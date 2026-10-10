/* hall.js — «Прогулка по дому»: точки-бутоны на фото зала, лента кадров с инерцией, лайтбокс, эскиз → фото. */
(function () {
  'use strict';
  var DD = window.DD;
  var $ = DD.$, $$ = DD.$$;

  var ZONES = {
    tea: { title: 'Чай и травы', text: 'Стеллажи слева: «Чай Богатых Татар», прессованный казанский, синий чай, сбитень.' },
    sweets: { title: 'Чак-чак и сладости', text: 'Прилавок в центре — горы свежего чак-чака. Здесь же и дают попробовать.' },
    drinks: { title: 'Квас и напитки', text: 'Холодильник справа: казанский домашний квас — берите холодным.' },
    souvenirs: { title: 'Сувениры', text: 'Котики с эчпочмаком, вышитые магниты, тарелки и шоперы.' },
    chests: { title: 'Сундуки', text: 'Внизу у стены — сундуки ручной чеканки, золотые и зелёные.' },
  };

  /* ---------- бутоны ---------- */
  function buds() {
    var map = $('[data-hall]');
    if (!map) return;
    var card = $('[data-budcard]', map), title = $('.budcard__title', card), text = $('.budcard__text', card), go = $('.budcard__go', card);
    var budEls = $$('[data-bud]', map), legend = $$('[data-zone]');
    var cur = null, hideT = 0;

    function show(zone) {
      clearTimeout(hideT);
      if (cur === zone && !card.hidden) return;
      cur = zone;
      var z = ZONES[zone], bud = map.querySelector('[data-bud="' + zone + '"]');
      budEls.forEach(function (b) { b.classList.toggle('is-on', b === bud); b.setAttribute('aria-expanded', b === bud ? 'true' : 'false'); });
      legend.forEach(function (l) { l.classList.toggle('is-on', l.getAttribute('data-zone') === zone); });
      title.textContent = z.title; text.textContent = z.text;
      card.hidden = false;
      // карточка рядом с бутоном и внутри кадра
      var W = map.clientWidth, H = map.clientHeight, cw = card.offsetWidth, ch = card.offsetHeight;
      var bx = parseFloat(bud.style.getPropertyValue('--x')) / 100 * W, by = parseFloat(bud.style.getPropertyValue('--y')) / 100 * H;
      var left = bx > W * 0.55 ? bx - cw - 30 : bx + 30;
      left = Math.max(8, Math.min(W - cw - 8, left));
      var top = Math.max(8, Math.min(H - ch - 16, by - ch / 2));
      card.style.left = left + 'px'; card.style.top = top + 'px';
      if (DD.gsap && !DD.reduced) gsap.fromTo(card, { autoAlpha: 0, x: bx > W * 0.55 ? 16 : -16, scale: 0.94 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)' });
    }
    function hide(delay) {
      clearTimeout(hideT);
      hideT = setTimeout(function () {
        cur = null; card.hidden = true;
        budEls.forEach(function (b) { b.classList.remove('is-on'); b.setAttribute('aria-expanded', 'false'); });
        legend.forEach(function (l) { l.classList.remove('is-on'); });
      }, delay || 0);
    }
    budEls.forEach(function (b) {
      var zone = b.getAttribute('data-bud');
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function (e) { e.stopPropagation(); show(zone); });
      if (DD.fine) { b.addEventListener('mouseenter', function () { show(zone); }); b.addEventListener('mouseleave', function () { hide(500); }); }
      b.addEventListener('focus', function () { if (b.matches(':focus-visible')) show(zone); });
    });
    legend.forEach(function (l) {
      var zone = l.getAttribute('data-zone');
      if (DD.fine) { l.addEventListener('mouseenter', function () { show(zone); }); l.addEventListener('mouseleave', function () { hide(500); }); }
      l.addEventListener('click', function () { show(zone); });
      l.addEventListener('focus', function () { if (l.matches(':focus-visible')) show(zone); });
    });
    card.addEventListener('mouseenter', function () { clearTimeout(hideT); });
    card.addEventListener('mouseleave', function () { hide(400); });
    go.addEventListener('click', function () {
      var zone = cur;
      hide();
      if (DD.catalog) DD.catalog.filter(zone);
      DD.scrollTo('#katalog');
    });
    document.addEventListener('click', function (e) { if (!card.hidden && !e.target.closest('[data-budcard], [data-bud], [data-zone]')) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !card.hidden) hide(); });
  }

  /* ---------- лента кадров: перетаскивание с инерцией ---------- */
  function ribbon() {
    var view = $('[data-ribbon-view]'), track = $('[data-ribbon-track]'), bar = $('[data-ribbon-bar]');
    if (!view) return;
    var x = 0, target = 0, min = 0, drag = null, moved = 0, vel = 0, lastX = 0, lastT = 0, raf = 0;
    function bounds() { min = Math.min(0, view.clientWidth - track.scrollWidth); target = Math.max(min, Math.min(0, target)); }
    function render() {
      x += (target - x) * 0.1;
      if (Math.abs(target - x) < 0.3) x = target;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      var ratio = Math.min(1, view.clientWidth / track.scrollWidth), p = min ? x / min : 0;
      bar.style.transform = 'translateX(' + (p * (1 / ratio - 1) * 100).toFixed(2) + '%) scaleX(1)';
      bar.style.width = (ratio * 100).toFixed(2) + '%';
      raf = x !== target || drag ? requestAnimationFrame(render) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(render); }
    function setTarget(v) { target = Math.max(min, Math.min(0, v)); kick(); }
    bounds(); render();
    window.addEventListener('resize', function () { bounds(); kick(); });
    $$('img', track).forEach(function (im) { im.addEventListener('load', function () { bounds(); kick(); }); im.addEventListener('dragstart', function (e) { e.preventDefault(); }); });

    view.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = { x0: e.clientX, y0: e.clientY, t0: target }; moved = 0; vel = 0; lastX = e.clientX; lastT = performance.now();
      if (e.pointerType === 'mouse') e.preventDefault();
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x0;
      if (e.pointerType !== 'mouse' && Math.abs(e.clientY - drag.y0) > Math.abs(dx) && moved < 8) { drag = null; return; }
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) view.classList.add('is-drag');
      var now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      target = Math.max(min - 80, Math.min(80, drag.t0 + dx));
      kick();
    }, { passive: true });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      drag = null; view.classList.remove('is-drag');
      setTarget(target + vel * 260);
    });
    // перетаскивание — не клик
    track.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    view.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); setTarget(target - e.deltaX); } }, { passive: false });
    $('[data-ribbon-prev]').addEventListener('click', function () { setTarget(target + view.clientWidth * 0.7); });
    $('[data-ribbon-next]').addEventListener('click', function () { setTarget(target - view.clientWidth * 0.7); });
    track.addEventListener('focusin', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      var l = li.offsetLeft, r = l + li.offsetWidth;
      if (l + target < 0) setTarget(-l + 20);
      else if (r + target > view.clientWidth) setTarget(view.clientWidth - r - 20);
    });
  }

  /* ---------- лайтбокс ---------- */
  var SHOTS = [
    ['img/hall/hall-counter.webp', 'Прилавок с чак-чаком, за ним голубое полотно'],
    ['img/hall/hall-shelf.webp', 'Стеллаж: игрушки, чай, мёд, урбеч и шоперы'],
    ['img/hall/hall-shelf-2.webp', 'Второй стеллаж с чаем и сувенирами'],
    ['img/hall/hall-evening.webp', 'Зал вечером — на окне гирлянда'],
    ['img/facade/facade-wide.webp', 'Вход с улицы: дверь под кованым козырьком'],
    ['img/facade/facade-winter.webp', 'Дом зимой'],
  ];
  function lightbox() {
    var lb = $('[data-lightbox]');
    if (!lb) return;
    var stage = $('[data-lb-stage]', lb), count = $('[data-lb-count]', lb), cap = $('[data-lb-cap]', lb);
    var a = document.createElement('img'), b = document.createElement('img');
    a.alt = b.alt = ''; a.decoding = b.decoding = 'async';
    stage.appendChild(a); stage.appendChild(b);
    var front = a, idx = 0, opener = null;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    function show(i) {
      idx = (i + SHOTS.length) % SHOTS.length;
      var back = front === a ? b : a, shot = SHOTS[idx];
      count.textContent = pad(idx + 1) + ' / ' + pad(SHOTS.length);
      cap.textContent = shot[1];
      back.alt = shot[1];
      var swap = function () { back.onload = null; back.classList.add('is-on'); front.classList.remove('is-on'); front.alt = ''; front = back; };
      back.onload = null;
      back.src = shot[0];
      if (back.complete && back.naturalWidth) swap(); else back.onload = swap;
    }
    function open(i, from) {
      opener = from || document.activeElement;
      lb.hidden = false; DD.lock(true);
      show(i);
      if (DD.gsap && !DD.reduced) gsap.fromTo(lb, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
      $('[data-lb-close]', lb).focus();
    }
    function close() {
      lb.hidden = true; DD.lock(false);
      front.classList.remove('is-on');
      if (opener) opener.focus({ preventScroll: true });
    }
    $$('[data-lb]').forEach(function (btn) { btn.addEventListener('click', function () { open(+btn.getAttribute('data-lb'), btn); }); });
    $('[data-lb-prev]', lb).addEventListener('click', function () { show(idx - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { show(idx + 1); });
    $('[data-lb-close]', lb).addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') DD.trap(lb, e);
    });
    var sx = null;
    lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    lb.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
  }

  // фокус-ловушка для окон
  DD.trap = function (root, e) {
    var f = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', root).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  };

  /* ---------- эскиз → фото ---------- */
  function sketch() {
    var box = $('[data-sketch]');
    if (!box || !DD.gsap || DD.reduced) return;
    var lines = $$('[data-sketch-lines] path', box), draft = $('.sketch__draft img', box), real = $('.sketch__real', box);
    var arrow = $$('.sketch__arrow path', box);
    lines.concat(arrow).forEach(function (p) { var l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.set(draft, { opacity: 0 });
    gsap.set(real, { '--shut': 1 });
    gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 68%', once: true } })
      .to(lines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.07, ease: 'power2.inOut' })
      .to(draft, { opacity: 1, duration: 0.7, ease: 'power1.out' }, '-=0.3')
      .to('[data-sketch-lines]', { opacity: 0.18, duration: 0.6 }, '<')
      .to(arrow, { strokeDashoffset: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, '-=0.2')
      .to(real, { '--shut': 0, duration: 1, ease: 'power3.inOut' }, '-=0.1');
  }

  DD.on(70, 'buds', buds);
  DD.on(71, 'ribbon', ribbon);
  DD.on(72, 'lightbox', lightbox);
  DD.on(73, 'sketch', sketch);
})();
