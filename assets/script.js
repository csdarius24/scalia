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

  /* --- 0. Címek szavakra bontása a felúszó animációhoz ------------------ */
  // A felolvasó az eredeti mondatot kapja (aria-label), a darabolt szavakat nem.
  var splitEls = document.querySelectorAll(".split");
  for (var s = 0; s < splitEls.length; s++) {
    var el = splitEls[s];
    var idx = 0;
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    var nodes = Array.prototype.slice.call(el.childNodes);
    for (var n = 0; n < nodes.length; n++) {
      var node = nodes[n];
      if (node.nodeType !== 3) continue; // a <br> és társai maradnak
      var frag = document.createDocumentFragment();
      var parts = node.textContent.split(/(\s+)/);
      for (var p = 0; p < parts.length; p++) {
        if (!parts[p]) continue;
        if (/^\s+$/.test(parts[p])) {
          frag.appendChild(document.createTextNode(" "));
          continue;
        }
        var outer = document.createElement("span");
        var inner = document.createElement("span");
        outer.className = "w";
        outer.setAttribute("aria-hidden", "true");
        inner.textContent = parts[p];
        inner.style.setProperty("--i", idx++);
        outer.appendChild(inner);
        frag.appendChild(outer);
      }
      el.replaceChild(frag, node);
    }
  }

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

  /* --- 4e. Kapcsolatfelvételi űrlap ------------------------------------- */
  // Ha az action http(s) végpont (pl. Formspree), háttérben küld; ha mailto:,
  // a látogató levelezőjét nyitja meg kitöltött levéllel.
  var form = document.getElementById("contactForm");
  if (form) {
    var formDone = document.getElementById("formDone");
    var formStatus = document.getElementById("formStatus");
    var submitBtn = form.querySelector(".form__btn");
    var required = form.querySelectorAll("[required]");

    var setError = function (input, msg) {
      var field = input.closest(".field");
      var err = field && field.querySelector(".field__error");
      if (!field) return;
      field.classList.toggle("is-invalid", !!msg);
      if (err) {
        err.textContent = msg || "";
        if (err.id) input.setAttribute("aria-describedby", err.id);
      }
      input.setAttribute("aria-invalid", msg ? "true" : "false");
    };

    var check = function (input) {
      var ok = input.type === "checkbox" ? input.checked : input.checkValidity() && input.value.trim() !== "";
      setError(input, ok ? "" : input.getAttribute("data-msg"));
      return ok;
    };

    for (var q = 0; q < required.length; q++) {
      (function (input) {
        input.addEventListener("blur", function () {
          if (input.type !== "checkbox" && input.value) check(input);
        });
        // Hiba után gépelés közben azonnal eltűnik, amint helyes
        input.addEventListener(input.type === "checkbox" ? "change" : "input", function () {
          if (input.closest(".field").classList.contains("is-invalid")) check(input);
        });
      })(required[q]);
    }

    var finish = function () {
      form.hidden = true;
      if (formDone) {
        formDone.hidden = false;
        formDone.focus({ preventScroll: true });
        formDone.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
    };

    var buildMailto = function () {
      var data = new FormData(form);
      var lines = [
        "Név: " + (data.get("nev") || ""),
        "E-mail: " + (data.get("email") || ""),
        "Telefon: " + (data.get("telefon") || "—"),
        "Téma: " + (data.getAll("tema").join(", ") || "—"),
        "Forma: " + (data.get("forma") || "—"),
        "",
        String(data.get("uzenet") || "")
      ];
      var to = form.getAttribute("action").replace(/^mailto:/, "").split("?")[0];
      return "mailto:" + to +
        "?subject=" + encodeURIComponent("Első beszélgetés — " + (data.get("nev") || "")) +
        "&body=" + encodeURIComponent(lines.join("\n"));
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (formStatus) { formStatus.textContent = ""; formStatus.classList.remove("is-error"); }

      var firstBad = null;
      for (var r = 0; r < required.length; r++) {
        if (!check(required[r]) && !firstBad) firstBad = required[r];
      }
      if (firstBad) { firstBad.focus(); return; }

      // Spamcsapda: ha ki van töltve, csendben "sikeres"
      if (form.elements._gotcha && form.elements._gotcha.value) { finish(); return; }

      var action = form.getAttribute("action") || "";
      if (!/^https?:/i.test(action)) {
        window.location.href = buildMailto();
        if (formStatus) {
          formStatus.innerHTML = "A levelezőprogramod a kitöltött üzenettel nyílik meg — ott már csak a Küldés gombot kell megnyomnod. " +
            'Ha nem nyílt meg, írj közvetlenül: <a href="mailto:hello@scialla.hu">hello@scialla.hu</a>';
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add("is-sending");
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          finish();
        })
        .catch(function () {
          if (formStatus) {
            formStatus.classList.add("is-error");
            formStatus.innerHTML = "Most nem sikerült elküldeni. Próbáld újra, vagy írj közvetlenül: " +
              '<a href="mailto:hello@scialla.hu">hello@scialla.hu</a>';
          }
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-sending");
        });
    });
  }

  /* --- 5. Copyright évszám ---------------------------------------------- */
  var yearEl = document.getElementById("ev");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
