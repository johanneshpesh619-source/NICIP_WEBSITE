/* =====================================================================
   NICIP Construction Ltd - script.js
   Link it just before </body>:   <script src="script.js"></script>

   Sections
     0. Settings you can edit
     1. Styles used by the script (lightbox, errors, back-to-top...)
     2. Navigation: burger menu + smooth scrolling
     3. Images: swap placeholders for real photos
     4. Lightbox: click an image to enlarge it
     5. Contact form validation
     6. Button click effect
     7. Fade-in on scroll
     8. Back-to-top button
   ===================================================================== */
(function () {
  'use strict';

document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- 0. SETTINGS YOU CAN EDIT ---------------------------------- */
  var CONFIG = {
    backToTopAfter: 400,       // px scrolled before the back-to-top button appears
    minMessageLength: 10,      // shortest message the form accepts
    // Placeholder -> real photo. Use "match" (text found in a project's heading)
    // or "selector" (any CSS selector). If the file is missing, the placeholder stays.
    images: [
      { selector: '#about .img-ph', src: 'Team.jpg',       alt: 'The NICIP Construction team' },
      { match: 'Water & Sewer',     src: 'Water.jpg',      alt: 'Water and sewer reticulation works' },
      { match: 'Additional Civil',  src: 'Additional.jpg', alt: 'Road and gabion wall construction' }
    ]
  };

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tiny helpers
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- 1. STYLES USED BY THE SCRIPT ------------------------------
     Injected here so this one file is all you need. Move them into
     style.css later if you prefer.                                        */
  function injectStyles() {
    var css = [
      '.project img{display:block;width:100%;height:190px;object-fit:cover;border-radius:8px;margin-bottom:1rem}',
      'img.photo{display:block;width:100%;max-height:360px;object-fit:cover;border-radius:10px}',
      '.project img,img.photo,img[data-lightbox]{cursor:zoom-in}',
      '.btn:hover{transform:translateY(-2px) scale(1.03)}.btn:active{transform:scale(.97)}',
      '.menu-toggle:focus-visible + .burger{outline:3px solid #f7941d;outline-offset:2px}',
      /* fade-in */
      '.reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}',
      '.reveal.is-visible{opacity:1;transform:none}',
      /* form errors */
      '.field-error{margin:.3rem 0 0;color:#b42318;font-size:.88rem;font-weight:600}',
      '.form input.invalid,.form textarea.invalid{border-color:#b42318;background:#fff7f6}',
      '.form-status{margin:.9rem 0 0;font-weight:600;color:#1b5bb8}.form-status.error{color:#b42318}',
      /* back to top */
      '#back-to-top{position:fixed;right:1.2rem;bottom:1.2rem;z-index:60;width:48px;height:48px;border:0;border-radius:50%;',
      'background:#f7941d;color:#1d1400;font-size:1.5rem;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);',
      'opacity:0;visibility:hidden;transform:translateY(12px);transition:opacity .3s,transform .3s,visibility .3s}',
      '#back-to-top.show{opacity:1;visibility:visible;transform:none}',
      /* lightbox */
      '.lightbox{position:fixed;top:0;right:0;bottom:0;left:0;z-index:200;display:flex;align-items:center;justify-content:center;',
      'padding:1rem;background:rgba(8,18,40,.92);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}',
      '.lightbox.open{opacity:1;visibility:visible}',
      '.lightbox figure{margin:0;text-align:center}',
      '.lightbox figure img{max-width:90vw;max-height:78vh;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.5)}',
      '.lightbox figcaption{margin-top:.8rem;color:#fff}',
      '.lightbox button{position:absolute;border:0;background:rgba(255,255,255,.15);color:#fff;font-size:2rem;line-height:1;',
      'width:48px;height:48px;border-radius:50%;cursor:pointer}',
      '.lightbox button:hover{background:rgba(255,255,255,.3)}',
      '.lb-close{top:1rem;right:1rem}.lb-prev{left:1rem;top:50%}.lb-next{right:1rem;top:50%}',
      'body.no-scroll{overflow:hidden}'
    ].join('');
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- 2. NAVIGATION ---------------------------------------------
     The burger already works through the CSS checkbox (#menu-toggle), so it
     still works without JavaScript. The script adds: close on link click,
     close on Escape / outside click, and smooth scrolling that allows for the
     sticky header.                                                         */
  function initNavigation() {
    var toggle = $('#menu-toggle');
    var header = $('.site-header');

    function closeMenu() { if (toggle) toggle.checked = false; }

    function scrollToTarget(target) {
      var offset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');          // lets keyboard users land on the section
      target.focus({ preventScroll: true });
    }

    // Every in-page link (#about, #contact, skip link, footer links...)
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (hash.length < 2) return;                   // "#" placeholders (e.g. social links)
        var target = document.getElementById(hash.slice(1));
        if (!target) return;
        e.preventDefault();
        closeMenu();
        scrollToTarget(target);
        try { history.pushState(null, '', hash); } catch (err) { /* ignored on some file:// pages */ }
      });
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (e) {
      if (toggle && toggle.checked && header && !header.contains(e.target)) closeMenu();
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) closeMenu(); });
  }

  /* ---------- 3. IMAGES -------------------------------------------------
     Replaces each placeholder box with a real <img> - but only after the file
     has loaded, so a missing file never leaves a broken-image icon.        */
  function findProjectPlaceholder(text) {
    var cards = $$('.project');
    for (var i = 0; i < cards.length; i++) {
      var h3 = $('h3', cards[i]);
      if (h3 && h3.textContent.indexOf(text) > -1) return $('.img-ph', cards[i]);
    }
    return null;
  }

  function initImages() {
    CONFIG.images.forEach(function (item) {
      var holder = item.selector ? $(item.selector) : findProjectPlaceholder(item.match);
      if (!holder) return;
      var probe = new Image();
      probe.onload = function () {
        var img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || '';
        img.loading = 'lazy';
        if (item.selector) img.className = 'photo';     // non-project photos get the "photo" style
        holder.parentNode.replaceChild(img, holder);
        makeKeyboardFriendly(img);
      };
      probe.src = item.src;                            // onerror: do nothing, keep the placeholder
    });
    $$('.project img').forEach(function (img) { img.loading = 'lazy'; });
  }

  /* ---------- 4. LIGHTBOX ----------------------------------------------- */
  var LIGHTBOX_IMAGES = '.project img, img.photo, img[data-lightbox]';

  // Make pictures reachable and usable from the keyboard (Tab, then Enter/Space)
  function makeKeyboardFriendly(img) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Enlarge image: ' + (img.alt || 'photo'));
  }

  function initLightbox() {
    $$(LIGHTBOX_IMAGES).forEach(makeKeyboardFriendly);

    // Build the overlay once
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    box.innerHTML =
      '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lb-prev" aria-label="Previous image">&#8249;</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-next" aria-label="Next image">&#8250;</button>';
    document.body.appendChild(box);

    var bigImg = $('img', box), caption = $('figcaption', box);
    var closeBtn = $('.lb-close', box), prevBtn = $('.lb-prev', box), nextBtn = $('.lb-next', box);
    var list = [], index = 0, lastFocus = null;

    function show() {
      var img = list[index];
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt;
      caption.textContent = img.alt;
      prevBtn.style.display = nextBtn.style.display = list.length > 1 ? '' : 'none';
    }
    function open(img) {
      list = $$(LIGHTBOX_IMAGES);
      index = Math.max(0, list.indexOf(img));
      lastFocus = document.activeElement;
      show();
      box.classList.add('open');
      document.body.classList.add('no-scroll');
      closeBtn.focus();
    }
    function close() {
      box.classList.remove('open');
      document.body.classList.remove('no-scroll');
      if (lastFocus) lastFocus.focus();
    }
    function step(n) { index = (index + n + list.length) % list.length; show(); }

    // One delegated listener also covers images swapped in later
    document.addEventListener('click', function (e) {
      var img = e.target.closest ? e.target.closest(LIGHTBOX_IMAGES) : null;
      if (img && !box.contains(img)) open(img);
    });
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (!box.classList.contains('open')) {
        if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches(LIGHTBOX_IMAGES)) {
          e.preventDefault(); open(t);
        }
        return;
      }
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') {                      // keep focus inside the overlay
        var ctrls = [closeBtn, prevBtn, nextBtn].filter(function (b) { return b.style.display !== 'none'; });
        var i = ctrls.indexOf(document.activeElement);
        e.preventDefault();
        ctrls[(i + (e.shiftKey ? -1 : 1) + ctrls.length) % ctrls.length].focus();
      }
    });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });   // click backdrop
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
  }

  /* ---------- 5. CONTACT FORM VALIDATION --------------------------------
     Checks every field marked "required" plus email format, then shows the
     message under the field. When everything is valid the form is submitted
     normally (your form currently opens the visitor's email app).          */
  function initForm() {
    var form = $('form.form');
    if (!form) return;
    form.setAttribute('novalidate', '');               // we show our own messages instead of the browser's
    var fields = $$('input, textarea', form);
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var status = document.createElement('p');          // overall result line above the button
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    form.insertBefore(status, $('button[type="submit"]', form));

    function labelOf(f) {
      var l = $('label[for="' + f.id + '"]', form);
      return l ? l.textContent.replace(/\(optional\)/i, '').trim() : 'This field';
    }

    // Returns an error message, or '' when the field is fine
    function check(f) {
      var v = f.value.trim();
      if (f.required && !v) return labelOf(f) + ' is required.';
      if (f.type === 'email' && v && !EMAIL.test(v)) return 'Enter a valid email address, e.g. name@example.com.';
      if (f.type === 'tel' && v && !/^[0-9+()\-\s]{5,20}$/.test(v)) return 'Use digits, spaces, + ( ) or - only.';
      if (f.id === 'message' && v && v.length < CONFIG.minMessageLength)
        return 'Please write at least ' + CONFIG.minMessageLength + ' characters.';
      return '';
    }

    function showError(f, msg) {
      var err = document.getElementById(f.id + '-error');
      if (!err) {
        err = document.createElement('p');
        err.id = f.id + '-error';
        err.className = 'field-error';
        f.parentNode.insertBefore(err, f.nextSibling);
      }
      err.textContent = msg;
      err.hidden = !msg;
      f.classList.toggle('invalid', !!msg);
      if (msg) { f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', err.id); }
      else { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); }
    }

    fields.forEach(function (f) {
      f.addEventListener('blur', function () { f.dataset.touched = '1'; showError(f, check(f)); });
      f.addEventListener('input', function () { if (f.dataset.touched) showError(f, check(f)); });
    });

    form.addEventListener('submit', function (e) {
      var firstBad = null;
      fields.forEach(function (f) {
        var msg = check(f);
        showError(f, msg);
        if (msg && !firstBad) firstBad = f;
      });
      if (firstBad) {
        e.preventDefault();                            // stop sending
        firstBad.focus();
        status.className = 'form-status error';
        status.textContent = 'Please correct the highlighted fields.';
      } else {
        status.className = 'form-status';
        status.textContent = 'Thank you. Opening your email app to send the message...';
      }
    });
  }

  /* ---------- 6. BUTTON CLICK EFFECT -------------------------------------
     Hover/press styles come from the injected CSS above; this adds a quick
     "squash" animation on click for any .btn or <button>.                  */
  function initButtons() {
    if (reduceMotion) return;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.btn, button') : null;
      if (!btn || !btn.animate) return;
      btn.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(0.92)' }, { transform: 'scale(1)' }],
        { duration: 220, easing: 'ease-out' }
      );
    });
  }

  /* ---------- 7. FADE-IN ON SCROLL ---------------------------------------
     Sections start slightly faded and slide up when they scroll into view.
     Added by JS, so visitors without JS (or who prefer reduced motion) just
     see the normal page.                                                   */
  function initReveal() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var sections = $$('main .section');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);            // animate once
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    sections.forEach(function (s) { s.classList.add('reveal'); observer.observe(s); });
  }

  /* ---------- 8. BACK-TO-TOP BUTTON -------------------------------------- */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '&uarr;';
    document.body.appendChild(btn);

    var ticking = false;                               // throttle scroll work to one per frame
    function update() {
      btn.classList.toggle('show', window.pageYOffset > CONFIG.backToTopAfter);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var home = document.getElementById('home');
      if (home) { home.setAttribute('tabindex', '-1'); home.focus({ preventScroll: true }); }
    });
    update();
  }

  /* ---------- START ------------------------------------------------------ */
  function init() {
    injectStyles();
    initNavigation();
    initImages();
    initLightbox();
    initForm();
    initButtons();
    initReveal();
    initBackToTop();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
