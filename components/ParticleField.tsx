"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";

/**
 * System A — "The Field" (docs/DESIGN-SYSTEM.md §11).
 *
 * Implementation note: the spec's reference stack is Three.js r18x with
 * WebGPURenderer + TSL node materials, WebGPU -> WebGL2 -> static image
 * as the fallback chain. TSL/WebGPURenderer is still a thin, fast-moving
 * API surface — hand-writing a simulation against it without a way to
 * iterate on a real GPU here is a real correctness risk. This ships the
 * WebGL2 GPGPU path only (the spec's own first fallback), which is the
 * mature, well-tested route through three/examples/jsm and gets the same
 * visual result. A WebGPU/TSL path is a reasonable fast-follow, not a
 * blocker for this pass.
 *
 * Rest shape: the spec's reference concept is a point cloud resolving
 * into a face contour. CLAUDE.md has a standing hard rule against
 * depicting or implying facial scanning (the real sensor is a fingertip
 * capacitive pad) — so this resolves into the K mark instead, sampled
 * from the actual brand asset, then disperses into a sphere. Same
 * "resolves from chaos into identity" beat, no facial-scan implication.
 *
 * No static hero photograph exists to serve as the third fallback rung,
 * so "no WebGL2 / reduced motion" renders nothing here and lets the
 * ambient gradient + grain underneath (see Hero.tsx) stand in for it.
 *
 * Bloom: dropped for this pass. three/examples' UnrealBloomPass hardcodes
 * alpha = 1.0 in its final composite shader, which would make the canvas
 * paint an opaque black rectangle over the section's gradient wherever
 * there's no particle — structurally incompatible with a transparent
 * overlay, not a tuning problem. A real "subtle glow" needs a custom
 * alpha-preserving blur/screen pass; tracked as follow-up, not shipped
 * half-working here.
 */

const INDIGO = new THREE.Color("#313f79");
const PERIWINKLE = new THREE.Color("#8a8db3");
const BLUSH = new THREE.Color("#e8ccd2");

const MARK_SRC = "/images/logo/mark-cream.png";

const DAMPING = 0.94;
const SPRING = 0.02;
const REPULSION_RADIUS_VH = 0.22;
const MORPH_DELAY_MS = 2400;
const MORPH_DURATION_MS = 2200;

// Ashima Arts simplex noise (public domain), plus a curl-noise wrapper
// derived from finite differences of three offset noise channels.
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 curlNoise(vec3 p){
  const float e = 0.1;
  float n1 = snoise(vec3(p.x, p.y + e, p.z));
  float n2 = snoise(vec3(p.x, p.y - e, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + e));
  float n4 = snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z));
  float n6 = snoise(vec3(p.x - e, p.y, p.z));
  float x = (n1 - n2) - (n3 - n4);
  float y = (n3 - n4) - (n5 - n6);
  float z = (n5 - n6) - (n1 - n2);
  return normalize(vec3(x, y, z) + 1e-4) ;
}
`;

// Two dependent passes, both reading only the *previous* frame's state
// (how GPUComputationRenderer resolves dependencies within one compute()
// call — never the value another variable just wrote this frame). So the
// force calculation lives in the velocity pass, and position just
// integrates last frame's velocity; a one-frame lag between the two is
// standard for this kind of leapfrog GPGPU step and isn't visible at
// 60fps.
const POSITION_FRAGMENT = /* glsl */ `
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  gl_FragColor = vec4(pos + vel, 1.0);
}
`;

const VELOCITY_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uDamping;
uniform float uSpring;
uniform float uDriftAmplitude;
uniform float uInfluenceRadius;
uniform float uRepulsionStrength;
uniform vec3 uPointerWorld;
uniform float uPointerActive;
uniform sampler2D textureTargetA;
uniform sampler2D textureTargetB;

${NOISE_GLSL}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  vec3 targetA = texture2D(textureTargetA, uv).xyz;
  vec3 targetB = texture2D(textureTargetB, uv).xyz;
  vec3 target = mix(targetA, targetB, uMorph);

  vec3 restForce = (target - pos) * uSpring;
  vec3 drift = curlNoise(pos * 0.6 + uTime * 0.05) * uDriftAmplitude;

  vec3 repulsion = vec3(0.0);
  if (uPointerActive > 0.5) {
    vec3 toParticle = pos - uPointerWorld;
    float dist = length(toParticle);
    if (dist < uInfluenceRadius && dist > 0.0001) {
      float falloff = 1.0 - dist / uInfluenceRadius;
      float strength = (falloff * falloff) * uRepulsionStrength;
      repulsion = normalize(toParticle) * strength;
    }
  }

  vel = (vel + drift + repulsion + restForce) * uDamping;
  gl_FragColor = vec4(vel, 1.0);
}
`;

const RENDER_VERTEX = /* glsl */ `
uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float uDpr;
varying float vSpeed;
varying float vRadius;

void main() {
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  vSpeed = length(vel) * 40.0;
  vRadius = length(pos.xy);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  // Fixed small on-screen size (no perspective falloff) — the depth
  // range here is a few world units, not enough to warrant it, and an
  // uncalibrated depth-scaled size previously produced ~100px+ circles
  // that fully saturated the frame at 250k points.
  gl_PointSize = mix(1.3, 2.4, clamp(vSpeed, 0.0, 1.0)) * uDpr;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const RENDER_FRAGMENT = /* glsl */ `
uniform vec3 uColorCore;
uniform vec3 uColorBody;
uniform vec3 uColorEdge;
varying float vSpeed;
varying float vRadius;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d) * 0.42;

  float mixFactor = clamp(vRadius * 0.7, 0.0, 1.0);
  vec3 color = mix(uColorCore, uColorBody, mixFactor);
  // Blush only on the fastest, outermost points (~<10% by design).
  float blushMix = smoothstep(0.55, 1.0, vSpeed) * smoothstep(0.6, 1.0, vRadius);
  color = mix(color, uColorEdge, blushMix * 0.85);

  gl_FragColor = vec4(color, alpha);
}
`;

function sampleMarkPositions(
  img: HTMLImageElement,
  count: number,
): Float32Array {
  const size = 220;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const scale = Math.min(size / img.width, size / img.height) * 0.85;
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  const data = ctx.getImageData(0, 0, size, size).data;

  const candidates: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alpha = data[(y * size + x) * 4 + 3];
      if (alpha > 128) candidates.push([x, y]);
    }
  }

  const out = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const [px, py] =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : [size / 2, size / 2];
    const jitter = 1.2;
    const nx = (px / size - 0.5) * 2 + (Math.random() - 0.5) * (jitter / size);
    const ny = -(py / size - 0.5) * 2 + (Math.random() - 0.5) * (jitter / size);
    out[i * 4] = nx * 1.3;
    out[i * 4 + 1] = ny * 1.3;
    out[i * 4 + 2] = (Math.random() - 0.5) * 0.15;
    out[i * 4 + 3] = 1;
  }
  return out;
}

function sphereTargetPositions(count: number, radius: number): Float32Array {
  const out = new Float32Array(count * 4);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out[i * 4] = Math.cos(theta) * r * radius;
    out[i * 4 + 1] = y * radius;
    out[i * 4 + 2] = Math.sin(theta) * r * radius;
    out[i * 4 + 3] = 1;
  }
  return out;
}

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

export default function ParticleField({
  className = "",
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion || !hasWebGL2()) return;

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const particleCount = isDesktop ? 250000 : 60000;
    const texSize = Math.ceil(Math.sqrt(particleCount));

    let disposed = false;
    let rafId: number | null = null;
    let running = false;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    // alpha: true alone doesn't make the clear pass transparent — the
    // clear alpha still defaults to 1 (opaque), which would paint the
    // whole canvas as a solid backdrop over the section's own gradient.
    renderer.setClearColor(0x000000, 0);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(
      container.clientWidth,
      container.clientHeight,
      false,
    );
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.z = 6.5;

    const gpu = new GPUComputationRenderer(texSize, texSize, renderer);
    const dtPosition = gpu.createTexture();
    const dtVelocity = gpu.createTexture();
    const dtTargetA = gpu.createTexture(); // K-mark rest shape
    const dtTargetB = gpu.createTexture(); // sphere rest shape

    // Seed everything with the sphere shape until the mark image loads;
    // avoids a null/garbage-position flash on first paint.
    const seed = sphereTargetPositions(texSize * texSize, 1.4);
    (dtPosition.image.data as Float32Array).set(seed);
    (dtTargetA.image.data as Float32Array).set(seed);
    (dtTargetB.image.data as Float32Array).set(
      sphereTargetPositions(texSize * texSize, 1.6),
    );

    const positionVariable = gpu.addVariable(
      "texturePosition",
      POSITION_FRAGMENT,
      dtPosition,
    );
    const velocityVariable = gpu.addVariable(
      "textureVelocity",
      VELOCITY_FRAGMENT,
      dtVelocity,
    );
    // Both passes depend on both variables' *previous* frame state — see
    // the comment above POSITION_FRAGMENT for why the force calculation
    // lives entirely in the velocity pass.
    gpu.setVariableDependencies(positionVariable, [
      positionVariable,
      velocityVariable,
    ]);
    gpu.setVariableDependencies(velocityVariable, [
      positionVariable,
      velocityVariable,
    ]);

    velocityVariable.material.uniforms.uTime = { value: 0 };
    velocityVariable.material.uniforms.uMorph = { value: 0 };
    velocityVariable.material.uniforms.uDamping = { value: DAMPING };
    velocityVariable.material.uniforms.uSpring = { value: SPRING };
    velocityVariable.material.uniforms.uDriftAmplitude = { value: 0.0009 };
    velocityVariable.material.uniforms.uInfluenceRadius = { value: 0.9 };
    velocityVariable.material.uniforms.uRepulsionStrength = { value: 0.02 };
    velocityVariable.material.uniforms.uPointerWorld = {
      value: new THREE.Vector3(9999, 9999, 0),
    };
    velocityVariable.material.uniforms.uPointerActive = { value: 0 };
    velocityVariable.material.uniforms.textureTargetA = { value: dtTargetA };
    velocityVariable.material.uniforms.textureTargetB = { value: dtTargetB };

    const error = gpu.init();
    if (error !== null) {
      console.error("ParticleField GPGPU init failed:", error);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      return;
    }

    // Load the K mark and rebuild target A once it's decoded.
    const markImg = new Image();
    markImg.crossOrigin = "anonymous";
    markImg.onload = () => {
      if (disposed) return;
      const markPositions = sampleMarkPositions(markImg, texSize * texSize);
      const tex = dtTargetA;
      (tex.image.data as Float32Array).set(markPositions);
      tex.needsUpdate = true;
      const uniform = velocityVariable.material.uniforms.textureTargetA;
      uniform.value = tex;
    };
    markImg.src = MARK_SRC;

    const geometry = new THREE.BufferGeometry();
    const uvs = new Float32Array(texSize * texSize * 2);
    let p = 0;
    for (let y = 0; y < texSize; y++) {
      for (let x = 0; x < texSize; x++) {
        uvs[p++] = x / (texSize - 1);
        uvs[p++] = y / (texSize - 1);
      }
    }
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(texSize * texSize * 3), 3),
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        uDpr: { value: dpr },
        uColorCore: { value: INDIGO },
        uColorBody: { value: PERIWINKLE },
        uColorEdge: { value: BLUSH },
      },
      vertexShader: RENDER_VERTEX,
      fragmentShader: RENDER_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    // The geometry's own `position` attribute is a dummy (real positions
    // come from texturePosition in the vertex shader), so its computed
    // bounding sphere is degenerate — frustum culling against it would
    // incorrectly cull the whole draw call.
    points.frustumCulled = false;
    scene.add(points);

    // Pointer tracking, mapped to the z=0 world plane the field lives on.
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const pointerNDC = new THREE.Vector2(9999, 9999);
    const pointerWorld = new THREE.Vector3();
    let pointerActive = false;

    function onPointerMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerActive = true;
    }
    function onPointerLeave() {
      pointerActive = false;
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    const influenceRadius =
      (REPULSION_RADIUS_VH * window.innerHeight) /
      Math.max(container.clientHeight, 1);
    velocityVariable.material.uniforms.uInfluenceRadius.value =
      influenceRadius * 2.4;

    const startTime = performance.now();
    let morphStarted = false;
    let morphStartTime = 0;

    function resize() {
      const w = container!.clientWidth;
      const h = Math.max(container!.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }

    function frame() {
      if (!running) return;
      const t = (performance.now() - startTime) / 1000;
      velocityVariable.material.uniforms.uTime.value = t;

      if (!morphStarted && t * 1000 > MORPH_DELAY_MS) {
        morphStarted = true;
        morphStartTime = t;
      }
      if (morphStarted) {
        const progress = Math.min(
          1,
          ((t - morphStartTime) * 1000) / MORPH_DURATION_MS,
        );
        // ease-glide-ish (matches --ease-glide intent without importing CSS)
        const eased = 1 - Math.pow(1 - progress, 3);
        velocityVariable.material.uniforms.uMorph.value = eased;
      }

      if (pointerActive) {
        raycaster.setFromCamera(pointerNDC, camera);
        raycaster.ray.intersectPlane(plane, pointerWorld);
        velocityVariable.material.uniforms.uPointerWorld.value.copy(
          pointerWorld,
        );
        velocityVariable.material.uniforms.uPointerActive.value = 1;
      } else {
        velocityVariable.material.uniforms.uPointerActive.value = 0;
      }

      gpu.compute();
      material.uniforms.texturePosition.value =
        gpu.getCurrentRenderTarget(positionVariable).texture;
      material.uniforms.textureVelocity.value =
        gpu.getCurrentRenderTarget(velocityVariable).texture;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(container);

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-auto absolute inset-0 ${className}`}
    />
  );
}
