(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    if (window.scrollY > 12) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  function closeNav() {
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Scroll reveal (with staggered cascade) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        // Items entering together cascade in sequence rather than all at once.
        var batch = entries.filter(function (e) { return e.isIntersecting; });
        batch.forEach(function (entry, i) {
          entry.target.style.transitionDelay = Math.min(i * 80, 480) + "ms";
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Count-up stats ---------- */
  var countEls = document.querySelectorAll(".count-up");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }
    requestAnimationFrame(frame);
  }
  if (countEls.length && "IntersectionObserver" in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    countEls.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Scrollspy: highlight active nav link ---------- */
  var navLinks = Array.prototype.slice.call(mainNav.querySelectorAll('a[href^="#"]'));
  var spySections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href").slice(1);
      return { link: link, section: document.getElementById(id) };
    })
    .filter(function (entry) { return entry.section; });

  if (spySections.length && "IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            var match = spySections.filter(function (s) { return s.section === entry.target; })[0];
            if (match) match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spySections.forEach(function (entry) { spyObserver.observe(entry.section); });
  }

  /* ---------- Testimonial slider ---------- */
  var track = document.getElementById("testimonialTrack");
  var slides = track ? Array.prototype.slice.call(track.querySelectorAll(".testimonial")) : [];
  var dotsWrap = document.getElementById("testimonialDots");
  var prevBtn = document.getElementById("testimonialPrev");
  var nextBtn = document.getElementById("testimonialNext");
  var current = 0;
  var autoplayTimer;

  if (slides.length) {
    slides.forEach(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show review " + (i + 1));
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", function () { goTo(i); restartAutoplay(); });
      dotsWrap.appendChild(dot);
    });

    function render() {
      slides.forEach(function (slide, i) {
        var isActive = i === current;
        slide.classList.toggle("active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      Array.prototype.forEach.call(dotsWrap.children, function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      render();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restartAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(next, 6000);
    }

    nextBtn.addEventListener("click", function () { next(); restartAutoplay(); });
    prevBtn.addEventListener("click", function () { prev(); restartAutoplay(); });

    var slider = document.getElementById("testimonialSlider");
    slider.addEventListener("mouseenter", function () { clearInterval(autoplayTimer); });
    slider.addEventListener("mouseleave", restartAutoplay);
    slider.addEventListener("focusin", function () { clearInterval(autoplayTimer); });
    slider.addEventListener("focusout", restartAutoplay);

    render();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      restartAutoplay();
    }
  }

  /* ---------- Reservation / Catering modal ---------- */
  var overlay = document.getElementById("modalOverlay");
  var modalClose = document.getElementById("modalClose");
  var modalTitle = document.getElementById("modalTitle");
  var requestType = document.getElementById("requestType");
  var requestForm = document.getElementById("requestForm");
  var formSuccess = document.getElementById("formSuccess");
  var lastFocused;

  var titles = {
    Reservation: "Reserve a Table",
    Catering: "Request Catering"
  };

  function openModal(type) {
    lastFocused = document.activeElement;
    requestType.value = type;
    modalTitle.textContent = titles[type] || "Get in Touch";
    requestForm.hidden = false;
    formSuccess.hidden = true;
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      var firstField = requestForm.querySelector("input, textarea");
      if (firstField) firstField.focus();
    });
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () {
      overlay.hidden = true;
      if (lastFocused) lastFocused.focus();
    }, 250);
  }

  document.querySelectorAll(".js-open-modal").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(btn.getAttribute("data-type") || "Reservation");
    });
  });

  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });

  requestForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // NOTE: no backend is wired up yet. Connect this to your booking
    // system, CRM, or an email service (e.g. Formspree) before launch.
    requestForm.hidden = true;
    formSuccess.hidden = false;
  });

  /* ---------- Order link placeholder notice ---------- */
  document.querySelectorAll(".order-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        window.alert("Add your Uber Eats store link to this button before launch.");
      }
    });
  });
})();
