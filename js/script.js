/* ============================================================
   JULIE MEESSEN INSTITUT — script.js
   Header au scroll · menu mobile · reveals · carrousel Insta
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. HEADER : fond au scroll + hide/show ---------- */
  const header = document.querySelector('[data-header]');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    // Fond crème après 100px
    header.classList.toggle('is-scrolled', y > 100);
    // Masquer en descendant, montrer en remontant (après le hero)
    if (y > 300 && y > lastY + 6) {
      header.classList.add('is-hidden');
    } else if (y < lastY - 6) {
      header.classList.remove('is-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- 2. MENU MOBILE ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');

  if (toggle && menu) {
    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-active', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- 3. REVEALS AU SCROLL ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    // Index pour le décalage (stagger) dans les grilles
    document.querySelectorAll('.services__grid').forEach(grid => {
      grid.querySelectorAll('[data-reveal]').forEach((el, i) => el.style.setProperty('--i', i));
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- 4. CARROUSEL INSTAGRAM ---------- */
  const track = document.querySelector('.instagram__track');
  const prev = document.querySelector('.carousel-btn--prev');
  const next = document.querySelector('.carousel-btn--next');

  if (track && prev && next) {
    const step = () => track.querySelector('.instagram__item')?.offsetWidth + 16 || 300;
    const updateBtns = () => {
      prev.disabled = track.scrollLeft < 10;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', () => window.requestAnimationFrame(updateBtns), { passive: true });
    window.addEventListener('resize', updateBtns);
    updateBtns();
  }

  /* ---------- 5. ANNÉE COURANTE (footer) ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
