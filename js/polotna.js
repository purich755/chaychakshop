/* polotna.js — полотна: прелоадер, вход в дом (hero), угощение (горизонтальная сцена), полотна-переходы,
   футер «полотна закрываются» и «живая ткань» — покачивание от курсора и скорости прокрутки. */
(function () {
  'use strict';
  var DD = window.DD;
  var $ = DD.$, $$ = DD.$$;

  /* ---------- 00 · прелоадер ---------- */
  function preloader() {
    var pre = $('.pre');
    if (!pre) return;
    var skip = document.documentElement.classList.contains('no-pre') || DD.reduced || !DD.gsap;
    try { sessionStorage.setItem('dd-visited', '1'); } catch (e) {}
    if (skip) { pre.remove(); return; }
    var c = $$('.pre__c', pre), mark = $('.pre__mark', pre);
    gsap.timeline({ onComplete: function () { pre.remove(); } })
      .fromTo(c, { yPercent: -102, y: 0 }, { yPercent: 0, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.inOut' }, 0)
      .fromTo(mark, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.38)
      .to(c[0], { xPercent: -260, duration: 0.5, ease: 'power3.inOut' }, 1.0)
      .to(c[2], { xPercent: 260, duration: 0.5, ease: 'power3.inOut' }, 1.0)
      .to(c[1], { yPercent: -104, duration: 0.5, ease: 'power3.inOut' }, 1.0)
      .to(mark, { autoAlpha: 0, duration: 0.25 }, 1.0)
      .to(pre, { autoAlpha: 0, duration: 0.25 }, 1.22);
  }

  /* ---------- живая ткань: пружина от скорости и курсора ---------- */
  function sway() {
    if (DD.reduced) return;
    var all = $$('.cl > .cloth').filter(function (c) { return !c.closest('.pre, .tab, .menu'); });
    var live = new Set();
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? live.add(e.target) : live.delete(e.target); }); });
    var st = new Map();
    all.forEach(function (c, i) { st.set(c, { sk: 0, x: 0, d: 0.6 + ((i * 37) % 10) / 12 }); io.observe(c); });
    var mx = 0, tmx = 0;
    if (DD.fine) window.addEventListener('pointermove', function (e) { tmx = (e.clientX / window.innerWidth - 0.5) * 2; }, { passive: true });
    function tick() {
      mx += (tmx - mx) * 0.07;
      var v = Math.max(-1, Math.min(1, (DD.vel || 0) / 40));
      var n = 0;
      live.forEach(function (c) {
        if (n++ > 8) return;
        var s = st.get(c);
        var tsk = v * 1.5 * s.d + mx * 0.6 * s.d;
        var tx = mx * 8 * s.d;
        s.sk += (tsk - s.sk) * 0.07;
        s.x += (tx - s.x) * 0.07;
        c.style.transform = 'translate3d(' + s.x.toFixed(2) + 'px,0,0) skewX(' + s.sk.toFixed(3) + 'deg)';
      });
    }
    if (DD.gsap) gsap.ticker.add(tick);
  }

  /* ---------- 01 · вход в дом ---------- */
  function hero() {
    var sec = $('[data-hero]');
    if (!sec || !DD.gsap || DD.reduced) return;
    var stage = $('.hero__stage', sec), wrap = $('[data-hero-photo]', sec), img = $('[data-hero-img]', sec);
    var hall = $('[data-hero-hall]', sec), hallImg = $('img', hall), plate = $('[data-hero-plate]', sec);
    var welcome = $('[data-hero-welcome]', sec), hint = $('.hero__hint', sec);
    var cloths = $$('.hero__cloths .cl', sec);
    var mq = window.matchMedia('(min-width: 768px)');
    var L = {};

    // где дверь на кадре (доли кадра): широкий 1d36fd и вертикальный 1c34c6
    var FR = {
      wide: { w: 1920, h: 1440, pos: [0.25, 0.72], door: { cx: 0.372, cy: 0.76, l: 0.292, r: 0.455, t: 0.53, b: 1.0 } },
      tall: { w: 1080, h: 1440, pos: [0.42, 0.62], door: { cx: 0.41, cy: 0.6, l: 0.32, r: 0.507, t: 0.478, b: 0.73 } },
    };
    function layout() {
      var W = stage.clientWidth, H = stage.clientHeight, desk = mq.matches;
      var f = desk ? FR.wide : FR.tall;
      var boxL = desk ? Math.round(W * 0.36) : 0, boxW = W - boxL;
      var s = Math.max(boxW / f.w, H / f.h);
      var iw = f.w * s, ih = f.h * s;
      var il = boxL - (iw - boxW) * f.pos[0], it = (H - ih) * f.pos[1];
      var dx = il + f.door.cx * iw, dy = it + f.door.cy * ih;
      var tx = W * 0.5, ty = H * 0.55;
      var S = Math.max(desk ? 1.6 : 1.45, tx / (dx - il), (W - tx) / (il + iw - dx), ty / (dy - it), (H - ty) / (it + ih - dy)) * 1.02;
      L = { W: W, H: H, desk: desk, boxL: boxL, S: S, mx: tx - dx, my: ty - dy,
        door: { l: tx + (il + f.door.l * iw - dx) * S, r: tx + (il + f.door.r * iw - dx) * S, t: ty + (it + f.door.t * ih - dy) * S, b: ty + (it + f.door.b * ih - dy) * S } };
      img.style.cssText = 'inset:auto;object-fit:fill;left:' + il.toFixed(1) + 'px;top:' + it.toFixed(1) + 'px;width:' + iw.toFixed(1) + 'px;height:' + ih.toFixed(1) + 'px;transform-origin:' + (dx - il).toFixed(1) + 'px ' + (dy - it).toFixed(1) + 'px';
    }
    layout();

    // крупный кадр зала подменяем после загрузки страницы
    window.addEventListener('load', function () { setTimeout(function () { if (hallImg.dataset.src) hallImg.src = hallImg.dataset.src; }, 600); });

    var clip = { p: 0 };
    function setClip() {
      var d = L.door, k = clip.p, i = 1 - k;
      var t = Math.max(0, d.t) * i, r = Math.max(0, L.W - d.r) * i, b = Math.max(0, L.H - d.b) * i, l = Math.max(0, d.l) * i;
      hall.style.clipPath = 'inset(' + t.toFixed(1) + 'px ' + r.toFixed(1) + 'px ' + b.toFixed(1) + 'px ' + l.toFixed(1) + 'px)';
    }

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(window.innerHeight * (mq.matches ? 1.2 : 0.45)); },
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onRefreshInit: function () { gsap.set(img, { clearProps: 'transform' }); layout(); },
      },
    });
    tl.to(hint, { autoAlpha: 0, duration: 0.06 }, 0)
      .to(plate, { xPercent: function () { return mq.matches ? -115 : 0; }, yPercent: function () { return mq.matches ? 0 : 110; }, autoAlpha: 0, duration: 0.36, ease: 'power2.in' }, 0)
      .fromTo(wrap, { '--clip': function () { return (L.boxL / L.W * 100).toFixed(2) + '%'; } }, { '--clip': '0%', duration: 0.42, ease: 'power2.inOut' }, 0.04)
      .fromTo(wrap, { '--fade': 1 }, { '--fade': 0, duration: 0.3 }, 0.12);
    cloths.forEach(function (c, i) {
      var dir = parseFloat(c.getAttribute('data-hc')) || (i < 2 ? -1 : 1);
      tl.to(c, { x: function () { return dir * window.innerWidth * (0.42 + Math.abs(dir) * 0.28); }, opacity: 0.25, duration: 0.5, ease: 'power2.in' }, 0.02 + i * 0.02);
    });
    tl.to(img, { x: function () { return L.mx; }, y: function () { return L.my; }, scale: function () { return L.S; }, duration: 0.58, ease: 'power2.inOut' }, 0.02)
      .set(hall, { visibility: 'visible' }, 0.5)
      .fromTo(clip, { p: 0 }, { p: 1, duration: 0.3, ease: 'power2.inOut', onUpdate: setClip, onStart: setClip }, 0.52)
      .fromTo(hallImg, { scale: 1.25 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, 0.52)
      .fromTo(welcome, { yPercent: -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.2, ease: 'power3.out' }, 0.78)
      .to({}, { duration: 0.06 });
    setClip();

    // перекладка при смене ориентации / ширины
    mq.addEventListener('change', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- 03 · угощение: горизонтальная сцена ---------- */
  function treat() {
    var sec = $('[data-treat]');
    if (!sec) return;
    steam();
    if (!DD.gsap || DD.reduced) return;
    var track = $('[data-treat-track]', sec);
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', function () {
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
      // полотна между сценами наплывают быстрее ленты
      $$('.treat__gap', sec).forEach(function (g) {
        gsap.fromTo(g, { xPercent: 120 }, { xPercent: -160, ease: 'none', scrollTrigger: { trigger: g, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      $$('.scene__photo .clothframe__img img', sec).forEach(function (im) {
        gsap.fromTo(im, { scale: 1.14, xPercent: 4 }, { scale: 1.02, xPercent: -4, ease: 'none', scrollTrigger: { trigger: im, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      $$('.scene__text', sec).forEach(function (t) {
        gsap.from(t.children, { y: 40, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: t, containerAnimation: tween, start: 'left 78%', once: true } });
      });
      return function () { gsap.set(track, { clearProps: 'transform' }); };
    });
    mm.add('(max-width: 1023px)', function () {
      $$('.scene', sec).forEach(function (s) {
        gsap.from(s.children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 85%', once: true } });
      });
    });
  }

  /* пар над чашкой: не больше 40 частиц, пауза вне экрана */
  function steam() {
    var cv = $('[data-steam]');
    if (!cv || DD.reduced) return;
    var ctx = cv.getContext('2d'), img = cv.parentNode.querySelector('img');
    var dpr = Math.min(1.5, window.devicePixelRatio || 1), W = 0, H = 0, ox = 0, oy = 0, on = false, raf = 0, last = 0;
    var P = [], MAX = 36;
    // мягкое пятно рисуем один раз
    var sp = document.createElement('canvas'); sp.width = sp.height = 64;
    var sx = sp.getContext('2d'), g = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.45, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    sx.fillStyle = g; sx.fillRect(0, 0, 64, 64);
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      // кадр 1024×1536 вписан cover: чашка — 48 % по ширине, край — 55.5 % по высоте исходника
      var s = Math.max(W / 1024, H / 1536), iw = 1024 * s, ih = 1536 * s;
      ox = (W - iw) / 2 + 0.48 * iw; oy = (H - ih) / 2 + 0.555 * ih;
    }
    function spawn() {
      P.push({ x: ox + (Math.random() - 0.5) * W * 0.2, y: oy + 4, vx: (Math.random() - 0.5) * 5, vy: -(12 + Math.random() * 12), r: 3 + Math.random() * 4, life: 0, max: 1.6 + Math.random() * 1.2, ph: Math.random() * 6.28 });
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      if (P.length < MAX && Math.random() < 0.35) spawn();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (var i = P.length - 1; i >= 0; i--) {
        var p = P[i];
        p.life += dt;
        if (p.life > p.max) { P.splice(i, 1); continue; }
        var k = p.life / p.max;
        p.x += (p.vx + Math.sin(p.ph + p.life * 2.2) * 7) * dt; p.y += p.vy * dt; p.r += 6 * dt;
        ctx.globalAlpha = Math.sin(k * Math.PI) * (1 - k * 0.6) * 0.3;
        ctx.drawImage(sp, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !on) { on = true; size(); last = performance.now(); raf = requestAnimationFrame(frame); }
        else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
      });
    });
    io.observe(cv);
    window.addEventListener('resize', function () { if (on) size(); });
    if (img && !img.complete) img.addEventListener('load', size);
  }

  /* ---------- полотна-переходы ---------- */
  function veils() {
    if (!DD.gsap || DD.reduced) return;
    $$('[data-veil]').forEach(function (v) {
      var cl = $$('.cl', v);
      var tl = gsap.timeline({ scrollTrigger: { trigger: v, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      cl.forEach(function (c, i) {
        var x = parseFloat(c.style.getPropertyValue('--x')) || 0, w = parseFloat(c.style.getPropertyValue('--w')) || 0;
        var dir = x + w / 2 < 50 ? -1 : 1;
        var far = 0.5 + Math.abs(x + w / 2 - 50) / 100;
        tl.fromTo(c, { x: function () { return -dir * window.innerWidth * 0.1; }, yPercent: -12 }, { x: 0, yPercent: 0, duration: 0.4, ease: 'sine.out' }, 0)
          .to(c, { x: function () { return dir * window.innerWidth * far; }, duration: 0.58, ease: 'power2.in' }, 0.42 + i * 0.015);
      });
    });
  }

  /* ---------- 10 · полотна закрываются ---------- */
  function curtain() {
    var foot = $('[data-foot]');
    if (!foot || !DD.gsap || DD.reduced) return;
    var cl = $$('.foot__curtain .cl', foot);
    gsap.fromTo(cl, { yPercent: -100 }, { yPercent: 0, ease: 'power2.out', stagger: { each: 0.06, from: 'edges' },
      scrollTrigger: { trigger: foot, start: 'top 85%', end: 'top 5%', scrub: 1 } });
    gsap.from('.foot__wish > :not(.draw)', { y: 40, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.foot__wish', start: 'top 45%', once: true } });
  }

  DD.on(5, 'preloader', preloader);
  DD.on(10, 'hero', hero);
  DD.on(20, 'treat', treat);
  DD.on(60, 'veils', veils);
  DD.on(62, 'curtain', curtain);
  DD.on(64, 'sway', sway);
})();
