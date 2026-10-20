/* main.js — Lenis + ScrollTrigger в одном RAF, шапка, статус «открыто», общие появления, бирки на нитках.
   Модули регистрируются через DD.on(порядок, имя, fn) и запускаются по порядку: пины — первыми. */
(function () {
  'use strict';
  var DD = (window.DD = window.DD || {});
  var mods = [];
  DD.on = function (order, name, fn) { mods.push({ order: order, name: name, fn: fn }); };
  DD.$ = function (s, r) { return (r || document).querySelector(s); };
  DD.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  DD.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  DD.fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  DD.wa = function (text) { return 'https://wa.me/79625527198' + (text ? '?text=' + encodeURIComponent(text) : ''); };
  DD.rub = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; };
  DD.gsap = !!(window.gsap && window.ScrollTrigger);
  DD.vel = 0; // скорость прокрутки (для покачивания полотен)

  /* ---------- статус «открыто / закрыто» по Москве ---------- */
  var HOURS = { 0: [10, 18], 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 19] };
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function moscowNow() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return { day: WD[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  DD.status = function () {
    var n = moscowNow(), h = HOURS[n.day];
    var open = n.min >= h[0] * 60 && n.min < h[1] * 60;
    var full, mini;
    if (open) { full = mini = 'Открыто до ' + h[1] + ':00'; }
    else if (n.min < h[0] * 60) { full = 'Сейчас закрыто — ждём сегодня с ' + h[0] + ':00'; mini = 'Закрыто · откроемся в ' + h[0] + ':00'; }
    else { var t = HOURS[(n.day + 1) % 7]; full = 'Сейчас закрыто — ждём завтра с ' + t[0] + ':00'; mini = 'Закрыто · завтра с ' + t[0] + ':00'; }
    DD.$$('[data-status]').forEach(function (el) {
      var txt = el.querySelector('.status__text');
      if (txt) txt.textContent = el.classList.contains('status--mini') ? mini : full;
    });
    document.body.classList.toggle('is-closed', !open);
    DD.$$('[data-hours] tr').forEach(function (tr) { tr.classList.toggle('is-today', +tr.getAttribute('data-day') === n.day); });
    DD.isOpen = open;
    return open;
  };

  /* ---------- плавный скролл ---------- */
  function initScroll() {
    if (!DD.gsap) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.Flip) gsap.registerPlugin(Flip);
    if (DD.reduced || !window.Lenis) return;
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    DD.lenis = lenis;
    lenis.on('scroll', function (e) { DD.vel = e.velocity || 0; ScrollTrigger.update(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  DD.scrollTo = function (target, opts) {
    var el = typeof target === 'string' ? DD.$(target) : target;
    if (!el && target !== 0) return;
    if (DD.lenis) DD.lenis.scrollTo(el || 0, Object.assign({ duration: 1.3, easing: function (t) { return 1 - Math.pow(1 - t, 4); } }, opts || {}));
    else if (el) el.scrollIntoView({ behavior: DD.reduced ? 'auto' : 'smooth' });
    else window.scrollTo(0, 0);
  };
  DD.lock = function (on) {
    if (DD.lenis) on ? DD.lenis.stop() : DD.lenis.start();
    document.documentElement.style.overflow = on ? 'hidden' : '';
  };

  /* ---------- якоря ---------- */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.getElementById(id.slice(1));
      if (!el) return;
      e.preventDefault();
      if (DD.menuOpen) DD.closeMenu();
      DD.scrollTo(id === '#top' ? 0 : el);
      if (a.hasAttribute('data-goto-cat') && DD.catalog) DD.catalog.filter(a.getAttribute('data-goto-cat'));
    });
  }

  /* ---------- шапка ---------- */
  function initHeader() {
    var hdr = DD.$('[data-hdr]');
    var last = 0;
    function onScroll() {
      var y = window.scrollY;
      hdr.classList.toggle('is-solid', y > 60);
      var down = y > last + 2, up = y < last - 2;
      if (y < 120 || DD.menuOpen) hdr.classList.remove('is-hidden');
      else if (down) hdr.classList.add('is-hidden');
      else if (up) hdr.classList.remove('is-hidden');
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    hdr.addEventListener('focusin', function () { hdr.classList.remove('is-hidden'); });
    onScroll();

    // подсветка раздела в навигации
    var links = DD.$$('.hdr__nav a');
    if (DD.gsap) {
      links.forEach(function (a) {
        var sec = DD.$(a.getAttribute('href'));
        if (!sec) return;
        ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: function (s) { a.classList.toggle('is-here', s.isActive); } });
      });
    }
  }

  /* ---------- мобильное меню: три полотна ---------- */
  function initMenu() {
    var btn = DD.$('[data-burger]'), menu = DD.$('[data-menu]');
    if (!btn || !menu) return;
    var cloths = DD.$$('.menu__c', menu), items = DD.$$('.menu__nav a, .menu__foot', menu);
    function open() {
      DD.menuOpen = true; menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Закрыть меню');
      DD.lock(true);
      if (DD.gsap && !DD.reduced) {
        gsap.fromTo(cloths, { yPercent: -102 }, { yPercent: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' });
        gsap.fromTo(items, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, delay: 0.25, ease: 'power3.out' });
      }
      var first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true });
    }
    DD.closeMenu = function () {
      DD.menuOpen = false; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Меню');
      DD.lock(false);
      if (DD.gsap && !DD.reduced) gsap.to(cloths, { yPercent: -102, duration: 0.45, stagger: 0.05, ease: 'power3.in', onComplete: function () { menu.hidden = true; } });
      else menu.hidden = true;
    };
    btn.addEventListener('click', function () { DD.menuOpen ? DD.closeMenu() : open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && DD.menuOpen) { DD.closeMenu(); btn.focus(); } });
    window.addEventListener('resize', function () { if (DD.menuOpen && window.innerWidth >= 1024) DD.closeMenu(); });
  }

  /* ---------- слова из-под маски ---------- */
  DD.splitWords = function (el, cls) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    var out = [];
    nodes.forEach(function (node) {
      var parts = node.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span');
        w.className = cls || 'w';
        if (!cls) { var inner = document.createElement('span'); inner.textContent = p; w.appendChild(inner); out.push(inner); }
        else { w.textContent = p; out.push(w); }
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return out;
  };

  function initReveals() {
    if (!DD.gsap || DD.reduced) return;
    DD.$$('[data-reveal-words]').forEach(function (el) {
      if (el.closest('[data-hero]')) return;
      var words = DD.splitWords(el);
      gsap.from(words, { yPercent: 110, y: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'clamp(top 88%)', once: true } });
    });
    // манифест: слова темнеют по одному
    DD.$$('[data-words]').forEach(function (el) {
      var words = DD.splitWords(el, 'mw');
      // 15 % → 100 %; бледное состояние появляется только у въезжающего блока — при загрузке текст полный
      gsap.fromTo(words, { opacity: 0.15 }, { opacity: 1, ease: 'none', stagger: 0.12, immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 40%', scrub: 0.5 } });
    });
    var blocks = '.manifest__photo, .tags, .sec__head .lead, .hall__legend, .ribbon, .sketch__text, .catalog__lead, .tabs, .catalog__more, .gift__ask > .lead, .ask, .gift__result, .chest__video, .chest__text .lead, .chest__facts, .chest__text .btn, .builder, .strips, .visit__photo, .visit__info > :not(.draw), .map';
    // clamp(): блок у самого конца страницы до 90 % экрана не доедет — старт прижимается к концу прокрутки
    DD.$$(blocks).forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'clamp(top 90%)', once: true } });
    });
  }

  /* ---------- бирки: маятник с пружиной ---------- */
  function initTags() {
    var tags = DD.$$('[data-tag]');
    if (!tags.length || DD.reduced) return;
    var st = tags.map(function (el) { return { el: el, a: 0, v: 0, live: false }; });
    var K = 46, C = 2.4;
    function kick(s, imp) { s.v += imp; s.live = true; }
    st.forEach(function (s, i) {
      s.el.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') kick(s, Math.max(-30, Math.min(30, e.movementX * 2.2))); });
      s.el.addEventListener('pointerdown', function () { kick(s, (Math.random() > 0.5 ? 1 : -1) * 60); });
      if (DD.gsap) ScrollTrigger.create({ trigger: s.el, start: 'top 92%', once: true, onEnter: function () { setTimeout(function () { kick(s, (i % 2 ? -1 : 1) * (55 + Math.random() * 30)); }, i % 4 * 110); } });
    });
    var lastT = performance.now();
    function step(now) {
      var dt = Math.min(0.033, (now - lastT) / 1000); lastT = now;
      st.forEach(function (s) {
        if (!s.live) return;
        s.v += (-K * s.a - C * s.v) * dt;
        s.a += s.v * dt;
        if (Math.abs(s.a) < 0.02 && Math.abs(s.v) < 0.05) { s.a = 0; s.v = 0; s.live = false; }
        s.el.style.transform = 'rotate(' + s.a.toFixed(3) + 'deg)';
      });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- вышивка: прорисовка росчерков и букетов, стежки по биркам ---------- */
  function initEmbroidery() {
    DD.$$('.draw').forEach(function (el) {
      if (!DD.gsap || DD.reduced) { el.classList.add('is-drawn'); return; }
      ScrollTrigger.create({ trigger: el, start: 'clamp(top 90%)', once: true, onEnter: function () { setTimeout(function () { el.classList.add('is-drawn'); }, 250); } });
    });
    // большие розетки и облачка в цветных разделах медленно поворачиваются при прокрутке
    if (DD.gsap && !DD.reduced) DD.$$('.float-orn').forEach(function (el, i) {
      gsap.fromTo(el, { rotation: i % 2 ? 18 : -18 }, { rotation: i % 2 ? -42 : 42, ease: 'none',
        scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: 1 } });
    });
    var NS = 'http://www.w3.org/2000/svg';
    var cards = DD.$$('.tag__card');
    function stitch() {
      cards.forEach(function (card) {
        var w = card.offsetWidth, h = card.offsetHeight, d = 6.5;
        if (!w) return;
        var svg = card.querySelector('.tag__stitch');
        if (!svg) { svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'tag__stitch'); svg.setAttribute('aria-hidden', 'true'); svg.appendChild(document.createElementNS(NS, 'polygon')); card.appendChild(svg); }
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        var cx = w * 0.16, cy = h * 0.15;
        // тот же силуэт, что у clip-path бирки, отступ внутрь ~6 px
        var pts = [[cx + d * 0.45, d], [w - cx - d * 0.45, d], [w - d, cy + d * 0.9], [w - d, h - d], [d, h - d], [d, cy + d * 0.9]];
        svg.firstChild.setAttribute('points', pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
      });
    }
    stitch();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(stitch);
    var t = 0;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(stitch, 150); });
  }

  /* ---------- видео и пауза вне экрана ---------- */
  function initVideos() {
    var vids = DD.$$('video[data-autoplay]');
    if (DD.reduced || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { rootMargin: '120px 0px' });
    vids.forEach(function (v) { v.muted = true; io.observe(v); });
  }

  /* ---------- отзывы: дублируем ленты для бесшовной петли ---------- */
  function initStrips() {
    DD.$$('.strips__track').forEach(function (t) {
      DD.$$('li', t).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); t.appendChild(c); });
    });
  }

  /* ---------- живая карта по кнопке ---------- */
  function initMap() {
    var btn = DD.$('[data-map-live]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var map = DD.$('[data-map]');
      var f = document.createElement('iframe');
      f.src = 'https://yandex.ru/map-widget/v1/?oid=136296826032&z=17';
      f.title = 'Яндекс Карта: Дом татарской продукции на Мартына Межлаука, 6';
      f.loading = 'lazy';
      f.allowFullscreen = true;
      map.appendChild(f);
      map.classList.add('is-live');
    });
  }

  /* ---------- Max: ссылка «поделиться» открывает приложение с готовым текстом ---------- */
  // max.ru/:share?text= в мобильном Max открывает выбор чата; в браузере на компьютере такой страницы нет,
  // поэтому текст ещё и копируем, а подсказка говорит, кому его отправить.
  DD.maxUrl = function (text) { return 'https://max.ru/:share?text=' + encodeURIComponent(text || 'Здравствуйте!'); };
  DD.maxLink = function (el, text) { if (el) { el.href = DD.maxUrl(text); el.setAttribute('data-max-msg', text || ''); } };
  var toastT = 0;
  DD.toast = function (msg) {
    var t = DD.$('[data-toast]');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    requestAnimationFrame(function () { t.classList.add('is-on'); });
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('is-on'); setTimeout(function () { t.hidden = true; }, 400); }, 6500);
  };
  function initMax() {
    DD.$$('[data-max-text]').forEach(function (a) {
      DD.maxLink(a, a.getAttribute('data-max-text'));
      a.target = '_blank'; a.rel = 'noopener';
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-max-msg]');
      if (!a) return;
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var text = a.getAttribute('data-max-msg');
      try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (err) {}
      DD.toast('Открываем Max. Выберите чат с магазином +7 (962) 552-71-98 — текст уже скопирован, его можно просто вставить.');
    });
  }

  /* ---------- запуск ---------- */
  function boot() {
    DD.status();
    setInterval(DD.status, 60000);
    initScroll();
    initStrips();
    mods.sort(function (a, b) { return a.order - b.order; });
    var run = function (m) {
      try { m.fn(); } catch (err) { console.error('[DD] модуль ' + m.name + ':', err); }
    };
    mods.filter(function (m) { return m.order < 50; }).forEach(run); // пины и сцены
    initAnchors();
    initHeader();
    initMenu();
    mods.filter(function (m) { return m.order >= 50; }).forEach(run);
    initReveals();
    initTags();
    initEmbroidery();
    initVideos();
    initMap();
    initMax();
    if (DD.gsap) {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    document.documentElement.classList.add('is-ready');
  }
  // все модули подключены с defer и успевают зарегистрироваться до DOMContentLoaded
  document.addEventListener('DOMContentLoaded', boot);
})();
