(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      startHero();
    });
  });

  startHero();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function applyFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var query = normalize(searchInputs.map(function (input) { return input.value; }).filter(Boolean).join(' '));
    var visible = 0;

    cards.forEach(function (card) {
      var hay = normalize(card.getAttribute('data-search'));
      var category = card.getAttribute('data-category') || '';
      var matchQuery = !query || hay.indexOf(query) !== -1;
      var matchFilter = activeFilter === 'all' || activeFilter === category;
      var show = matchQuery && matchFilter;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    document.querySelectorAll('.empty-state').forEach(function (item) {
      item.hidden = visible !== 0;
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
      var target = document.querySelector('#movies');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
