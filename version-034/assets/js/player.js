(function () {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('.player-cover');

  if (!video) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var prepared = false;
  var hls = null;

  function prepare(callback) {
    if (prepared) {
      callback();
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      callback();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, callback);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal && hls) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });
      return;
    }

    video.src = stream;
    callback();
  }

  function play() {
    if (cover) {
      cover.classList.add('is-hidden');
    }

    prepare(function () {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    });
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!prepared) {
      play();
    }
  });
})();
