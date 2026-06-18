(function () {
  function bind(videoId, triggerId, source) {
    var video = document.getElementById(videoId);
    var trigger = document.getElementById(triggerId);
    var started = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function loadSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function start() {
      loadSource();

      if (trigger) {
        trigger.classList.add("is-hidden");
      }

      video.controls = true;

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.FilmPlayer = {
    bind: bind
  };
})();
