"""Renderiza a fumaça do hero para o celular (assets/video/fumaca-celular.mp4) com o mesmo shader
de assets/fumaca.js, quadro a quadro num Chromium headless, e codifica com o ffmpeg do imageio-ffmpeg.
O loop fecha sem emenda: o último quadro é a fase 2π, igual à fase 0.

Uso: python -I tools/gerar_fumaca.py [--teste]   (--teste só salva um quadro em ../_ref/folhas)
"""
import base64
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "assets" / "video"
FPS, SEGUNDOS, RAIO = 24, 14, .22
VERSOES = [("fumaca-celular", 720, 1014, 1.0)]  # no celular a fumaça ocupa a largura toda (lado=1); 720 px para não borrar em tela densa


def abrir(pw, w, h):
    b = pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": w, "height": h})
    pg.set_content(f'<body style="margin:0;background:#000"><canvas id="c" width="{w}" height="{h}"></canvas></body>')
    pg.add_script_tag(path=str(RAIZ / "assets" / "fumaca.js"))
    pg.evaluate("window.F = fumacaGL(document.getElementById('c'), {preserveDrawingBuffer: true})")
    return b, pg


def quadro(pg, fase, lado):
    d = pg.evaluate(f"(F.desenhar({fase}, {RAIO}, {lado}), document.getElementById('c').toDataURL('image/png'))")
    return base64.b64decode(d.split(",", 1)[1])


def main():
    with sync_playwright() as pw:
        if "--teste" in sys.argv:
            for nome, w, h, lado in [("desktop", 900, 900, 0.0), ("celular", 540, 760, 1.0)]:
                b, pg = abrir(pw, w, h)
                (RAIZ.parent / "_ref" / "folhas" / f"fumaca-{nome}.png").write_bytes(quadro(pg, 1.0, lado))
                b.close()
            print("quadros de teste em _ref/folhas")
            return
        SAIDA.mkdir(parents=True, exist_ok=True)
        for nome, w, h, lado in VERSOES:
            mp4 = SAIDA / f"{nome}.mp4"
            enc = subprocess.Popen([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-f", "image2pipe",
                                    "-framerate", str(FPS), "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "slow",
                                    "-crf", "24", "-x264-params", "aq-mode=3", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", str(mp4)],
                                   stdin=subprocess.PIPE)
            b, pg = abrir(pw, w, h)
            total = FPS * SEGUNDOS
            for i in range(total):
                png = quadro(pg, i / total * 6.283185307179586, lado)
                enc.stdin.write(png)
                if i == 0:
                    from io import BytesIO
                    from PIL import Image
                    Image.open(BytesIO(png)).convert("RGB").save(RAIZ / "assets" / "img" / "fumaca-poster.webp", quality=80)
            b.close()
            enc.stdin.close()
            enc.wait()
            print(mp4.name, round(mp4.stat().st_size / 1e6, 2), "MB")


if __name__ == "__main__":
    main()
