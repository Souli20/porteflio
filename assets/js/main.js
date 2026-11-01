(function () {
  'use strict';

  var EN = document.documentElement.lang === 'en';
  function L(fr, en) { return EN ? en : fr; }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Année du pied de page ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Barre de progression + en-tête ---------- */
  var prog = $('#prog'), nav = $('#nav');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', h.scrollTop > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = $('#nav-toggle'), links = $('#nav-links');
  function closeMenu() {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', L('Ouvrir le menu', 'Open menu'));
    links.classList.remove('open');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? L('Ouvrir le menu', 'Open menu') : L('Fermer le menu', 'Close menu'));
      links.classList.toggle('open', !open);
    });
    $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Thème clair / sombre ---------- */
  var themeBtn = $('#theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Apparition au défilement ---------- */
  var reveals = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Lien actif dans le menu ---------- */
  var sections = $$('main section[id]');
  if ('IntersectionObserver' in window && links) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$('a', links).forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Filtre des projets ---------- */
  var chips = $$('.chip'), projects = $$('.proj');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-f');
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('on', on);
        c.setAttribute('aria-pressed', String(on));
      });
      projects.forEach(function (p) {
        var cats = (p.getAttribute('data-cat') || '').split(' ');
        p.classList.toggle('hide', f !== 'all' && cats.indexOf(f) === -1);
      });
    });
  });

  /* ---------- Formulaire de contact ---------- */
  var form = $('#contact-form'), status = $('#form-status'), btn = $('#submit-btn');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['nom', 'email', 'message'].forEach(function (id) {
        var el = $('#' + id), field = el.closest('.field');
        var valid = el.value.trim() !== '' && (id !== 'email' || /^\S+@\S+\.\S+$/.test(el.value));
        field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!$('#consent').checked) ok = false;
      if (!ok) {
        status.className = 'form-status err';
        status.textContent = L('Merci de remplir les champs obligatoires et de cocher la case de consentement.', 'Please fill in the required fields and tick the consent box.');
        return;
      }
      btn.disabled = true;
      status.className = 'form-status';
      status.textContent = L('Envoi en cours…', 'Sending…');
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.reset();
        status.className = 'form-status ok';
        status.textContent = L('Message envoyé, merci ! Je vous réponds bientôt.', 'Message sent, thank you! I will reply soon.');
      }).catch(function () {
        status.className = 'form-status err';
        status.textContent = L("L'envoi a échoué. Réessayez plus tard ou contactez-moi via LinkedIn.", 'Sending failed. Please try again later or contact me on LinkedIn.');
      }).then(function () { btn.disabled = false; });
    });
  }
  /* ---------- Suggestion de langue (page française uniquement) ---------- */
  var langBanner = $('#lang-banner');
  if (langBanner && !EN) {
    var first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    var dismissed = false;
    try { dismissed = localStorage.getItem('langBannerDismissed') === '1'; } catch (e) {}
    if (/^en/i.test(first) && !dismissed) langBanner.hidden = false;
    var closeLang = function () {
      langBanner.hidden = true;
      try { localStorage.setItem('langBannerDismissed', '1'); } catch (e) {}
    };
    var langClose = $('#lang-close');
    if (langClose) langClose.addEventListener('click', closeLang);
    var langLink = $('a', langBanner);
    if (langLink) langLink.addEventListener('click', function () {
      try { localStorage.setItem('langBannerDismissed', '1'); } catch (e) {}
    });
  }
})();
