(function () {
  var thread = document.getElementById("thread");
  var form = document.getElementById("ask");
  var input = document.getElementById("q");
  if (!thread || !form) return;

  var replies = [
    {
      keys: ["preco", "preço", "valor", "plano", "planos", "custa", "investimento"],
      text: "São três planos: Vitrine por R$ 1.490 (site completo, 1 ano de domínio e 30 dias de ajustes). Vitrine + Ôjas Bot por R$ 2.490 + R$ 149/mês, com atendimento 24/7, coleta de dados e envio por e-mail e WhatsApp. O terceiro soma integração e automação de processos: R$ 4.490 + R$ 297/mês."
    },
    {
      keys: ["vitrine", "site"],
      text: "A Vitrine é o site completo — presença digital com identidade, domínio no primeiro ano e 30 dias para manutenção e alterações."
    },
    {
      keys: ["bot", "atendimento", "whatsapp", "email", "e-mail"],
      text: "O Ôjas Bot fica no próprio site. Faz atendimento simples 24 horas, coleta dados e encaminha por e-mail ou WhatsApp."
    },
    {
      keys: ["n8n", "automacao", "automação", "integracao", "integração", "processo"],
      text: "No plano 03 ligamos o que já existe — site, bot e sistemas — com n8n: integração e automação de processos para o fluxo andar sozinho."
    },
    {
      keys: ["prazo", "tempo", "demora", "entrega"],
      text: "O recorte define o prazo. Uma Vitrine costuma sair em poucos ciclos; bot e automação entram depois do mapeamento do fluxo. Combinamos isso na conversa inicial."
    },
    {
      keys: ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"],
      text: "Olá. Sou o Ôjas Bot. Posso falar de planos, do site, do atendimento 24h ou da automação com n8n."
    }
  ];

  function add(text, who) {
    var el = document.createElement("div");
    el.className = "msg msg--" + who;
    el.textContent = text;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
  }

  function answer(q) {
    var n = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (var i = 0; i < replies.length; i++) {
      for (var k = 0; k < replies[i].keys.length; k++) {
        if (n.indexOf(replies[i].keys[k]) !== -1) return replies[i].text;
      }
    }
    return "Consigo orientar sobre Vitrine (R$ 1.490), Vitrine + Ôjas Bot (R$ 2.490 + R$ 149/mês) e o plano com automação n8n (R$ 4.490 + R$ 297/mês). Se preferir, fale com a equipe no WhatsApp.";
  }

  add("Olá. Sou o Ôjas Bot. Pergunte sobre planos, prazos, o site ou a automação — respondo aqui mesmo.", "bot");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = (input.value || "").trim();
    if (!q) return;
    add(q, "user");
    input.value = "";
    setTimeout(function () { add(answer(q), "bot"); }, 380);
  });
})();
