/* Roni Romano · menu, revelar ao rolar, filtros, foto ampliada e agendamento pelo WhatsApp */
(() => {
  const doc = document.documentElement;
  const ZAP = "5511982991393";
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // entrada do hero depois que a foto carregar (ou em 1,2 s, o que vier antes)
  const fotoHero = document.querySelector(".hero__foto img");
  const pronto = () => doc.classList.add("pronto");
  if (fotoHero && !fotoHero.complete) {
    fotoHero.addEventListener("load", pronto, { once: true });
    setTimeout(pronto, 1200);
  } else requestAnimationFrame(() => requestAnimationFrame(pronto));

  // fumaça: shader ao vivo no desktop, MP4 no celular; só anima com a seção na tela
  const desktop = matchMedia("(min-width: 901px)").matches;
  const fumaca = (secao, tela, video, { escala = .75, lado = 0, ciclo = 14000, fps = 60, atraso = 400 } = {}) => {
    if (!secao || reduz) return;
    if (desktop && tela && window.fumacaGL) {
      const f = window.fumacaGL(tela);
      if (!f) return;
      let visivel = false, ultimo = 0;
      const t0 = performance.now(), passo = 1000 / fps - 2;
      const medir = () => {
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        tela.width = Math.round(tela.clientWidth * dpr * escala);
        tela.height = Math.round(tela.clientHeight * dpr * escala);
      };
      medir();
      addEventListener("resize", medir);
      const laco = agora => {
        if (visivel && !document.hidden && agora - ultimo >= passo) {
          ultimo = agora;
          f.desenhar(((agora - t0) % ciclo) / ciclo * Math.PI * 2, .22, lado);
        }
        requestAnimationFrame(laco);
      };
      requestAnimationFrame(laco);
      new IntersectionObserver(es => {
        visivel = es[0].isIntersecting;
        if (visivel && !tela.classList.contains("liga")) setTimeout(() => tela.classList.add("liga"), atraso);
      }).observe(secao);
    } else if (video) {
      // o vídeo só baixa quando a seção chega perto e pausa fora da tela (bateria e dados no celular)
      let carregado = false;
      new IntersectionObserver(es => {
        const perto = es[0].isIntersecting;
        if (perto && !carregado) {
          carregado = true;
          video.src = video.dataset.src;
          video.addEventListener("loadeddata", () => video.classList.add("liga"), { once: true });
          video.load();
        }
        if (perto) video.play().catch(() => video.classList.add("liga"));
        else if (carregado) video.pause();
      }, { rootMargin: "200px 0px" }).observe(secao);
    }
  };
  fumaca(document.querySelector(".hero"), document.getElementById("fumaca"), document.getElementById("fumaca-video"));
  // no agendamento é mais leve: meia resolução, 30 quadros, ciclo mais lento e mais espalhada
  fumaca(document.getElementById("agendar"), document.getElementById("fumaca-agendar"), document.getElementById("fumaca-agendar-video"),
    { escala: .5, lado: .55, ciclo: 20000, fps: 30, atraso: 0 });

  // topo fica sólido ao rolar; botão do WhatsApp aparece depois do hero
  const topo = document.querySelector(".topo");
  const zap = document.querySelector(".zap");
  const aoRolar = () => {
    const y = window.scrollY;
    topo.classList.toggle("solido", y > 40 || !document.querySelector(".hero"));
    if (zap) zap.classList.toggle("mostra", y > window.innerHeight * .7);
  };
  aoRolar();
  addEventListener("scroll", aoRolar, { passive: true });

  // menu do celular
  const abre = document.querySelector(".abre-menu");
  const fecharMenu = () => {
    doc.classList.remove("menu-aberto");
    document.body.classList.remove("travado");
    abre && abre.setAttribute("aria-expanded", "false");
  };
  abre && abre.addEventListener("click", () => {
    const aberto = doc.classList.toggle("menu-aberto");
    document.body.classList.toggle("travado", aberto);
    abre.setAttribute("aria-expanded", String(aberto));
  });
  document.querySelectorAll(".menu a").forEach(a => a.addEventListener("click", fecharMenu));

  // links internos (logo, menu, "agendar") rolam suave até o destino em vez de saltar;
  // a duração cresce com a distância e o toque ou a roda do mouse interrompem a animação
  let rolagem = 0;
  const parar = () => cancelAnimationFrame(rolagem);
  ["wheel", "touchstart", "keydown"].forEach(ev => addEventListener(ev, parar, { passive: true }));
  const rolarAte = destino => {
    parar();
    const inicio = scrollY, dist = destino - inicio;
    if (reduz || Math.abs(dist) < 2) { scrollTo(0, destino); return; }
    const dur = Math.min(1300, Math.max(550, Math.abs(dist) * .35)), t0 = performance.now();
    const curva = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const passo = agora => {
      const t = Math.min((agora - t0) / dur, 1);
      scrollTo(0, inicio + dist * curva(t));
      if (t < 1) rolagem = requestAnimationFrame(passo);
    };
    rolagem = requestAnimationFrame(passo);
  };
  document.querySelectorAll('a[href*="#"]').forEach(a => a.addEventListener("click", e => {
    const url = new URL(a.href, location.href);
    const mesma = url.pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "");
    const alvo = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!mesma || !alvo || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    fecharMenu();
    const folga = parseFloat(getComputedStyle(doc).scrollPaddingTop) || 0;
    rolarAte(alvo.id === "inicio" ? 0 : Math.max(0, alvo.getBoundingClientRect().top + scrollY - folga));
    history.pushState(null, "", alvo.id === "inicio" ? url.pathname : url.hash);
  }));
  addEventListener("keydown", e => { if (e.key === "Escape") fecharMenu(); });
  matchMedia("(min-width: 901px)").addEventListener("change", e => e.matches && fecharMenu());

  // revelar ao rolar
  const revelaveis = document.querySelectorAll(".revela");
  if ("IntersectionObserver" in window && !reduz) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    revelaveis.forEach(el => io.observe(el));
  } else revelaveis.forEach(el => el.classList.add("visto"));

  // paralaxe leve nas fotos em arco (só em telas grandes)
  const fotos = [...document.querySelectorAll("img[data-paralaxe]")];
  const telaGrande = matchMedia("(min-width: 901px)");
  let pedido = false;
  const mover = () => {
    pedido = false;
    const h = innerHeight;
    fotos.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      const p = (r.top + r.height / 2 - h / 2) / (h / 2 + r.height / 2); // -1 a 1
      img.style.transform = `translate3d(0,${(-5 - p * 5).toFixed(2)}%,0)`;
    });
  };
  const pedir = () => { if (!pedido) { pedido = true; requestAnimationFrame(mover); } };
  const ligaParalaxe = () => {
    if (telaGrande.matches && !reduz && fotos.length) { addEventListener("scroll", pedir, { passive: true }); mover(); }
    else { removeEventListener("scroll", pedir); fotos.forEach(i => { i.style.transform = ""; }); }
  };
  ligaParalaxe();
  telaGrande.addEventListener("change", ligaParalaxe);

  // filtros da página de trabalhos
  const filtros = document.querySelectorAll(".filtros button");
  filtros.forEach(b => b.addEventListener("click", () => {
    filtros.forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    const cat = b.dataset.cat;
    document.querySelectorAll(".grade .obra").forEach(o => {
      const mostra = cat === "todos" || o.dataset.cat === cat;
      o.classList.toggle("some", !mostra);
      if (mostra) o.classList.add("visto");
    });
  }));

  // foto ampliada
  const lupa = document.querySelector(".lupa");
  if (lupa) {
    const img = lupa.querySelector("img");
    const leg = lupa.querySelector("figcaption");
    let lista = [], i = 0, voltaFoco = null, toque = null;
    const mostrar = n => {
      i = (n + lista.length) % lista.length;
      const b = lista[i];
      img.style.opacity = "0";
      const nova = new Image();
      nova.onload = nova.onerror = () => { img.src = nova.src; img.alt = b.dataset.alt || ""; img.style.opacity = "1"; };
      nova.src = b.dataset.grande;
      leg.textContent = b.dataset.leg || "";
    };
    const abrir = b => {
      lista = [...document.querySelectorAll(".obra:not(.some) button[data-grande]")];
      voltaFoco = b;
      lupa.hidden = false;
      document.body.classList.add("travado");
      mostrar(lista.indexOf(b));
      requestAnimationFrame(() => lupa.classList.add("aberta"));
      lupa.querySelector(".fecha").focus();
    };
    const fechar = () => {
      lupa.classList.remove("aberta");
      document.body.classList.remove("travado");
      setTimeout(() => { lupa.hidden = true; img.removeAttribute("src"); }, 350);
      voltaFoco && voltaFoco.focus();
    };
    document.querySelectorAll(".obra button[data-grande]").forEach(b => b.addEventListener("click", () => abrir(b)));
    lupa.querySelector(".fecha").addEventListener("click", fechar);
    lupa.querySelector(".ant").addEventListener("click", () => mostrar(i - 1));
    lupa.querySelector(".prox").addEventListener("click", () => mostrar(i + 1));
    lupa.addEventListener("click", e => { if (e.target === lupa) fechar(); });
    addEventListener("keydown", e => {
      if (lupa.hidden) return;
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") mostrar(i - 1);
      if (e.key === "ArrowRight") mostrar(i + 1);
    });
    lupa.addEventListener("touchstart", e => { toque = e.touches[0].clientX; }, { passive: true });
    lupa.addEventListener("touchend", e => {
      if (toque === null) return;
      const dx = e.changedTouches[0].clientX - toque;
      if (Math.abs(dx) > 50) mostrar(i + (dx < 0 ? 1 : -1));
      toque = null;
    });
  }

  // links "agendar este serviço" já escolhem o serviço no formulário
  const sel = document.querySelector("#servico");
  document.querySelectorAll("[data-servico]").forEach(a => a.addEventListener("click", () => {
    if (sel) sel.value = a.dataset.servico;
  }));

  // formulário monta a mensagem e abre o WhatsApp
  const form = document.querySelector(".form");
  form && form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const nome = (d.get("nome") || "").toString().trim();
    const linhas = [
      `Olá, Roni! ${nome ? "Aqui é " + nome + ". " : ""}Vim pelo seu site e gostaria de agendar.`,
      `Serviço: ${d.get("servico")}`,
      d.get("periodo") ? `Melhor período: ${d.get("periodo")}` : "",
      (d.get("obs") || "").toString().trim() ? `Observação: ${d.get("obs").toString().trim()}` : ""
    ].filter(Boolean);
    window.open(`https://wa.me/${ZAP}?text=${encodeURIComponent(linhas.join("\n"))}`, "_blank", "noopener");
  });

  // ano no rodapé
  document.querySelectorAll("[data-ano]").forEach(el => { el.textContent = new Date().getFullYear(); });
})();
