/* Desktop only. The W unfolds into the system line. Mobile keeps the vertical list. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  var stage = document.querySelector("[data-map]");
  if (!stage) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 960px)");
  if (reduced.matches || !wide.matches) return;

  gsap.registerPlugin(ScrollTrigger);
  var segs = stage.querySelectorAll(".pose-live .seg");
  var stations = stage.querySelectorAll(".station");
  var fold = [
    [120, 108],
    [360, 372],
    [600, 108],
    [840, 372],
    [1080, 108],
  ];
  var line = [
    [120, 236],
    [360, 236],
    [600, 236],
    [840, 236],
    [1080, 236],
  ];
  var W = 1200;
  var H = 480;
  var proxy = { t: 0 };
  var tween;

  function apply(t) {
    var pts = fold.map(function (p, i) {
      return [p[0] + (line[i][0] - p[0]) * t, p[1] + (line[i][1] - p[1]) * t];
    });
    stations.forEach(function (el, i) {
      el.style.left = (pts[i][0] / W) * 100 + "%";
      el.style.top = (pts[i][1] / H) * 100 + "%";
    });
    segs.forEach(function (seg, i) {
      var a = pts[i];
      var b = pts[i + 1];
      seg.setAttribute("d", "M " + a[0] + " " + a[1] + " L " + b[0] + " " + b[1]);
    });
    stage.classList.toggle("is-flat", t > 0.98);
  }

  function destroy() {
    if (tween) tween.kill();
    ScrollTrigger.getAll().forEach(function (st) {
      st.kill();
    });
    stations.forEach(function (el) {
      el.style.left = "";
      el.style.top = "";
    });
    stage.classList.remove("is-live", "is-flat");
    tween = null;
  }

  function mount() {
    if (reduced.matches || !wide.matches) {
      destroy();
      return;
    }
    if (tween) return;
    stage.classList.add("is-live");
    apply(0);
    tween = gsap.to(proxy, {
      t: 1,
      ease: "none",
      scrollTrigger: {
        trigger: stage,
        start: "top 96%",
        end: "top 46%",
        scrub: true,
        invalidateOnRefresh: true,
      },
      onUpdate: function () {
        apply(proxy.t);
      },
    });
  }

  mount();
  wide.addEventListener("change", function () {
    if (wide.matches) mount();
    else destroy();
  });
  reduced.addEventListener("change", destroy);
  window.__swgMotion = true;
})();
