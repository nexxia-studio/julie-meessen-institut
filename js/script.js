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


  /* ---------- 6. VIDÉO HERO : source attachée après le 1er paint ---------- */
  /* L'autoplay est conservé ; on évite simplement que la vidéo entre en
     concurrence avec le LCP au chargement. */
  const heroVideo = document.querySelector('[data-hero-video]');
  if (heroVideo && heroVideo.dataset.src) {
    const loadHero = () => {
      if (heroVideo.querySelector('source')) return;
      const src = document.createElement('source');
      src.src = heroVideo.dataset.src;
      src.type = 'video/mp4';
      heroVideo.appendChild(src);
      heroVideo.load();
      const play = heroVideo.play();
      if (play && play.catch) play.catch(() => {});
    };
    if (document.readyState === 'complete') {
      requestAnimationFrame(loadHero);
    } else {
      window.addEventListener('load', () => requestAnimationFrame(loadHero), { once: true });
    }
  }

  /* ---------- 7. CARTE GOOGLE : chargement au clic ---------- */
  /* Aucune requête vers Google (ni cookie) avant action de la visiteuse. */
  document.querySelectorAll('[data-map-facade]').forEach(facade => {
    const btn = facade.querySelector('.map-facade__btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = facade.dataset.mapSrc;
      iframe.title = facade.dataset.mapTitle || 'Carte';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      facade.replaceChildren(iframe);
    });
  });


  /* ---------- 8. FLUX INSTAGRAM ---------- */
  /* Les publications sont récupérées au build par une GitHub Action et
     versionnées dans le dépôt. On lit un JSON local : aucune requête vers
     Instagram, aucun cookie tiers. Si le fichier manque ou échoue, les
     visuels codés en dur dans le HTML restent affichés. */
  const igTrack = document.querySelector('[data-instagram-feed]');
  if (igTrack) {
    fetch('assets/instagram.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then(data => {
        const posts = (data && data.posts) || [];
        if (!posts.length) return;
        igTrack.replaceChildren(...posts.map(post => {
          const li = document.createElement('li');
          li.className = 'instagram__item';
          const a = document.createElement('a');
          a.href = post.permalink;
          a.target = '_blank';
          a.rel = 'noopener';
          const img = document.createElement('img');
          img.src = post.image;
          img.alt = post.alt || 'Publication Instagram de l\'institut';
          img.loading = 'lazy';
          img.width = 640;
          img.height = 640;
          a.appendChild(img);
          if (post.isVideo) {
            const badge = document.createElement('span');
            badge.className = 'instagram__video';
            badge.setAttribute('aria-hidden', 'true');
            a.appendChild(badge);
          }
          li.appendChild(a);
          return li;
        }));
      })
      .catch(() => { /* on garde les visuels de repli */ });
  }


  /* ---------- 9. CARROUSELS MOBILE ---------- */
  /* Défilement natif + avance automatique douce. L'avance s'arrête dès
     que la visiteuse touche le carrousel, quand il sort de l'écran, et
     elle ne démarre pas du tout si le système demande moins d'animations.
     Un bouton pause est fourni : c'est ce qu'exige le critère WCAG 2.2.1
     pour tout contenu qui défile seul plus de cinq secondes. */
  const ICON_PAUSE = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1"/><rect x="7" y="1.5" width="3" height="9" rx="1"/></svg>';
  const ICON_PLAY  = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8L10 6z"/></svg>';

  function initCarousel(track, label) {
    if (!track) return;
    const slides = Array.from(track.children);
    if (slides.length < 2) return;

    const mq = window.matchMedia('(max-width: 720px)');
    const ui = document.createElement('div');
    ui.className = 'carousel-ui';

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', label);
    slides.forEach((slide, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Aller à l'élément ${i + 1} sur ${slides.length}`);
      b.addEventListener('click', () => { stop(); goTo(i); });
      dots.appendChild(b);
    });

    const pause = document.createElement('button');
    pause.type = 'button';
    pause.className = 'carousel-pause';
    pause.innerHTML = ICON_PAUSE;
    pause.setAttribute('aria-label', 'Mettre le défilement en pause');

    ui.append(dots, pause);
    track.parentNode.insertBefore(ui, track.nextSibling);

    let timer = null, running = false, index = 0;

    const current = () => {
      const c = track.scrollLeft + track.clientWidth / 2;
      let best = 0, dist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };

    const paint = () => {
      index = current();
      Array.from(dots.children).forEach((d, i) =>
        d.setAttribute('aria-current', String(i === index)));
    };

    function goTo(i) {
      const s = slides[(i + slides.length) % slides.length];
      track.scrollTo({
        left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    }

    function start() {
      if (running || reduceMotion || !mq.matches) return;
      running = true;
      pause.innerHTML = ICON_PAUSE;
      pause.setAttribute('aria-label', 'Mettre le défilement en pause');
      timer = setInterval(() => goTo(current() + 1), 5000);
    }
    function stop() {
      running = false;
      clearInterval(timer);
      timer = null;
      pause.innerHTML = ICON_PLAY;
      pause.setAttribute('aria-label', 'Relancer le défilement');
    }

    pause.addEventListener('click', () => (running ? stop() : start()));

    // Toute manipulation directe coupe l'avance automatique : on ne se bat
    // jamais contre le pouce de la visiteuse.
    ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(ev =>
      track.addEventListener(ev, stop, { passive: true, once: true }));

    let raf = null;
    track.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { paint(); raf = null; });
    }, { passive: true });

    // On n'anime rien tant que la section n'est pas visible.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        entries.forEach(e => (e.isIntersecting && mq.matches ? start() : (timer && stop())));
      }, { threshold: 0.35 }).observe(track);
    } else {
      start();
    }

    mq.addEventListener('change', e => (e.matches ? paint() : stop()));
    paint();
  }

  initCarousel(document.querySelector('.services__grid'), 'Nos univers de soins');
  initCarousel(document.querySelector('.testimonials__grid'), 'Avis clientes');

  /* ---------- 5. ANNÉE COURANTE (footer) ---------- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
