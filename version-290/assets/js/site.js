(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function uniqueSorted(values) {
    var store = {};
    values.forEach(function (value) {
      if (value) {
        store[value] = true;
      }
    });
    return Object.keys(store).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    uniqueSorted(values).forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panel = $('[data-filter-panel]');
    var grid = $('[data-filter-grid]');
    if (!panel || !grid) {
      return;
    }
    var input = $('[data-filter-input]', panel);
    var year = $('[data-filter-year]', panel);
    var region = $('[data-filter-region]', panel);
    var type = $('[data-filter-type]', panel);
    var cards = $all('[data-movie-card]', grid);

    fillSelect(year, cards.map(function (card) { return card.getAttribute('data-year'); }));
    fillSelect(region, cards.map(function (card) { return card.getAttribute('data-region'); }));
    fillSelect(type, cards.map(function (card) { return card.getAttribute('data-type'); }));

    function apply() {
      var keyword = (input && input.value ? input.value : '').trim().toLowerCase();
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var visible = true;
        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          visible = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          visible = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          visible = false;
        }
        card.style.display = visible ? '' : 'none';
      });
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function cardHtml(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card card">',
      '<a class="movie-poster" href="' + escapeAttr(item.url) + '" aria-label="观看' + escapeAttr(item.title) + '">',
      '<img src="' + escapeAttr(item.cover) + '" alt="' + escapeAttr(item.title) + '" loading="lazy">',
      '<span class="poster-gradient"></span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h3><a href="' + escapeAttr(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine || '') + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#096;');
  }

  function setupSearchPage() {
    var page = $('[data-search-page]');
    if (!page || !window.SEARCH_ITEMS) {
      return;
    }
    var input = $('[data-search-input]', page);
    var results = $('[data-search-results]', page);
    var title = $('[data-search-title]', page);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render(query) {
      var keyword = (query || '').trim().toLowerCase();
      if (!keyword) {
        title.textContent = '热门推荐';
        results.innerHTML = window.SEARCH_ITEMS.slice(0, 24).map(cardHtml).join('');
        return;
      }
      var matched = window.SEARCH_ITEMS.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.category, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 96);
      title.textContent = '搜索结果：' + matched.length + ' 部';
      results.innerHTML = matched.length ? matched.map(cardHtml).join('') : '<p class="empty-result">没有找到匹配内容</p>';
    }

    var form = $('.search-large', page);
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value : '';
        var url = new URL(window.location.href);
        if (value.trim()) {
          url.searchParams.set('q', value.trim());
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState(null, '', url.toString());
        render(value);
      });
    }
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(initial);
  }

  window.initMoviePlayer = function (videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var shell = video.closest('.video-shell');
    var hlsInstance = null;
    var prepared = false;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });
    video.addEventListener('ended', function () {
      if (shell) {
        shell.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
}());
