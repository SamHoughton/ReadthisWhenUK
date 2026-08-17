(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll (Lenis), wired into GSAP's ticker so ScrollTrigger
  // stays in sync with it rather than fighting native scroll. lerp-only
  // (no duration): duration-based easing is tied to Lenis's own elapsed-
  // time tracking, which doesn't play well with being driven by an
  // external ticker's time value the way lerp's simple per-frame
  // interpolation does.
  if (hasGsap && typeof window.Lenis !== "undefined" && !prefersReducedMotion) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // scroll-behavior: smooth was removed from the stylesheet (it fights
    // Lenis for control of scroll position), so in-page anchor links need
    // to go through Lenis directly to keep easing on navigation.
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target);
        // Update the URL without the native hash-jump this would otherwise
        // trigger now that scroll-behavior: smooth is gone, which would
        // yank the page straight to the target and fight the Lenis ease.
        if (history.pushState) history.pushState(null, "", id);
      });
    });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Header rides transparent over the full-screen hero, then picks up
  // a solid background once the hero has scrolled out from under it.
  var header = document.querySelector(".site-header");
  var heroEl = document.querySelector(".hero");
  if (header && heroEl) {
    var updateHeaderState = function () {
      var heroBottom = heroEl.getBoundingClientRect().bottom;
      header.classList.toggle(
        "site-header--scrolled",
        heroBottom <= header.offsetHeight
      );
    };
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);
  }

  // "You are here": mirror the .ink-link hover underline onto whichever
  // nav item matches the section currently in view. Driven by top-edge
  // crossing rather than IntersectionObserver, since #business nests
  // inside #pricing and a plain visibility check can't tell which of
  // the two should count as "current".
  var navTargets = Array.prototype.slice
    .call(document.querySelectorAll(".nav a[href^='#']"))
    .map(function (link) {
      var target = document.querySelector(link.getAttribute("href"));
      return target ? { link: link, target: target } : null;
    })
    .filter(Boolean);

  if (navTargets.length && header) {
    var updateActiveNav = function () {
      var line = header.offsetHeight + 40;
      var current = null;
      navTargets.forEach(function (entry) {
        if (entry.target.getBoundingClientRect().top <= line) current = entry;
      });
      navTargets.forEach(function (entry) {
        entry.link.classList.toggle("is-active", entry === current);
      });
    };
    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);
  }

  // Mobile nav toggle
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

    // Kinetic type: a restrained word-level stagger on a handful of key
    // headings (hero line + the three chapter-intro headings), layered
    // on top of their existing block reveal rather than replacing it --
    // the block still fades/rises as a whole, the words inside it
    // stagger a beat behind. Word-level rather than character-level:
    // splitting to characters reads as a gimmick performed once, this
    // is meant to read as texture.
    var splitIntoWords = function (el) {
      var words = [];
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === Node.TEXT_NODE) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (part === "") return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(part));
                return;
              }
              var span = document.createElement("span");
              span.className = "kinetic-word";
              span.textContent = part;
              frag.appendChild(span);
              words.push(span);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            walk(child);
          }
        });
      };
      walk(el);
      return words;
    };

    document
      .querySelectorAll(".band__title, .section-title, .closer__title")
      .forEach(function (heading) {
        var words = splitIntoWords(heading);
        var revealParent = heading.closest("[data-reveal]") || heading;
        gsap.from(words, {
          opacity: 0,
          y: 10,
          duration: 0.5,
          stagger: 0.035,
          ease: "power2.out",
          scrollTrigger: {
            trigger: revealParent,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });

    // Hero: media drifts slower than scroll, copy drifts opposite,
    // a real parallax handoff rather than a static banner.
    var heroMedia = document.querySelector(".hero__media img, .hero__media video");
    var heroCopy = document.querySelector(".hero__copy");
    var heroTitle = document.querySelector(".hero__title");
    if (heroTitle) {
      gsap.from(splitIntoWords(heroTitle), {
        opacity: 0,
        y: 14,
        duration: 0.7,
        stagger: 0.04,
        ease: "power2.out",
        delay: 0.15,
      });
    }
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

  // Decorative accent images (pricing parcels, how-it-works seal): fade in
  // once on scroll into view. Left fully visible and static if the user
  // prefers reduced motion or IntersectionObserver isn't available.
  var initAccentImage = function (el, onRevealed) {
    if (!el || prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      return;
    }
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          el.style.opacity = "1";
          el.style.transform = "translateY(0px)";
          observer.unobserve(el);

          var handleSettled = function (e) {
            if (e.propertyName !== "transform") return;
            el.removeEventListener("transitionend", handleSettled);
            // Drop the transform transition and inline value so the
            // rAF-driven parallax (where present) tracks scroll directly
            // instead of easing toward it, and CSS-only effects like a
            // hover tilt aren't blocked by a leftover inline transform.
            el.style.transition = "opacity 0.6s ease-out";
            el.style.transform = "";
            if (onRevealed) onRevealed();
          };
          el.addEventListener("transitionend", handleSettled);
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
  };

  // Larger accent images drift a little further once revealed, tied to how
  // far their section has scrolled through the viewport.
  var startAccentDrift = function (imgEl, sectionEl, driftRange) {
    if (!imgEl || !sectionEl) return;
    var ticking = false;
    var update = function () {
      ticking = false;
      var rect = sectionEl.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var total = rect.height + vh;
      var progress = total > 0 ? (vh - rect.top) / total : 0;
      progress = Math.min(1, Math.max(0, progress));
      var offset = (progress - 0.5) * driftRange;
      imgEl.style.transform = "translateY(" + offset.toFixed(2) + "px)";
    };
    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  };

  var parcelsImg = document.querySelector(".pricing-parcels");
  var aliceVignetteImg = document.querySelector(".alice-vignette");
  var closerPenImg = document.querySelector(".closer-pen");

  initAccentImage(document.querySelector(".how-it-works-seal"));
  initAccentImage(document.querySelector(".moments-sprig"));
  initAccentImage(document.querySelector(".business-plant"));
  initAccentImage(parcelsImg, function () {
    startAccentDrift(parcelsImg, document.querySelector(".pricing-block"), 26);
  });
  initAccentImage(aliceVignetteImg, function () {
    startAccentDrift(aliceVignetteImg, document.querySelector(".alice__inner"), 26);
  });
  initAccentImage(closerPenImg, function () {
    startAccentDrift(closerPenImg, document.querySelector(".closer__inner"), 26);
  });

  // Journey sequence: each scene fades up independently as it's scrolled
  // to, same mechanism as the single accent images above, just called
  // once per frame instead of once per section.
  document.querySelectorAll(".journey__frame").forEach(function (frame) {
    initAccentImage(frame);
  });

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
