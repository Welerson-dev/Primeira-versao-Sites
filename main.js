/* ===========================================
   PRISM — JavaScript v2
   =========================================== */
'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =============================================
// 1. MOBILE NAV TOGGLE
// =============================================
(function initNav() {
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    }
  });
})();

// =============================================
// 2. CANVAS PRISM — Ray labels on hover
// =============================================
(function initPrismCanvas() {
  const canvas = document.getElementById('prism-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animFrame;

  const RAYS = [
    { color: '#555555', label: 'fashion', angle: -8,  opacity: 0, hovered: false, endX: 0, endY: 0, exitX: 0, exitY: 0 },
    { color: '#F3722C', label: 'gym',     angle: -2,  opacity: 0, hovered: false, endX: 0, endY: 0, exitX: 0, exitY: 0 },
    { color: '#A0622A', label: 'resto',   angle:  5,  opacity: 0, hovered: false, endX: 0, endY: 0, exitX: 0, exitY: 0 },
    { color: '#0077B6', label: 'dental',  angle:  12, opacity: 0, hovered: false, endX: 0, endY: 0, exitX: 0, exitY: 0 },
  ];

  // Labels metadata
  const RAY_META = {
    fashion: { name: 'Moda',        href: 'fashion/index.html' },
    gym:     { name: 'Academia',    href: 'gym/index.html'     },
    resto:   { name: 'Gastronomia', href: 'restaurante/index.html' },
    dental:  { name: 'Odontologia', href: 'odontologia/index.html' },
  };

  function resize() {
    const wrap = canvas.parentElement;
    W = canvas.width  = wrap.offsetWidth;
    H = canvas.height = Math.min(wrap.offsetHeight, 480);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawPrism(cx, cy, size) {
    const top    = { x: cx,              y: cy - size * 0.55 };
    const bottom = { x: cx - size * 0.48, y: cy + size * 0.45 };
    const right  = { x: cx + size * 0.48, y: cy + size * 0.45 };

    // Glow
    const grd = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.7);
    grd.addColorStop(0, 'rgba(140,80,255,0.12)');
    grd.addColorStop(1, 'rgba(140,80,255,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Face
    const grad = ctx.createLinearGradient(top.x, top.y, bottom.x, bottom.y);
    grad.addColorStop(0,   'rgba(255,255,255,0.68)');
    grad.addColorStop(0.4, 'rgba(220,230,255,0.42)');
    grad.addColorStop(1,   'rgba(200,220,255,0.58)');

    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight edge
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.stroke();

    return { top, bottom, right };
  }

  function drawInputBeam(cx, cy, size) {
    const startX = cx - size * 1.1;
    const startY = cy - size * 0.05;
    const entryX = cx - size * 0.25;
    const entryY = cy + size * 0.08;
    const bw = size * 0.032;

    ctx.save();
    ctx.globalAlpha = 0.82;

    const beamGrad = ctx.createLinearGradient(startX, startY, entryX, entryY);
    beamGrad.addColorStop(0,   'rgba(255,255,255,0)');
    beamGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)');
    beamGrad.addColorStop(1,   'rgba(255,255,255,0.3)');

    ctx.beginPath();
    ctx.moveTo(startX, startY - bw);
    ctx.lineTo(entryX, entryY - bw * 0.5);
    ctx.lineTo(entryX, entryY + bw * 0.5);
    ctx.lineTo(startX, startY + bw);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.restore();
  }

  function drawOutputRays(cx, cy, size, timestamp) {
    const exitX = cx + size * 0.3;
    const exitY = cy + size * 0.22;

    ctx.save();
    RAYS.forEach((ray, i) => {
      const targetOpacity = ray.hovered ? 1 : 0.65;
      ray.opacity = lerp(ray.opacity, targetOpacity, prefersReducedMotion ? 1 : 0.06);

      const angleDeg = ray.angle + 8; // shift baseline
      const angleRad = (angleDeg * Math.PI) / 180;

      const rayLen = size * (ray.hovered ? 1.45 : 1.15);
      ray.exitX = exitX;
      ray.exitY = exitY;
      ray.endX  = exitX + Math.cos(angleRad) * rayLen;
      ray.endY  = exitY + Math.sin(angleRad) * rayLen;
      ray.angleRad = angleRad;

      const bw = size * 0.026 * (1 + (RAYS.length - i) * 0.12);
      const perpX = Math.sin(angleRad) * bw;
      const perpY = -Math.cos(angleRad) * bw;

      ctx.globalAlpha = ray.opacity * (ray.hovered ? 1 : 0.8);

      const rayGrad = ctx.createLinearGradient(exitX, exitY, ray.endX, ray.endY);
      rayGrad.addColorStop(0, ray.color + 'ee');
      rayGrad.addColorStop(0.7, ray.color + '88');
      rayGrad.addColorStop(1, ray.color + '00');

      ctx.beginPath();
      ctx.moveTo(exitX - perpX, exitY - perpY);
      ctx.lineTo(ray.endX - perpX * 0.15, ray.endY - perpY * 0.15);
      ctx.lineTo(ray.endX + perpX * 0.15, ray.endY + perpY * 0.15);
      ctx.lineTo(exitX + perpX, exitY + perpY);
      ctx.closePath();
      ctx.fillStyle = rayGrad;
      ctx.fill();

      // Dot at ray tip
      if (ray.hovered) {
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(ray.endX, ray.endY, 5, 0, Math.PI * 2);
        ctx.fillStyle = ray.color;
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // ---- Floating canvas labels (drawn in HTML overlay) ----
  function updateOverlayLabels() {
    RAYS.forEach(ray => {
      const labelEl = document.querySelector(`.ray-${ray.label}`);
      if (!labelEl) return;

      if (ray.endX === 0 && ray.endY === 0) return;

      // Position relative to canvas
      const rect = canvas.getBoundingClientRect();
      // Convert canvas coords → page (canvas is scaled via CSS)
      const scaleX = rect.width  / W;
      const scaleY = rect.height / H;

      const px = rect.left + window.scrollX + ray.endX * scaleX;
      const py = rect.top  + window.scrollY + ray.endY * scaleY;

      labelEl.style.left = px + 'px';
      labelEl.style.top  = py + 'px';

      labelEl.classList.add('positioned');
      if (ray.hovered) {
        labelEl.classList.add('visible');
      } else {
        labelEl.classList.remove('visible');
      }
    });
  }

  function draw(timestamp) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    const cx   = W * 0.44;
    const cy   = H * 0.48;
    const size = Math.min(W, H) * 0.4;

    drawInputBeam(cx, cy, size);
    drawPrism(cx, cy, size);
    drawOutputRays(cx, cy, size, timestamp);
    updateOverlayLabels();

    animFrame = requestAnimationFrame(draw);
  }

  // ---- Hit-test: is point (mx,my) near a ray? ----
  function hitTestRay(mx, my) {
    // mx,my in canvas coordinates
    let hit = -1;
    RAYS.forEach((ray, i) => {
      if (ray.endX === 0) return;
      const dx = mx - ray.exitX;
      const dy = my - ray.exitY;
      // Project onto ray direction
      const len = Math.hypot(ray.endX - ray.exitX, ray.endY - ray.exitY);
      const dirX = (ray.endX - ray.exitX) / len;
      const dirY = (ray.endY - ray.exitY) / len;
      const proj = dx * dirX + dy * dirY;
      if (proj < 0 || proj > len * 1.1) return;
      // Perpendicular distance
      const perp = Math.abs(dx * (-dirY) + dy * dirX);
      if (perp < 22 && proj >= 0) hit = i;
    });
    return hit;
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;

    const hit = hitTestRay(mx, my);
    RAYS.forEach((ray, i) => { ray.hovered = (i === hit); });
    canvas.style.cursor = hit >= 0 ? 'pointer' : '';
  });

  canvas.addEventListener('mouseleave', () => {
    RAYS.forEach(ray => { ray.hovered = false; });
    canvas.style.cursor = '';
  });

  // Click on ray → navigate to that site
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const hit = hitTestRay(mx, my);
    if (hit >= 0) {
      window.location.href = RAY_META[RAYS[hit].label].href;
    }
  });

  // Touch support
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect  = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (touch.clientX - rect.left) * scaleX;
    const my = (touch.clientY - rect.top)  * scaleY;
    const hit = hitTestRay(mx, my);
    if (hit >= 0) window.location.href = RAY_META[RAYS[hit].label].href;
  });

  function init() {
    resize();
    if (!prefersReducedMotion) {
      animFrame = requestAnimationFrame(draw);
    } else {
      draw(0);
    }
    window.addEventListener('resize', () => { resize(); });
  }

  init();
})();

// =============================================
// 3. VITRINE CARD ENTRANCE
// =============================================
(function initCardEntrance() {
  const cards = document.querySelectorAll('.vitrine-card');
  if (!cards.length) return;

  if (prefersReducedMotion) {
    cards.forEach(card => { card.style.opacity = '1'; card.style.transform = 'none'; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const delay = parseInt(card.getAttribute('data-delay') || '0');
        setTimeout(() => card.classList.add('animate-in'), delay);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card, i) => {
    card.setAttribute('data-delay', String(i * 120));
    observer.observe(card);
  });
})();

// =============================================
// 4. SMOOTH ACTIVE NAV
// =============================================
(function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActive() {
    let current = '';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= 100) current = section.id;
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href').slice(1);
      link.style.color = href === current ? 'var(--ink-900)' : '';
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

// =============================================
// 5. CONTACT FORM
// =============================================
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('#contact-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = '✓ Mensagem enviada!';
      btn.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    }, 1200);
  });
})();

// =============================================
// 6. HEADER SCROLL EFFECT
// =============================================
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
})();

// =============================================
// 7. GLASS PANELS REVEAL
// =============================================
(function initReveal() {
  if (prefersReducedMotion) return;

  const els = document.querySelectorAll(
    '.about-text, .stat-card, .diferencial-card, .testimonial-card, .pricing-card, .glass-feature, .glass-stat'
  );

  els.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px)';
    el.style.transition = 'opacity 0.65s var(--ease-out-expo), transform 0.65s var(--ease-out-expo)';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'none';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => obs.observe(el));
})();

// =============================================
// 8. PARALLAX FLOATING GLASS CARDS
// =============================================
(function initParallax() {
  if (prefersReducedMotion) return;
  const floaters = document.querySelectorAll('[data-parallax]');
  if (!floaters.length) return;

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    floaters.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax') || '0.15');
      el.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
})();

// =============================================
// 9. COUNTER ANIMATION
// =============================================
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const dur    = 1800;
      const start  = performance.now();

      function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const val  = target * ease;
        el.textContent = prefix + (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();
