/* ==========================================================================
   SCIALLA — landing page
   1) scroll-reveal (IntersectionObserver)
   2) a folyamat idővonalának kirajzolása
   3) sticky header hajszálvonal
   4) mobil sticky CTA sáv megjelenítése / elrejtése
   5) copyright évszám
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 1–2. Reveal + idővonal ------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  var drawEls = document.querySelectorAll(".draw");

  function showAll() {
    var i;
    for (i = 0; i < revealEls.length; i++) revealEls[i].classList.add("is-in");
    for (i = 0; i < drawEls.length; i++) drawEls[i].classList.add("is-drawn");
  }

  if (!("IntersectionObserver" in window) || reduceMotion) {
    // Nincs IO-támogatás vagy a felhasználó kevesebb mozgást kért:
    // minden tartalom azonnal látszik.
    showAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (!entry.isIntersecting) continue;
          var el = entry.target;
          el.classList.add(el.classList.contains("draw") ? "is-drawn" : "is-in");
          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    var j;
    for (j = 0; j < revealEls.length; j++) observer.observe(revealEls[j]);
    for (j = 0; j < drawEls.length; j++) observer.observe(drawEls[j]);

    // Biztonsági háló: ha bármi félrecsúszna, 4 másodperc után minden látszik.
    window.setTimeout(showAll, 4000);
  }

  /* --- 3. Sticky header hajszálvonal ------------------------------------ */
  var header = document.getElementById("header");
  var mobileCta = document.getElementById("mobileCta");
  var hero = document.querySelector(".hero");
  var booking = document.getElementById("foglalas");
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (header) header.classList.toggle("is-scrolled", y > 8);

    if (mobileCta && hero) {
      var heroBottom = hero.offsetTop + hero.offsetHeight;
      var pastHero = y > heroBottom - 120;
      var bookingVisible = false;

      if (booking) {
        var rect = booking.getBoundingClientRect();
        bookingVisible = rect.top < window.innerHeight && rect.bottom > 0;
      }
      mobileCta.classList.toggle("is-visible", pastHero && !bookingVisible);
    }
    ticking = false;
  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScroll();

  /* --- 4b. Aktív menüpont jelölése -------------------------------------- */
  var navLinks = document.querySelectorAll(".site-nav a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    var watched = [];

    for (var k = 0; k < navLinks.length; k++) {
      var id = navLinks[k].getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) continue;
      linkFor[id] = navLinks[k];
      watched.push(section);
    }

    var spy = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var link = linkFor[entries[i].target.id];
          if (link) link.classList.toggle("is-current", entries[i].isIntersecting);
        }
      },
      // Csak az a szekció számít aktívnak, amelyik a képernyő közepén jár.
      { threshold: 0, rootMargin: "-45% 0px -50% 0px" }
    );

    for (var m = 0; m < watched.length; m++) spy.observe(watched[m]);
  }

  /* --- 4c. Mobil menü --------------------------------------------------- */
  var menuBtn = document.getElementById("menuToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (menuBtn && mobileNav) {
    var menuLabel = menuBtn.querySelector(".menu-toggle__label");
    // Nyitott menü alatt a háttér nem fókuszálható és nem olvasható fel.
    var behind = [document.getElementById("fo"), document.querySelector(".site-footer"), mobileCta];
    var closeTimer;

    function setMenu(open, restoreFocus) {
      window.clearTimeout(closeTimer);
      menuBtn.setAttribute("aria-expanded", String(open));
      if (menuLabel) menuLabel.textContent = open ? "Bezár" : "Menü";
      document.documentElement.classList.toggle("nav-open", open);
      for (var b = 0; b < behind.length; b++) {
        if (behind[b]) behind[b].inert = open;
      }

      if (open) {
        mobileNav.hidden = false;
        // Egy képkocka kell, hogy a [hidden] levétele után az átmenet lefusson.
        window.requestAnimationFrame(function () {
          mobileNav.classList.add("is-open");
        });
        var first = mobileNav.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      } else {
        mobileNav.classList.remove("is-open");
        closeTimer = window.setTimeout(function () {
          mobileNav.hidden = true;
        }, reduceMotion ? 0 : 220);
        if (restoreFocus) menuBtn.focus();
      }
    }

    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true", false);
    });

    // Linkre kattintva bezár, a horgonyugrás pedig a böngészőre marad.
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false, false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setMenu(false, true);
      }
    });

    // Ha az ablak teljes navigációs szélességre nő, a menü ne ragadjon nyitva.
    var wide = window.matchMedia("(min-width: 1000px)");
    var onWide = function () {
      if (wide.matches && menuBtn.getAttribute("aria-expanded") === "true") setMenu(false, false);
    };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* --- 4d. Cal.com beágyazás ------------------------------------------- */
  // Csak akkor tölt be, ha van data-cal-link, és csak ha a foglalás közel ér
  // a képernyőhöz — így a Cal.com szkript nem lassítja az oldal elejét.
  var calEl = document.getElementById("calEmbed");
  var calLink = calEl && calEl.getAttribute("data-cal-link");
  if (calEl && calLink && booking) {
    calEl.hidden = false;
    booking.classList.add("has-cal");

    var calFallback = function () {
      calEl.hidden = true;
      booking.classList.remove("has-cal");
    };

    var loadCal = function () {
      // A Cal.com hivatalos betöltő-stubja: sorba állítja a hívásokat,
      // amíg az embed.js meg nem érkezik.
      (function (C, A, L) {
        var p = function (a, ar) { a.q.push(ar); };
        var d = C.document;
        C.Cal = C.Cal || function () {
          var cal = C.Cal, ar = arguments;
          if (!cal.loaded) {
            cal.ns = {}; cal.q = cal.q || [];
            var s = d.createElement("script");
            s.src = A;
            s.onerror = calFallback;
            d.head.appendChild(s);
            cal.loaded = true;
          }
          if (ar[0] === L) {
            var api = function () { p(api, arguments); };
            var namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");

      window.Cal("init", "foglalas", { origin: "https://app.cal.com" });
      window.Cal.ns.foglalas("inline", {
        elementOrSelector: "#calEmbed",
        calLink: calLink,
        config: { layout: "month_view" }
      });
      window.Cal.ns.foglalas("ui", {
        cssVarsPerTheme: { light: { "cal-brand": "#1F2A28" } },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
      window.Cal.ns.foglalas("on", {
        action: "linkReady",
        callback: function () { calEl.classList.add("is-ready"); }
      });

      // Ha 12 másodperc alatt sem jelent meg a naptár, az e-mailes út marad.
      window.setTimeout(function () {
        if (!calEl.classList.contains("is-ready")) calFallback();
      }, 12000);
    };

    if ("IntersectionObserver" in window) {
      var calIo = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        calIo.disconnect();
        loadCal();
      }, { rootMargin: "800px 0px" });
      calIo.observe(booking);
    } else {
      loadCal();
    }
  }

  /* --- 5. Copyright évszám ---------------------------------------------- */
  var yearEl = document.getElementById("ev");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
