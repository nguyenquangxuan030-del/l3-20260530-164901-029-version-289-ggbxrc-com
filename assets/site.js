(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-horizontal-scroll]").forEach(function (scroller) {
      var section = scroller.closest(".section-block");
      if (!section) {
        return;
      }
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (left) {
        left.addEventListener("click", function () {
          scroller.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          scroller.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var filterInput = document.querySelector("[data-filter-input]");
    var filterType = document.querySelector("[data-filter-type]");
    var filterYear = document.querySelector("[data-filter-year]");
    var emptyState = document.querySelector("[data-empty-state]");

    if (cards.length && filterInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        filterInput.value = query;
      }

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilter() {
        var term = normalize(filterInput.value);
        var type = filterType ? normalize(filterType.value) : "";
        var year = filterYear ? normalize(filterYear.value) : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-year")
          ].join(" "));
          var okTerm = !term || haystack.indexOf(term) !== -1;
          var okType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
          var okYear = !year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1;
          var ok = okTerm && okType && okYear;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      filterInput.addEventListener("input", applyFilter);
      if (filterType) {
        filterType.addEventListener("change", applyFilter);
      }
      if (filterYear) {
        filterYear.addEventListener("change", applyFilter);
      }
      applyFilter();
    }
  });
})();

function initMoviePlayer(id, url) {
  var video = document.getElementById(id);
  if (!video || !url) {
    return;
  }

  var loaded = false;
  var covers = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  }

  function play() {
    attach();
    covers.forEach(function (cover) {
      cover.classList.add("is-hidden");
    });
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  covers.forEach(function (cover) {
    cover.addEventListener("click", play);
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
}
