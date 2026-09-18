/* ============================================================
   proads24 — основной скрипт сайта
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Шапка: плотный фон при скролле ---------- */
  var header = $(".site-header");
  var onScroll = function () {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Мобильное меню ---------- */
  var burger = $(".burger");
  var navList = $("#site-nav .nav-list");

  function closeMenu() {
    document.body.classList.remove("nav-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  }

  burger.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });

  navList.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeMenu();
  });

  /* ---------- Scrollspy: подсветка активного раздела ---------- */
  var spyLinks = $$("[data-spy]");
  var spyMap = {};
  spyLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    spyMap[id] = link;
  });

  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = spyMap[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        spyLinks.forEach(function (l) { l.classList.remove("is-active"); });
        link.classList.add("is-active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

  Object.keys(spyMap).forEach(function (id) {
    var section = document.getElementById(id);
    if (section) spyObserver.observe(section);
  });

  /* ---------- Процесс: активация этапов по скроллу ---------- */
  var steps = $$(".step");
  var progress = $(".process-progress");

  function updateProgress() {
    if (!steps.length || !progress) return;
    var activeIndex = -1;
    steps.forEach(function (s, i) { if (s.classList.contains("is-active")) activeIndex = i; });
    var ratio = (activeIndex + 1) / steps.length;
    progress.style.transform = "scaleY(" + ratio + ")";
  }

  if (steps.length) {
    var stepsObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
        } else if (entry.boundingClientRect.top > 0) {
          entry.target.classList.remove("is-active");
        }
        updateProgress();
      });
    }, { rootMargin: "-30% 0px -30% 0px", threshold: .2 });
    steps.forEach(function (s) { stepsObserver.observe(s); });
    updateProgress();
  }

  /* ---------- Модалка заявки ---------- */
  var leadModal = $("#lead-modal");
  var docDialog = $("#doc-dialog");
  var leadForm = $("#lead-form");
  var successBox = $("#form-success");
  var topicSelect = $("#f-topic");
  var lastFocused = null;

  var SERVICE_TOPICS = ["Контекстная реклама", "Таргетированная реклама", "Медиа и programmatic"];

  function openModal(topic) {
    lastFocused = document.activeElement;
    leadForm.hidden = false;
    successBox.hidden = true;

    if (topic) {
      var matched = SERVICE_TOPICS.indexOf(topic) !== -1;
      if (matched) {
        topicSelect.value = topic;
      } else {
        // Отрасль или спец. тема — уводим в комментарий, тему ставим «Другое»
        var otherOption = topicSelect.querySelector('option[value="Другое"]') ||
          Array.prototype.filter.call(topicSelect.options, function (o) { return o.value === "Другое"; })[0];
        if (otherOption) topicSelect.value = "Другое";
        var comment = $("#f-comment");
        if (comment && !comment.value) comment.value = "Направление: " + topic;
      }
    }
    leadModal.showModal();
  }

  function closeModal(dialog) {
    dialog.close();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-modal]");
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute("data-topic"));
      return;
    }
    var closer = e.target.closest("[data-close-modal]");
    if (closer) {
      closeModal(closer.closest("dialog"));
      return;
    }
    var doc = e.target.closest("[data-doc]");
    if (doc) {
      e.preventDefault();
      var titles = {
        policy: "Политика конфиденциальности",
        consent: "Согласие на обработку персональных данных"
      };
      $("#doc-dialog-title").textContent = titles[doc.getAttribute("data-doc")] || "Документ";
      docDialog.showModal();
    }
  });

  // Клик по подложке закрывает окно
  [leadModal, docDialog].forEach(function (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeModal(dialog);
    });
  });

  /* ---------- Маска телефона ---------- */
  var phoneInput = $("#f-phone");
  phoneInput.addEventListener("input", function () {
    var digits = phoneInput.value.replace(/\D/g, "");
    if (!digits) { phoneInput.value = ""; return; }
    if (digits[0] === "8") digits = "7" + digits.slice(1);
    if (digits[0] !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);
    var out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ") " + digits.slice(4, 7);
    if (digits.length >= 7) out += "-" + digits.slice(7, 9);
    if (digits.length >= 9) out += "-" + digits.slice(9, 11);
    phoneInput.value = out;
  });

  /* ---------- Валидация и отправка ---------- */
  function setError(input, errId, hasError) {
    var err = document.getElementById(errId);
    var field = input.closest(".field");
    err.hidden = !hasError;
    field.classList.toggle("has-error", hasError);
    input.setAttribute("aria-invalid", String(hasError));
  }

  var nameInput = $("#f-name");
  var emailInput = $("#f-email");
  var consentInput = $("#f-consent");

  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener("input", function () { setError(input, input.id + "-err", false); });
  });
  consentInput.addEventListener("change", function () { setError(consentInput, "f-consent-err", false); });

  leadForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    if (!nameInput.value.trim()) { setError(nameInput, "f-name-err", true); valid = false; }
    if (phoneInput.value.replace(/\D/g, "").length < 11) { setError(phoneInput, "f-phone-err", true); valid = false; }
    if (emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value)) { setError(emailInput, "f-email-err", true); valid = false; }
    if (!consentInput.checked) { setError(consentInput, "f-consent-err", true); valid = false; }
    if (!valid) {
      var firstError = $(".field.has-error input, .field.has-error textarea");
      if (firstError) firstError.focus();
      return;
    }

    var submit = $(".btn-submit", leadForm);
    submit.disabled = true;
    submit.classList.add("is-loading");

    // Демо-режим: на реальном сайте здесь отправка на backend / в CRM.
    // Черновик заявки сохраняем локально, чтобы данные не потерялись.
    try {
      localStorage.setItem("proads24-lead-draft", JSON.stringify({
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        company: $("#f-company").value.trim(),
        topic: topicSelect.value,
        budget: $("#f-budget").value,
        comment: $("#f-comment").value.trim(),
        sentAt: new Date().toISOString()
      }));
    } catch (err) { /* приватный режим — просто пропускаем */ }

    window.setTimeout(function () {
      submit.disabled = false;
      submit.classList.remove("is-loading");
      leadForm.hidden = true;
      successBox.hidden = false;
      successBox.querySelector("button").focus();
    }, 900);
  });

  /* ---------- Год в футере ---------- */
  var year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

