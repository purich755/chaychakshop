/* gifts.js — «Что привезти из Казани?» (подборщик по тегам) и «Собери кучтәнәч в сундук». */
(function () {
  'use strict';
  var DD = window.DD;
  var $ = DD.$, $$ = DD.$$;
  var ITEMS = window.PRODUCTS || [];
  var WHO = { mom: 'маме или бабушке', colleague: 'коллеге', friend: 'другу', kid: 'ребёнку', self: 'себе' };
  var BUDGET = { low: 'до 500 ₽', mid: '500–1 500 ₽', high: 'хочу удивить' };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- подбор ---------- */
  function fits(p, budget) {
    var m = DD.minPrice(p), max = p.variants ? Math.max.apply(null, p.variants.map(function (v) { return v.price; })) : p.price;
    if (budget === 'high') return p.category === 'chests';
    if (m == null) return false; // без цены в бюджетных вариантах не участвуют
    if (p.category === 'chests') return false;
    if (budget === 'low') return m <= 500;
    return max >= 500 && m <= 1500;
  }
  function pick(who, budget) {
    var pool = ITEMS.filter(function (p) { return fits(p, budget); });
    var mine = pool.filter(function (p) { return p.for.indexOf(who) > -1; });
    // сначала разные категории, крупные (featured) вперёд
    mine.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    var out = [], cats = {};
    mine.forEach(function (p) { if (out.length < 3 && !cats[p.category]) { out.push(p); cats[p.category] = 1; } });
    mine.forEach(function (p) { if (out.length < 3 && out.indexOf(p) < 0) out.push(p); });
    // не хватило: «удивить» — остальные сундуки; иначе — что подходит человеку из бюджета подешевле, потом любое из бюджета
    if (out.length < 3 && budget === 'high') pool.forEach(function (p) { if (out.length < 3 && out.indexOf(p) < 0) out.push(p); });
    if (out.length < 3 && budget === 'mid') ITEMS.forEach(function (p) { if (out.length < 3 && out.indexOf(p) < 0 && p.for.indexOf(who) > -1 && fits(p, 'low')) out.push(p); });
    if (out.length < 3) pool.forEach(function (p) { if (out.length < 3 && out.indexOf(p) < 0) out.push(p); });
    return out;
  }

  function picker() {
    var box = $('[data-gift]');
    if (!box) return;
    var list = $('[data-gift-items]', box), empty = $('[data-gift-empty]', box), actions = $('[data-gift-actions]', box), wa = $('[data-gift-wa]', box), mx = $('[data-gift-max]', box);
    function val(name) { var r = box.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : null; }
    function render() {
      var who = val('who'), budget = val('budget');
      if (!who || !budget) return;
      var res = pick(who, budget);
      empty.hidden = true; actions.hidden = false;
      list.innerHTML = res.map(function (p) {
        var pr = DD.price(p, 0);
        return '<li class="gift__item" style="--c:var(--' + ({ tea: 'sky', sweets: 'rose', honey: 'lime', drinks: 'mint', chests: 'lilac', souvenirs: 'sky' }[p.category]) + ')">' +
          '<div class="card__ph"><div class="card__frame"><img src="' + p.images[0] + '" alt="' + esc(p.name) + '" width="800" height="1067" loading="lazy"></div></div>' +
          '<h3>' + esc(p.name) + '</h3><p class="gift__why">' + esc(p.gift) + '</p>' +
          '<p class="card__meta"><span class="card__price' + (pr.ask ? ' card__price--ask' : '') + '">' + esc(pr.text) + '</span></p>' +
          '<button class="btn btn--text" type="button" data-more="' + p.id + '" aria-haspopup="dialog">Подробнее</button></li>';
      }).join('');
      var text = 'Здравствуйте! Подбираю подарок — ' + WHO[who] + ', бюджет: ' + BUDGET[budget] + '.\nПонравилось:\n' +
        res.map(function (p, i) { return (i + 1) + '. ' + p.name; }).join('\n') + '\nЧто из этого есть сегодня?';
      wa.href = DD.wa(text);
      DD.maxLink(mx, text);
      if (DD.gsap && !DD.reduced) gsap.fromTo($$('.gift__item', list), { y: 80, opacity: 0, rotate: function (i) { return (i - 1) * 3; } }, { y: 0, opacity: 1, rotate: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
    }
    box.addEventListener('change', function (e) { if (e.target.matches('input[type="radio"]')) render(); });
    list.addEventListener('click', function (e) { var b = e.target.closest('[data-more]'); if (b && DD.catalog) DD.catalog.open(b.getAttribute('data-more'), b); });
  }

  /* ---------- сундук: открывается настоящими кадрами из роликов магазина ---------- */
  var STRIP = ['chak-chak', 'chay-bogatyh-tatar', 'kazanskiy-chay', 'sbiten', 'myod', 'urbech', 'blue-tea', 'shokolad-kuchtenech', 'findi', 'pryaniki', 'kotik-brelok', 'magnit', 'tarelka'];
  // n — кадров в img/chest-open/<dir>/ (см. tools/build-chest-open.mjs); inside — дно открытого сундука на последнем кадре, % кадра;
  // sink — какую часть гостинца прячет передняя стенка
  var KINDS = {
    'VIP': { dir: 'green', n: 17, inside: { l: 22, t: 66, w: 72, h: 30 }, sink: 0, label: 'Сундук VIP, 36 × 27 × 20 см' },
    'Ханский': { dir: 'green', n: 17, inside: { l: 22, t: 66, w: 72, h: 30 }, sink: 0, label: 'Ханский сундук, 30 × 20 × 17 см' },
    'Сөембикә': { dir: 'gold', n: 19, inside: { l: 9, t: 40, w: 82, h: 30 }, sink: 0.42, label: 'Сундук «Сөембикә», 25 × 14 × 12 см' },
    'набор «Милли»': { photo: 'img/products/large/nabor-milli-1.webp', label: 'Подарочный набор «Милли» — голубой короб' },
  };
  var FPS = 12;
  function builder() {
    var root = $('[data-builder]');
    if (!root) return;
    var strip = $('[data-chest-strip]', root), list = $('[data-chest-list]', root), count = $('[data-chest-count]', root);
    var wa = $('[data-chest-wa]', root), mx = $('[data-chest-max]', root);
    var opener = $('[data-opener]', root), cv = $('[data-opener-canvas]', root), ctx = cv.getContext('2d');
    var poster = $('[data-opener-poster]', root), inside = $('[data-chest-inside]', root), btn = $('[data-opener-btn]', root), hint = $('[data-opener-hint]', root);
    var bag = []; // [{id, n}]
    var cur = null, frames = [], frame = 0, isOpen = false, raf = 0, want = null, ready = false, started = false;

    strip.innerHTML = STRIP.map(function (id) {
      var p = DD.product(id);
      if (!p) return '';
      return '<li><button type="button" data-add="' + id + '"><img src="' + DD.thumb(p.images[0]) + '" alt="" width="44" height="44" loading="lazy">' + esc(p.name.replace(/ на натуральном мёду| — .*/, '')) + '</button></li>';
    }).join('');

    function kind() { var r = root.querySelector('input[name="chestkind"]:checked'); return r ? r.value : 'VIP'; }
    function src(k, i) { return 'img/chest-open/' + k.dir + '/' + (i < 10 ? '0' : '') + i + '.webp'; }

    // ---- кадры ----
    function draw(i) {
      frame = i;
      var im = frames[i];
      if (im && im.complete && im.naturalWidth) { ctx.drawImage(im, 0, 0, cv.width, cv.height); opener.classList.add('is-canvas'); }
    }
    function load(k, done) {
      frames = []; ready = false;
      var left = k.n;
      for (var i = 0; i < k.n; i++) {
        var im = new Image();
        im.decoding = 'async';
        im.onload = im.onerror = function () { if (--left === 0) { ready = true; done(); } };
        im.src = src(k, i);
        frames.push(im);
      }
    }
    function play(to, cb) {
      cancelAnimationFrame(raf);
      var target = to ? cur.n - 1 : 0;
      if (DD.reduced || !ready) { draw(target); cb && cb(); return; }
      var t0 = performance.now(), f0 = frame, span = Math.abs(target - f0);
      (function step(now) {
        var k = Math.min(1, (now - t0) / (span / FPS * 1000));
        draw(Math.round(f0 + (target - f0) * k));
        if (k < 1) raf = requestAnimationFrame(step); else { cb && cb(); }
      })(t0);
    }
    // moving — крышка в движении: всё, что ждёт открытого сундука, встаёт в очередь
    var moving = false, queue = [];
    function setOpen(v, cb) {
      if (!cur || cur.photo) { cb && cb(); return; }
      if (moving) { queue.push(function () { setOpen(v, cb); }); return; }
      if (v === isOpen && !want) { cb && cb(); return; }
      if (!ready) { want = { v: v, cb: cb }; return; }
      isOpen = v; moving = true;
      opener.classList.toggle('is-open', v);
      if (!v) opener.classList.remove('is-filled');
      btn.textContent = v ? 'Закрыть сундук' : 'Открыть сундук';
      btn.setAttribute('aria-pressed', v ? 'true' : 'false');
      if (hint) hint.hidden = true;
      play(v, function () {
        moving = false;
        if (v) { opener.classList.add('is-filled'); bump(); }
        cb && cb();
        var q = queue; queue = [];
        q.forEach(function (f) { f(); });
      });
    }
    function bump() { if (DD.gsap && !DD.reduced) gsap.fromTo(cv, { y: 0 }, { y: -4, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' }); }

    function useKind(name) {
      var k = KINDS[name];
      if (!k || k === cur) return;
      if (cur && k.dir && cur.dir === k.dir) { cur = k; opener.setAttribute('aria-label', k.label); return; }
      var first = !cur;
      // смена сундука посреди движения крышки: старую анимацию гасим, ждущие гостинцы полетят в новый сундук
      cancelAnimationFrame(raf); moving = false;
      var pend = queue; queue = [];
      cur = k; isOpen = false; frame = 0;
      want = pend.length ? { v: true, cb: function () { pend.forEach(function (f) { f(); }); } } : null;
      opener.classList.remove('is-open', 'is-filled', 'is-canvas');
      opener.classList.toggle('is-photo', !!k.photo);
      opener.setAttribute('aria-label', k.label);
      inside.style.cssText = k.inside ? 'left:' + k.inside.l + '%;top:' + k.inside.t + '%;width:' + k.inside.w + '%;height:' + k.inside.h + '%;--sink:' + (k.sink * 100) + '%' : '';
      if (k.photo) { poster.src = k.photo; btn.hidden = true; renderInside(); if (want) { var pw = want; want = null; pw.cb(); } return; }
      btn.hidden = false; btn.textContent = 'Открыть сундук'; btn.setAttribute('aria-pressed', 'false');
      poster.src = src(k, 0);
      if (!started && first) return; // кадры грузим, когда блок подъедет к экрану
      load(k, function () {
        if (cur !== k) return;
        draw(0);
        var w = want; want = null;
        if (w) setOpen(w.v, w.cb); else if (bag.length) setOpen(true);
        renderInside();
      });
    }
    function start() {
      if (started) return;
      started = true;
      var k = cur; cur = null; useKind(kind()); if (k && k.photo) renderInside();
    }

    // ---- гостинцы внутри ----
    function renderInside() {
      var items = [];
      bag.forEach(function (b) { for (var i = 0; i < b.n; i++) items.push(b.id); });
      inside.innerHTML = items.slice(-9).map(function (id, i) {
        var p = DD.product(id);
        // раскладка по дну: 4 в ряд, следующий ряд — глубже в сундуке (выше и позади)
        var row = Math.floor(i / 4), col = i % 4;
        return '<img src="' + DD.thumb(p.images[0]) + '" alt="" style="left:' + (2 + col * 24 + (row % 2) * 10) + '%;bottom:' + (row * 20) + '%;z-index:' + (10 - row) + ';--r:' + (((i * 47) % 13) - 6) + 'deg">';
      }).join('');
    }
    function sync() {
      var total = bag.reduce(function (s, b) { return s + b.n; }, 0);
      count.textContent = total ? 'В сундуке: ' + total + ' ' + plural(total, ['гостинец', 'гостинца', 'гостинцев']) : 'В сундуке пока пусто';
      list.innerHTML = bag.map(function (b) {
        var p = DD.product(b.id);
        return '<li><span>' + esc(p.name) + (b.n > 1 ? ' × ' + b.n : '') + '</span><button type="button" data-del="' + b.id + '" aria-label="Убрать: ' + esc(p.name) + '"><svg aria-hidden="true"><use href="#i-close"/></svg></button></li>';
      }).join('');
      renderInside();
      if (total) {
        var text = 'Здравствуйте! Хочу собрать кучтәнәч в сундук (' + kind() + '):\n' + bag.map(function (b, i) { return (i + 1) + '. ' + DD.product(b.id).name + (b.n > 1 ? ' × ' + b.n : ''); }).join('\n') + '\nПодскажите, сколько будет стоить?';
        wa.removeAttribute('aria-disabled'); mx.removeAttribute('aria-disabled');
        wa.href = DD.wa(text); DD.maxLink(mx, text);
      } else { wa.setAttribute('aria-disabled', 'true'); mx.setAttribute('aria-disabled', 'true'); wa.href = DD.wa(); DD.maxLink(mx, ''); }
    }
    function plural(n, f) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? f[1] : f[2]; }
    function add(id) {
      var it = bag.filter(function (b) { return b.id === id; })[0];
      if (it) it.n++; else bag.push({ id: id, n: 1 });
      sync();
    }

    // ---- события ----
    btn.addEventListener('click', function () { start(); setOpen(!isOpen); });
    cv.addEventListener('click', function () { start(); if (!cur.photo) setOpen(!isOpen); });
    strip.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]');
      if (!b) return;
      var id = b.getAttribute('data-add');
      start();
      // сначала сундук открывается, потом гостинец летит по дуге на дно
      setOpen(true, function () {
        if (!DD.gsap || DD.reduced) { add(id); return; }
        var from = b.querySelector('img').getBoundingClientRect(), to = inside.getBoundingClientRect();
        var fly = document.createElement('img');
        fly.className = 'flyer'; fly.src = DD.thumb(DD.product(id).images[0]); fly.alt = '';
        fly.style.left = from.left + 'px'; fly.style.top = from.top + 'px';
        document.body.appendChild(fly);
        var dx = to.left + to.width * (0.25 + Math.random() * 0.5) - from.left - 32, dy = to.top + to.height * 0.45 - from.top - 40;
        var lift = Math.min(-120, dy - 160);
        gsap.timeline({ onComplete: function () { fly.remove(); add(id); bump(); } })
          .to(fly, { x: dx, duration: 0.7, ease: 'power1.inOut' }, 0)
          .to(fly, { y: lift, duration: 0.32, ease: 'power2.out' }, 0)
          .to(fly, { y: dy, duration: 0.38, ease: 'power2.in' }, 0.32)
          .to(fly, { rotation: 14, scale: 0.75, duration: 0.7, ease: 'none' }, 0);
      });
    });
    list.addEventListener('click', function (e) {
      var d = e.target.closest('[data-del]');
      if (!d) return;
      var id = d.getAttribute('data-del');
      bag = bag.filter(function (b) { if (b.id === id) b.n--; return b.n > 0; });
      sync();
    });
    root.addEventListener('change', function (e) { if (e.target.name === 'chestkind') { useKind(kind()); sync(); } });

    useKind(kind());
    sync();
    // кадры подгружаем заранее, когда конструктор подъезжает к экрану; сам сундук открывается от нажатия
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '600px 0px' });
      io.observe(root);
    } else start();
    DD.chest = { open: function () { start(); setOpen(true); }, close: function () { setOpen(false); }, state: function () { return { open: isOpen, frame: frame, ready: ready, kind: cur && (cur.dir || 'photo') }; } };
  }

  DD.on(80, 'gift-picker', picker);
  DD.on(81, 'chest-builder', builder);
})();
