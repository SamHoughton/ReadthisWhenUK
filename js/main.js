(function () {
  "use strict";

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

  // Scroll reveal
  var revealEls = document.querySelectorAll("[data-reveal]");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
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
