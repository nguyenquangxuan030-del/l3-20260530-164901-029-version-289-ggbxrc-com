(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupImages() {
        selectAll("img").forEach(function(img) {
            img.addEventListener("error", function() {
                img.classList.add("image-missing");
                img.removeAttribute("src");
            }, { once: true });
        });
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function() {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var dots = selectAll("[data-hero-dot]", slider);
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function textForCard(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-tags") || "",
            card.textContent || ""
        ].join(" ").toLowerCase();
    }

    function setupFilters() {
        selectAll("[data-filter-root]").forEach(function(root) {
            var input = root.querySelector("[data-filter-input]");
            var year = root.querySelector("[data-year-filter]");
            var type = root.querySelector("[data-type-filter]");
            var cards = selectAll("[data-card]", root);
            var empty = root.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (input && query && root.hasAttribute("data-query-sync")) {
                input.value = query;
            }

            function apply() {
                var term = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                cards.forEach(function(card) {
                    var cardText = textForCard(card);
                    var okTerm = !term || cardText.indexOf(term) !== -1;
                    var okYear = !selectedYear || (card.getAttribute("data-year") || "") === selectedYear;
                    var okType = !selectedType || (card.getAttribute("data-type") || "") === selectedType;
                    var show = okTerm && okYear && okType;

                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var overlay = player.querySelector(".player-overlay");
        if (!video || !overlay) {
            return;
        }
        var url = video.getAttribute("data-video-url");
        var hls = null;
        var loading = false;

        function hideOverlay() {
            overlay.classList.add("is-hidden");
        }

        function loadAndPlay() {
            if (!url || loading) {
                return;
            }
            loading = true;
            hideOverlay();

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    video.play().catch(function() {});
                });
                hls.on(window.Hls.Events.ERROR, function(event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.addEventListener("loadedmetadata", function() {
                    video.play().catch(function() {});
                }, { once: true });
            } else {
                video.src = url;
                video.play().catch(function() {
                    window.location.href = url;
                });
            }
        }

        overlay.addEventListener("click", loadAndPlay);
        video.addEventListener("click", function() {
            if (!video.getAttribute("src") && !hls) {
                loadAndPlay();
                return;
            }
            if (video.paused) {
                video.play().catch(function() {});
            } else {
                video.pause();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function() {
        setupImages();
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
