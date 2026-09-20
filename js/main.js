(function () {
  var nav = document.querySelector(".nav");
  if (nav) {
    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var N8N_WEBHOOK = "https://n8n.ojaslab.com.br/webhook/lead-plano";

  var leadModal = document.getElementById("leadModal");
  var thanksModal = document.getElementById("thanksModal");
  var form = document.getElementById("leadForm");
  var planoInput = document.getElementById("leadPlano");
  var planoLabel = document.getElementById("leadPlanoLabel");

  function openModal(el) {
    if (!el) return;
    el.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal(el) {
    if (!el) return;
    el.hidden = true;
    if ((!leadModal || leadModal.hidden) && (!thanksModal || thanksModal.hidden)) {
      document.body.style.overflow = "";
    }
  }

  document.querySelectorAll(".plano__btn[data-plano]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!form || !planoInput) return;
      var plano = btn.getAttribute("data-plano") || "";
      form.reset();
      planoInput.value = plano;
      if (planoLabel) planoLabel.textContent = plano;
      openModal(leadModal);
    });
  });

  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      var which = el.getAttribute("data-close");
      closeModal(which === "lead" ? leadModal : thanksModal);
    });
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        nome: (form.nome.value || "").trim(),
        telefone: (form.telefone.value || "").trim(),
        email: (form.email.value || "").trim(),
        plano: planoInput ? planoInput.value : "",
        origem: "site-ojas-lab",
        data: new Date().toISOString()
      };
      if (!data.nome || !data.telefone || !data.email) return;

      fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).catch(function () {});

      closeModal(leadModal);
      openModal(thanksModal);
    });
  }
})();
