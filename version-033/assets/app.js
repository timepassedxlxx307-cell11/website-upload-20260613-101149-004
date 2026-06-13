(() => {
  const body = document.body;
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('is-open');
      body.classList.toggle('is-menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let heroTimer = null;

  function setHeroSlide(index) {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle('is-active', current === activeSlide);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle('is-active', current === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) return;
    heroTimer = window.setInterval(() => setHeroSlide(activeSlide + 1), 5200);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      window.clearInterval(heroTimer);
      setHeroSlide(index);
      startHero();
    });
  });

  setHeroSlide(0);
  startHero();

  const backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    const syncTop = () => {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    };
    window.addEventListener('scroll', syncTop, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    syncTop();
  }

  const filterInputs = Array.from(document.querySelectorAll('[data-card-filter]'));
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(input) {
    const target = document.querySelector(input.getAttribute('data-card-filter'));
    if (!target) return;
    const cards = Array.from(target.querySelectorAll('[data-search-item]'));
    const empty = document.querySelector(input.getAttribute('data-empty-target'));
    const query = normalize(input.value);
    let visible = 0;
    cards.forEach((card) => {
      const text = normalize(card.getAttribute('data-search-text'));
      const show = !query || text.includes(query);
      card.classList.toggle('hidden-card', !show);
      if (show) visible += 1;
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  filterInputs.forEach((input) => {
    if (initialQuery && !input.value) {
      input.value = initialQuery;
    }
    input.addEventListener('input', () => applyFilter(input));
    applyFilter(input);
  });

  function attachPlayer(shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    const source = shell.getAttribute('data-stream');
    if (!video || !source) return;

    const play = () => {
      if (!video.dataset.loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({ maxBufferLength: 45 });
          hls.loadSource(source);
          hls.attachMedia(video);
          shell._hls = hls;
        } else {
          video.src = source;
        }
        video.dataset.loaded = 'true';
      }
      shell.classList.add('is-playing');
      video.controls = true;
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          shell.classList.remove('is-playing');
        });
      }
    };

    shell.addEventListener('click', (event) => {
      if (event.target === video && !video.paused) return;
      play();
    });

    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });
  }

  document.querySelectorAll('[data-stream]').forEach(attachPlayer);
})();
