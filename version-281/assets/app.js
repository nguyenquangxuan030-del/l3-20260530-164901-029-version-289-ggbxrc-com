(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function() {
    var menuButton = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-nav]");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function() {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function(hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          show(Number(dot.getAttribute("data-hero-dot") || "0"));
        });
      });

      if (slides.length > 1) {
        window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-block]").forEach(function(block) {
      var input = block.querySelector("[data-filter-input]");
      var region = block.querySelector("[data-region-filter]");
      var type = block.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(block.querySelectorAll(".movie-card, .rank-row"));
      var queryValue = "";
      try {
        queryValue = new URLSearchParams(window.location.search).get("q") || "";
      } catch (e) {
        queryValue = "";
      }

      if (queryValue && input) {
        input.value = queryValue;
      }

      function apply() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";

        cards.forEach(function(card) {
          var allText = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-text") || ""
          ].join(" ").toLowerCase();

          var okText = !text || allText.indexOf(text) !== -1;
          var okRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var okType = !typeValue || card.getAttribute("data-type") === typeValue;

          card.classList.toggle("is-hidden", !(okText && okRegion && okType));
        });
      }

      [input, region, type].forEach(function(node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });

      apply();
    });
  });
})();
