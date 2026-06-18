(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupNavSearch() {
    var forms = document.querySelectorAll('[data-nav-search]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
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
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function setupCatalog() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filterable-card]'));
    if (!cards.length) {
      return;
    }
    var search = document.getElementById('catalog-search');
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));
    var active = {};

    groups.forEach(function (group) {
      var name = group.getAttribute('data-filter-name');
      active[name] = 'all';
      group.querySelectorAll('button[data-filter-value]').forEach(function (button) {
        button.addEventListener('click', function () {
          active[name] = button.getAttribute('data-filter-value') || 'all';
          group.querySelectorAll('button').forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          apply();
        });
      });
    });

    function apply() {
      var term = normalize(search ? search.value.trim() : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = !term || haystack.indexOf(term) !== -1;
        Object.keys(active).forEach(function (name) {
          var selected = active[name];
          if (selected && selected !== 'all') {
            matched = matched && normalize(card.getAttribute('data-' + name)) === normalize(selected);
          }
        });
        card.classList.toggle('is-hidden', !matched);
      });
    }

    if (search) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');
      if (initial) {
        search.value = initial;
      }
      search.addEventListener('input', apply);
    }
    apply();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('.player-overlay');
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
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
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupNavSearch();
    setupHero();
    setupCatalog();
  });
})();
