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
})();
