(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var index = 0;
      var timer;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          show(i);
          start();
        });
      });
      start();
    }

    var searchInput = document.getElementById("search-input");
    var categoryFilter = document.getElementById("category-filter");
    var yearFilter = document.getElementById("year-filter");
    var clearButton = document.getElementById("clear-search");
    var status = document.querySelector(".search-status");
    var allCards = Array.prototype.slice.call(document.querySelectorAll(".all-search-grid .movie-card"));

    function applyMainSearch() {
      if (!allCards.length) {
        return;
      }
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var category = categoryFilter ? categoryFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;
      allCards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okCategory = !category || card.getAttribute("data-category") === category;
        var okYear = !year || card.getAttribute("data-year") === year;
        var show = okKeyword && okCategory && okYear;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = visible > 0 ? "筛选结果已更新。" : "没有找到匹配内容。";
      }
    }

    if (searchInput || categoryFilter || yearFilter) {
      [searchInput, categoryFilter, yearFilter].forEach(function (field) {
        if (field) {
          field.addEventListener("input", applyMainSearch);
          field.addEventListener("change", applyMainSearch);
        }
      });
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (searchInput) {
            searchInput.value = "";
          }
          if (categoryFilter) {
            categoryFilter.value = "";
          }
          if (yearFilter) {
            yearFilter.value = "";
          }
          applyMainSearch();
        });
      }
    }

    var localInput = document.querySelector(".local-filter");
    var localYear = document.querySelector(".filter-bar .year-filter");
    var localCards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid:not(.all-search-grid) .movie-card"));

    function applyLocalSearch() {
      if (!localCards.length) {
        return;
      }
      var keyword = localInput ? localInput.value.trim().toLowerCase() : "";
      var year = localYear ? localYear.value : "";
      localCards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("is-hidden", !(okKeyword && okYear));
      });
    }

    if (localInput || localYear) {
      if (localInput) {
        localInput.addEventListener("input", applyLocalSearch);
      }
      if (localYear) {
        localYear.addEventListener("change", applyLocalSearch);
      }
    }
  });
})();
