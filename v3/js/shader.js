/* Liquid-metal ribbon. Loaded after first paint. Poster stays if this fails. */
(function () {
  var root = document.documentElement;
  if (root.dataset.motion !== "playing") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var save = navigator.connection && navigator.connection.saveData;
  if (save) return;

  var canvas = document.getElementById("metal-canvas");
  var figure = document.querySelector(".metal");
  var state = document.querySelector("[data-metal-state]");
  if (!canvas || !figure) return;

  var gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return;

  var vsSrc =
    "attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}";
  var fsSrc = [
    "precision mediump float;",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/uRes;",
    "  vec2 p=uv-0.5;",
    "  p.x*=uRes.x/uRes.y;",
    "  float curve=sin(p.x*1.55+uTime*0.18)*0.13;",
    "  float across=(p.y-curve)/0.105;",
    "  float inside=1.0-smoothstep(0.86,1.0,abs(across));",
    "  float nz=sqrt(max(0.0,1.0-across*across));",
    "  vec3 N=normalize(vec3(across,0.08,nz));",
    "  vec3 L=normalize(vec3(-0.25,0.35,0.9));",
    "  float diff=pow(max(dot(N,L),0.0),1.15);",
    "  vec3 H=normalize(L+vec3(0.0,0.0,1.0));",
    "  float spec=pow(max(dot(N,H),0.0),48.0);",
    "  float sweep=pow(max(dot(N,normalize(vec3(sin(uTime*0.45)*0.9,0.15,0.55))),0.0),22.0);",
    "  float edge=smoothstep(0.18,0.0,abs(abs(across)-0.78));",
    "  float brush=0.82+0.18*sin(p.x*80.0+across*4.0);",
    "  vec3 col=vec3(0.03)+vec3(0.5)*diff*brush+vec3(1.0)*spec*1.15+vec3(0.9)*sweep+vec3(edge*0.35);",
    "  float vig=smoothstep(1.35,0.15,length(p));",
    "  col*=inside*vig;",
    "  gl_FragColor=vec4(col,1.0);",
    "}",
  ].join("");

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
    return sh;
  }
  var vs = compile(gl.VERTEX_SHADER, vsSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "a");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  var uRes = gl.getUniformLocation(prog, "uRes");
  var uTime = gl.getUniformLocation(prog, "uTime");

  var running = true;
  var raf = 0;
  var start = performance.now();
  var last = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(2, Math.round(rect.width * dpr));
    var h = Math.max(2, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function frame(now) {
    raf = 0;
    if (!running || document.hidden) return;
    if (now - last < 34) {
      raf = requestAnimationFrame(frame);
      return;
    }
    last = now;
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  }

  function queue() {
    if (!raf && running && !document.hidden) raf = requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        running = entries[0].isIntersecting;
        if (running) queue();
      },
      { threshold: 0.05 }
    );
    io.observe(figure);
  }

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) queue();
  });

  figure.classList.add("is-live");
  if (state) state.textContent = "Live";
  queue();
})();
