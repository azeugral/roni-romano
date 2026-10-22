"""Gera og.jpg (prévia de link 1200x630) e os favicons.

Uso: python -I tools/og.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
CAFE, CREME, AREIA, CARAMELO = (21, 16, 12), (244, 238, 229), (203, 183, 157), (207, 154, 98)


def fonte(nomes, tam):
    for n in nomes:
        try:
            return ImageFont.truetype(n, tam)
        except OSError:
            continue
    return ImageFont.load_default()


SERIF = ["bodoni.ttf", "BOD_R.TTF", "georgia.ttf"]
MONO = ["consola.ttf", "cour.ttf"]


def og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), CAFE)
    foto = Image.open(RAIZ / "assets/img/roni-hero-1080.webp").convert("RGB")
    fw = 520
    foto = foto.resize((fw, round(foto.height * fw / foto.width)))
    y = max(0, int(foto.height * .06))
    foto = foto.crop((0, y, fw, y + H))
    im.paste(foto, (W - fw, 0))
    # degradê da foto para o fundo
    grad = Image.new("L", (220, H))
    for x in range(220):
        ImageDraw.Draw(grad).line([(x, 0), (x, H)], fill=int(255 * (1 - x / 220)))
    im.paste(Image.new("RGB", (220, H), CAFE), (W - fw, 0), grad)
    d = ImageDraw.Draw(im)
    d.text((70, 150), "HAIR DESIGN · VISAGISMO · MORUMBI, SP", font=fonte(MONO, 20), fill=CARAMELO)
    d.text((66, 200), "Roni", font=fonte(SERIF, 124), fill=CREME)
    d.text((66, 325), "Romano", font=fonte(SERIF, 124), fill=CREME)
    d.text((70, 490), "Corte, cor e coloração pessoal", font=fonte(SERIF, 30), fill=AREIA)
    im.save(RAIZ / "og.jpg", quality=86)


def icones():
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#15100c"/>'
           '<text x="32" y="44" text-anchor="middle" font-family="Didot,Bodoni 72,Georgia,serif" font-size="34" fill="#f4eee5">RR</text>'
           '<rect x="18" y="50" width="28" height="2" fill="#cf9a62"/></svg>')
    (RAIZ / "favicon.svg").write_text(svg, encoding="utf-8")
    for tam, nome in ((32, "favicon-32.png"), (180, "apple-touch-icon.png")):
        im = Image.new("RGB", (tam, tam), CAFE)
        d = ImageDraw.Draw(im)
        f = fonte(SERIF, int(tam * .52))
        d.text((tam / 2, tam * .46), "RR", font=f, fill=CREME, anchor="mm")
        d.rectangle([tam * .28, tam * .78, tam * .72, tam * .78 + max(1, tam // 32)], fill=CARAMELO)
        im.save(RAIZ / nome)


og()
icones()
print("og.jpg e favicons gerados")
