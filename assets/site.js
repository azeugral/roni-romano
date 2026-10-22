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
