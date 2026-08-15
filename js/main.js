(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll (Lenis), wired into GSAP's ticker so ScrollTrigger
  // stays in sync with it rather than fighting native scroll.
  if (hasGsap && typeof window.Lenis !== "undefined" && !prefersReducedMotion) {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var header = document.querySelector(".site-header");
  var toggle = document.getElementById("nav-toggle");
  var navPanel = document.getElementById("site-nav");

  if (toggle && header && navPanel) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navPanel.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        header.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Scroll reveal, scrubbed to scroll position rather than a one-shot
  // fade-in, and only ever applied once GSAP has actually loaded, so a
  // CDN failure or reduced-motion leaves everything simply visible.
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (hasGsap && !prefersReducedMotion) {
    revealEls.forEach(function (el) {
      // Sticky columns get a plain one-shot fade: a scrub tied to the
      // element's own position breaks once it pins and stops moving.
      var isSticky = el.classList.contains("sticky-col");
      gsap.from(el, {
        opacity: 0,
        y: 28,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: isSticky
          ? { trigger: el, start: "top 90%", toggleActions: "play none none none" }
          : { trigger: el, start: "top 88%", end: "top 55%", scrub: 0.6 },
      });
    });

    // Hero: media drifts slower than scroll, copy drifts opposite,
    // a real parallax handoff rather than a static banner.
    var heroMedia = document.querySelector(".hero__media img, .hero__media video");
    var heroCopy = document.querySelector(".hero__copy");
    if (heroMedia) {
      gsap.to(heroMedia, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    }
    if (heroCopy) {
      gsap.to(heroCopy, {
        yPercent: -18,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    }

    // Images, video and webfonts can finish loading after triggers are
    // created and shift the layout underneath them, so recalculate once
    // everything has actually settled.
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        ScrollTrigger.refresh();
      });
    }
  }

  // Mouse-tracked card tilt
  if (
    window.matchMedia("(pointer: fine) and (hover: hover)").matches &&
    !prefersReducedMotion
  ) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (px - 0.5) * 14;
        var ry = (0.5 - py) * 14;
        card.style.setProperty("--rx", rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", ry.toFixed(2) + "deg");
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  // Ink-stamp press effect on buttons
  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.classList.remove("is-stamping");
      // force reflow so the animation can restart
      void btn.offsetWidth;
      btn.classList.add("is-stamping");
      setTimeout(function () {
        btn.classList.remove("is-stamping");
      }, 500);
    });
  });

  // Pre-fill the "which option" field when a pricing/business CTA is clicked
  var planField = document.getElementById("f-plan");
  document.querySelectorAll("[data-plan]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (!planField) return;
      var plan = link.getAttribute("data-plan");
      var match = Array.from(planField.options).find(function (opt) {
        return opt.text.indexOf(plan) === 0 || opt.text === plan;
      });
      if (plan === "Business") {
        match = Array.from(planField.options).find(function (opt) {
          return opt.text.indexOf("Business") === 0;
        });
      }
      if (match) planField.value = match.value;
    });
  });

  // Pre-fill the message when a "contents" (moment) row is clicked
  var messageField = document.getElementById("f-message");
  document.querySelectorAll("[data-moment]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (!messageField || messageField.value.trim()) return;
      messageField.value = "A box for when " + link.getAttribute("data-moment") + ": ";
    });
  });

  // Netlify form: progressive-enhancement AJAX submit
  var form = document.getElementById("enquiry-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var body = new URLSearchParams();
      data.forEach(function (value, key) {
        body.append(key, value);
      });

      var submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      })
        .then(function () {
          form.reset();
          form.querySelectorAll(".field, .enquiry__row, .enquiry__note, .btn").forEach(
            function (el) {
              el.style.display = "none";
            }
          );
          var success = form.querySelector(".enquiry__success");
          if (success) success.hidden = false;
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send";
          }
          alert(
            "Something went wrong sending that. Please email hello@readthiswhen.co.uk instead."
          );
        });
    });
  }
})();
