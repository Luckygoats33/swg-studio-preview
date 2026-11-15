(function () {
  var root = document.documentElement;
  var motion = root.dataset.motion || "reduced";
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var forced = window.matchMedia("(forced-colors: active)");

  var navToggle = document.getElementById("nav-toggle");
  if (navToggle) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") navToggle.checked = false;
    });
    document.querySelectorAll(".nav-panel a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 899px)").matches) navToggle.checked = false;
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
      var panel = document.getElementById("panel-" + el.dataset.station);
      if (panel) panel.scrollIntoView({ block: "nearest" });
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

  document.querySelectorAll("[data-select]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      select(btn.dataset.select);
      var panel = document.getElementById("panel-" + btn.dataset.select);
      if (panel) panel.scrollIntoView({ block: "nearest" });
    });
  });

  function nodeNames(id) {
    var names = ["content", "ads", "website", "crm", "analytics"];
    var rest = id;
    var found = [];
    while (rest) {
      var match = null;
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        if (rest === name || rest.indexOf(name + "-") === 0) {
          match = name;
          break;
        }
      }
      if (!match) break;
      found.push(match);
      rest = rest.slice(match.length + 1);
    }
    return found;
  }

  function stressesFromChecks() {
    var links = [];
    document.querySelectorAll('input[name="symptoms"]:checked').forEach(function (box) {
      (box.dataset.stress || "").split(" ").forEach(function (id) {
        if (id) links.push(id);
      });
    });
    return links;
  }

  var hoverLinks = [];
  function paint() {
    var set = {};
    hoverLinks.concat(stressesFromChecks()).forEach(function (id) {
      set[id] = true;
    });
    document.querySelectorAll(".is-hot").forEach(function (n) {
      n.classList.remove("is-hot");
    });
    Object.keys(set).forEach(function (id) {
      document.querySelectorAll('[data-link="' + id + '"]').forEach(function (n) {
        n.classList.add("is-hot");
      });
      nodeNames(id).forEach(function (name) {
        var node = document.querySelector('[data-node="' + name + '"]');
        if (node) node.classList.add("is-hot");
      });
    });
  }

  document.querySelectorAll(".chip").forEach(function (chip) {
    function enter() {
      hoverLinks = (chip.dataset.stress || "").split(" ").filter(Boolean);
      paint();
    }
    function leave() {
      hoverLinks = [];
      paint();
    }
    chip.addEventListener("pointerenter", enter);
    chip.addEventListener("pointerleave", leave);
    chip.addEventListener("focus", enter);
    chip.addEventListener("blur", leave);
    chip.addEventListener("click", function (e) {
      var id = chip.dataset.symptom;
      var box = document.querySelector('input[name="symptoms"][value="' + id + '"]');
      if (!box) return;
      e.preventDefault();
      box.checked = true;
      render();
      syncUrl();
      var start = document.getElementById("start");
      if (start) start.scrollIntoView();
    });
  });

  var PLANS = {
    foundation: {
      name: "Foundation",
      price: "$12k-$20k",
      statement: "A website that finally says what the business has become.",
      timeline: "Often 6-10 weeks once scope is agreed. Planning range, not a promise.",
    },
    growth: {
      name: "Growth System",
      price: "$25k-$45k",
      statement: "Not just a better site. A connected acquisition system.",
      timeline: "Often 10-16 weeks once scope is agreed. Planning range, not a promise.",
    },
    flagship: {
      name: "Interactive Flagship",
      price: "$45k-$85k+",
      statement: "Build the site people remember, and the system your team can actually run.",
      timeline: "Often 16-24 weeks once scope is agreed. Planning range, not a promise.",
    },
  };
  var RANK = { foundation: 0, growth: 1, flagship: 2 };
  var SERVICES = [
    ["web-design", "Web Design & Development"],
    ["growth-marketing", "Growth Marketing"],
    ["ai-automation", "AI & Automation"],
    ["conversion-analytics", "Conversion & Analytics"],
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
    paint();
    var boxes = Array.prototype.slice.call(document.querySelectorAll('input[name="symptoms"]:checked'));
    var ids = boxes.map(function (b) {
      return b.value;
    });
    if (!rec) return;
    clear(rec);
    if (!boxes.length) {
      rec.dataset.empty = "true";
      rec.appendChild(
        text(
          "p",
          "",
          "Select at least one symptom. The recommendation stays empty until you do."
        )
      );
      if (mail) mail.href = "mailto:info@supportwellnessglobal.com?subject=" + encodeURIComponent("SWG diagnostic");
      return;
    }
    rec.dataset.empty = "false";
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
      rec.appendChild(
        text(
          "p",
          "",
          "Growth & Optimization ($3k-$8k/month) is optional here. Optional. Not a substitute for the build."
        )
      );
    }
    rec.appendChild(text("p", "muted", "A starting scope, not a quote. " + plan.timeline));
    if (mail) {
      var body =
        "Symptoms: " +
        ids.join(", ") +
        "\nStarting scope: " +
        plan.name +
        " (" +
        plan.price +
        ")\n\nThis preview does not send a form. A starting scope, not a quote.";
      mail.href =
        "mailto:info@supportwellnessglobal.com?subject=" +
        encodeURIComponent("SWG diagnostic") +
        "&body=" +
        encodeURIComponent(body);
    }
  }

  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var ids = Array.prototype.map.call(
      document.querySelectorAll('input[name="symptoms"]:checked'),
      function (b) {
        return "symptom=" + encodeURIComponent(b.value);
      }
    );
    var next = ids.length ? "?" + ids.join("&") : location.pathname;
    history.replaceState(null, "", next);
  }

  document.querySelectorAll('input[name="symptoms"]').forEach(function (box) {
    box.addEventListener("change", function () {
      render();
      syncUrl();
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

  var mark = document.querySelector(".mark");
  if (mark && motion === "playing" && "IntersectionObserver" in window) {
    var armed = false;
    var io = new IntersectionObserver(
      function (entries) {
        var hit = entries[0].isIntersecting;
        if (!hit) {
          armed = true;
          return;
        }
        if (!armed) return;
        mark.classList.remove("is-sweep");
        void mark.offsetWidth;
        mark.classList.add("is-sweep");
      },
      { threshold: 0.55 }
    );
    io.observe(mark);
  }

  var range = document.querySelector(".compare-range");
  var beforePane = document.querySelector(".compare-before");
  if (range && beforePane) {
    var paintCompare = function () {
      beforePane.style.width = range.value + "%";
    };
    range.addEventListener("input", paintCompare);
    paintCompare();
  }

  var layers = {};
  document.querySelectorAll("[data-glow-layer]").forEach(function (layer) {
    layers[layer.getAttribute("data-glow-layer")] = layer;
  });
  var glowTargets = document.querySelectorAll("[data-glow]");
  if (glowTargets.length && "IntersectionObserver" in window) {
    var currentGlow = "blue";
    var applyGlow = function (name) {
      if (!name || name === currentGlow) return;
      currentGlow = name;
      Object.keys(layers).forEach(function (key) {
        layers[key].classList.toggle("is-on", key === name);
      });
    };
    var glowObserver = new IntersectionObserver(
      function (entries) {
        var best = null;
        entries.forEach(function (entry) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        });
        if (best) applyGlow(best.target.getAttribute("data-glow"));
      },
      { threshold: [0.35, 0.6] }
    );
    glowTargets.forEach(function (el) {
      glowObserver.observe(el);
    });
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
    video.addEventListener(
      "playing",
      function () {
        video.classList.add("is-playing");
      },
      { once: true }
    );
    var playAttempt = video.play();
    if (playAttempt && playAttempt.catch) playAttempt.catch(function () {});
  }
  if ("requestIdleCallback" in window) requestIdleCallback(bootVideo, { timeout: 1500 });
  else window.addEventListener("load", bootVideo);

  if (motion === "playing" && fine.matches && !forced.matches) {
    document.querySelectorAll(".button, .button-quiet").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }
})();
