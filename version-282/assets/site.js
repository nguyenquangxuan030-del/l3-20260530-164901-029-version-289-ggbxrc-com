(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });

      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-movie-search]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function matchYear(cardYear, filterValue) {
      var year = parseInt(cardYear, 10);

      if (!filterValue) {
        return true;
      }

      if (filterValue === "2000s") {
        return year >= 2000 && year <= 2009;
      }

      if (filterValue === "1990s") {
        return year >= 1990 && year <= 1999;
      }

      if (filterValue === "older") {
        return year > 0 && year < 1990;
      }

      return cardYear === filterValue;
    }

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var yearValue = yearFilter ? yearFilter.value : "";
      var typeValue = typeFilter ? typeFilter.value : "";

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var queryOk = !query || haystack.indexOf(query) !== -1;
        var yearOk = matchYear(cardYear, yearValue);
        var typeOk = !typeValue || cardType === typeValue;

        card.hidden = !(queryOk && yearOk && typeOk);
      });
    }

    if (searchInput || yearFilter || typeFilter) {
      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }

      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
      }

      if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
      }
    }
  });
})();
