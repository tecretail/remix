(function () {
  var DURATION = 4200;
  var SHOW_AT = 3276;
  var SHOW_FOR = 800;

  function pgCourierDrive(track) {
    var road = track.querySelector('.pg-p-delivery-road');
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (!road || !courier) return;
    var travel = Math.max(0, road.clientWidth - courier.offsetWidth);
    courier.style.setProperty('--pg-cart-travel', travel + 'px');
  }

  function pgCourierHide(track) {
    track.classList.remove('is-show-tip');
    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel) {
      panel.classList.remove('is-visible');
    });
  }

  function pgCourierStop(track) {
    if (track._pgShowTimer) clearTimeout(track._pgShowTimer);
    if (track._pgHideTimer) clearTimeout(track._pgHideTimer);
    if (track._pgLoopTimer) clearInterval(track._pgLoopTimer);
    track._pgShowTimer = null;
    track._pgHideTimer = null;
    track._pgLoopTimer = null;
    pgCourierHide(track);
  }

  function pgCourierShowMessage(track, msgIndex) {
    if (track._pgShowTimer) clearTimeout(track._pgShowTimer);
    if (track._pgHideTimer) clearTimeout(track._pgHideTimer);
    pgCourierHide(track);

    track._pgShowTimer = setTimeout(function () {
      var panel = track.querySelector('[data-pg-msg-panel="' + msgIndex + '"]');
      if (!panel) return;
      panel.classList.add('is-visible');
      track.classList.add('is-show-tip');

      track._pgHideTimer = setTimeout(function () {
        pgCourierHide(track);
      }, SHOW_FOR);
    }, SHOW_AT);
  }

  function pgCourierStartTrack(track) {
    pgCourierStop(track);
    pgCourierDrive(track);

    var panels = track.querySelectorAll('[data-pg-msg-panel]');
    var count = panels.length || 1;
    var step = 0;

    function runStep() {
      var msgIndex = step % count;
      step += 1;
      pgCourierShowMessage(track, msgIndex);
    }

    runStep();
    track._pgLoopTimer = setInterval(runStep, DURATION);
  }

  function pgCourierInitAll() {
    document.querySelectorAll('[data-pg-delivery]').forEach(pgCourierStartTrack);
  }

  function pgCourierResize() {
    document.querySelectorAll('[data-pg-delivery]').forEach(pgCourierDrive);
  }

  if (!window.__pgCourierReady) {
    window.__pgCourierReady = true;
    window.addEventListener('resize', pgCourierResize);
    document.addEventListener('shopify:section:load', pgCourierInitAll);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', pgCourierInitAll);
    } else {
      pgCourierInitAll();
    }
  } else {
    pgCourierInitAll();
  }

  window.pgCourierInitAll = pgCourierInitAll;
})();
