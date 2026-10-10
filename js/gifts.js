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
    var list = $('[data-gift-items]', box), empty = $('[data-gift-empty]', box), actions = $('[data-gift-actions]', box), wa = $('[data-gift-wa]', box);
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
      if (DD.gsap && !DD.reduced) gsap.fromTo($$('.gift__item', list), { y: 80, opacity: 0, rotate: function (i) { return (i - 1) * 3; } }, { y: 0, opacity: 1, rotate: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' });
    }
    box.addEventListener('change', function (e) { if (e.target.matches('input[type="radio"]')) render(); });
    list.addEventListener('click', function (e) { var b = e.target.closest('[data-more]'); if (b && DD.catalog) DD.catalog.open(b.getAttribute('data-more'), b); });
  }

  /* ---------- сундук ---------- */
  var STRIP = ['chak-chak', 'chay-bogatyh-tatar', 'kazanskiy-chay', 'sbiten', 'myod', 'urbech', 'blue-tea', 'shokolad-kuchtenech', 'findi', 'pryaniki', 'kotik-brelok', 'magnit', 'tarelka'];
  function builder() {
    var root = $('[data-builder]');
    if (!root) return;
    var strip = $('[data-chest-strip]', root), list = $('[data-chest-list]', root), count = $('[data-chest-count]', root);
    var inside = $('[data-chest-inside]', root), wa = $('[data-chest-wa]', root), lid = $('[data-lid]', root), box = $('[data-chest-box]', root);
    var bag = []; // [{id, n}]
    strip.innerHTML = STRIP.map(function (id) {
      var p = DD.product(id);
      if (!p) return '';
      return '<li><button type="button" data-add="' + id + '"><img src="' + DD.thumb(p.images[0]) + '" alt="" width="44" height="44" loading="lazy">' + esc(p.name.replace(/ на натуральном мёду| — .*/, '')) + '</button></li>';
    }).join('');

    function kind() { var r = root.querySelector('input[name="chestkind"]:checked'); return r ? r.value : 'Бирнә сандыгы'; }
    function sync() {
      var total = bag.reduce(function (s, b) { return s + b.n; }, 0);
      count.textContent = total ? 'В сундуке: ' + total + ' ' + plural(total, ['гостинец', 'гостинца', 'гостинцев']) : 'В сундуке пока пусто';
      list.innerHTML = bag.map(function (b) {
        var p = DD.product(b.id);
        return '<li><span>' + esc(p.name) + (b.n > 1 ? ' × ' + b.n : '') + '</span><button type="button" data-del="' + b.id + '" aria-label="Убрать: ' + esc(p.name) + '"><svg aria-hidden="true"><use href="#i-close"/></svg></button></li>';
      }).join('');
      inside.innerHTML = bag.slice(-8).map(function (b, i) {
        var p = DD.product(b.id);
        return '<img src="' + DD.thumb(p.images[0]) + '" alt="" style="--r:' + (((i * 53) % 11) - 5) + 'deg">';
      }).join('');
      if (total) {
        wa.removeAttribute('aria-disabled');
        wa.href = DD.wa('Здравствуйте! Хочу собрать кучтәнәч в сундук (' + kind() + '):\n' + bag.map(function (b, i) { return (i + 1) + '. ' + DD.product(b.id).name + (b.n > 1 ? ' × ' + b.n : ''); }).join('\n') + '\nПодскажите, сколько будет стоить?');
      } else { wa.setAttribute('aria-disabled', 'true'); wa.href = DD.wa(); }
    }
    function plural(n, f) { var a = n % 10, b = n % 100; return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? f[1] : f[2]; }
    function add(id) {
      var it = bag.filter(function (b) { return b.id === id; })[0];
      if (it) it.n++; else bag.push({ id: id, n: 1 });
      sync();
    }
    function wobble() { if (DD.gsap && !DD.reduced) gsap.fromTo(lid, { rotation: -5 }, { rotation: 0, svgOrigin: '260 120', duration: 1, ease: 'elastic.out(1, 0.35)' }); }

    strip.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]');
      if (!b) return;
      var id = b.getAttribute('data-add');
      if (!DD.gsap || DD.reduced) { add(id); return; }
      // полёт по дуге в сундук
      var from = b.querySelector('img').getBoundingClientRect(), to = box.getBoundingClientRect();
      var fly = document.createElement('img');
      fly.className = 'flyer'; fly.src = DD.thumb(DD.product(id).images[0]); fly.alt = '';
      fly.style.left = from.left + 'px'; fly.style.top = from.top + 'px';
      document.body.appendChild(fly);
      var dx = to.left + to.width * (0.38 + Math.random() * 0.24) - from.left, dy = to.top + to.height * 0.3 - from.top;
      var lift = Math.min(-120, dy - 160);
      gsap.timeline({ onComplete: function () { fly.remove(); add(id); wobble(); } })
        .to(fly, { x: dx, duration: 0.7, ease: 'power1.inOut' }, 0)
        .to(fly, { y: lift, duration: 0.32, ease: 'power2.out' }, 0)
        .to(fly, { y: dy, duration: 0.38, ease: 'power2.in' }, 0.32)
        .to(fly, { rotation: 18, scale: 0.7, duration: 0.7, ease: 'none' }, 0);
    });
    list.addEventListener('click', function (e) {
      var d = e.target.closest('[data-del]');
      if (!d) return;
      var id = d.getAttribute('data-del');
      bag = bag.filter(function (b) { if (b.id === id) b.n--; return b.n > 0; });
      sync();
    });
    root.addEventListener('change', function (e) { if (e.target.name === 'chestkind') sync(); });
    sync();
  }

  DD.on(80, 'gift-picker', picker);
  DD.on(81, 'chest-builder', builder);
})();
