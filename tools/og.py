"""Renderiza a prévia de link (og.jpg, 1200×630) a partir de tools/og.html num Chromium headless.

Uso: python -I tools/og.py
A arte usa a foto otimizada do hero e as fontes do site (Google Fonts, precisa de internet).
"""
from io import BytesIO
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent


def main():
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=2)
        pg.goto((RAIZ / "tools" / "og.html").as_uri())
        pg.wait_for_load_state("networkidle")
        pg.evaluate("document.fonts.ready")
        png = pg.screenshot()
        b.close()
    # renderiza em 2x e reduz: letras e fios saem mais limpos que no 1x
    im = Image.open(BytesIO(png)).convert("RGB").resize((1200, 630), Image.LANCZOS)
    im.save(RAIZ / "og.jpg", quality=90, optimize=True, progressive=True)
    print("og.jpg", round((RAIZ / "og.jpg").stat().st_size / 1024), "KB")


if __name__ == "__main__":
    main()
