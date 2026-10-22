"""Recorta a logo oficial (../_ref/logo/logo-oficial.png, dourada em fundo transparente) e gera
as versões do site, as favicons e a prévia de link (og.jpg).

Uso: python -I tools/logo.py
- assets/img/logo-rr.png      monograma RR
- assets/img/logo-nome.png    letreiro RONI ROMANO
- assets/img/logo.png         logo completa (rodapé)
- favicon-32.png, favicon-192.png, apple-touch-icon.png, favicon.ico
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ.parent / "_ref" / "logo" / "logo-oficial.png"
IMG = RAIZ / "assets" / "img"
CAFE = (22, 17, 13)


def aparar(im):
    a = np.array(im)[:, :, 3]
    ys, xs = np.where(a > 12)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def altura(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)


def main():
    logo = Image.open(ORIG).convert("RGBA")
    a = np.array(logo)[:, :, 3]
    linhas = np.where(a.max(1) > 20)[0]
    # o vão entre o monograma e o letreiro é a maior sequência de linhas vazias
    corte = max(((linhas[i], linhas[i + 1]) for i in range(len(linhas) - 1)), key=lambda p: p[1] - p[0])
    meio = (corte[0] + corte[1]) // 2
    rr = aparar(logo.crop((0, 0, logo.width, meio)))
    nome = aparar(logo.crop((0, meio, logo.width, logo.height)))
    completo = aparar(logo)

    altura(rr, 240).save(IMG / "logo-rr.png", optimize=True)
    altura(nome, 72).save(IMG / "logo-nome.png", optimize=True)
    completo.resize((1000, round(completo.height * 1000 / completo.width)), Image.LANCZOS).save(IMG / "logo.png", optimize=True)

    # favicons: monograma dourado no café
    def icone(tam, margem=.16):
        fundo = Image.new("RGBA", (tam, tam), CAFE + (255,))
        lado = round(tam * (1 - 2 * margem))
        m = rr.copy()
        m.thumbnail((lado, lado), Image.LANCZOS)
        if tam <= 48:
            m = m.filter(ImageFilter.UnsharpMask(radius=1, percent=80, threshold=2))
        fundo.alpha_composite(m, ((tam - m.width) // 2, (tam - m.height) // 2))
        return fundo.convert("RGB")
    icone(32, .1).save(RAIZ / "favicon-32.png")
    icone(192).save(RAIZ / "favicon-192.png")
    icone(180).save(RAIZ / "apple-touch-icon.png")
    icone(48, .1).save(RAIZ / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    # prévia de link: foto do hero à direita, logo à esquerda
    W, H = 1200, 630
    og = Image.new("RGB", (W, H), CAFE)
    foto = Image.open(RAIZ / "assets/img/roni-hero-1080.webp").convert("RGB")
    fw = 540
    foto = foto.resize((fw, round(foto.height * fw / foto.width)), Image.LANCZOS)
    y = int(foto.height * .05)
    og.paste(foto.crop((0, y, fw, y + H)), (W - fw, 0))
    mask = Image.new("L", (240, H))
    d = ImageDraw.Draw(mask)
    for x in range(240):
        d.line([(x, 0), (x, H)], fill=int(255 * (1 - x / 240) ** 1.4))
    og.paste(Image.new("RGB", (240, H), CAFE), (W - fw, 0), mask)
    lg = completo.copy()
    lg.thumbnail((560, 380), Image.LANCZOS)
    og.paste(lg, (70 + (560 - lg.width) // 2, (H - lg.height) // 2), lg)
    og.save(RAIZ / "og.jpg", quality=88)
    for f in ("favicon.svg",):
        (RAIZ / f).unlink(missing_ok=True)
    print("logo, favicons e og.jpg gerados", rr.size, nome.size)


if __name__ == "__main__":
    main()
