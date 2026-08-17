(function () {
  "use strict";

  var steps = [].slice.call(document.querySelectorAll(".step"));
  var total = 6;
  var cur = 0;
  var answers = {};
  var noteBody = document.getElementById("noteBody");
  var noteSign = document.getElementById("noteSign");
  var pTrack = document.getElementById("pTrack");
  var pLabel = document.getElementById("pLabel");

  for (var i = 0; i < total; i++) {
    var s = document.createElement("span");
    s.className = "progress__seg";
    pTrack.appendChild(s);
  }
  var segs = [].slice.call(pTrack.children);

  function show(n) {
    steps.forEach(function (s) {
      s.classList.remove("is-active");
    });
    steps[n].classList.add("is-active");
    cur = n;
    segs.forEach(function (seg, i) {
      seg.classList.toggle("is-done", i < n);
    });
    pLabel.textContent = n < total ? "Question " + (n + 1) + " of " + total : "Your details";
    var q = steps[n].querySelector(".step__q");
    if (q) {
      q.setAttribute("tabindex", "-1");
      q.focus({ preventScroll: true });
    }
  }

  function redrawNote() {
    var lines = [];
    ["recipient", "moment", "need", "reader", "tier", "timing"].forEach(function (k) {
      if (answers[k]) lines.push(answers[k].note);
    });
    noteBody.innerHTML = "<p>Dear Alice,</p>";
    if (!lines.length) {
      noteBody.innerHTML += '<p class="note__ph">I\'d like to send someone a box&hellip;</p>';
      noteSign.hidden = true;
      return;
    }
    var opening = lines[0];
    var rest = lines.slice(1);
    var p = document.createElement("p");
    p.className = "note__line";
    p.textContent = "I'd like " + opening + ".";
    noteBody.appendChild(p);
    rest.forEach(function (t) {
      var el = document.createElement("p");
      el.className = "note__line";
      el.textContent = t;
      noteBody.appendChild(el);
    });
    noteSign.hidden = lines.length < 3;
    // Structured summary for Alice, mirrored into the hidden field below
    // rather than created on the fly -- Netlify Forms only detects fields
    // that exist in the static HTML at build/deploy time.
    document.getElementById("d-summary").value = lines.join(" ");
  }

  document.querySelectorAll(".opts").forEach(function (group) {
    var key = group.getAttribute("data-key");
    group.addEventListener("click", function (e) {
      var btn = e.target.closest(".opt");
      if (!btn) return;
      group.querySelectorAll(".opt").forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");
      answers[key] = { value: btn.getAttribute("data-v"), note: btn.getAttribute("data-note") };
      // Same reasoning as note-summary above: this hidden input already
      // exists in the HTML, we're only ever setting its value, never
      // creating it.
      var hidden = document.getElementById("d-" + key);
      if (hidden) hidden.value = btn.getAttribute("data-v");
      var next = group.parentElement.querySelector("[data-next]");
      if (next) next.disabled = false;
      redrawNote();
    });
  });

  document.querySelectorAll("[data-next]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (cur < steps.length - 1) show(cur + 1);
    });
  });
  document.querySelectorAll("[data-back]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (cur > 0) show(cur - 1);
    });
  });

  // Keepsake: a small postmark-style SVG stamped with the chosen moment
  // and today's date, shown once the box is sent. Serif fallbacks only
  // (no Caveat/webfont) so the PNG export below renders consistently
  // even if a browser rasterizes the SVG before webfonts are available --
  // real postmarks are engraved lettering anyway, not handwriting.
  var SVG_NS = "http://www.w3.org/2000/svg";
  var KEEPSAKE_FONT = "Georgia, 'Times New Roman', serif";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function postmarkDate(d) {
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function buildKeepsakeSvg(momentText) {
    var svg = svgEl("svg", { viewBox: "0 0 340 340", width: "220", height: "220", xmlns: SVG_NS });

    var defs = svgEl("defs");
    defs.appendChild(svgEl("path", { id: "keepsakeArc", d: "M 50 170 A 120 120 0 0 1 290 170", fill: "none" }));
    svg.appendChild(defs);

    svg.appendChild(svgEl("circle", { cx: 170, cy: 170, r: 138, fill: "#7a1030" }));
    svg.appendChild(
      svgEl("circle", {
        cx: 170,
        cy: 170,
        r: 122,
        fill: "none",
        stroke: "rgba(247,240,220,0.45)",
        "stroke-width": 1.5,
        "stroke-dasharray": "3 5",
      })
    );

    var topText = svgEl("text", {
      fill: "#f7f0dc",
      "font-family": KEEPSAKE_FONT,
      "font-size": "13",
      "letter-spacing": "3",
      "text-anchor": "middle",
    });
    var topPath = svgEl("textPath", { href: "#keepsakeArc", startOffset: "50%" });
    topPath.textContent = "READ THIS WHEN";
    topText.appendChild(topPath);
    svg.appendChild(topText);

    var momentEl = svgEl("text", {
      x: 170,
      y: 179,
      fill: "#f7f0dc",
      "font-family": KEEPSAKE_FONT,
      "font-style": "italic",
      "font-size": "14",
      "text-anchor": "middle",
    });
    momentEl.textContent = momentText;
    svg.appendChild(momentEl);

    var dateEl = svgEl("text", {
      x: 170,
      y: 208,
      fill: "rgba(247,240,220,0.75)",
      "font-family": KEEPSAKE_FONT,
      "font-size": "11",
      "letter-spacing": "2",
      "text-anchor": "middle",
    });
    dateEl.textContent = postmarkDate(new Date());
    svg.appendChild(dateEl);

    var monogram = svgEl("text", {
      x: 170,
      y: 240,
      fill: "rgba(247,240,220,0.6)",
      "font-family": KEEPSAKE_FONT,
      "font-style": "italic",
      "font-size": "13",
      "letter-spacing": "2",
      "text-anchor": "middle",
    });
    monogram.textContent = "R · W";
    svg.appendChild(monogram);

    return svg;
  }

  function saveKeepsakeAsPng(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute("width", "680");
    clone.setAttribute("height", "680");
    var svgString = new XMLSerializer().serializeToString(clone);
    var svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(svgBlob);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = 680;
      canvas.height = 680;
      canvas.getContext("2d").drawImage(img, 0, 0, 680, 680);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) {
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "read-this-when-keepsake.png";
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");
    };
    img.src = url;
  }

  function renderKeepsake() {
    var container = document.getElementById("keepsake");
    var saveBtn = document.getElementById("keepsakeSave");
    if (!container || !answers.moment) return;
    container.innerHTML = "";
    var svg = buildKeepsakeSvg(answers.moment.value);
    container.appendChild(svg);
    container.hidden = false;
    if (saveBtn) {
      saveBtn.hidden = false;
      saveBtn.onclick = function () {
        saveKeepsakeAsPng(svg);
      };
    }
  }

  // Form submit: AJAX to Netlify Forms (same pattern as the homepage
  // enquiry form in main.js), then swap the last step for the done
  // state in place rather than letting Netlify's default full-page
  // redirect throw away the keepsake we're about to generate.
  var builderForm = document.querySelector(".builder");
  var doneEl = document.getElementById("done");
  if (builderForm && doneEl) {
    builderForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(builderForm);
      var body = new URLSearchParams();
      data.forEach(function (value, key) {
        body.append(key, value);
      });

      var submitBtn = builderForm.querySelector('button[type="submit"]');
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
          steps.forEach(function (s) {
            s.classList.remove("is-active");
          });
          doneEl.classList.add("is-active");
          renderKeepsake();
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send this to Alice";
          }
          alert("Something went wrong sending that. Please email hello@readthiswhen.co.uk instead.");
        });
    });
  }
})();
