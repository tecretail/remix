(function () {
  var TRUCK_TRAVEL = 3276;
  var MSG_SHOW = 900;
  var MSG_GAP = 200;

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
    if (track._pgTimers) {
      track._pgTimers.forEach(clearTimeout);
      track._pgTimers = [];
    }
    pgCourierHide(track);
  }

  function pgCourierWait(track, ms) {
    return new Promise(function (resolve) {
      var id = setTimeout(resolve, ms);
      track._pgTimers.push(id);
    });
  }

  function pgCourierShowPanel(track, msgIndex) {
    pgCourierHide(track);
    var panel = track.querySelector('[data-pg-msg-panel="' + msgIndex + '"]');
    if (panel) panel.classList.add('is-visible');
    track.classList.add('is-show-tip');
  }

  async function pgCourierRunCycle(track) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    var panelCount = track.querySelectorAll('[data-pg-msg-panel]').length || 2;

    pgCourierHide(track);
    pgCourierRestartAnimation(courier);
    pgCourierDrive(track);

    await pgCourierWait(track, TRUCK_TRAVEL);

    for (var i = 0; i < panelCount; i += 1) {
      pgCourierShowPanel(track, i);
      await pgCourierWait(track, MSG_SHOW);
      if (i < panelCount - 1) {
        pgCourierHide(track);
        await pgCourierWait(track, MSG_GAP);
      }
    }

    pgCourierHide(track);
    await pgCourierWait(track, 200);
    pgCourierRunCycle(track);
  }

  function pgCourierStartTrack(track) {
    pgCourierStop(track);
    track._pgTimers = [];
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
