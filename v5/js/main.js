(function () {
  var root = document.documentElement;
  var motion = root.dataset.motion || "reduced";

  var navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") navToggle.checked = false;
    });
    document.querySelectorAll(".nav-panel a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 900px)").matches) navToggle.checked = false;
      });
    });
  }

  var stations = Array.prototype.slice.call(document.querySelectorAll(".station"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));

  function select(id) {
    stations.forEach(function (el) {
      var on = el.dataset.station === id;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-expanded", on ? "true" : "false");
      if (on) el.setAttribute("aria-current", "true");
      else el.removeAttribute("aria-current");
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("is-on", panel.dataset.station === id);
    });
  }

  stations.forEach(function (el, index) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      select(el.dataset.station);
    });
    el.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = stations[(index + 1) % stations.length];
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = stations[(index - 1 + stations.length) % stations.length];
      if (e.key === "Home") next = stations[0];
      if (e.key === "End") next = stations[stations.length - 1];
      if (!next || next === el) return;
      e.preventDefault();
      select(next.dataset.station);
      next.focus();
    });
  });

  var PLANS = {
    foundation: {
      name: "Foundation",
      price: "$12k–$20k",
      statement: "A website that finally says what the business has become.",
      timeline: "Often 6–10 weeks once scope is agreed. Planning range, not a promise."
    },
    growth: {
      name: "Growth System",
      price: "$25k–$45k",
      statement: "Not just a better site. A connected acquisition system.",
      timeline: "Often 10–16 weeks once scope is agreed. Planning range, not a promise."
    },
    flagship: {
      name: "Interactive Flagship",
      price: "$45k–$85k+",
      statement: "Build the site people remember, and the system your team can actually run.",
      timeline: "Often 16–24 weeks once scope is agreed. Planning range, not a promise."
    }
  };
  var RANK = { foundation: 0, growth: 1, flagship: 2 };
  var SERVICES = [
    ["web-design", "Web Design & Development"],
    ["growth-marketing", "Growth Marketing"],
    ["ai-automation", "AI & Automation"],
    ["conversion-analytics", "Conversion & Analytics"]
  ];
  var rec = document.querySelector("[data-recommendation]");
  var mail = document.querySelector("[data-mail]");

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  function text(tag, className, value) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    n.textContent = value;
    return n;
  }

  function render() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('input[name="symptoms"]:checked'));
    var ids = boxes.map(function (b) { return b.value; });
    if (!rec) return;
    clear(rec);
    if (!boxes.length) {
      rec.appendChild(text("p", "", "Select at least one symptom. The recommendation stays empty until you do."));
      if (mail) mail.href = "mailto:info@supportwellnessglobal.com?subject=" + encodeURIComponent("SWG diagnostic");
      return;
    }
    var planId = "foundation";
    var serviceSet = {};
    var retainer = boxes.length >= 3;
    boxes.forEach(function (box) {
      var id = box.dataset.plan;
      if (RANK[id] > RANK[planId]) planId = id;
      (box.dataset.services || "").split(" ").forEach(function (s) {
        if (s) serviceSet[s] = true;
      });
      if (box.dataset.retainer === "true") retainer = true;
    });
    var plan = PLANS[planId];
    rec.appendChild(text("p", "eyebrow", "Combined recommendation"));
    rec.appendChild(text("h3", "", plan.name));
    rec.appendChild(text("p", "price", plan.price));
    rec.appendChild(text("p", "", plan.statement));
    var links = document.createElement("p");
    var first = true;
    SERVICES.forEach(function (pair) {
      if (!serviceSet[pair[0]]) return;
      if (!first) links.appendChild(document.createTextNode(" · "));
      first = false;
      var a = document.createElement("a");
      a.href = "#" + pair[0];
      a.textContent = pair[1];
      links.appendChild(a);
    });
    rec.appendChild(links);
    var list = document.createElement("ul");
    boxes.forEach(function (box) {
      list.appendChild(text("li", "", box.dataset.reason || ""));
    });
    rec.appendChild(list);
    if (retainer) {
      rec.appendChild(text("p", "muted", "Growth & Optimization ($3k–$8k/month) is optional here. Optional. Not a substitute for the build."));
    }
    rec.appendChild(text("p", "muted", "A starting scope, not a quote. " + plan.timeline));
    if (mail) {
      var body = "Symptoms: " + ids.join(", ") + "\nStarting scope: " + plan.name + " (" + plan.price + ")\n\nThis preview does not send a form. A starting scope, not a quote.";
      mail.href = "mailto:info@supportwellnessglobal.com?subject=" + encodeURIComponent("SWG diagnostic") + "&body=" + encodeURIComponent(body);
    }
  }

  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var ids = Array.prototype.map.call(document.querySelectorAll('input[name="symptoms"]:checked'), function (b) {
      return "symptom=" + encodeURIComponent(b.value);
    });
    history.replaceState(null, "", ids.length ? "?" + ids.join("&") : location.pathname);
  }

  document.querySelectorAll('input[name="symptoms"]').forEach(function (box) {
    box.addEventListener("change", function () {
      render();
      syncUrl();
    });
  });

  document.querySelectorAll("[data-symptom]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var box = document.querySelector('input[name="symptoms"][value="' + link.dataset.symptom + '"]');
      if (!box) return;
      e.preventDefault();
      box.checked = true;
      render();
      syncUrl();
      var start = document.getElementById("start");
      if (start) start.scrollIntoView();
    });
  });

  var params = new URLSearchParams(location.search);
  var preset = new Set(params.getAll("symptom").concat(params.getAll("symptoms")));
  if (preset.size) {
    document.querySelectorAll('input[name="symptoms"]').forEach(function (box) {
      if (preset.has(box.value)) box.checked = true;
    });
  }
  render();

  document.querySelectorAll("[data-dialog]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var dialog = document.getElementById(btn.getAttribute("data-dialog"));
      if (dialog && dialog.showModal) dialog.showModal();
    });
  });
  var schedule = document.getElementById("schedule-dialog");
  if (schedule) {
    schedule.addEventListener("click", function (e) {
      if (e.target === schedule) schedule.close();
    });
  }

  var range = document.querySelector(".compare-range");
  var beforePane = document.querySelector(".compare-before");
  if (range && beforePane) {
    var vel = 0;
    var lastVal = Number(range.value);
    var lastTime = 0;
    var coast = 0;
    var paintCompare = function () {
      beforePane.style.width = range.value + "%";
    };
    range.addEventListener("pointerdown", function () {
      if (coast) cancelAnimationFrame(coast);
      coast = 0;
      vel = 0;
      lastVal = Number(range.value);
      lastTime = performance.now();
    });
    range.addEventListener("input", function () {
      var now = performance.now();
      var value = Number(range.value);
      var dt = Math.max(16, now - lastTime);
      vel = (value - lastVal) / dt;
      lastVal = value;
      lastTime = now;
      paintCompare();
    });
    range.addEventListener("pointerup", function () {
      if (motion !== "playing") return;
      var step = function () {
        if (Math.abs(vel) < 0.015) return;
        var next = Math.min(100, Math.max(0, Number(range.value) + vel * 18));
        vel *= 0.86;
        range.value = String(Math.round(next));
        paintCompare();
        coast = requestAnimationFrame(step);
      };
      coast = requestAnimationFrame(step);
    });
    paintCompare();
  }

  var fix = document.getElementById("fix-chain");
  var chain = document.querySelector(".chain");
  if (fix && chain) {
    fix.addEventListener("click", function () {
      var on = chain.classList.toggle("is-fixed");
      fix.setAttribute("aria-pressed", on ? "true" : "false");
      fix.textContent = on ? "Break repaired" : "Fix the break";
    });
  }

  var services = Array.prototype.slice.call(document.querySelectorAll(".service"));
  function showService(el) {
    services.forEach(function (item) {
      item.classList.toggle("is-shown", item === el);
    });
    var img = el.querySelector("img");
    if (img && img.decode) img.decode().catch(function () {});
  }
  if (services.length) {
    showService(services[0]);
    services.forEach(function (el) {
      var hit = el.querySelector(".service-copy") || el;
      hit.addEventListener("pointerenter", function () { showService(el); });
      el.addEventListener("focusin", function () { showService(el); });
    });
  }

  if (!window.CSS || !CSS.supports || !CSS.supports("animation-timeline: view()")) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-in");
        });
      }, { threshold: 0.16 });
      document.querySelectorAll(".reveal").forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  function bootVideo() {
    if (motion !== "playing") return;
    if (navigator.connection && navigator.connection.saveData) return;
    var video = document.querySelector(".hero-video");
    if (!video) return;
    var webm = document.createElement("source");
    webm.src = "assets/hero-loop.webm";
    webm.type = "video/webm";
    var mp4 = document.createElement("source");
    mp4.src = "assets/hero-loop.mp4";
    mp4.type = "video/mp4";
    video.appendChild(webm);
    video.appendChild(mp4);
    video.addEventListener("playing", function () { video.classList.add("is-playing"); }, { once: true });
    var playAttempt = video.play();
    if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});
  }
  if ("requestIdleCallback" in window) requestIdleCallback(bootVideo, { timeout: 1500 });
  else window.addEventListener("load", bootVideo);
})();
