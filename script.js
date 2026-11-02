/* NICIP Construction Ltd - script.js (loaded with "defer") */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* Navigation: close menu on link / Escape / outside click, highlight current section */
  var toggle = $('#menu-toggle'), header = $('.site-header');
  function closeMenu() { toggle.checked = false; }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (!t) return;
      e.preventDefault(); closeMenu();
      window.scrollTo({ top: t.getBoundingClientRect().top + pageYOffset - header.offsetHeight + 1, behavior: calm ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
      try { history.pushState(null, '', a.getAttribute('href')); } catch (x) {}
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeBox(); } });
  document.addEventListener('click', function (e) { if (toggle.checked && !header.contains(e.target)) closeMenu(); });
  addEventListener('resize', function () { if (innerWidth > 760) closeMenu(); });

  if ('IntersectionObserver' in window) {
    var links = $$('.nav a[href^="#"]:not(.btn)');
    var spy = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + x.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* Project filter */
  var btns = $$('.filters button'), cards = $$('.project');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filter;
      btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
      cards.forEach(function (c) { c.hidden = f !== 'all' && c.dataset.cat.split(' ').indexOf(f) < 0; });
    });
  });

  /* Lightbox for project photos */
  var box = document.createElement('div');
  box.className = 'lightbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Photo viewer');
  box.innerHTML = '<div><img alt=""><p></p></div><button type="button" aria-label="Close">&times;</button>';
  document.body.appendChild(box);
  var last;
  function closeBox() { if (box.classList.contains('open')) { box.classList.remove('open'); if (last) last.focus(); } }
  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.thumb img');
    if (img) { last = img; $('img', box).src = img.currentSrc || img.src; $('p', box).textContent = img.alt; box.classList.add('open'); $('button', box).focus(); }
    else if (e.target === box || e.target.closest('.lightbox button')) closeBox();
  });

  /* Contact form: inline validation + AJAX send (no page redirect) */
  var form = $('form.form'), status = $('.form-status', form);
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function check(f) {
    var v = f.value.trim();
    if (f.required && !v) return 'This field is required.';
    if (f.type === 'email' && v && !EMAIL.test(v)) return 'Enter a valid email, e.g. name@example.com.';
    if (f.type === 'tel' && v && !/^[0-9+()\-\s]{5,20}$/.test(v)) return 'Use digits, spaces, + ( ) or - only.';
    if (f.id === 'message' && v && v.length < 10) return 'Please write at least 10 characters.';
    return '';
  }
  function show(f, msg) {
    var err = document.getElementById(f.id + '-error');
    if (!err) { err = document.createElement('p'); err.id = f.id + '-error'; err.className = 'field-error'; f.after(err); }
    err.textContent = msg; err.hidden = !msg;
    f.classList.toggle('invalid', !!msg);
    f.setAttribute('aria-invalid', !!msg);
    if (msg) f.setAttribute('aria-describedby', err.id);
  }
  var fields = $$('input:not(.hp), textarea', form);
  form.noValidate = true;
  fields.forEach(function (f) {
    f.addEventListener('blur', function () { f.dataset.t = 1; show(f, check(f)); });
    f.addEventListener('input', function () { if (f.dataset.t) show(f, check(f)); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    fields.forEach(function (f) { var m = check(f); show(f, m); if (m && !bad) bad = f; });
    status.className = 'form-status';
    if (bad) { bad.focus(); status.className += ' error'; status.textContent = 'Please correct the highlighted fields.'; return; }
    var btn = $('button', form); btn.disabled = true; status.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw 0;
        form.reset(); fields.forEach(function (f) { delete f.dataset.t; });
        status.textContent = 'Thank you. Your message has been sent and we will reply soon.';
      })
      .catch(function () {
        status.className += ' error';
        status.textContent = 'Your message could not be sent. Please call +675 7831 6190 or email nicipworks@gmail.com.';
      })
      .then(function () { btn.disabled = false; });
  });

  /* Back to top */
  var top = document.createElement('button');
  top.id = 'top-btn'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top'); top.innerHTML = '&uarr;';
  document.body.appendChild(top);
  addEventListener('scroll', function () { top.classList.toggle('show', pageYOffset > 500); }, { passive: true });
  top.addEventListener('click', function () { scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }); });
})();
