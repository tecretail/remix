(function () {
  var TRUCK_TRAVEL = 3276;
  var MSG_SHOW = 850;
  var FADE = 280;

  function pgCourierDrive(track) {
    var road = track.querySelector('.pg-p-delivery-road');
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (!road || !courier) return;
    var travel = Math.max(0, road.clientWidth - courier.offsetWidth);
    courier.style.setProperty('--pg-cart-travel', travel + 'px');
    courier.style.setProperty('--pg-courier-duration', TRUCK_TRAVEL + 'ms');
  }

  function pgCourierResetCourier(courier) {
    if (!courier) return;
    courier.classList.remove('is-running');
    courier.style.transform = 'translateX(0)';
    courier.style.opacity = '1';
  }

  function pgCourierStartRun(courier) {
    if (!courier) return;
    pgCourierResetCourier(courier);
    void courier.offsetWidth;
    courier.classList.add('is-running');
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
    pgCourierResetCourier(track.querySelector('.pg-p-delivery-courier'));
    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel) {
      panel.classList.remove('is-visible');
    });
  }

  function pgCourierShowTruck(track) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel) {
      panel.classList.remove('is-visible');
    });
    pgCourierResetCourier(courier);
    pgCourierDrive(track);
    track.classList.remove('is-phase-msg');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pgCourierStartRun(courier);
      });
    });
  }

  function pgCourierShowMessage(track, msgIndex) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    if (courier) courier.classList.remove('is-running');
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
    await pgCourierWait(track, TRUCK_TRAVEL);

    pgCourierShowMessage(track, 0);
    await pgCourierWait(track, FADE + MSG_SHOW);

    if (panelCount > 1) {
      pgCourierSwapMessage(track, 1);
      await pgCourierWait(track, FADE + MSG_SHOW);
    }

    track.querySelectorAll('.pg-p-delivery-message').forEach(function (panel) {
      panel.classList.remove('is-visible');
    });
    await pgCourierWait(track, FADE);
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
