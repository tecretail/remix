(function () {
  var designMode =
    (window.Shopify && Shopify.designMode) ||
    document.documentElement.classList.contains("shopify-design-mode") ||
    (document.body && document.body.classList.contains("shopify-design-mode"));

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function timeParts() {
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    var diff = Math.max(0, end.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
      hOnly: Math.floor(diff / 3600000),
    };
  }

  function flipUnit(value) {
    var digits = pad(value).split("");
    var html = '<ul class="flip">';
    for (var i = 0; i < digits.length; i++) {
      var d = digits[i];
      html +=
        '<li class="d' +
        (i + 1) +
        '"><section class="ready">' +
        '<div class="up"><div class="inn">' +
        d +
        "</div></div>" +
        '<div class="down"><div class="inn">' +
        d +
        "</div></div>" +
        "</section></li>";
    }
    html += "</ul>";
    return html;
  }

  function ensureTicker(el, parts) {
    var mobile =
      window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
    var mode = mobile ? "simple" : "flip";
    var built = el.getAttribute("data-pg-built");

    if (mode === "simple") {
      var html =
        '<span class="pg-tick"><b>' +
        pad(parts.days) +
        "</b></span>" +
        '<span class="pg-tick"><b>' +
        pad(parts.hours) +
        "</b></span>" +
        '<span class="pg-tick"><b>' +
        pad(parts.mins) +
        "</b></span>" +
        '<span class="pg-tick"><b>' +
        pad(parts.secs) +
        "</b></span>";
      if (built !== "simple") {
        el.innerHTML = html;
        el.setAttribute("data-pg-built", "simple");
        el.classList.add("pg-ticker--simple");
      } else {
        var nums = el.querySelectorAll(".pg-tick b");
        var str =
          pad(parts.days) +
          pad(parts.hours) +
          pad(parts.mins) +
          pad(parts.secs);
        for (var i = 0; i < nums.length; i++) {
          nums[i].textContent = str.substr(i * 2, 2);
        }
      }
      return;
    }

    if (built === "simple") {
      el.removeAttribute("data-pg-built");
      el.classList.remove("pg-ticker--simple");
      el.innerHTML = "";
    }

    if (!el.getAttribute("data-pg-built")) {
      el.innerHTML =
        flipUnit(parts.days) +
        flipUnit(parts.hours) +
        flipUnit(parts.mins) +
        flipUnit(parts.secs);
      el.setAttribute("data-pg-built", "flip");
      return;
    }
    var inns = el.querySelectorAll(".inn");
    var s =
      pad(parts.days) + pad(parts.hours) + pad(parts.mins) + pad(parts.secs);
    for (var j = 0; j < s.length; j++) {
      var up = inns[j * 2];
      var down = inns[j * 2 + 1];
      if (up) up.textContent = s.charAt(j);
      if (down) down.textContent = s.charAt(j);
    }
  }

  function tickHeroCounters() {
    var tickers = document.querySelectorAll("#ticker, [data-pg-ticker]");
    if (!tickers.length) return;
    var parts = timeParts();
    for (var i = 0; i < tickers.length; i++) {
      ensureTicker(tickers[i], parts);
    }
  }

  function tickPgCountdowns() {
    var roots = document.querySelectorAll("[data-pg-countdown]");
    if (!roots.length) return;
    var parts = timeParts();
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      var dEl = root.querySelector("[data-d]");
      var hEl = root.querySelector("[data-h]");
      var mEl = root.querySelector("[data-m]");
      var sEl = root.querySelector("[data-s]");
      if (dEl) dEl.textContent = pad(parts.days);
      if (hEl) {
        hEl.textContent = pad(
          root.hasAttribute("data-hours-only") ? parts.hOnly : parts.hours
        );
      }
      if (mEl) mEl.textContent = pad(parts.mins);
      if (sEl) sEl.textContent = pad(parts.secs);
    }
  }

  function setupWhatsApp() {
    var btn = document.getElementById("lvWaBtn");
    if (!btn) return;
    var host = document.getElementById("lvWaHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "lvWaHost";
      document.body.appendChild(host);
    }
    if (btn.parentNode !== host) host.appendChild(btn);
  }

  function setupYear() {
    var years = document.getElementsByClassName("currentYear");
    var y = String(new Date().getFullYear());
    for (var i = 0; i < years.length; i++) years[i].textContent = y;
  }

  function setupGallery() {
    document.querySelectorAll("[data-pg-gallery]").forEach(function (gallery) {
      if (gallery.getAttribute("data-pg-bound")) return;
      gallery.setAttribute("data-pg-bound", "1");
      var hero = gallery.querySelector("[data-pg-hero]");
      gallery.querySelectorAll("[data-pg-thumb]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          gallery.querySelectorAll("[data-pg-thumb]").forEach(function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          if (hero) hero.src = btn.getAttribute("data-src") || hero.src;
        });
      });
    });
  }

  function applyVariant(root, btn, updateImage) {
    var input = root.querySelector('input[name="id"], [data-pg-variant-input]');
    var checkout = root.querySelector("[data-pg-checkout]");
    var totalPrice = root.querySelector("[data-pg-total-price]");
    var totalCompare = root.querySelector("[data-pg-total-compare]");
    var totalSave = root.querySelector("[data-pg-total-save]");
    var hero = root.querySelector("[data-pg-hero]");

    function money(cents) {
      var n = Number(cents) / 100;
      return "S/ " + n.toFixed(2);
    }

    root.querySelectorAll("[data-pg-variant]").forEach(function (b) {
      b.classList.remove("is-active");
    });
    btn.classList.add("is-active");
    var id = btn.getAttribute("data-id");
    var price = Number(btn.getAttribute("data-price") || 0);
    var compare = Number(btn.getAttribute("data-compare") || price);
    if (compare < price) compare = Math.round(price * 2.5);
    var save = Math.max(0, compare - price);
    if (input) input.value = id;
    if (totalPrice) totalPrice.textContent = money(price);
    if (totalCompare) totalCompare.textContent = money(compare);
    if (totalSave) totalSave.textContent = money(save);
    if (checkout && id) {
      var numeric = String(id).replace(/\D/g, "");
      checkout.setAttribute("data-pg-variant-id", numeric);
      if (checkout.tagName === "A") {
        checkout.setAttribute("href", "/cart/" + numeric + ":1");
      }
    }
    if (!updateImage || !hero) return;
    var imageUrl = btn.getAttribute("data-image");
    var defaultUrl = hero.getAttribute("data-pg-hero-default");
    if (imageUrl) {
      hero.src = imageUrl;
    } else if (defaultUrl) {
      hero.src = defaultUrl;
    }
    var gallery = root.querySelector("[data-pg-gallery]");
    if (gallery) {
      var activeSrc = hero.src || "";
      gallery.querySelectorAll("[data-pg-thumb]").forEach(function (thumb) {
        var src = thumb.getAttribute("data-src") || "";
        var match = false;
        if (src && activeSrc) {
          try {
            match =
              src.split("?")[0] === activeSrc.split("?")[0] ||
              activeSrc.indexOf(src.split("/").pop().split("?")[0]) !== -1;
          } catch (e) {}
        }
        thumb.classList.toggle("is-active", !!match);
      });
    }
  }

  function setupCheckoutButtons() {
    /* Preventify/COD necesita el form product + button[name=add].
       No interceptamos el submit nativo. */
  }

  function setupVariants() {
    document.querySelectorAll("[data-pg-product]").forEach(function (root) {
      if (root.getAttribute("data-pg-bound")) return;
      root.setAttribute("data-pg-bound", "1");
      root.querySelectorAll("[data-pg-variant]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          applyVariant(root, btn, true);
        });
      });
      var active =
        root.querySelector("[data-pg-variant].is-active") ||
        root.querySelector("[data-pg-variant]");
      if (active) applyVariant(root, active, false);
    });
  }

  function setupOfferThumbs() {
    document.querySelectorAll("[data-pg-offer-thumbs]").forEach(function (row) {
      if (row.getAttribute("data-pg-bound")) return;
      row.setAttribute("data-pg-bound", "1");
      var visual = row.closest(".lv-offer-visual");
      var main = visual && visual.querySelector(".lv-offer-bottles img");
      if (!main) return;
      row.querySelectorAll(".lv-offer-thumb").forEach(function (btn) {
        btn.addEventListener("click", function () {
          row.querySelectorAll(".lv-offer-thumb").forEach(function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          var src = btn.getAttribute("data-src");
          if (src) main.src = src;
        });
      });
    });
  }

  function lockHorizontalOverflow() {
    var html = document.documentElement;
    var body = document.body;
    html.style.setProperty("overflow-x", "hidden", "important");
    body.style.setProperty("overflow-x", "hidden", "important");
    body.style.setProperty("max-width", "100%", "important");
    body.style.setProperty("overscroll-behavior-x", "none", "important");
    body.style.setProperty("touch-action", "pan-y", "important");
    html.scrollLeft = 0;
    body.scrollLeft = 0;
    if (window.scrollX) window.scrollTo(0, window.scrollY);

    var nodes = document.querySelectorAll(
      ".shopify-section, .pg-sec-style, .banner_special, .body_full, .body_full_nomar, .lv-announce, .pg-brand-slider-wrap, .pg-buybox, .pg-preventify-host, .clock, .counter, .lv-preview-embed-wrap"
    );
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.style.setProperty("max-width", "100%", "important");
      el.style.setProperty("min-width", "0", "important");
      el.style.setProperty("box-sizing", "border-box", "important");
      el.style.setProperty("overflow-x", "hidden", "important");
    }

    /* Quitar outline que ensancha el scroll en iOS */
    var glowBtns = document.querySelectorAll(".pg-preventify-host button, .pg-preventify-host [role='button'], .jaldi-modal-overlay button.jaldi-button-pulse, .jaldi-modal-overlay button.jaldi-button-bounce, .jaldi-modal-overlay button.jaldi-button-shake");
    for (var b = 0; b < glowBtns.length; b++) {
      glowBtns[b].style.setProperty("outline", "none", "important");
      glowBtns[b].style.setProperty("transform", "none", "important");
    }

    if (html.scrollWidth > html.clientWidth + 1) {
      var all = body.getElementsByTagName("*");
      var vw = html.clientWidth;
      for (var j = 0; j < all.length; j++) {
        var n = all[j];
        if (n.id === "lvWaHost" || (n.className && String(n.className).indexOf("lv-wa") !== -1)) continue;
        if (!n.getBoundingClientRect) continue;
        var r = n.getBoundingClientRect();
        if (r.right > vw + 4 || r.left < -4 || r.width > vw + 8) {
          n.style.setProperty("max-width", "100%", "important");
          n.style.setProperty("overflow-x", "hidden", "important");
        }
      }
      html.scrollLeft = 0;
      body.scrollLeft = 0;
      window.scrollTo(0, window.scrollY || 0);
    }
  }

  function bindNoHorizontalScroll() {
    if (window.__pgNoHScroll) return;
    window.__pgNoHScroll = true;
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
      },
      { passive: true }
    );
    document.addEventListener(
      "touchmove",
      function () {
        if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
      },
      { passive: true }
    );
  }

  function init() {
    setupYear();
    setupWhatsApp();
    setupGallery();
    setupOfferThumbs();
    setupVariants();
    setupCheckoutButtons();
    tickHeroCounters();
    tickPgCountdowns();
    lockHorizontalOverflow();
    bindNoHorizontalScroll();
    setTimeout(lockHorizontalOverflow, 300);
    setTimeout(lockHorizontalOverflow, 1200);
    window.addEventListener("resize", lockHorizontalOverflow);
    if (designMode) return;
    setInterval(function () {
      tickHeroCounters();
      tickPgCountdowns();
    }, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
