(function () {
  var root = window.SITE_ROOT || './';

  function withRoot(path) {
    if (!path) {
      return root;
    }
    if (/^(https?:)?\/\//.test(path) || path.charAt(0) === '#') {
      return path;
    }
    return root + path.replace(/^\.\//, '');
  }

  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var navButton = qs('[data-nav-toggle]');
  var mobilePanel = qs('[data-mobile-panel]');

  if (navButton && mobilePanel) {
    navButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[name="q"]', form);
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = withRoot('search.html?q=' + encodeURIComponent(input.value.trim()));
    });
  });

  var slides = qsa('[data-hero-slide]');
  var dots = qsa('[data-hero-dot]');
  var currentSlide = 0;
  var heroTimer;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function autoHero() {
    if (slides.length <= 1) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  qsa('[data-hero-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      autoHero();
    });
  });

  qsa('[data-hero-prev]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      autoHero();
    });
  });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      autoHero();
    });
  });

  showSlide(0);
  autoHero();

  function initSearchPage() {
    var list = qs('[data-search-results]');
    if (!list || !window.MOVIES) {
      return;
    }

    var keywordInput = qs('[data-filter-keyword]');
    var typeSelect = qs('[data-filter-type]');
    var yearSelect = qs('[data-filter-year]');
    var countBox = qs('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (keywordInput) {
      keywordInput.value = initialKeyword;
    }

    function unique(values) {
      var map = {};
      values.forEach(function (value) {
        if (value !== undefined && value !== null && String(value).trim()) {
          map[String(value)] = true;
        }
      });
      return Object.keys(map).sort();
    }

    if (typeSelect) {
      unique(window.MOVIES.map(function (movie) { return movie.type; })).forEach(function (type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }

    if (yearSelect) {
      unique(window.MOVIES.map(function (movie) { return movie.year; })).reverse().forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        yearSelect.appendChild(option);
      });
    }

    function makeCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + tag + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
        '  <a class="poster-link" href="' + withRoot(movie.url) + '">' +
        '    <img src="' + withRoot(movie.cover) + '" alt="' + movie.title + '" loading="lazy">' +
        '    <span class="score">' + movie.score + '</span>' +
        '  </a>' +
        '  <div class="movie-card-body">' +
        '    <h3><a href="' + withRoot(movie.url) + '">' + movie.title + '</a></h3>' +
        '    <p class="meta-line">' + movie.region + ' · ' + movie.type + ' · ' + movie.year + '</p>' +
        '    <p class="desc line-clamp-2">' + movie.oneLine + '</p>' +
        '    <div class="tag-row">' + tags + '</div>' +
        '  </div>' +
        '</article>';
    }

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      var results = window.MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        var keywordOk = !keyword || haystack.indexOf(keyword) >= 0;
        var typeOk = !type || movie.type === type;
        var yearOk = !year || String(movie.year) === String(year);
        return keywordOk && typeOk && yearOk;
      });

      if (countBox) {
        countBox.textContent = '共找到 ' + results.length + ' 部影片';
      }

      if (!results.length) {
        list.innerHTML = '<div class="empty-state">没有找到匹配影片，请换一个关键词或筛选条件。</div>';
        return;
      }

      list.innerHTML = results.slice(0, 240).map(makeCard).join('');
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (node) {
      if (node) {
        node.addEventListener('input', applyFilters);
        node.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function initPlayer() {
    var video = qs('[data-video-player]');
    var playButton = qs('[data-play-button]');
    var overlay = qs('[data-play-overlay]');
    var status = qs('[data-player-status]');

    if (!video || !playButton) {
      return;
    }

    var source = video.getAttribute('data-video-url');
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function startPlayback() {
      if (!source) {
        setStatus('当前影片未配置播放源。');
        return;
      }

      if (overlay) {
        overlay.classList.add('hidden');
      }

      setStatus('正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().then(function () {
          setStatus('正在播放');
        }).catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setStatus('正在播放');
            }).catch(function () {
              setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请刷新页面后重试。');
            }
          });
        } else {
          video.play();
        }
        return;
      }

      video.src = source;
      video.play().catch(function () {
        setStatus('当前浏览器不支持 HLS 播放，请更换浏览器或使用支持 HLS 的环境。');
      });
    }

    playButton.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      setStatus('正在播放');
    });
    video.addEventListener('pause', function () {
      setStatus('已暂停');
    });
  }

  initSearchPage();
  initPlayer();
})();
