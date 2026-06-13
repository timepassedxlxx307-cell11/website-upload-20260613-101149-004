(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }

        callback();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";

                if (query) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(query);
                }
            });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        document.querySelectorAll("[data-filter-form]").forEach(function (form) {
            var target = form.getAttribute("data-target") || "movie-list";
            var list = document.getElementById(target);
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];
            var count = document.querySelector("[data-result-count='" + target + "']");
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            var keywordInput = form.querySelector("input[name='keyword']");

            if (keywordInput && q) {
                keywordInput.value = q;
            }

            function applyFilters() {
                var keyword = normalize(keywordInput ? keywordInput.value : "");
                var regionSelect = form.querySelector("select[name='region']");
                var yearSelect = form.querySelector("select[name='year']");
                var region = regionSelect ? regionSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-text"));
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = Number(card.getAttribute("data-year") || 0);
                    var regionMatched = true;
                    var yearMatched = true;

                    if (region === "other") {
                        regionMatched = ["中国大陆", "中国", "中国香港", "香港", "中国台湾", "美国", "日本", "韩国", "英国", "法国"].indexOf(cardRegion) === -1;
                    } else if (region) {
                        regionMatched = cardRegion === region;
                    }

                    if (year === "older") {
                        yearMatched = cardYear < 2020;
                    } else if (year) {
                        yearMatched = cardYear === Number(year);
                    }

                    var matched = (!keyword || text.indexOf(keyword) !== -1) && regionMatched && yearMatched;
                    card.hidden = !matched;

                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "已显示 " + visible + " 部影片";
                }
            }

            form.addEventListener("input", applyFilters);
            form.addEventListener("change", applyFilters);
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilters();
            });
            applyFilters();
        });
    });

    window.initializeMoviePlayer = function (videoId, buttonId, mediaUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var hlsInstance = null;

        if (!video || !button || !mediaUrl) {
            return;
        }

        function attachMedia() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(mediaUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }

            video.setAttribute("data-ready", "1");
        }

        function beginPlayback() {
            attachMedia();
            button.classList.add("is-hidden");
            video.setAttribute("controls", "controls");
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        button.addEventListener("click", beginPlayback);
        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1") {
                beginPlayback();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };
})();
