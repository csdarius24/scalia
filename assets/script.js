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

  /* --- 5. Copyright évszám ---------------------------------------------- */
  var yearEl = document.getElementById("ev");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
