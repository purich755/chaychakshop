/* polotna.js — их полотна: мягкий вход на первом экране, угощение, полотна-переходы,
   футер «полотна закрываются» и «живая ткань» — покачивание от курсора и скорости прокрутки. */
(function () {
  'use strict';
  var DD = window.DD;
  var $ = DD.$, $$ = DD.$$;

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

  /* ---------- первый экран: без закрепления и «слайдов» — только мягкий вход полотен ---------- */
  function hero() {
    var sec = $('.hero');
    if (!sec || !DD.gsap || DD.reduced) return;
    gsap.from($$('.hero__cloths .cl', sec), { yPercent: -18, opacity: 0, duration: 1.4, stagger: 0.12, ease: 'power3.out', delay: 0.15 });
    gsap.from($('.hero__photo img', sec), { scale: 1.06, duration: 1.8, ease: 'power2.out' });
  }

  /* ---------- угощение: обычный раздел, сцены появляются по очереди ---------- */
  function treat() {
    var sec = $('[data-treat]');
    if (!sec) return;
    steam();
    if (!DD.gsap || DD.reduced) return;
    $$('.scene', sec).forEach(function (sc, i) {
      gsap.from(sc.children, { y: 50, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: sc, start: 'clamp(top 88%)', once: true } });
    });
    gsap.from($$('.treat__final > *', sec), { y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: $('.treat__final', sec), start: 'clamp(top 88%)', once: true } });
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

  DD.on(10, 'hero', hero);
  DD.on(20, 'treat', treat);
  DD.on(60, 'veils', veils);
  DD.on(62, 'curtain', curtain);
  DD.on(64, 'sway', sway);
})();
