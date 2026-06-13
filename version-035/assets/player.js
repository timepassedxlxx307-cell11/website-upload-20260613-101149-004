(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var video = document.querySelector("video[data-stream]");
    var layer = document.querySelector(".play-layer");
    var button = document.querySelector(".play-button");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var initialized = false;
    var hls = null;

    function loadStream() {
      if (initialized || !stream) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      loadStream();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (layer) {
      layer.addEventListener("click", play);
    }
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
