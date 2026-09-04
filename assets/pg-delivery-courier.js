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

  function pgLockCodOverlay(overlay) {
    var mobile = window.matchMedia('(max-width: 900px)').matches;
    overlay.style.setProperty('left', '0', 'important');
    overlay.style.setProperty('right', '0', 'important');
    overlay.style.setProperty('top', '0', 'important');
    overlay.style.setProperty('bottom', '0', 'important');
    overlay.style.setProperty('width', '100%', 'important');
    overlay.style.setProperty('max-width', '100%', 'important');
    overlay.style.setProperty('height', '100%', 'important');
    overlay.style.setProperty('max-height', 'none', 'important');
    overlay.style.setProperty('box-sizing', 'border-box', 'important');
    overlay.style.setProperty('padding', mobile ? '16px' : '16px', 'important');
    overlay.style.setProperty('overflow', 'hidden', 'important');
    overlay.style.setProperty('transform', 'none', 'important');
    overlay.style.setProperty('align-items', 'center', 'important');
    overlay.style.setProperty('justify-content', 'center', 'important');
    var box = overlay.firstElementChild;
    if (box) {
      box.style.setProperty('width', '100%', 'important');
      box.style.setProperty('max-width', mobile ? '420px' : '520px', 'important');
      box.style.setProperty('margin', '0 auto', 'important');
      box.style.setProperty('box-sizing', 'border-box', 'important');
      box.style.setProperty('transform', 'none', 'important');
      box.style.setProperty('border-radius', '16px', 'important');
      box.style.setProperty('height', 'auto', 'important');
      box.style.setProperty('max-height', mobile ? '90dvh' : '92vh', 'important');
    }
    overlay.querySelectorAll('button').forEach(function (btn) {
      var st = btn.getAttribute('style') || '';
      var txt = (btn.textContent || '').trim();
      var inProductRow = !!(btn.closest('[style*="gap: 12px"], [style*="gap:12px"]') &&
        btn.closest('[style*="gap: 12px"], [style*="gap:12px"]').querySelector('img'));
      var isRound = st.indexOf('border-radius: 50%') !== -1 || st.indexOf('border-radius:50%') !== -1 ||
        txt === '\u00d7' || txt === '×' || txt.toLowerCase() === 'x';
      var isRemove = isRound && inProductRow;
      var isClose = isRound && !inProductRow;
      var isCta = btn.classList.contains('jaldi-button-pulse') ||
        btn.classList.contains('jaldi-button-bounce') ||
        btn.classList.contains('jaldi-button-shake') ||
        btn.type === 'submit' ||
        /hacer\s*pedido/i.test(txt);
      var isAccordion = !isCta && !isRemove && !isClose &&
        (st.indexOf('width: 100%') !== -1 || st.indexOf('width:100%') !== -1) &&
        (st.indexOf('display: flex') !== -1 || st.indexOf('display:flex') !== -1);

      if (isClose) {
        btn.style.setProperty('width', '28px', 'important');
        btn.style.setProperty('height', '28px', 'important');
        btn.style.setProperty('min-width', '28px', 'important');
        btn.style.setProperty('min-height', '28px', 'important');
        btn.style.setProperty('max-width', '28px', 'important');
        btn.style.setProperty('padding', '0', 'important');
        btn.style.setProperty('border-radius', '50%', 'important');
        btn.style.setProperty('background', '#054497', 'important');
        btn.style.setProperty('color', '#fff', 'important');
        btn.style.setProperty('border', '2px solid #ffffff', 'important');
        btn.style.setProperty('outline', 'none', 'important');
        btn.style.setProperty('box-shadow', '0 2px 8px rgba(5,68,151,0.25)', 'important');
        btn.style.setProperty('animation', 'none', 'important');
        btn.style.setProperty('transform', 'none', 'important');
        btn.style.setProperty('position', 'absolute', 'important');
        btn.style.setProperty('top', '12px', 'important');
        btn.style.setProperty('right', '12px', 'important');
        btn.style.setProperty('z-index', '5', 'important');
        btn.style.setProperty('display', 'inline-flex', 'important');
        btn.style.setProperty('align-items', 'center', 'important');
        btn.style.setProperty('justify-content', 'center', 'important');
        return;
      }

      if (isRemove) {
        btn.style.setProperty('width', '22px', 'important');
        btn.style.setProperty('height', '22px', 'important');
        btn.style.setProperty('min-width', '22px', 'important');
        btn.style.setProperty('min-height', '22px', 'important');
        btn.style.setProperty('max-width', '22px', 'important');
        btn.style.setProperty('padding', '0', 'important');
        btn.style.setProperty('border-radius', '50%', 'important');
        btn.style.setProperty('background', '#6b7280', 'important');
        btn.style.setProperty('color', '#fff', 'important');
        btn.style.setProperty('border', '2px solid #fff', 'important');
        btn.style.setProperty('outline', 'none', 'important');
        btn.style.setProperty('box-shadow', '0 1px 4px rgba(0,0,0,0.2)', 'important');
        btn.style.setProperty('animation', 'none', 'important');
        btn.style.setProperty('transform', 'none', 'important');
        btn.style.setProperty('position', 'absolute', 'important');
        btn.style.setProperty('top', '-4px', 'important');
        btn.style.setProperty('right', '-4px', 'important');
        btn.style.setProperty('z-index', '3', 'important');
        return;
      }

      if (isAccordion) {
        btn.style.setProperty('animation', 'none', 'important');
        btn.style.setProperty('transform', 'none', 'important');
        btn.style.setProperty('outline', 'none', 'important');
        btn.style.setProperty('box-shadow', 'none', 'important');
        btn.style.setProperty('background', '#eef3fb', 'important');
        btn.style.setProperty('background-color', '#eef3fb', 'important');
        btn.style.setProperty('border', '1px solid #c5d4ea', 'important');
        btn.style.setProperty('border-radius', '12px', 'important');
        btn.style.setProperty('color', '#0b1a3a', 'important');
        btn.style.setProperty('width', '100%', 'important');
        return;
      }
      if (isCta) {
        btn.style.setProperty('animation', 'none', 'important');
        btn.style.setProperty('transform', 'none', 'important');
        btn.style.setProperty('outline', 'none', 'important');
        btn.style.setProperty('background', 'linear-gradient(180deg, #ffffff 0%, #edfff1 45%, #d8f9de 100%)', 'important');
        btn.style.setProperty('background-color', '#edfff1', 'important');
        btn.style.setProperty('color', '#158a2e', 'important');
        btn.style.setProperty('border', '3px solid #39e85a', 'important');
        btn.style.setProperty('border-radius', '14px', 'important');
        btn.style.setProperty('box-shadow', 'inset 0 1px 0 rgba(255,255,255,0.95), 0 0 0 3px rgba(57,232,90,0.22), 0 4px 14px rgba(5,68,151,0.1)', 'important');
        btn.style.setProperty('font-weight', '900', 'important');
        btn.style.setProperty('text-transform', 'uppercase', 'important');
      }
    });
    overlay.querySelectorAll('input, select, textarea').forEach(function (inp) {
      if (inp.type === 'checkbox') return;
      inp.style.setProperty('font-size', '16px', 'important');
    });
  }

  function pgStyleCodProductRows() {
    var overlay = document.querySelector('.jaldi-modal-overlay');
    if (!overlay) return;
    pgLockCodOverlay(overlay);
    var mobile = window.matchMedia('(max-width: 900px)').matches;
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
        el.style.setProperty('position', 'relative', 'important');
        el.style.setProperty('overflow', 'visible', 'important');
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('box-sizing', 'border-box', 'important');
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
      h.style.setProperty('color', '#054497', 'important');
      h.style.setProperty('font-weight', '800', 'important');
      h.style.setProperty('font-size', mobile ? '13px' : '14px', 'important');
      h.style.setProperty('letter-spacing', mobile ? '0.05em' : '0.08em', 'important');
      h.style.setProperty('text-transform', 'uppercase', 'important');
      h.style.setProperty('text-align', 'center', 'important');
      h.style.setProperty('margin', mobile ? '6px 8px 12px' : '8px 12px 16px', 'important');
      h.style.setProperty('padding', mobile ? '11px 36px 11px 14px' : '12px 40px 12px 16px', 'important');
      h.style.setProperty('background', '#eef3fb', 'important');
      h.style.setProperty('background-color', '#eef3fb', 'important');
      h.style.setProperty('border', '1px solid #c5d4ea', 'important');
      h.style.setProperty('border-radius', '10px', 'important');
      h.style.setProperty('box-shadow', 'none', 'important');
      h.style.setProperty('line-height', '1.35', 'important');
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
      pgCodRowTimer = setTimeout(pgStyleCodProductRows, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.pg-preventify-host, .jaldi-modal-overlay, [class*="preventify"]')) return;
      setTimeout(pgStyleCodProductRows, 80);
    });
    if (!document.getElementById('pg-cod-anim-kill')) {
      var st = document.createElement('style');
      st.id = 'pg-cod-anim-kill';
      st.textContent = [
        '.jaldi-modal-overlay .jaldi-button-pulse,',
        '.jaldi-modal-overlay .jaldi-button-bounce,',
        '.jaldi-modal-overlay .jaldi-button-shake,',
        '.jaldi-modal-overlay button{animation:none!important;transform:none!important}',
        '@keyframes pg-cod-neon-pulse{',
        '0%,100%{box-shadow:0 0 0 3px rgba(57,232,90,.28),0 0 12px rgba(57,255,120,.4),0 4px 14px rgba(5,68,151,.1);border-color:#39e85a}',
        '50%{box-shadow:0 0 0 6px rgba(57,232,90,.5),0 0 28px rgba(57,255,120,.85),0 8px 20px rgba(47,158,68,.28);border-color:#7dff95}',
        '}',
        '.pg-cod-bounce-wrap{',
        'display:block!important;width:100%!important;max-width:100%!important;',
        'position:relative!important;isolation:isolate!important;z-index:0!important;',
        'overflow:hidden!important;padding:3px!important;margin:10px 0 8px!important;',
        'border-radius:18px!important;background:#39e85a!important;box-sizing:border-box!important;',
        'box-shadow:0 0 16px rgba(57,232,90,.35),0 0 28px rgba(5,68,151,.18)!important;',
        'will-change:transform!important;',
        '}',
        '.pg-cod-bounce-wrap::before{',
        'content:""!important;position:absolute!important;top:50%!important;left:50%!important;',
        'width:260%!important;height:260%!important;z-index:0!important;pointer-events:none!important;',
        'background:conic-gradient(#39e85a,#7dff95,#054497,#2bb8ff,#39e85a,#f39200,#7dff95,#054497,#39e85a)!important;',
        'transform:translate(-50%,-50%) rotate(0deg);',
        'animation:pg-deal-spin-rotate 2.2s linear infinite!important;will-change:transform!important;',
        '}',
        '@keyframes pg-deal-spin-rotate{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}',
        '.pg-preventify-host,.pg-preventify-host .quick-add{overflow:visible!important}',
        '.pg-cod-bounce-wrap > button,',
        '.pg-cod-bounce-wrap > [role="button"]{',
        'position:relative!important;z-index:1!important;border:none!important;outline:none!important;',
        'animation:pg-cod-neon-pulse 1.2s ease-in-out infinite!important;',
        'width:100%!important;border-radius:15px!important',
        '}'
      ].join('');
      document.head.appendChild(st);
    }

    function pgFindCodButtons() {
      var list = [];
      var seen = {};
      function add(el) {
        if (!el || seen[el]) return;
        if (el.closest && el.closest('.jaldi-modal-overlay')) return;
        seen[el] = 1;
        list.push(el);
      }
      document.querySelectorAll('.pg-preventify-host button, .pg-preventify-host [role="button"]').forEach(add);
      document.querySelectorAll('button.jaldi-button-pulse, button.jaldi-button-bounce, button.jaldi-button-shake').forEach(add);
      document.querySelectorAll('button, [role="button"]').forEach(function (el) {
        var t = (el.textContent || '').replace(/\s+/g, ' ').toUpperCase();
        if (t.indexOf('REALIZA TU PEDIDO') !== -1 || t.indexOf('HACER PEDIDO') !== -1) add(el);
      });
      return list;
    }

    function pgEnsureBounceWrap(btn) {
      if (btn.parentElement && btn.parentElement.classList.contains('pg-cod-bounce-wrap')) {
        return btn.parentElement;
      }
      var wrap = document.createElement('div');
      wrap.className = 'pg-cod-bounce-wrap';
      wrap.setAttribute('data-pg-cod-bounce', '1');
      if (btn.parentNode) {
        btn.parentNode.insertBefore(wrap, btn);
        wrap.appendChild(btn);
      }
      return wrap;
    }

    function pgAnimateCodButton() {
      var btns = pgFindCodButtons();
      btns.forEach(function (btn) {
        var wrap = pgEnsureBounceWrap(btn);
        wrap.style.setProperty('display', 'block', 'important');
        wrap.style.setProperty('overflow', 'hidden', 'important');
        wrap.style.setProperty('width', '100%', 'important');
        wrap.style.setProperty('padding', '3px', 'important');
        wrap.style.setProperty('border-radius', '18px', 'important');
        wrap.style.setProperty('position', 'relative', 'important');
        wrap.style.setProperty('will-change', 'transform', 'important');
        btn.style.setProperty('animation', 'pg-cod-neon-pulse 1.2s ease-in-out infinite', 'important');
        btn.style.setProperty('width', '100%', 'important');
        btn.style.setProperty('position', 'relative', 'important');
        btn.style.setProperty('z-index', '1', 'important');
        btn.style.setProperty('border', 'none', 'important');
        btn.style.setProperty('border-radius', '15px', 'important');
      });
      document.querySelectorAll('.pg-preventify-host, .pg-preventify-host .quick-add').forEach(function (host) {
        host.style.setProperty('overflow', 'visible', 'important');
      });
    }

    /* Movimiento suave continuo (sin cortes) */
    if (!window.__pgCodRafBounce) {
      window.__pgCodRafBounce = true;
      var pgCodT0 = performance.now();
      function pgCodRafTick(now) {
        /* Ciclo largo y fluido: sube y baja con ease, sin pausas secas */
        var period = 1200;
        var t = ((now - pgCodT0) % period) / period;
        /* seno más marcado: movimiento llamativo pero suave */
        var wave = Math.sin(t * Math.PI * 2);
        var wave2 = Math.sin(t * Math.PI * 4);
        var y = wave * -11 - wave2 * 2.2;
        document.querySelectorAll('.pg-cod-bounce-wrap').forEach(function (wrap) {
          wrap.style.setProperty('transform', 'translate3d(0,' + y.toFixed(2) + 'px,0)', 'important');
          wrap.style.setProperty('transition', 'none', 'important');
        });
        requestAnimationFrame(pgCodRafTick);
      }
      requestAnimationFrame(pgCodRafTick);
    }

    pgAnimateCodButton();
    setTimeout(pgAnimateCodButton, 500);
    setTimeout(pgAnimateCodButton, 1500);
    setTimeout(pgAnimateCodButton, 3000);
    setInterval(pgAnimateCodButton, 2500);
  }

  /* Desktop: imagen izquierda fija; solo el buybox derecho se mueve con el scroll */
  function pgInitStickyGallery() {
    var gallery = document.querySelector('.pg-p-gallery[data-pg-gallery]') || document.querySelector('.pg-p-gallery');
    var col = document.querySelector('.pg-p-col-gallery');
    var main = document.querySelector('.pg-p-main');
    if (!gallery || !col || !main) return;
    if (gallery.getAttribute('data-pg-sticky-bound') === '1') {
      window.dispatchEvent(new Event('scroll'));
      return;
    }
    gallery.setAttribute('data-pg-sticky-bound', '1');

    var TOP = 20;
    var ticking = false;

    function resetGallery() {
      gallery.style.removeProperty('transform');
      gallery.style.removeProperty('will-change');
      gallery.style.removeProperty('position');
      gallery.style.removeProperty('top');
      gallery.style.removeProperty('bottom');
      gallery.style.removeProperty('left');
      gallery.style.removeProperty('width');
      gallery.style.removeProperty('z-index');
      gallery.classList.remove('is-pg-pinned');
    }

    function update() {
      ticking = false;
      if (window.innerWidth < 901) {
        resetGallery();
        return;
      }

      var galH = gallery.offsetHeight;
      var colH = col.offsetHeight;
      var maxTravel = Math.max(0, colH - galH);
      if (maxTravel <= 0) {
        resetGallery();
        return;
      }

      var colTop = col.getBoundingClientRect().top;
      /* Cuanto debe bajar la imagen dentro de su columna */
      var travel = Math.min(maxTravel, Math.max(0, TOP - colTop));

      gallery.classList.add('is-pg-pinned');
      gallery.style.setProperty('position', 'relative', 'important');
      gallery.style.setProperty('z-index', '5', 'important');
      gallery.style.setProperty('will-change', 'transform', 'important');
      gallery.style.setProperty('transform', 'translate3d(0,' + travel.toFixed(2) + 'px,0)', 'important');
      gallery.style.removeProperty('top');
      gallery.style.removeProperty('bottom');
      gallery.style.removeProperty('left');
      gallery.style.removeProperty('width');
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    setTimeout(update, 300);
    setTimeout(update, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pgInitStickyGallery);
  } else {
    pgInitStickyGallery();
  }
  setTimeout(pgInitStickyGallery, 500);
})();
