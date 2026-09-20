(function () {
  var thread = document.getElementById("thread");
  var form = document.getElementById("ask");
  var input = document.getElementById("q");
  if (!thread || !form) return;

  var N8N_BOT = "https://overfunctioning-undefensibly-johnette.ngrok-free.dev/webhook/50729f79-5bfa-4a69-8e0a-9a5d7cb167bb";
  var WA = "WhatsApp +55 41 9128-3609";
  var historico = [];
  var ocupado = false;

  function add(text, who) {
    var el = document.createElement("div");
    el.className = "msg msg--" + who;
    el.textContent = text;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
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
      historico: historico.slice(-10),
      origem: "site-ojas-lab",
      pagina: location.pathname,
      data: new Date().toISOString()
    };
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 12000);
    return fetch(N8N_BOT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  add("Olá. Sou o Ôjas Bot. Conte o que o negócio precisa — eu esclareço e indico o recorte da casa.", "bot");

  var panel = document.getElementById("botPanel");
  document.querySelectorAll("[data-open-bot]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (panel) panel.hidden = false;
    });
  });
  document.querySelectorAll("[data-close-bot]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (panel) panel.hidden = true;
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q || ocupado) return;
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
