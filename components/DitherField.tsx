"use client";

import { useEffect, useRef } from "react";

/*
 * A living background drawn as a grid of small dithered cells: a slow
 * nebula of brand colour drifts underneath, a few cells twinkle like
 * stars, and moving the pointer leaves ripples that spread through the
 * grid (blush at the crest). Plain WebGL, one fragment shader, no
 * library. Reference: kat's picks of pixel-grid, dithered "living"
 * backgrounds (godly.design posts 608 and 615).
 *
 * Reduced motion: one still frame, no ripples. No WebGL: renders nothing.
 * Pauses off-screen and while the intro covers the page.
 */

const MAX_RIPPLES = 10;

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uCell;
uniform float uDensity;
uniform vec2 uMouse;
uniform vec3 uRip[${MAX_RIPPLES}];

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
// 4x4 ordered-dither threshold, 0..1
float bayer(vec2 c) {
  vec2 m = mod(c, 4.0);
  float x = m.x, y = m.y;
  float b = 0.0;
  if (y < 1.0) b = x < 1.0 ? 0.0 : x < 2.0 ? 8.0 : x < 3.0 ? 2.0 : 10.0;
  else if (y < 2.0) b = x < 1.0 ? 12.0 : x < 2.0 ? 4.0 : x < 3.0 ? 14.0 : 6.0;
  else if (y < 3.0) b = x < 1.0 ? 3.0 : x < 2.0 ? 11.0 : x < 3.0 ? 1.0 : 9.0;
  else b = x < 1.0 ? 15.0 : x < 2.0 ? 7.0 : x < 3.0 ? 13.0 : 5.0;
  return (b + 0.5) / 16.0;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(frag / uCell);
  vec2 c = (cell + 0.5) * uCell;
  vec2 local = fract(frag / uCell);

  // Drifting nebula, domain-warped so it folds slowly like a tide.
  vec2 p = c / uRes.y * 2.4;
  float t = uTime * 0.035;
  vec2 w = vec2(fbm(p * 1.2 + vec2(t, 0.0)), fbm(p * 1.2 + vec2(4.0, -t)));
  float n = fbm(p + 1.4 * w + vec2(-t * 0.6, t * 0.3));
  float neb = smoothstep(0.42, 0.82, n) * uDensity;

  // Ripples from the pointer: rings that travel out and fade.
  float rip = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec3 r = uRip[i];
    float age = uTime - r.z;
    if (r.z < 0.0 || age < 0.0 || age > 3.2) continue;
    float d = length(c - r.xy) / uCell;
    float rad = age * 16.0;
    float ring = exp(-pow(d - rad, 2.0) / 2.2);
    rip += ring * pow(1.0 - age / 3.2, 1.6) * 0.9;
  }

  // A soft lift around the pointer itself.
  float glow = 0.0;
  if (uMouse.x > -1.0) {
    float md = length(c - uMouse) / uCell;
    glow = exp(-md * md / 70.0) * 0.45;
  }

  float val = neb * 0.75 + rip + glow;
  float q = floor(clamp(val, 0.0, 1.0) * 3.0 + bayer(cell));

  // Points of light: a few cells breathe on their own.
  float h = hash(cell + 7.0);
  float star = 0.0;
  if (h > 0.9988) star = 0.5 + 0.5 * sin(uTime * (0.6 + h * 1.5) + h * 40.0);

  // Each cell is a small rounded square with a gap around it.
  vec2 e = abs(local - 0.5) - 0.24;
  float shape = 1.0 - smoothstep(0.1, 0.16, length(max(e, 0.0)));

  vec3 indigo = vec3(0.192, 0.247, 0.475);
  vec3 peri = vec3(0.541, 0.553, 0.702);
  vec3 blush = vec3(0.910, 0.800, 0.824);
  vec3 col = indigo; float a = 0.0;
  if (q >= 3.0) { col = vec3(0.93, 0.92, 0.97); a = 0.5; }
  else if (q >= 2.0) { col = peri; a = 0.42; }
  else if (q >= 1.0) { col = indigo; a = 0.55; }
  if (q >= 1.0 && rip > max(neb * 0.75, glow) && rip > 0.3) { col = blush; a = max(a, 0.55); }
  if (star > 0.0 && q < 1.0) { col = peri; a = star * 0.55; }
  if (star > 0.9) { col = vec3(1.0); a = 0.7; }

  // stars are smaller than the grid cells: a point, not a tile
  float dotShape = 1.0 - smoothstep(0.12, 0.2, length(local - 0.5));
  a *= (star > 0.0 && q < 1.0) ? dotShape : shape;
  gl_FragColor = vec4(col * a, a);
}
`;


// "aura": a soft glowing form that folds and breathes, navy at the edge
// through indigo and periwinkle to a blush core, with live film grain and
// a faint vertical smear. Leans toward the pointer. Reference: kat's
// Pryzm background clip.
const AURA = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uCell;
uniform float uDensity;
uniform vec2 uMouse;
uniform vec2 uCenter;
uniform vec3 uRip[${MAX_RIPPLES}];

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  float t = uTime * 0.12;
  vec2 p = (frag - uCenter) / min(uRes.y, uRes.x * 1.25);
  // faint vertical smear, like light dragged down glass
  p.x += (noise(vec2(frag.x / uRes.y * 60.0, t * 0.5)) - 0.5) * 0.006;

  vec2 q = p + 0.32 * vec2(fbm(p * 1.6 + vec2(t, 0.0)) - 0.5,
                           fbm(p * 1.6 + vec2(3.0, -t)) - 0.5);
  q += 0.12 * vec2(sin(t * 0.7), cos(t * 0.5));
  float d = length(q * vec2(1.0, 0.92));
  float form = 1.0 - smoothstep(0.05, 0.62, d + 0.22 * (fbm(q * 2.4 - t) - 0.5));

  // the bright core wanders inside the form
  vec2 cq = q - 0.14 * vec2(sin(t * 1.1 + 1.0), cos(t * 0.8));
  float core = 1.0 - smoothstep(0.0, 0.26, length(cq * vec2(1.0, 1.3)));

  // pointer clicks: a gentle bloom
  float pulse = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec3 r = uRip[i];
    float age = uTime - r.z;
    if (r.z < 0.0 || age < 0.0 || age > 2.0) continue;
    pulse += (1.0 - age / 2.0) * age * 2.0 * exp(-age * 2.0);
  }
  form = clamp(form * (uDensity + 0.25 * pulse), 0.0, 1.0);

  vec3 midnight = vec3(0.122, 0.141, 0.255);
  vec3 indigo = vec3(0.192, 0.247, 0.475);
  vec3 indigoHi = vec3(0.27, 0.34, 0.66);
  vec3 peri = vec3(0.62, 0.64, 0.80);
  vec3 blush = vec3(0.93, 0.83, 0.86);
  vec3 col = mix(midnight, indigo, smoothstep(0.0, 0.3, form));
  col = mix(col, indigoHi, smoothstep(0.25, 0.55, form));
  col = mix(col, peri, smoothstep(0.5, 0.85, form));
  col = mix(col, blush, core * smoothstep(0.55, 0.95, form) * 0.9);

  float a = smoothstep(0.0, 0.35, form);
  // live grain over everything, a touch stronger in the light
  float g = hash(frag + floor(uTime * 24.0) * 13.7) - 0.5;
  col += g * (0.05 + 0.05 * form);
  a = max(a, 0.06);
  gl_FragColor = vec4(col * a, a);
}
`;

export default function DitherField({
  className = "",
  cell = 9,
  density = 1,
  variant = "grid",
  center = [0.5, 0.5],
}: {
  /** "grid": dithered cells. "aura": a soft glowing form with grain. */
  variant?: "grid" | "aura";
  /** Where the aura sits, as fractions of width and height. */
  center?: [number, number];
  className?: string;
  /** Cell size in CSS pixels. */
  cell?: number;
  /** 0..1, how much of the nebula shows. */
  density?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [cx, cy] = center;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, variant === "aura" ? AURA : FRAG);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes");
    const uTime = u("uTime");
    const uCell = u("uCell");
    const uDensity = u("uDensity");
    const uMouse = u("uMouse");
    const uRip = u("uRip");
    const uCenter = u("uCenter");
    // The aura leans a little toward the pointer, smoothed.
    const lean = { x: 0, y: 0 };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ripples = new Float32Array(MAX_RIPPLES * 3).fill(-1);
    let ripIdx = 0;
    const mouse = { x: -10, y: -10 };
    let lastRip = { x: -1e4, y: -1e4, t: -10 };
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;

    function resize() {
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      if (!w || !h) return;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw();
    });
    ro.observe(canvas);

    function draw() {
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, still ? 12 : now());
      gl!.uniform1f(uCell, cell * dpr);
      gl!.uniform1f(uDensity, density);
      gl!.uniform2f(uMouse, mouse.x, mouse.y);
      gl!.uniform3fv(uRip, ripples);
      const W = canvas!.width;
      const H = canvas!.height;
      const tx = mouse.x > -1 ? (mouse.x - W * cx) * 0.08 : 0;
      const ty = mouse.y > -1 ? (mouse.y - H * cy) * 0.08 : 0;
      lean.x += (tx - lean.x) * 0.04;
      lean.y += (ty - lean.y) * 0.04;
      gl!.uniform2f(uCenter, W * cx + lean.x, H * cy + lean.y);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    const addRipple = (x: number, y: number) => {
      ripples.set([x, y, now()], ripIdx * 3);
      ripIdx = (ripIdx + 1) % MAX_RIPPLES;
    };
    const local = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * dpr,
        y: (e.clientY - r.top) * dpr,
        inside:
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom,
      };
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (!p.inside) {
        mouse.x = mouse.y = -10;
        return;
      }
      mouse.x = p.x;
      mouse.y = p.y;
      // A wake: a new ripple every so often as the pointer travels.
      const t = now();
      const dist = Math.hypot(p.x - lastRip.x, p.y - lastRip.y);
      if (dist > 140 * dpr && t - lastRip.t > 0.18) {
        addRipple(p.x, p.y);
        lastRip = { x: p.x, y: p.y, t };
      }
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      if (p.inside) addRipple(p.x, p.y);
    };
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
    }

    let raf = 0;
    let visible = true;
    const loop = () => {
      if (document.documentElement.dataset.gate !== "open") draw();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !still) raf = requestAnimationFrame(loop);
      else if (visible) draw();
    });
    io.observe(canvas);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [cell, density, variant, cx, cy]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none block h-full w-full ${className}`}
    />
  );
}
