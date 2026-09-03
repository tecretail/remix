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
    courier.style.animation = 'none';
    courier.style.transform = 'translateX(0)';
    courier.style.opacity = '1';
  }

  function pgCourierStartRun(courier) {
    if (!courier) return;
    courier.classList.remove('is-running');
    courier.style.animation = 'none';
    courier.style.transform = 'translateX(0)';
    courier.style.opacity = '1';
    void courier.offsetWidth;
    courier.style.removeProperty('animation');
    courier.style.removeProperty('transform');
    courier.style.removeProperty('opacity');
    courier.classList.add('is-running');
  }

  function pgCourierWait(track, ms) {
    return new Promise(function (resolve) {
      var id = setTimeout(resolve, ms);
      if (!track._pgTimers) track._pgTimers = [];
      track._pgTimers.push(id);
    });
  }

  function pgCourierWaitForTruck(track) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    return new Promise(function (resolve) {
      if (!courier) {
        resolve();
        return;
      }
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        courier.removeEventListener('animationend', onEnd);
        resolve();
      }
      function onEnd(e) {
        if (e.target !== courier) return;
        finish();
      }
      courier.addEventListener('animationend', onEnd);
      track._pgTimers.push(setTimeout(finish, TRUCK_TRAVEL + 150));
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
    if (courier) {
      courier.style.removeProperty('transform');
      courier.style.removeProperty('opacity');
      courier.style.removeProperty('animation');
    }
    track.classList.remove('is-phase-msg');
    requestAnimationFrame(function () {
      pgCourierStartRun(courier);
    });
  }

  function pgCourierShowMessage(track, msgIndex) {
    var courier = track.querySelector('.pg-p-delivery-courier');
    track.classList.add('is-phase-msg');
    if (courier) courier.classList.remove('is-running');
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
    if (!track._pgTimers) track._pgTimers = [];
    var panelCount = track.querySelectorAll('[data-pg-msg-panel]').length || 2;

    pgCourierShowTruck(track);
    await pgCourierWaitForTruck(track);

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

    var courier = track.querySelector('.pg-p-delivery-courier');
    pgCourierResetCourier(courier);
    pgCourierDrive(track);
    if (courier) {
      courier.style.removeProperty('transform');
      courier.style.removeProperty('opacity');
      courier.style.removeProperty('animation');
    }

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

  function pgStyleCodProductRows() {
    var overlay = document.querySelector('.jaldi-modal-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('div').forEach(function (el) {
      var cs = el.getAttribute('style') || '';
      if (cs.indexOf('gap: 12px') === -1 && cs.indexOf('gap:12px') === -1) return;
      if (cs.indexOf('width: 52px') !== -1 || cs.indexOf('width:52px') !== -1) return;
      if (el.querySelector('img') && el.querySelector('button')) {
        el.style.setProperty('background', 'linear-gradient(180deg, #ffffff 0%, #f3f8ff 55%, #e8f1fc 100%)', 'important');
        el.style.setProperty('background-color', '#eef4fc', 'important');
        el.style.setProperty('border', '1px solid rgba(5, 68, 151, 0.18)', 'important');
        el.style.setProperty('border-radius', '14px', 'important');
        el.style.setProperty('padding', '12px 14px', 'important');
        el.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,0.95), 0 6px 16px rgba(5, 68, 151, 0.1)', 'important');
      }
    });
  }

  if (!window.__pgCodRowWatch) {
    window.__pgCodRowWatch = true;
    var pgCodRowTimer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(pgCodRowTimer);
      pgCodRowTimer = setTimeout(pgStyleCodProductRows, 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', function () {
      setTimeout(pgStyleCodProductRows, 80);
      setTimeout(pgStyleCodProductRows, 280);
    });
  }
})();
