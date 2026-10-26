"""Recorta as fotos de ../_ref/ig e gera os .webp do site em assets/img.

Uso: python -I tools/processar.py
Cada foto sai em 4:5 (ou na proporção pedida) em duas larguras: 640 e 1080.
`foco` é a altura (0 a 1) que fica no centro do recorte; nos reels o rosto fica perto de 0.35.
"""
import glob
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ.parent / "_ref" / "ig"
SAIDA = RAIZ / "assets" / "img"
SAIDA.mkdir(parents=True, exist_ok=True)

# nome no site: (post, foco vertical, proporção L/A, recorte de baixo para tirar texto do post[, aproximar])
# aproximar = (centro horizontal, fração da largura): corta as laterais antes, para fechar no Roni
FOTOS = {
    # retratos do Roni
    # "c1" a "c6" são as fotos que o Roni mandou em 26/10 (../_ref/cliente-fotos-2610)
    "roni-hero": ("037", .45, 3 / 5, 0),
    "roni-arco": ("037", .36, 3 / 4.15, 0),
    "roni-avatar": ("123", .22, 1, .35),
    "roni-sobre": ("c1", .42, 4 / 5, 0),
    "roni-palco": ("c2", .36, 4 / 5, 0),
    "roni-hairshow": ("c3", .55, 4 / 5, 0),
    "roni-entrevista": ("c5", .50, 4 / 5, 0, (.44, .66)),
    "roni-premiacao": ("c6", .50, 4 / 5, 0, (.52, .85)),
    # serviços
    "serv-corte": ("154", .45, 4 / 5, 0),
    "serv-cor": ("049", .45, 4 / 5, 0),
    "serv-pessoal": ("160", .42, 4 / 5, 0),
    "serv-noivas": ("148", .32, 4 / 5, 0),
    "serv-make": ("030", .45, 4 / 5, .12),
    "serv-trat": ("046", .45, 4 / 5, 0),
    # bastidores
    "bast-1": ("020", .38, 4 / 5, 0),
    "bast-2": ("025", .40, 4 / 5, 0),
    "bast-3": ("010", .38, 4 / 5, 0),
    "bast-4": ("029", .38, 4 / 5, 0),
}
# portfólio: (post, categoria, foco)
PORTFOLIO = [
    ("049", "cor", .45), ("154", "corte", .45), ("003", "make", .40), ("028", "cor", .40),
    ("097", "corte", .38), ("047", "cor", .38), ("153", "cor", .45), ("017", "corte", .40),
    ("030", "make", .40), ("093", "cor", .38), ("098", "corte", .38), ("157", "cor", .45),
    ("027", "cor", .38), ("111", "corte", .38), ("038", "make", .45), ("161", "cor", .45),
    ("032", "cor", .38), ("004", "corte", .38), ("143", "make", .45), ("088", "cor", .38),
    ("162", "cor", .45), ("091", "corte", .38), ("107", "make", .38), ("095", "cor", .38),
    ("099", "cor", .38), ("156", "corte", .45), ("132", "make", .40), ("140", "cor", .40),
    ("151", "cor", .40), ("058", "corte", .38), ("148", "make", .32), ("101", "cor", .38),
    ("124", "corte", .38), ("155", "cor", .45), ("167", "make", .45), ("007", "cor", .35),
    ("005", "corte", .38), ("121", "corte", .38), ("029", "cor", .38), ("022", "cor", .38),
]


HD = RAIZ.parent / "hero-para-melhorar" / "roni-hero-hd.png"  # versão melhorada do post 037
CLIENTE = RAIZ.parent / "_ref" / "cliente-fotos-2610"


def arquivo(post):
    if post.startswith("c"):
        return str(CLIENTE / f"foto{post[1:]}.jpg")
    if post == "037" and HD.exists():
        return str(HD)
    return glob.glob(str(ORIG / f"{post}*.jpg"))[0]


def recortar(im, foco, prop, corta_baixo):
    w, h = im.size
    if corta_baixo:
        h = int(h * (1 - corta_baixo))
        im = im.crop((0, 0, w, h))
    if w / h > prop:  # larga demais: corta dos lados
        nw = int(h * prop)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = int(w / prop)
    y = int(min(max(foco * h - nh / 2, 0), h - nh))
    return im.crop((0, y, w, y + nh))


def salvar(im, nome):
    for larg in (640, 1080):
        if im.width < larg and larg != 640:
            larg = im.width
        alt = round(larg * im.height / im.width)
        im.resize((larg, alt), Image.LANCZOS).save(SAIDA / f"{nome}-{larg if larg in (640, 1080) else 1080}.webp",
                                                   quality=82, method=6)


def main():
    for nome, (post, foco, prop, corte, *aprox) in FOTOS.items():
        im = Image.open(arquivo(post)).convert("RGB")
        if aprox:
            cx, frac = aprox[0]
            nw = int(im.width * frac)
            x = int(min(max(cx * im.width - nw / 2, 0), im.width - nw))
            im = im.crop((x, 0, x + nw, im.height))
        salvar(recortar(im, foco, prop, corte), nome)
    for i, (post, cat, foco) in enumerate(PORTFOLIO, 1):
        im = Image.open(arquivo(post)).convert("RGB")
        salvar(recortar(im, foco, 4 / 5, .12 if post == "030" else 0), f"p{i:02d}")
    print(len(FOTOS), "fotos +", len(PORTFOLIO), "do portfólio em", SAIDA)


if __name__ == "__main__":
    main()
