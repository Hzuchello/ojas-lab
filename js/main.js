(function () {
  var nav = document.querySelector(".nav");
  if (nav) {
    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var toggle = nav.querySelector(".nav__toggle");
    var links = nav.querySelector(".nav__links");
    function setMenu(on) {
      nav.classList.toggle("is-menu", on);
      if (toggle) {
        toggle.setAttribute("aria-expanded", on ? "true" : "false");
        toggle.setAttribute("aria-label", on ? "Fechar menu" : "Abrir menu");
      }
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        setMenu(!nav.classList.contains("is-menu"));
      });
    }
    if (links) {
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { setMenu(false); });
      });
    }
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setMenu(false);
    });
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

  function abrirPlano(plano) {
    if (!form || !planoInput || !leadModal) return;
    form.reset();
    planoInput.value = plano || "";
    if (planoLabel) planoLabel.textContent = plano || "";
    openModal(leadModal);
  }
  window.ojasAbrirPlano = abrirPlano;

  document.querySelectorAll(".plano__btn[data-plano]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      abrirPlano(btn.getAttribute("data-plano") || "");
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
