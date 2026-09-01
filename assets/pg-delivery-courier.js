(function () {
  var TRUCK_TRAVEL = 3000;
  var MSG_SHOW = 850;
  var FADE = 280;

  function pgCourierDrive(track) {
    var road = track.querySelector('.pg-p-delivery-road');
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (!road || !courier) return;
    var travel = Math.max(0, road.clientWidth - courier.offsetWidth);
    courier.style.setProperty('--pg-cart-travel', travel + 'px');
  }

  function pgCourierWait(track, ms) {
    return new Promise(function (resolve) {
      var id = setTimeout(resolve, ms);
      if (!track._pgTimers) track._pgTimers = [];
      track._pgTimers.push(id);
    });
  }

  function pgCourierStop(track) {
    if (track._pgTimers) {
      track._pgTimers.forEach(clearTimeout);
      track._pgTimers = [];
    }
    track.classList.remove('is-phase-msg');
    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel) {
      panel.classList.remove('is-visible');
    });
  }

  function pgCourierShowTruck(track) {
    track.classList.remove('is-phase-msg');
    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel) {
      panel.classList.remove('is-visible');
    });
  }

  function pgCourierShowMessage(track, msgIndex) {
    track.classList.add('is-phase-msg');
    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel, i) {
      panel.classList.toggle('is-visible', i === msgIndex);
    });
  }

  function pgCourierSwapMessage(track, msgIndex) {
    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel, i) {
      panel.classList.toggle('is-visible', i === msgIndex);
    });
  }

  async function pgCourierRunCycle(track) {
    var panelCount = track.querySelectorAll('[data-pg-msg-panel]').length || 2;

    pgCourierShowTruck(track);
    pgCourierDrive(track);
    await pgCourierWait(track, TRUCK_TRAVEL);

    pgCourierShowMessage(track, 0);
    await pgCourierWait(track, FADE + MSG_SHOW);

    if (panelCount > 1) {
      pgCourierSwapMessage(track, 1);
      await pgCourierWait(track, FADE + MSG_SHOW);
    }

    pgCourierShowTruck(track);
    await pgCourierWait(track, FADE + 150);
    pgCourierRunCycle(track);
  }

  function pgCourierStartTrack(track) {
    pgCourierStop(track);
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
