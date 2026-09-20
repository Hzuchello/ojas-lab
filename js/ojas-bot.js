(function () {
  var thread = document.getElementById("thread");
  var form = document.getElementById("ask");
  var input = document.getElementById("q");
  if (!thread || !form) return;

  var WA = "WhatsApp +55 41 9128-3609";

  var planos = {
    vitrine: {
      nome: "Vitrine",
      setup: "R$ 1.490",
      mensal: null,
      entra: "site completo, 1 ano de domínio e 30 dias de manutenção e alterações.",
      naoEntra: "não inclui e-commerce, área logada, app, ERP, tráfego pago nem alterações depois dos 30 dias sem novo acordo.",
      para: "quem precisa de site próprio, ainda sem atendimento automático."
    },
    bot: {
      nome: "Vitrine + Ôjas Bot",
      setup: "R$ 2.490",
      mensal: "R$ 149/mês",
      entra: "tudo da Vitrine, mais atendimento 24h/7 no site, coleta de dados e envio por e-mail e WhatsApp.",
      naoEntra: "não fecha pagamento sozinho e não cobre automação de processos — isso é o plano 03.",
      para: "quem quer o site respondendo fora do horário e encaminhando o lead."
    },
    automacao: {
      nome: "Vitrine + Bot + Automação",
      setup: "R$ 4.490",
      mensal: "R$ 297/mês",
      entra: "tudo do plano 02, mais integração de sistemas e automação com n8n (até 3 fluxos: por exemplo lead para e-mail/Telegram, planilha ou CRM simples, e um follow-up).",
      naoEntra: "não inclui ERP pesado, loja complexa, app nem fluxo extra sem aditivo — extra a equipe orça à parte.",
      para: "quando o lead já nasce no site e precisa seguir sozinho até a operação."
    }
  };

  function norm(q) {
    return (q || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function has(n, keys) {
    for (var i = 0; i < keys.length; i++) if (n.indexOf(keys[i]) !== -1) return true;
    return false;
  }
  function preco(p) {
    return p.mensal ? p.setup + " + " + p.mensal : p.setup;
  }
  function ficha(p) {
    return p.nome + " sai por " + preco(p) + ". Entra: " + p.entra + " " + p.naoEntra + " Indicação: " + p.para + " Para contratar, use Quero este plano na seção Planos ou fale no " + WA + ".";
  }
  function qualPlano(n) {
    if (has(n, ["03", "n8n", "automacao", "integracao", "processo"])) return planos.automacao;
    if (has(n, ["02", "ojas bot", "atendimento", "24h", "24 h"])) return planos.bot;
    if (has(n, ["01", "vitrine", "site"])) return planos.vitrine;
    return null;
  }

  function answer(q) {
    var n = norm(q);
    var p = qualPlano(n);

    if (has(n, ["oi", "ola", "bom dia", "boa tarde", "boa noite"]) && n.length < 24) {
      return "Olá. Sou o Ôjas Bot. Posso detalhar cada plano, o que entra e o que não entra, prazos típicos e como contratar. O que você quer saber?";
    }

    if (has(n, ["contratar", "contrato", "fechar", "assinar", "como faco", "como faço", "quero contratar", "como contrato"])) {
      return "Aqui eu só esclareço. Para contratar: role até Planos, clique em Quero este plano e envie nome, WhatsApp e e-mail — ou fale direto no " + WA + ". Diga qual recorte (Vitrine, Vitrine + Bot ou o 03 com n8n) se já tiver escolha.";
    }

    if (has(n, ["desconto", "barato", "parcel", "promo"])) {
      return "Não aplico desconto daqui. Os valores da ficha são R$ 1.490, R$ 2.490 + R$ 149/mês e R$ 4.490 + R$ 297/mês. Condição diferente só com a equipe no " + WA + ".";
    }

    if (has(n, ["nao entra", "não entra", "nao inclui", "não inclui", "fora"])) {
      if (p) return p.nome + ": " + p.naoEntra;
      return "Nenhum plano inclui e-commerce complexo, app, ERP pesado ou tráfego pago. Alteração de site depois dos 30 dias e fluxo n8n extra saem de acordo à parte.";
    }

    if (has(n, ["prazo", "tempo", "demora", "entrega", "quando fica pronto"])) {
      return "Prazo firme só depois da escuta e dos materiais (logo, textos). Em geral a Vitrine sai em poucos ciclos; o bot entra com as perguntas do negócio; o n8n depois de mapear de onde o dado vem e para onde vai. Data fechada: " + WA + ".";
    }

    if (p && has(n, ["preco", "valor", "custa", "investimento", "mensal"])) {
      return p.nome + " custa " + preco(p) + ".";
    }

    if (p) return ficha(p);

    if (has(n, ["diferenca", "compar", "qual plano", "qual escolher", "os tres", "os 3"])) {
      return "01 Vitrine — " + preco(planos.vitrine) + " — só o site. 02 Vitrine + Bot — " + preco(planos.bot) + " — site com atendimento 24h. 03 + automação — " + preco(planos.automacao) + " — os anteriores com até 3 fluxos n8n. Qual desses quer que eu abra no detalhe?";
    }

    if (has(n, ["preco", "valor", "custa", "investimento", "planos", "plano"])) {
      return "Três recortes: Vitrine " + preco(planos.vitrine) + "; Vitrine + Ôjas Bot " + preco(planos.bot) + "; Vitrine + Bot + Automação " + preco(planos.automacao) + ". Quer o detalhe de um deles (o que entra e o que não entra)?";
    }

    if (has(n, ["whatsapp", "falar com", "humano", "equipe"])) {
      return "A equipe atende no " + WA + ". Se for para contratar um recorte já escolhido, o formulário Quero este plano também chega para nós.";
    }

    return "Posso detalhar Vitrine, Vitrine + Ôjas Bot ou o plano com n8n — preço, o que entra, o que fica de fora e como contratar. Se a dúvida sair dessa ficha, a equipe responde no " + WA + ".";
  }

  function add(text, who) {
    var el = document.createElement("div");
    el.className = "msg msg--" + who;
    el.textContent = text;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
  }

  add("Olá. Sou o Ôjas Bot. Pergunte sobre um plano específico, o que entra, prazos ou como contratar.", "bot");

  var panel = document.getElementById("botPanel");
  function openBot() {
    if (panel) panel.hidden = false;
  }
  function closeBot() {
    if (panel) panel.hidden = true;
  }
  document.querySelectorAll("[data-open-bot]").forEach(function (el) {
    el.addEventListener("click", openBot);
  });
  document.querySelectorAll("[data-close-bot]").forEach(function (el) {
    el.addEventListener("click", closeBot);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q) return;
    add(q, "user");
    input.value = "";
    setTimeout(function () { add(answer(q), "bot"); }, 380);
  });
})();
