(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
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
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function attachPlayer(shell, url) {
    var video = shell.querySelector("video");
    if (!video || !url) {
      return;
    }

    shell.classList.add("is-playing");

    if (window.Hls && typeof window.Hls.isSupported === "function" && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }

      var hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });

      video._hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          video.controls = true;
        });
      });
    } else {
      video.src = url;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {
          video.controls = true;
        });
      }, { once: true });
      video.load();
    }
  }

  document.querySelectorAll("[data-play]").forEach(function (button) {
    button.addEventListener("click", function () {
      var shell = button.closest(".player-shell");
      attachPlayer(shell, button.getAttribute("data-video"));
    });
  });

  document.querySelectorAll(".player-shell").forEach(function (shell) {
    shell.addEventListener("click", function (event) {
      var button = shell.querySelector("[data-play]");
      var video = shell.querySelector("video");

      if (event.target === video || event.target.closest("[data-play]")) {
        return;
      }

      if (button && !shell.classList.contains("is-playing")) {
        attachPlayer(shell, button.getAttribute("data-video"));
      }
    });
  });

  var searchInput = document.querySelector("[data-site-search]");
  var searchCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
  var emptyState = document.querySelector("[data-search-empty]");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var activeFilter = "all";

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applySearch() {
    if (!searchCards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : "");
    var visible = 0;

    searchCards.forEach(function (card) {
      var keywords = normalize(card.getAttribute("data-keywords"));
      var category = card.getAttribute("data-category") || "";
      var passQuery = !query || keywords.indexOf(query) !== -1;
      var passFilter = activeFilter === "all" || category === activeFilter;

      if (passQuery && passFilter) {
        card.style.display = "";
        visible += 1;
      } else {
        card.style.display = "none";
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    searchInput.addEventListener("input", applySearch);
    applySearch();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applySearch();
    });
  });
})();
