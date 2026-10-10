/* catalog.js — «Кучтәнәч»: вкладки-полотна, карточки на полках, перестановка через Flip, окно товара. */
(function () {
  'use strict';
  var DD = window.DD;
  var $ = DD.$, $$ = DD.$$;
  var CATS = window.CATEGORIES || [], ITEMS = window.PRODUCTS || [];
  var TONE = {}; CATS.forEach(function (c) { TONE[c.id] = c.tone; });
  var CNAME = {}; CATS.forEach(function (c) { CNAME[c.id] = c.name; });
  var chosen = {}; // id → индекс выбранной фасовки

  var large = function (src) { return src.replace('img/products/', 'img/products/large/'); };
  var thumb = function (src) { return src.replace('img/products/', 'img/products/thumb/'); };
  DD.thumb = thumb;
  DD.product = function (id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; };
  DD.price = function (p, vi) {
    if (p.variants && p.variants.length) { var v = p.variants[vi == null ? (chosen[p.id] || 0) : vi]; return { w: v.label, text: DD.rub(v.price), ask: false, n: v.price }; }
    if (p.price == null) return { w: p.weight, text: 'цену подскажем в магазине', ask: true, n: null };
    return { w: p.weight, text: (p.priceFrom ? 'от ' : '') + DD.rub(p.price), ask: false, n: p.price };
  };
  DD.minPrice = function (p) {
    if (p.variants && p.variants.length) return Math.min.apply(null, p.variants.map(function (v) { return v.price; }));
    return p.price;
  };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function cardHTML(p) {
    var pr = DD.price(p);
    var imgs = p.images.slice(0, 2).map(function (src, i) {
      return '<img src="' + src + '" width="800" height="1067" alt="' + (i ? '' : esc(p.name)) + '" loading="lazy" decoding="async">';
    }).join('');
    var vars = p.variants ? '<div class="vars" role="group" aria-label="Фасовка">' + p.variants.map(function (v, i) {
      return '<button type="button" data-var="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(v.label) + '</button>';
    }).join('') + '</div>' : '';
    return '<li class="card" data-id="' + p.id + '" data-cat="' + p.category + '" style="--c:var(--' + (TONE[p.category] || 'rose') + ')">' +
      '<div class="card__lift">' +
        '<div class="card__ph"><div class="card__frame">' + imgs + '</div></div>' +
        '<div class="card__body">' +
          '<h3 class="card__name"><button type="button" data-open aria-haspopup="dialog">' + esc(p.name) + '</button></h3>' +
          '<p class="card__short">' + esc(p.short) + '</p>' + vars +
          '<p class="card__meta">' + (pr.w && !p.variants ? '<span class="card__w">' + esc(pr.w) + '</span>' : '') +
          '<span class="card__price' + (pr.ask ? ' card__price--ask' : '') + '" data-price>' + esc(pr.text) + '</span></p>' +
          '<span class="card__more" aria-hidden="true">Подробнее</span>' +
        '</div>' +
      '</div><span class="card__shadow" aria-hidden="true"></span></li>';
  }

  var grid, boards, tabs, current = 'all';

  /* полки: по одной доске под каждым рядом */
  function shelves() {
    if (!grid) return;
    var rows = [];
    $$('.card', grid).forEach(function (c) {
      if (c.classList.contains('is-out')) return;
      var b = c.offsetTop + c.offsetHeight;
      for (var i = 0; i < rows.length; i++) if (Math.abs(rows[i] - b) < 6) return;
      rows.push(b);
    });
    rows.sort(function (a, b) { return a - b; });
    var have = $$('.board', boards);
    rows.forEach(function (y, i) {
      var el = have[i];
      if (!el) { el = document.createElement('span'); el.className = 'board'; boards.appendChild(el); }
      el.style.top = (y + 4) + 'px';
      el.style.opacity = '1';
    });
    have.slice(rows.length).forEach(function (el) { el.remove(); });
  }

  function applyFilter(cat) {
    var first = null;
    $$('.card', grid).forEach(function (c) {
      var show = cat === 'all' || c.getAttribute('data-cat') === cat;
      c.classList.toggle('is-out', !show);
      var big = false;
      if (show) {
        var p = DD.product(c.getAttribute('data-id'));
        if (cat === 'all') big = !!p.featured;
        else if (!first) { first = c; big = true; }
      }
      c.classList.toggle('card--big', big);
    });
  }

  function filter(cat, opts) {
    if (!grid || !CNAME[cat]) cat = 'all';
    if (cat === current && !(opts && opts.force)) return;
    current = cat;
    $$('.tab', tabs).forEach(function (t) {
      var on = t.getAttribute('data-cat') === cat;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    grid.parentNode.setAttribute('aria-labelledby', 'tab-' + cat);
    var useFlip = DD.gsap && window.Flip && !DD.reduced && !(opts && opts.instant);
    if (!useFlip) { applyFilter(cat); shelves(); return; }
    var cards = $$('.card', grid);
    var state = Flip.getState(cards);
    applyFilter(cat);
    shelves();
    gsap.fromTo($$('.board', boards), { scaleX: 0.9, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15 });
    Flip.from(state, {
      duration: 0.6, ease: 'power3.inOut', absolute: true, nested: true, prune: true,
      onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.03, delay: 0.12, ease: 'power3.out' }); },
      onLeave: function (els) { return gsap.to(els, { opacity: 0, y: 60, duration: 0.4, ease: 'power2.in' }); },
      onComplete: function () { shelves(); ScrollTrigger.refresh(); },
    });
  }

  /* ---------- окно товара ---------- */
  var drawer, panel, opener = null, curP = null;
  function setMedia(p, i) {
    var media = $('[data-d-media]', drawer), thumbs = $$('[data-d-thumbs] button', drawer);
    var list = mediaList(p), m = list[i];
    thumbs.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    media.innerHTML = m.video
      ? '<video src="' + m.video + '" poster="' + m.poster + '" muted loop playsinline autoplay aria-label="' + esc(p.name) + ' — видео"></video>'
      : '<img src="' + large(m.src) + '" alt="' + esc(p.name) + (i ? ', фото ' + (i + 1) : '') + '" width="1400" height="1867">';
    if (DD.gsap && !DD.reduced) gsap.fromTo(media.firstChild, { opacity: 0 }, { opacity: 1, duration: 0.45 });
  }
  function mediaList(p) {
    var l = p.images.map(function (s) { return { src: s }; });
    if (p.video) l.splice(1, 0, { video: p.video, poster: p.video.replace('.mp4', '.jpg') });
    return l;
  }
  function fillPrice(p) {
    var pr = DD.price(p);
    $('[data-d-weight]', drawer).textContent = pr.w || '';
    var b = $('[data-d-price]', drawer);
    b.textContent = pr.text; b.classList.toggle('is-ask', pr.ask);
    var name = p.name + (p.variants ? ' (' + pr.w + ')' : '');
    $('[data-d-wa]', drawer).href = DD.wa('Здравствуйте! Хочу узнать про: ' + name);
  }
  function open(id, from) {
    var p = DD.product(id);
    if (!p) return;
    curP = p; opener = from || document.activeElement;
    $('[data-d-cat]', drawer).textContent = CNAME[p.category] || '';
    $('[data-d-title]', drawer).textContent = p.name;
    $('[data-d-desc]', drawer).textContent = p.description;
    $('[data-d-note]', drawer).textContent = p.priceNote || '';
    var list = mediaList(p);
    $('[data-d-thumbs]', drawer).innerHTML = list.length > 1 ? list.map(function (m, i) {
      return '<button type="button" class="' + (m.video ? 'is-video' : '') + '" data-i="' + i + '" aria-label="' + (m.video ? 'Видео' : 'Фото ' + (i + 1)) + '"><img src="' + (m.video ? m.poster : thumb(m.src)) + '" alt="" loading="lazy"></button>';
    }).join('') : '';
    var vbox = $('[data-d-variants]', drawer);
    vbox.innerHTML = p.variants ? '<div class="vars" role="group" aria-label="Фасовка">' + p.variants.map(function (v, i) {
      return '<button type="button" data-dvar="' + i + '" aria-pressed="' + (i === (chosen[p.id] || 0)) + '">' + esc(v.label) + ' · ' + DD.rub(v.price) + '</button>';
    }).join('') + '</div>' : '';
    fillPrice(p);
    setMedia(p, 0);
    drawer.hidden = false;
    DD.lock(true);
    panel.scrollTop = 0;
    if (DD.gsap && !DD.reduced) {
      gsap.fromTo(panel, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: 'expo.out' });
      gsap.fromTo($('.drawer__shade', drawer), { opacity: 0 }, { opacity: 1, duration: 0.4 });
    }
    $('.drawer__close', drawer).focus({ preventScroll: true });
  }
  function close() {
    if (drawer.hidden) return;
    var done = function () { drawer.hidden = true; $('[data-d-media]', drawer).innerHTML = ''; DD.lock(false); if (opener) opener.focus({ preventScroll: true }); };
    if (DD.gsap && !DD.reduced) {
      gsap.to(panel, { xPercent: 100, duration: 0.4, ease: 'power3.in', onComplete: done });
      gsap.to($('.drawer__shade', drawer), { opacity: 0, duration: 0.35 });
    } else done();
  }

  function init() {
    grid = $('[data-grid]'); boards = $('[data-boards]'); tabs = $('[data-tabs]');
    drawer = $('[data-drawer]'); panel = $('.drawer__panel', drawer);
    if (!grid) return;

    // вкладки-полотна
    tabs.innerHTML = CATS.map(function (c, i) {
      var n = c.id === 'all' ? ITEMS.length : ITEMS.filter(function (p) { return p.category === c.id; }).length;
      return '<button class="tab tab--' + c.tone + '" type="button" role="tab" id="tab-' + c.id + '" data-cat="' + c.id + '" aria-selected="' + (i === 0) + '" aria-controls="catalog-panel" tabindex="' + (i === 0 ? 0 : -1) + '">' +
        '<span class="cl cl--' + (c.tone === 'paper' ? 'lime' : c.tone) + '" aria-hidden="true"><i class="cloth" style="--tile:var(--tile-' + 'abc'[i % 3] + ')"></i></span>' +
        '<span class="tab__name">' + esc(c.name) + '</span><span class="tab__count">' + n + '</span></button>';
    }).join('');
    var panelEl = grid.parentNode;
    panelEl.id = 'catalog-panel';
    panelEl.setAttribute('role', 'tabpanel');
    panelEl.setAttribute('aria-labelledby', 'tab-all');
    grid.innerHTML = ITEMS.map(cardHTML).join('');
    applyFilter('all');

    tabs.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (t) filter(t.getAttribute('data-cat')); });
    tabs.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var all = $$('.tab', tabs), i = all.indexOf(document.activeElement);
      if (i < 0) return;
      var n = all[(i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length];
      n.focus(); filter(n.getAttribute('data-cat'));
      e.preventDefault();
    });

    grid.addEventListener('click', function (e) {
      var v = e.target.closest('[data-var]');
      var card = e.target.closest('.card');
      if (!card) return;
      var p = DD.product(card.getAttribute('data-id'));
      if (v) {
        e.stopPropagation();
        chosen[p.id] = +v.getAttribute('data-var');
        $$('[data-var]', card).forEach(function (b) { b.setAttribute('aria-pressed', b === v ? 'true' : 'false'); });
        var pr = DD.price(p);
        $('[data-price]', card).textContent = pr.text;
        return;
      }
      open(p.id, $('[data-open]', card));
    });

    // окно: миниатюры, фасовка, закрытие, фокус
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) return close();
      var t = e.target.closest('[data-d-thumbs] button');
      if (t) return setMedia(curP, +t.getAttribute('data-i'));
      var dv = e.target.closest('[data-dvar]');
      if (dv) {
        chosen[curP.id] = +dv.getAttribute('data-dvar');
        $$('[data-dvar]', drawer).forEach(function (b) { b.setAttribute('aria-pressed', b === dv ? 'true' : 'false'); });
        fillPrice(curP);
        var card = grid.querySelector('[data-id="' + curP.id + '"]');
        if (card) {
          $('[data-price]', card).textContent = DD.price(curP).text;
          $$('[data-var]', card).forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-var') === chosen[curP.id] ? 'true' : 'false'); });
        }
      }
    });
    document.addEventListener('keydown', function (e) {
      if (drawer.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'Tab') DD.trap(panel, e);
    });

    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(shelves, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(shelves);
    window.addEventListener('load', shelves);
    shelves();

    DD.catalog = { filter: function (cat) { filter(cat || 'all'); }, open: open };
  }

  DD.on(55, 'catalog', init);
})();
