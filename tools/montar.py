"""Injeta a grade de trabalhos no index e monta trabalhos.html e 404.html com o topo e o rodapé do index.

Uso: python -I tools/montar.py   (rodar depois do processar.py)
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "tools"))
from processar import PORTFOLIO  # noqa: E402

CAT = {"cor": "Coloração", "corte": "Corte", "make": "Make e penteado"}
ALT = {"cor": "Resultado de coloração", "corte": "Resultado de corte", "make": "Maquiagem e penteado"}


def obra(i, cat, atraso):
    n = f"{i:02d}"
    return (f'      <figure class="obra revela" data-cat="{cat}" style="--d:{atraso}">'
            f'<button type="button" data-grande="assets/img/p{n}-1080.webp" data-leg="Nº {n} · {CAT[cat]}" data-alt="{ALT[cat]} feito por Roni Romano" aria-label="Ampliar foto {n}, {CAT[cat]}">'
            f'<img src="assets/img/p{n}-640.webp" width="640" height="800" alt="{ALT[cat]} feito por Roni Romano" loading="lazy" decoding="async"></button>'
            f'<figcaption><b>Nº {n}</b><span>{CAT[cat]}</span></figcaption></figure>')


def entre(texto, marca, novo):
    return re.sub(rf"(<!--{marca}-->).*?(<!--/{marca}-->)", lambda m: m.group(1) + "\n" + novo + "\n" + m.group(2), texto, flags=re.S)


def main():
    idx_p = RAIZ / "index.html"
    idx = idx_p.read_text(encoding="utf-8")
    home = "\n".join(obra(i, c, (i - 1) % 4) for i, (_, c, _) in enumerate(PORTFOLIO[:12], 1))
    idx = entre(idx, "GRADE-HOME", home)
    idx_p.write_text(idx, encoding="utf-8")

    cab = idx.split("<body>")[0]
    topo = re.search(r"<!--TOPO-->.*?<!--/TOPO-->", idx, re.S).group(0)
    rod = re.search(r"<!--RODAPE-->.*?<!--/RODAPE-->", idx, re.S).group(0)
    fim = '<script src="assets/site.js?v=1" defer></script>\n</body>\n</html>\n'

    def pagina(titulo, desc, corpo, ativo=None):
        c = re.sub(r"<title>.*?</title>", f"<title>{titulo}</title>", cab)
        c = re.sub(r'(<meta name="description" content=")[^"]*', rf"\g<1>{desc}", c)
        c = re.sub(r'<link rel="preload" as="image"[^>]*>\n', "", c)
        t = topo.replace(f'href="{ativo}"', f'href="{ativo}" aria-current="page"') if ativo else topo
        return f'{c}<body>\n<a class="pular" href="#conteudo">Pular para o conteúdo</a>\n{t}\n<main id="conteudo">\n{corpo}\n</main>\n\n{rod}\n{fim}'

    todas = "\n".join(obra(i, c, (i - 1) % 4) for i, (_, c, _) in enumerate(PORTFOLIO, 1))
    filtros = "".join(f'<button type="button" data-cat="{k}" aria-pressed="{"true" if k == "todos" else "false"}">{v}</button>'
                      for k, v in [("todos", "Todos"), ("cor", "Coloração"), ("corte", "Corte"), ("make", "Make e penteado")])
    corpo = f"""<section class="pagina-topo escuro">
  <div class="caixa">
    <p class="rotulo revela">Portfólio</p>
    <h1 class="revela" style="--d:1">Trabalhos</h1>
    <p class="lead revela" style="--d:2">Cortes, colorações e maquiagens feitos no salão. Toque em uma foto para ver maior.</p>
  </div>
</section>
<section class="secao escuro" style="padding-top:0">
  <div class="caixa">
    <div class="filtros revela" role="group" aria-label="Filtrar trabalhos">{filtros}</div>
    <div class="grade">
{todas}
    </div>
    <div class="trabalhos__mais"><a class="btn" href="./#agendar">Agendar atendimento</a></div>
  </div>
</section>"""
    (RAIZ / "trabalhos.html").write_text(pagina("Trabalhos · Roni Romano Hair Design",
                                                "Portfólio de cortes, colorações e maquiagens de Roni Romano, hair designer e visagista no Morumbi, São Paulo.",
                                                corpo, "trabalhos.html"), encoding="utf-8")
    nao = """<section class="pagina-topo escuro" style="min-height:80svh">
  <div class="caixa">
    <p class="rotulo">Erro 404</p>
    <h1>Página não encontrada</h1>
    <p class="lead" style="margin-bottom:34px">O endereço pode ter mudado. Volte para o início ou fale comigo pelo WhatsApp.</p>
    <a class="btn" href="./">Voltar ao início</a>
  </div>
</section>"""
    (RAIZ / "404.html").write_text(pagina("Página não encontrada · Roni Romano", "Página não encontrada.", nao), encoding="utf-8")
    print("index, trabalhos.html e 404.html montados com", len(PORTFOLIO), "trabalhos")


if __name__ == "__main__":
    main()
