(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMobileNav() {
        var toggle = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.hasAttribute('hidden');
            if (open) {
                nav.removeAttribute('hidden');
            } else {
                nav.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    function initHero() {
        var hero = document.querySelector('.hero-carousel');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var current = 0;
        var timer = null;
        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.filterable-grid'));
        if (!grids.length) {
            return;
        }
        var input = document.querySelector('.filter-input');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var active = 'all';
        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
        }
        function apply() {
            var q = normalize(input ? input.value : '');
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
                cards.forEach(function (card) {
                    var hay = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' '));
                    var queryMatch = !q || hay.indexOf(q) !== -1;
                    var filterMatch = true;
                    if (active !== 'all') {
                        var parts = normalize(active).split(' ');
                        filterMatch = parts.some(function (part) {
                            if (part === '2024') {
                                var year = parseInt(card.dataset.year || '0', 10);
                                return year >= 2024;
                            }
                            return hay.indexOf(part) !== -1;
                        });
                    }
                    card.classList.toggle('hidden-by-filter', !(queryMatch && filterMatch));
                });
            });
        }
        if (input) {
            input.addEventListener('input', apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                active = button.dataset.filter || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        apply();
    }

    function initSearchPage() {
        var box = document.getElementById('search-results');
        var input = document.getElementById('search-page-input');
        if (!box || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input) {
            input.value = q;
        }
        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (ch) {
                return ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                })[ch];
            });
        }
        function render(query) {
            var normalized = String(query || '').toLowerCase().trim();
            var list = window.MOVIE_INDEX.filter(function (item) {
                if (!normalized) {
                    return true;
                }
                return [item.title, item.year, item.region, item.type, item.genre, item.category, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase().indexOf(normalized) !== -1;
            }).slice(0, 240);
            box.innerHTML = list.map(function (item) {
                var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<article class="movie-card">' +
                    '<a class="poster-link" href="' + escapeHtml(item.link) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="poster-year">' + escapeHtml(item.year) + '</span>' +
                    '<span class="poster-play">立即播放</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<h3><a href="' + escapeHtml(item.link) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }
        render(q);
        if (input) {
            input.addEventListener('input', function () {
                render(input.value);
            });
        }
    }

    function initPlayer() {
        var video = document.getElementById('movie-player');
        if (!video) {
            return;
        }
        var overlay = document.querySelector('.play-overlay');
        var source = video.dataset.src;
        var hls = null;
        var loaded = false;
        function load() {
            if (loaded || !source) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }
        function play() {
            load();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initSearchPage();
        initPlayer();
    });
})();
