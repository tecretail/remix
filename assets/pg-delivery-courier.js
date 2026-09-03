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
    var mobile = window.matchMedia('(max-width: 640px)').matches;
    overlay.querySelectorAll('div').forEach(function (el) {
      var cs = el.getAttribute('style') || '';
      if ((cs.indexOf('gap: 12px') !== -1 || cs.indexOf('gap:12px') !== -1) &&
          cs.indexOf('width: 52px') === -1 && cs.indexOf('width:52px') === -1 &&
          el.querySelector('img') && el.querySelector('button')) {
        el.style.setProperty('background', '#eef3fb', 'important');
        el.style.setProperty('background-color', '#eef3fb', 'important');
        el.style.setProperty('border', '2px solid #054497', 'important');
        el.style.setProperty('border-radius', mobile ? '12px' : '16px', 'important');
        el.style.setProperty('padding', mobile ? '10px' : '14px 16px', 'important');
        el.style.setProperty('box-shadow', '0 0 0 1px rgba(5, 68, 151, 0.12)', 'important');
        el.style.setProperty('max-width', '100%', 'important');
        el.style.setProperty('min-width', '0', 'important');
      }

      if (cs.indexOf('#F3F4F6') !== -1 && cs.indexOf('border-radius: 8px') !== -1 && cs.indexOf('padding') !== -1) {
        el.style.setProperty('background', '#f4f7fc', 'important');
        el.style.setProperty('background-color', '#f4f7fc', 'important');
        el.style.setProperty('border', 'none', 'important');
        el.style.setProperty('border-radius', mobile ? '10px' : '12px', 'important');
        el.style.setProperty('padding', mobile ? '12px 14px' : '16px 18px', 'important');
        el.style.setProperty('box-shadow', 'none', 'important');
        Array.prototype.forEach.call(el.children, function (row, idx) {
          var last = idx === el.children.length - 1;
          if (last) {
            row.style.setProperty('color', '#0b1a3a', 'important');
            row.style.setProperty('font-weight', '800', 'important');
            row.style.setProperty('border-top', '1px solid #e3e8f0', 'important');
            row.style.setProperty('margin-top', '8px', 'important');
            row.style.setProperty('padding-top', '12px', 'important');
          } else {
            row.style.setProperty('color', '#5e6d7a', 'important');
            row.style.setProperty('font-weight', '500', 'important');
          }
        });
      }

      if (cs.indexOf('#E5E7EB') !== -1 && el.querySelector('h3') && el.querySelector('.jaldi-field-row')) {
        el.style.setProperty('background', '#ffffff', 'important');
        el.style.setProperty('background-color', '#ffffff', 'important');
        el.style.setProperty('border', '1px solid #dce3ee', 'important');
        el.style.setProperty('border-radius', mobile ? '12px' : '14px', 'important');
        el.style.setProperty('padding', mobile ? '14px 12px 10px' : '18px 16px 12px', 'important');
        el.style.setProperty('box-shadow', '0 1px 3px rgba(11, 26, 58, 0.05)', 'important');
      }
    });

    overlay.querySelectorAll('h3').forEach(function (h) {
      h.style.setProperty('color', '#0b1a3a', 'important');
      h.style.setProperty('font-weight', '800', 'important');
      h.style.setProperty('font-size', mobile ? '13px' : '14px', 'important');
      h.style.setProperty('letter-spacing', mobile ? '0.04em' : '0.08em', 'important');
      h.style.setProperty('text-transform', 'uppercase', 'important');
      h.style.setProperty('text-align', 'center', 'important');
      h.style.setProperty('margin-bottom', mobile ? '12px' : '18px', 'important');
    });

    if (mobile) {
      overlay.querySelectorAll('.jaldi-field-label').forEach(function (lab) {
        lab.style.setProperty('width', '100%', 'important');
        lab.style.setProperty('min-width', '0', 'important');
        lab.style.setProperty('max-width', '100%', 'important');
      });
      overlay.querySelectorAll('.jaldi-field-row').forEach(function (row) {
        row.style.setProperty('flex-direction', 'column', 'important');
        row.style.setProperty('align-items', 'stretch', 'important');
      });
    }
  }

  if (!window.__pgCodRowWatch) {
    window.__pgCodRowWatch = true;
    var pgCodRowTimer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(pgCodRowTimer);
      pgCodRowTimer = setTimeout(pgStyleCodProductRows, 50);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', function () {
      clearTimeout(pgCodRowTimer);
      pgCodRowTimer = setTimeout(pgStyleCodProductRows, 80);
    });
    document.addEventListener('click', function () {
      setTimeout(pgStyleCodProductRows, 80);
      setTimeout(pgStyleCodProductRows, 280);
    });
  }
})();
