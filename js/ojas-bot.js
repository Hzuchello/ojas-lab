(function () {
  var thread = document.getElementById("thread");
  var form = document.getElementById("ask");
  var input = document.getElementById("q");
  if (!thread || !form) return;

  var N8N_BOT = "https://overfunctioning-undefensibly-johnette.ngrok-free.dev/webhook/50729f79-5bfa-4a69-8e0a-9a5d7cb167bb";
  var WA = "WhatsApp +55 41 9128-3609";
  var STORE = "ojas-lab-bot";
  var historico = [];
  var sessao = "";
  var ocupado = false;
  var mensagens = [];
  var IDLE = 15 * 60 * 1000;
  var lastAt = Date.now();
  var ENCERRADO = "Encerramos esta conversa por inatividade. Se tiver outra dúvida, estou à disposição.";

  function lerStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || "null"); }
    catch (e) { return null; }
  }
  function gravarStore() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        sessao: sessao,
        historico: historico.slice(-20),
        mensagens: mensagens.slice(-40),
        lastAt: lastAt,
        aberto: !!(document.getElementById("botPanel") && document.getElementById("botPanel").classList.contains("is-open"))
      }));
    } catch (e) {}
  }

  function limpaMd(s) {
    var out = String(s || "")
      .replace(/\*\*/g, "")
      .replace(/__/g, "")
      .replace(/`+/g, "")
      .replace(/^#+\s+/gm, "");
    out = out.replace(/\s*Quer este plano\??/gi, "");
    out = out.replace(/\s*Quero este plano\??/gi, "");
    out = out.replace(/\s*Quer o 02 ou o 03\??/gi, "");
    return out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }

  function add(text, who, silencioso) {
    var el = document.createElement("div");
    el.className = "msg msg--" + who;
    el.textContent = who === "bot" ? limpaMd(text) : text;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
    if (!silencioso) {
      mensagens.push({ who: who, text: who === "bot" ? limpaMd(text) : text });
      gravarStore();
    }
    return el;
  }

  function addCta(plano) {
    if (!plano) return;
    var wrap = document.createElement("div");
    wrap.className = "msg msg--bot msg--cta";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn--gold plano__btn";
    btn.setAttribute("data-plano", plano);
    btn.textContent = "Quero este plano";
    wrap.appendChild(btn);
    thread.appendChild(wrap);
    thread.scrollTop = thread.scrollHeight;
    if (typeof window.ojasAbrirPlano === "function") {
      btn.addEventListener("click", function () {
        window.ojasAbrirPlano(plano);
      });
    }
  }

  function setTyping(on) {
    var existing = thread.querySelector(".msg--typing");
    if (existing) existing.remove();
    if (!on) return;
    var el = document.createElement("div");
    el.className = "msg msg--bot msg--typing";
    el.textContent = "Digitando…";
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
  }

  function fallback() {
    return "Não consegui falar com o laboratório agora. Tente de novo em instantes ou chame a equipe no " + WA + ".";
  }

  function lerResposta(raw) {
    var data = raw;
    if (typeof raw === "string") {
      try { data = JSON.parse(raw); } catch (e) {
        return { texto: raw, planoSugerido: "", mostrarBotao: false };
      }
    }
    if (Array.isArray(data)) data = data[0] || {};
    if (data && data.json) data = data.json;
    var texto = "";
    if (typeof data === "string") texto = data;
    else if (data) {
      texto = data.texto || data.resposta || data.output || data.message || data.text || "";
    }
    return {
      texto: (texto || "").trim(),
      planoSugerido: data && data.planoSugerido ? String(data.planoSugerido) : "",
      mostrarBotao: !!(data && data.mostrarBotao)
    };
  }

  function perguntar(mensagem) {
    var corpo = {
      mensagem: mensagem,
      chatInput: mensagem,
      sessionId: sessao,
      historico: historico.slice(-10),
      origem: "site-ojas-lab",
      pagina: location.pathname,
      data: new Date().toISOString()
    };
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 12000);
    return fetch(N8N_BOT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1"
      },
      body: JSON.stringify(corpo),
      signal: ctrl.signal
    }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.text();
    }).then(function (txt) {
      return lerResposta(txt);
    }).finally(function () {
      clearTimeout(timer);
    });
  }

  var panel = document.getElementById("botPanel");
  var widget = document.querySelector(".bot-widget");
  function setBotOpen(on) {
    if (!panel) return;
    panel.classList.toggle("is-open", on);
    panel.removeAttribute("hidden");
    if (widget) widget.classList.toggle("is-open", on);
    gravarStore();
  }

  function novaSessao() {
    sessao = "site-" + Math.random().toString(36).slice(2, 10);
    historico = [];
    lastAt = Date.now();
  }
  function limparFio() {
    thread.innerHTML = "";
    mensagens = [];
  }
  function encerrarPorInatividade() {
    limparFio();
    novaSessao();
    add(ENCERRADO, "bot");
    lastAt = Date.now();
    gravarStore();
  }
  function marcarUso() {
    lastAt = Date.now();
    gravarStore();
  }

  var salvo = lerStore();
  var velho = salvo && salvo.lastAt && (Date.now() - Number(salvo.lastAt) > IDLE);
  if (velho) {
    novaSessao();
    add(ENCERRADO, "bot");
  } else if (salvo && salvo.mensagens && salvo.mensagens.length) {
    sessao = salvo.sessao || ("site-" + Math.random().toString(36).slice(2, 10));
    historico = salvo.historico || [];
    lastAt = Number(salvo.lastAt) || Date.now();
    salvo.mensagens.forEach(function (m) { add(m.text, m.who, true); });
    mensagens = salvo.mensagens.slice();
  } else {
    novaSessao();
    add("Olá. Sou o Ôjas Bot. Posso esclarecer os planos da casa.", "bot");
  }
  if (salvo && salvo.aberto && !velho) setBotOpen(true);
  setInterval(function () {
    if (Date.now() - lastAt >= IDLE && mensagens.length) {
      var soAviso = mensagens.length === 1 && mensagens[0].text === ENCERRADO;
      if (!soAviso) encerrarPorInatividade();
    }
  }, 30000);
  document.querySelectorAll("[data-open-bot]").forEach(function (el) {
    el.addEventListener("click", function () {
      setBotOpen(!(panel && panel.classList.contains("is-open")));
    });
  });
  document.querySelectorAll("[data-close-bot]").forEach(function (el) {
    el.addEventListener("click", function () {
      setBotOpen(false);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q || ocupado) return;
    marcarUso();
    var n = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/^(quero|sim|esse|este|ok|quero este plano|quero esse plano|quero o plano)[!.]?$/.test(n) || /quero este plano|quero esse plano/.test(n)) {
      add(q, "user");
      input.value = "";
      add("Certo. Abro o formulário para a equipe receber seus dados.", "bot");
      if (typeof window.ojasAbrirPlano === "function") {
        window.ojasAbrirPlano("Vitrine + Ôjas Bot");
      }
      return;
    }

    ocupado = true;
    input.disabled = true;
    add(q, "user");
    historico.push({ role: "user", text: q });
    input.value = "";
    setTyping(true);

    perguntar(q).then(function (r) {
      setTyping(false);
      var texto = r.texto || fallback();
      add(texto, "bot");
      historico.push({ role: "bot", text: texto });
      if (r.mostrarBotao && r.planoSugerido) addCta(r.planoSugerido);
    }).catch(function () {
      setTyping(false);
      var t = fallback();
      add(t, "bot");
      historico.push({ role: "bot", text: t });
    }).finally(function () {
      ocupado = false;
      input.disabled = false;
      input.focus();
    });
  });
})();
