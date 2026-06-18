(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function() {
            panel.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function() {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(index + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var query = new URLSearchParams(window.location.search).get("q") || "";
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-filter-block]"));

    blocks.forEach(function(block) {
        var keywordInput = block.querySelector("[data-filter-keyword]");
        var kindSelect = block.querySelector("[data-filter-kind]");
        var yearSelect = block.querySelector("[data-filter-year]");
        var resetButton = block.querySelector("[data-filter-reset]");
        var grid = block.parentElement.querySelector("[data-filter-grid]");
        var empty = block.parentElement.querySelector("[data-empty-result]");

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var kind = normalize(kindSelect ? kindSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function(card) {
                var target = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-kind"),
                    card.getAttribute("data-year")
                ].join(" "));
                var cardKind = normalize(card.getAttribute("data-kind"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matched = true;

                if (keyword && target.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (kind && cardKind !== kind) {
                    matched = false;
                }

                if (year && cardYear.indexOf(year) === -1) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("visible", visible === 0);
            }
        }

        [keywordInput, kindSelect, yearSelect].forEach(function(control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function() {
                if (keywordInput) {
                    keywordInput.value = "";
                }
                if (kindSelect) {
                    kindSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                applyFilter();
            });
        }

        applyFilter();
    });
})();
