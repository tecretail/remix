(function () {
  var TRUCK_TRAVEL = 3276;
  var MSG_SHOW = 800;

  function pgCourierDrive(track) {
    var road = track.querySelector('.pg-p-delivery-road');
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (!road || !courier) return;
    var travel = Math.max(0, road.clientWidth - courier.offsetWidth);
    courier.style.setProperty('--pg-cart-travel', travel + 'px');
  }

  function pgCourierRestartAnimation(courier) {
    if (!courier) return;
    courier.style.animation = 'none';
    void courier.offsetWidth;
    courier.style.removeProperty('animation');
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
    if (track._pgCycleTimer) clearTimeout(track._pgCycleTimer);
    track._pgShowTimer = null;
    track._pgHideTimer = null;
    track._pgCycleTimer = null;
    pgCourierHide(track);
  }

  function pgCourierRunCycle(track) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    var panels = track.querySelectorAll('[data-pg-msg-panel]');
    var count = panels.length || 2;
    var msgIndex = track._pgMsgStep % count;
    track._pgMsgStep += 1;

    pgCourierHide(track);
    pgCourierRestartAnimation(courier);
    pgCourierDrive(track);

    track._pgShowTimer = setTimeout(function () {
      var panel = track.querySelector('[data-pg-msg-panel="' + msgIndex + '"]');
      if (panel) panel.classList.add('is-visible');
      track.classList.add('is-show-tip');

      track._pgHideTimer = setTimeout(function () {
        pgCourierHide(track);
        track._pgCycleTimer = setTimeout(function () {
          pgCourierRunCycle(track);
        }, 120);
      }, MSG_SHOW);
    }, TRUCK_TRAVEL);
  }

  function pgCourierStartTrack(track) {
    pgCourierStop(track);
    track._pgMsgStep = 0;
    pgCourierRunCycle(track);
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
