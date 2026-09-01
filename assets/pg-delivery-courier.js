(function () {
  var SHOW_AT = 3276;
  var SHOW_FOR = 700;

  function pgCourierDrive(track) {
    var road = track.querySelector('.pg-p-delivery-road');
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (!road || !courier) return;
    var travel = Math.max(0, road.clientWidth - courier.offsetWidth);
    courier.style.setProperty('--pg-cart-travel', travel + 'px');
  }

  function pgCourierClearTimers(track) {
    if (track._pgShowTimer) clearTimeout(track._pgShowTimer);
    if (track._pgHideTimer) clearTimeout(track._pgHideTimer);
    track._pgShowTimer = null;
    track._pgHideTimer = null;
  }

  function pgCourierHide(track) {
    track.classList.remove('is-show-tip');
    track.querySelectorAll('[data-pg-msg-panel]').forEach(function (panel) {
      panel.hidden = true;
    });
  }

  function pgCourierStop(track) {
    pgCourierClearTimers(track);
    pgCourierHide(track);
  }

  function pgCourierShow(track, msgIndex) {
    pgCourierClearTimers(track);
    pgCourierHide(track);
    track.setAttribute('data-pg-msg', String(msgIndex));

    track._pgShowTimer = setTimeout(function () {
      var panel = track.querySelector('[data-pg-msg-panel="' + msgIndex + '"]');
      if (panel) panel.hidden = false;
      track.classList.add('is-show-tip');

      track._pgHideTimer = setTimeout(function () {
        pgCourierHide(track);
      }, SHOW_FOR);
    }, SHOW_AT);
  }

  function pgCourierBindTrack(track) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (!courier) return;

    pgCourierDrive(track);

    if (courier.dataset.pgBound === '1') return;
    courier.dataset.pgBound = '1';

    var panels = track.querySelectorAll('[data-pg-msg-panel]');
    var count = panels.length || 1;
    track._pgMsgIndex = 0;

    function runNextInOrder() {
      var msgIndex = track._pgMsgIndex % count;
      track._pgMsgIndex = msgIndex + 1;
      pgCourierShow(track, msgIndex);
    }

    courier.addEventListener('animationiteration', runNextInOrder);
    runNextInOrder();
  }

  function pgCourierInitTrack(track) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (courier) courier.dataset.pgBound = '0';
    pgCourierStop(track);
    track._pgMsgIndex = 0;
    track.setAttribute('data-pg-msg', '0');
    pgCourierBindTrack(track);
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
