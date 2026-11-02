"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { afterIntro } from "@/lib/afterIntro";

/*
 * Points of light that gather into a different form for each chapter of
 * the journey: the sparkle from the mark, the fingertip pad, the six
 * cartridges, the dose falling into its dish, and the skin chart. The
 * morph runs entirely in the vertex shader from one scroll value, so a
 * frame costs one draw call. The pointer pushes nearby points aside.
 */

export const SHAPES = 5;

const PERI = new THREE.Color(0x8a8db3);
const BLUSH = new THREE.Color(0xe8ccd2);
const WHITE = new THREE.Color(0xffffff);
const INDIGO_HI = new THREE.Color(0x5a63b0);

// Deterministic random, so every visit draws the same forms.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Gen = (r: () => number, out: Float32Array, n: number) => void;
const put = (o: Float32Array, i: number, x: number, y: number, z: number) => {
  o[i * 3] = x;
  o[i * 3 + 1] = y;
  o[i * 3 + 2] = z;
};
const gauss = (r: () => number) =>
  Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

// 0. The four-point sparkle (an astroid), dense at its edges.
const sparkle: Gen = (r, o, n) => {
  const R = 2.7;
  for (let i = 0; i < n; i++) {
    if (i % 9 === 0) {
      // a faint halo of loose points
      const a = r() * Math.PI * 2;
      const d = R * (0.4 + r() * 0.9);
      put(o, i, Math.cos(a) * d, Math.sin(a) * d, gauss(r) * 0.6);
      continue;
    }
    const t = r() * Math.PI * 2;
    const c = Math.abs(Math.cos(t));
    const s = Math.abs(Math.sin(t));
    const rmax = R / Math.pow(Math.pow(c, 0.45) + Math.pow(s, 0.45), 1 / 0.45);
    const d = rmax * Math.pow(r(), 0.3);
    put(o, i, Math.cos(t) * d, Math.sin(t) * d, gauss(r) * 0.12 * (1 - d / R));
  }
};

// 1. The fingertip pad: two half-disc electrodes inside rings of signal.
const pad: Gen = (r, o, n) => {
  const tilt = -1.0;
  for (let i = 0; i < n; i++) {
    let x: number, y: number;
    if (i % 3 === 0) {
      // electrodes, with a gap down the middle
      const a = r() * Math.PI * 2;
      const d = 1.0 * Math.sqrt(r());
      x = Math.cos(a) * d;
      y = Math.sin(a) * d;
      x += Math.sign(x || 1) * 0.07;
    } else {
      const k = 1 + Math.floor(r() * 5);
      const a = r() * Math.PI * 2;
      const d = 1.0 + k * 0.34 + gauss(r) * 0.025;
      x = Math.cos(a) * d;
      y = Math.sin(a) * d;
    }
    // lay it on a surface tilted toward the viewer
    const z = gauss(r) * 0.03;
    put(o, i, x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt));
  }
};

// 2. Six cartridges: three tall bases, three short actives.
const cartridges: Gen = (r, o, n) => {
  const cols = [
    { x: -2.35, h: 3.0, rad: 0.36 },
    { x: -1.45, h: 3.0, rad: 0.36 },
    { x: -0.55, h: 3.0, rad: 0.36 },
    { x: 0.45, h: 1.9, rad: 0.24 },
    { x: 1.2, h: 1.9, rad: 0.24 },
    { x: 1.95, h: 1.9, rad: 0.24 },
  ];
  const floor = -1.6;
  for (let i = 0; i < n; i++) {
    const c = cols[i % 6];
    const a = r() * Math.PI * 2;
    const u = r();
    if (u < 0.12) {
      // cap
      const d = c.rad * 0.7 * Math.sqrt(r());
      put(o, i, c.x + Math.cos(a) * d, floor + c.h + 0.12, Math.sin(a) * d);
    } else if (u < 0.55) {
      // liquid inside, filled to 75%
      const d = c.rad * 0.85 * Math.sqrt(r());
      put(o, i, c.x + Math.cos(a) * d, floor + r() * c.h * 0.75, Math.sin(a) * d);
    } else {
      // the bottle wall
      put(o, i, c.x + Math.cos(a) * c.rad, floor + r() * c.h, Math.sin(a) * c.rad);
    }
  }
};

// 3. A drop falling from the nozzle into a shallow dish.
const dose: Gen = (r, o, n) => {
  for (let i = 0; i < n; i++) {
    const u = r();
    const a = r() * Math.PI * 2;
    if (u < 0.3) {
      // teardrop: round below, pointed above
      const t = r();
      const y = 1.9 - t * 1.3;
      const rad = 0.42 * Math.sin(Math.PI * Math.pow(t, 0.7)) * Math.sqrt(r());
      put(o, i, Math.cos(a) * rad, y, Math.sin(a) * rad);
    } else if (u < 0.42) {
      // the stream below it
      put(o, i, gauss(r) * 0.03, 0.55 - r() * 2.0, gauss(r) * 0.03);
    } else if (u < 0.82) {
      // the dish: low and wide, its wall curving up to a lip
      const t = r();
      const rad = 0.5 + t * 1.1;
      put(o, i, Math.cos(a) * rad, -1.85 + t * t * 0.5, Math.sin(a) * rad);
    } else {
      // the dose, a shallow pool in the middle of the dish
      const d = 0.95 * Math.sqrt(r());
      put(o, i, Math.cos(a) * d, -1.72 + r() * 0.08, Math.sin(a) * d);
    }
  }
};

// 4. The skin chart: a run of stars, joined into a trend.
const chart: Gen = (r, o, n) => {
  const nodes: [number, number][] = [];
  for (let k = 0; k < 18; k++) {
    const x = -3 + (k / 17) * 6;
    nodes.push([x, Math.sin(k * 0.7) * 0.8 + Math.sin(k * 1.9) * 0.3]);
  }
  for (let i = 0; i < n; i++) {
    const u = r();
    if (u < 0.45) {
      const [x, y] = nodes[Math.floor(r() * nodes.length)];
      const s = 0.07;
      put(o, i, x + gauss(r) * s, y + gauss(r) * s, gauss(r) * s);
    } else if (u < 0.85) {
      const k = Math.floor(r() * (nodes.length - 1));
      const t = r();
      const [x0, y0] = nodes[k];
      const [x1, y1] = nodes[k + 1];
      put(o, i, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, gauss(r) * 0.02);
    } else {
      // the rest of the sky
      put(o, i, (r() - 0.5) * 8, (r() - 0.5) * 4.5, (r() - 0.5) * 2);
    }
  }
};

const GENS: Gen[] = [sparkle, pad, cartridges, dose, chart];

const VERT = /* glsl */ `
  attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
  attribute vec3 aColor; attribute float aSize; attribute float aRand;
  uniform float uMorph; uniform float uTime; uniform float uPx;
  uniform vec2 uMouse; uniform float uAspect;
  varying vec3 vColor; varying float vGlow;

  vec3 pick(float k) {
    if (k < 0.5) return p0;
    if (k < 1.5) return p1;
    if (k < 2.5) return p2;
    if (k < 3.5) return p3;
    return p4;
  }

  void main() {
    float i = floor(uMorph);
    float f = uMorph - i;
    // each point leaves at its own moment, so forms dissolve rather than slide
    float s = aRand * 0.4;
    float e = clamp((f - s) / 0.6, 0.0, 1.0);
    e = e * e * (3.0 - 2.0 * e);
    vec3 a = pick(i);
    vec3 b = pick(min(i + 1.0, 4.0));
    vec3 p = mix(a, b, e);
    // swirl outward mid-flight
    float arc = sin(e * 3.14159);
    p += normalize(vec3(-p.y, p.x, aRand - 0.5) + 1e-4) * arc * (0.6 + aRand);
    // imperceptible drift at rest
    p += 0.035 * vec3(sin(uTime * 0.6 + aRand * 30.0), cos(uTime * 0.5 + aRand * 17.0), sin(uTime * 0.4 + aRand * 9.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    // the pointer pushes nearby points aside and lights them
    vec2 ndc = gl_Position.xy / gl_Position.w;
    vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
    float near = smoothstep(0.32, 0.0, length(d));
    ndc += normalize(d + 1e-4) * near * 0.07 / vec2(uAspect, 1.0);
    gl_Position.xy = ndc * gl_Position.w;

    vColor = aColor;
    vGlow = near + arc * 0.4;
    float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + aRand * 2.0) + aRand * 40.0);
    gl_PointSize = aSize * uPx * twinkle * (1.0 + near * 0.8) * (9.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor; varying float vGlow;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = smoothstep(0.5, 0.0, d);
    float a = core * core * 0.85 + smoothstep(0.12, 0.0, d) * 0.6;
    vec3 col = mix(vColor, vec3(1.0), smoothstep(0.18, 0.0, d) * 0.6 + vGlow * 0.3);
    gl_FragColor = vec4(col, a);
  }
`;

export default function ParticleSculpture({
  morph,
  offset,
  className = "",
}: {
  /** 0 to SHAPES-1: which form, fractional while moving between two. */
  morph: MotionValue<number>;
  /** where the form sits, in model units [x, y], and its scale */
  offset: MotionValue<number[]>;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const cancel = afterIntro(() => {
      cleanup = init();
    });
    return () => {
      cancel();
      cleanup?.();
    };

    function init() {
      const el = ref.current;
      if (!el) return;
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      } catch {
        return;
      }
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.domElement.style.cssText =
        "width:100%;height:100%;opacity:0;transition:opacity 1200ms cubic-bezier(.16,1,.3,1)";
      el.appendChild(renderer.domElement);

      const small = window.innerWidth < 768;
      const N = small ? 3200 : 5600;
      const geo = new THREE.BufferGeometry();
      GENS.forEach((gen, k) => {
        const arr = new Float32Array(N * 3);
        gen(rng(11 + k * 97), arr, N);
        geo.setAttribute(`p${k}`, new THREE.BufferAttribute(arr, 3));
      });
      geo.setAttribute("position", geo.getAttribute("p0"));
      const col = new Float32Array(N * 3);
      const size = new Float32Array(N);
      const rand = new Float32Array(N);
      const r = rng(5);
      const c = new THREE.Color();
      for (let i = 0; i < N; i++) {
        const u = r();
        c.copy(u < 0.45 ? PERI : u < 0.7 ? BLUSH : u < 0.9 ? WHITE : INDIGO_HI);
        c.toArray(col, i * 3);
        size[i] = 0.8 + Math.pow(r(), 3) * 2.6;
        rand[i] = r();
      }
      geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uPx: { value: dpr * (small ? 3.6 : 4.4) },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uAspect: { value: 1 },
        },
      });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      const scene = new THREE.Scene();
      scene.add(points);
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 13);

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        mat.uniforms.uAspect.value = w / h;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const mouse = new THREE.Vector2(9, 9);
      const onMove = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        mouse.set(
          ((e.clientX - b.left) / b.width) * 2 - 1,
          -((e.clientY - b.top) / b.height) * 2 + 1,
        );
      };
      const onLeave = () => mouse.set(9, 9);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);

      const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      let raf = 0;
      let visible = false;
      const frame = () => {
        const t = clock.getElapsedTime();
        const m = morph.get();
        const [ox, oy, sc] = offset.get();
        mat.uniforms.uMorph.value = m;
        mat.uniforms.uTime.value = still ? 0 : t;
        (mat.uniforms.uMouse.value as THREE.Vector2).lerp(mouse, 0.12);
        points.position.set(ox, oy, 0);
        points.scale.setScalar(sc);
        points.rotation.y = still ? 0 : Math.sin(t * 0.15) * 0.22;
        points.rotation.x = still ? 0 : Math.sin(t * 0.11) * 0.08;
        renderer.render(scene, camera);
      };
      const loop = () => {
        frame();
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(loop);
      });
      io.observe(el);
      frame();
      renderer.domElement.style.opacity = "1";

      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
  }, [morph, offset]);

  return <div ref={ref} aria-hidden="true" className={className} />;
}
