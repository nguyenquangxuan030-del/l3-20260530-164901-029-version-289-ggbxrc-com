(function() {
  var currentScript = document.currentScript;
  var hlsUrl = currentScript && currentScript.src ? new URL("hls.js", currentScript.src).href : "";
  var hlsPromise = null;

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = (hlsUrl ? import(hlsUrl).then(function(mod) {
        return mod.H || mod.default || window.Hls || null;
      }).catch(function() {
        return null;
      }) : Promise.resolve(null)).then(function(localHls) {
        if (localHls) {
          return localHls;
        }

        if (window.Hls) {
          return window.Hls;
        }

        return new Promise(function(resolve) {
          var script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
          script.onload = function() {
            resolve(window.Hls || null);
          };
          script.onerror = function() {
            resolve(null);
          };
          document.head.appendChild(script);
        });
      });
    }

    return hlsPromise;
  }

  ready(function() {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-button]");
    var source = typeof currentVideoSource !== "undefined" ? currentVideoSource : "";
    var attached = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function attach() {
      if (attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }

      return getHls().then(function(Hls) {
        if (Hls && Hls.isSupported && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = source;
      });
    }

    function start() {
      hideOverlay();
      attach().then(function() {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function() {});
        }
      });
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("click", function() {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener("pagehide", function() {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
})();
