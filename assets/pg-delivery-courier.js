(function () {
  var DURATION = 4200;
  var SHOW_AT = 3276;
  var SHOW_FOR = 700;

  function pgCourierDrive(track) {
    var road = track.querySelector('.pg-p-delivery-road');
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (!road || !courier) return;
    var travel = Math.max(0, road.clientWidth - courier.offsetWidth);
    courier.style.setProperty('--pg-cart-travel', travel + 'px');
  }

  function pgCourierHide(track) {
    track.classList.remove('is-show-tip');
    track.querySelectorAll('[data-pg-msg-panel]').forEach(function (panel) {
      panel.hidden = true;
    });
  }

  function pgCourierStop(track) {
    if (track._pgCourierTimers) {
      track._pgCourierTimers.forEach(clearTimeout);
      track._pgCourierTimers = [];
    }
    pgCourierHide(track);
  }

  function pgCourierCycle(track) {
    var panels = track.querySelectorAll('[data-pg-msg-panel]');
    var count = panels.length || 1;
    if (typeof track._pgMsgIndex !== 'number') track._pgMsgIndex = 0;

    var msgIndex = track._pgMsgIndex % count;
    track._pgMsgIndex = msgIndex + 1;
    track.setAttribute('data-pg-msg', String(msgIndex));
    track._pgCourierTimers = track._pgCourierTimers || [];

    track._pgCourierTimers.push(
      setTimeout(function () {
        var panel = track.querySelector('[data-pg-msg-panel="' + msgIndex + '"]');
        if (panel) panel.hidden = false;
        track.classList.add('is-show-tip');

        track._pgCourierTimers.push(
          setTimeout(function () {
            pgCourierHide(track);
            track._pgCourierTimers.push(
              setTimeout(function () {
                pgCourierCycle(track);
              }, Math.max(0, DURATION - SHOW_AT - SHOW_FOR))
            );
          }, SHOW_FOR)
        );
      }, SHOW_AT)
    );
  }

  function pgCourierInitTrack(track) {
    pgCourierStop(track);
    track._pgMsgIndex = 0;
    pgCourierDrive(track);
    pgCourierCycle(track);
  }

  function pgCourierInitAll() {
    document.querySelectorAll('[data-pg-delivery]').forEach(pgCourierInitTrack);
  }

  function pgCourierResize() {
    document.querySelectorAll('[data-pg-delivery]').forEach(pgCourierDrive);
  }

  if (!window.__pgCourierBound) {
    window.__pgCourierBound = true;
    window.addEventListener('resize', pgCourierResize);
    document.addEventListener('shopify:section:load', pgCourierInitAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pgCourierInitAll);
  } else {
    pgCourierInitAll();
  }

  window.pgCourierInitAll = pgCourierInitAll;
})();
