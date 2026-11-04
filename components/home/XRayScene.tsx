"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { createQualityGovernor } from "@/lib/adaptiveQuality";
import { afterIntro } from "@/lib/afterIntro";
import { tintHex } from "@/lib/tints";
import {
  buildDevice,
  enqueueBuild,
  studioEnvironment,
  FRONT,
  TOP_Y,
} from "@/components/home/DeviceModel";

/*
 * The x-ray film: the real device model, its shell turned to a glowing
 * ghost, with the internals the spec describes drawn in (one pump and one
 * tube per cartridge, running to the six-tip nozzle over the dish). A
 * scroll-driven camera flies pad -> cartridges -> pumps -> dish.
 * `progress` (0-1) is the only input; everything is derived from it.
 */

// Cartridge x positions and the six nozzle tips, matching buildDevice.
const CART_X = [-0.98, -0.52, -0.06, 0.36, 0.66, 0.96];
const CODES = ["B-01", "B-02", "B-03", "A-01", "A-02", "A-03"] as const;
const PAD = { x: 0.68, z: 0.02 };
const CUP = { x: 0.62, z: FRONT + 0.22, floor: -0.905 };
const NOZZLE_Y = -0.52;

// Scroll timeline (fractions of the section).
export const PUMP_START = 0.42;
export const PUMP_EACH = 0.055;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const span = (p: number, a: number, b: number) => smooth((p - a) / (b - a));

type Shot = { p: number; pos: [number, number, number]; tgt: [number, number, number] };
const SHOTS: Shot[] = [
  { p: 0.0, pos: [3.6, 1.7, 7.2], tgt: [0, -0.05, 0] },
  { p: 0.08, pos: [3.0, 1.5, 6.2], tgt: [0, -0.05, 0] },
  { p: 0.16, pos: [2.3, 3.4, 3.3], tgt: [0.5, 1.0, 0.1] },
  { p: 0.24, pos: [2.0, 3.1, 2.9], tgt: [0.55, 1.0, 0.1] },
  { p: 0.32, pos: [0.1, 0.55, 3.9], tgt: [0, 0.2, 0.3] },
  { p: 0.4, pos: [-0.2, 0.3, 3.6], tgt: [0, 0.0, 0.3] },
  { p: 0.5, pos: [-1.2, -0.25, 3.3], tgt: [0.0, -0.45, 0.4] },
  { p: 0.62, pos: [1.9, -0.1, 3.1], tgt: [0.4, -0.55, 0.6] },
  { p: 0.74, pos: [1.6, -0.4, 2.45], tgt: [0.62, -0.72, 1.05] },
  { p: 0.86, pos: [1.35, -0.45, 2.25], tgt: [0.62, -0.78, 1.07] },
  { p: 1.0, pos: [-3.2, 1.3, 6.8], tgt: [0, -0.05, 0] },
];

function shotAt(p: number, pos: THREE.Vector3, tgt: THREE.Vector3) {
  let i = 0;
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1].p) i++;
  const a = SHOTS[i];
  const b = SHOTS[i + 1];
  const t = smooth((p - a.p) / (b.p - a.p));
  pos.set(...a.pos).lerp(new THREE.Vector3(...b.pos), t);
  tgt.set(...a.tgt).lerp(new THREE.Vector3(...b.tgt), t);
}

const ghostVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const ghostFrag = /* glsl */ `
  uniform float uAmt; uniform vec3 uColor;
  varying vec3 vN; varying vec3 vV;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
    gl_FragColor = vec4(uColor * (0.25 + f * 1.4), (0.025 + f * 0.5) * uAmt);
  }`;
const flowVert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const flowFrag = /* glsl */ `
  uniform float uFill; uniform float uTime; uniform float uOn; uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    if (vUv.x > uFill) discard;
    float pulse = 0.5 + 0.5 * sin((vUv.x * 40.0 - uTime * 9.0));
    float head = smoothstep(uFill - 0.08, uFill, vUv.x);
    vec3 c = uColor * (0.85 + 0.35 * pulse * uOn + head * 0.8 * uOn);
    gl_FragColor = vec4(c, 0.55 + 0.45 * uOn);
  }`;

// A soft round sprite, for every point of light in the film.
function glowSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.25, "rgba(255,255,255,0.55)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// A fingertip: lathe-turned with a rounded pad and a gentle taper, a
// little flatter front to back, with a glossy nail on the back.
function buildFinger(track: <T extends { dispose(): void }>(x: T) => T) {
  const g = new THREE.Group();
  const prof = [
    [0, 0],
    [0.035, 0.004],
    [0.064, 0.018],
    [0.086, 0.044],
    [0.1, 0.085],
    [0.106, 0.14],
    [0.107, 0.24],
    [0.104, 0.34],
    [0.108, 0.42], // the first knuckle, a slight swell
    [0.113, 0.5],
    [0.116, 0.7],
    [0.12, 1.1],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const skin = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xd8aa9b,
      roughness: 0.52,
      sheen: 0.7,
      sheenColor: new THREE.Color(0xffd9cf),
      sheenRoughness: 0.55,
      clearcoat: 0.12,
      clearcoatRoughness: 0.6,
      emissive: 0x5a1e18,
      emissiveIntensity: 0.1, // light passing through skin
    }),
  );
  const body = new THREE.Mesh(track(new THREE.LatheGeometry(prof, 64)), skin);
  body.scale.z = 0.86;
  g.add(body);
  // Nail: a thin curved shell cut from a sphere, on the back (+x).
  const nail = new THREE.Mesh(
    // phi centred on +x; a band either side of the equator, stretched tall.
    track(new THREE.SphereGeometry(0.105, 32, 16, Math.PI - 0.8, 1.6, 1.25, 0.64)),
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xf2cfc6,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
    ),
  );
  nail.scale.set(1.035, 2.3, 0.9);
  nail.position.set(0, 0.16, 0);
  g.add(nail);
  // A faint crease at the knuckle.
  const crease = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.108, 0.0025, 6, 48, Math.PI * 0.7)),
    track(new THREE.MeshStandardMaterial({ color: 0xb88676, roughness: 0.8 })),
  );
  crease.rotation.set(Math.PI / 2, 0, -Math.PI * 0.35);
  crease.position.y = 0.42;
  crease.scale.set(1.02, 0.88, 1);
  g.add(crease);
  return g;
}

export default function XRayScene({
  progress,
  className = "",
  onUnsupported,
}: {
  progress: MotionValue<number>;
  className?: string;
  onUnsupported?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancel = () => {};
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        cancel = afterIntro(() => {
          let cancelled = false;
          enqueueBuild(() => {
            if (!cancelled) cleanup = init();
          });
          const prev = cancel;
          cancel = () => {
            prev();
            cancelled = true;
          };
        });
      },
      { rootMargin: "150% 0px" },
    );
    if (ref.current) near.observe(ref.current);
    return () => {
      near.disconnect();
      cancel();
      cleanup?.();
    };

    function init(): (() => void) | undefined {
      const container = ref.current;
      if (!container) return;
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        onUnsupported?.();
        return;
      }
      const maxRatio = Math.min(window.devicePixelRatio, 1.5);
      renderer.setPixelRatio(maxRatio);
      renderer.transmissionResolutionScale = 0.5;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const el = renderer.domElement;
      el.style.width = "100%";
      el.style.height = "100%";
      el.setAttribute("aria-hidden", "true");
      el.style.opacity = "0";
      el.style.transition = "opacity 900ms cubic-bezier(.16,1,.3,1)";
      container.appendChild(el);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const studio = studioEnvironment();
      const envTex = pmrem.fromScene(studio.scene, 0.02).texture;
      studio.dispose();
      scene.environment = envTex;
      scene.background = new THREE.Color(0x15182e);
      scene.fog = new THREE.Fog(0x15182e, 9, 16);
      scene.add(new THREE.HemisphereLight(0xdfe3ff, 0x1f2441, 0.3));
      const key = new THREE.DirectionalLight(0xfff8f4, 2.2);
      key.position.set(-2.5, 8, 3.5);
      scene.add(key);
      const rim = new THREE.PointLight(0xe8ccd2, 12, 12);
      rim.position.set(4, 0.5, -1.5);
      scene.add(rim);

      const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
      const own: { dispose(): void }[] = [];
      const track = <T extends { dispose(): void }>(x: T) => (own.push(x), x);

      const { group, disposables, doseMat, streamMat } = buildDevice();
      scene.add(group);

      // ---- Ghost shell: everything but the cartridges, dish and dose.
      const ghostMat = track(
        new THREE.ShaderMaterial({
          vertexShader: ghostVert,
          fragmentShader: ghostFrag,
          uniforms: { uAmt: { value: 0 }, uColor: { value: new THREE.Color(0x9da2e0) } },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        }),
      );
      const solids: { mesh: THREE.Mesh; mat: THREE.Material & { opacity: number; transparent: boolean } }[] = [];
      const cartGroups: THREE.Group[] = [];
      group.children.slice().forEach((c) => {
        if (c.userData.layer === "cartridges" && (c as THREE.Group).isGroup) {
          cartGroups.push(c as THREE.Group);
          return;
        }
        const mesh = c as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.Material & { opacity: number; transparent: boolean };
        if (mat === doseMat || mat === streamMat) return;
        if (mesh.geometry.type === "LatheGeometry") return; // the dish
        const ghost = new THREE.Mesh(mesh.geometry, ghostMat);
        ghost.position.copy(mesh.position);
        ghost.rotation.copy(mesh.rotation);
        ghost.scale.copy(mesh.scale);
        ghost.renderOrder = 10;
        group.add(ghost);
        mat.transparent = true;
        mat.needsUpdate = true;
        solids.push({ mesh, mat });
      });

      // ---- Internals: pumps and tubes, one per cartridge.
      const pumpMat = track(new THREE.MeshPhysicalMaterial({ color: 0x2b3160, metalness: 0.5, roughness: 0.3, clearcoat: 0.6 }));
      const rotorMat = track(new THREE.MeshStandardMaterial({ color: 0xb8bce6, metalness: 0.8, roughness: 0.3 }));
      const tubeMat = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false }));
      const pumpG = track(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 32));
      const rotorG = track(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 12));
      const dropG = track(new THREE.SphereGeometry(0.018, 16, 12));
      const internals = new THREE.Group();
      group.add(internals);
      const lines = CART_X.map((x, i) => {
        const tint = new THREE.Color(tintHex(CODES[i]));
        const tip = CUP.x - 0.05 + (i % 3) * 0.05;
        const tipZ = CUP.z + (i < 3 ? -0.025 : 0.025);
        const pumpPos = new THREE.Vector3(x, -0.5, 0.22);
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, -0.14, 0.32),
          new THREE.Vector3(x, -0.36, 0.3),
          pumpPos.clone(),
          new THREE.Vector3(x * 0.55 + CUP.x * 0.45, -0.7, 0.62),
          new THREE.Vector3(tip, -0.62, CUP.z - 0.12),
          new THREE.Vector3(tip, -0.47, tipZ),
          new THREE.Vector3(tip, NOZZLE_Y, tipZ),
        ]);
        const geo = track(new THREE.TubeGeometry(curve, 120, 0.011, 8, false));
        internals.add(new THREE.Mesh(geo, tubeMat));
        const flowMat = track(
          new THREE.ShaderMaterial({
            vertexShader: flowVert,
            fragmentShader: flowFrag,
            uniforms: { uFill: { value: 0 }, uTime: { value: 0 }, uOn: { value: 0 }, uColor: { value: tint } },
            transparent: true,
            depthWrite: false,
            toneMapped: false,
          }),
        );
        const flowGeo = track(new THREE.TubeGeometry(curve, 160, 0.014, 10, false));
        const flow = new THREE.Mesh(flowGeo, flowMat);
        flow.renderOrder = 5;
        internals.add(flow);
        const pump = new THREE.Mesh(pumpG, pumpMat);
        pump.rotation.x = Math.PI / 2;
        pump.position.copy(pumpPos);
        internals.add(pump);
        const rotor = new THREE.Group();
        rotor.position.copy(pumpPos).add(new THREE.Vector3(0, 0, 0.032));
        // Peristaltic rollers: three small wheels on a turning hub.
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * Math.PI * 2;
          const r = new THREE.Mesh(rotorG, rotorMat);
          r.rotation.x = Math.PI / 2;
          r.position.set(Math.cos(a) * 0.042, Math.sin(a) * 0.042, 0);
          rotor.add(r);
        }
        internals.add(rotor);
        const dropMat = track(new THREE.MeshBasicMaterial({ color: tint, toneMapped: false, transparent: true }));
        const drop = new THREE.Mesh(dropG, dropMat);
        drop.position.set(tip, NOZZLE_Y, tipZ);
        drop.visible = false;
        internals.add(drop);
        return { flowMat, rotor, drop, tip, tipZ };
      });

      // Cartridge liquids, to glow while their pump runs.
      const liquids = cartGroups.map((g) => g.children[1] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>);
      const dose = group.children.find(
        (c) => (c as THREE.Mesh).isMesh && (c as THREE.Mesh).material === doseMat,
      ) as THREE.Mesh | undefined;

      // ---- Fingertip and the pad's glow.
      const sprite = track(glowSprite());
      const finger = buildFinger(track);
      // Comes in from the upper left, nail toward the camera.
      finger.rotation.set(0.25, 0, 0.55);
      const fingerAxis = new THREE.Vector3(0, 1, 0).applyEuler(finger.rotation);
      const fingerKey = new THREE.PointLight(0xffe2da, 0, 1.6);
      scene.add(finger, fingerKey);
      const padGlowMat = track(
        new THREE.MeshBasicMaterial({ map: sprite, color: new THREE.Color(0xe8ccd2).multiplyScalar(2.2), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      const padGlow = new THREE.Mesh(track(new THREE.PlaneGeometry(0.9, 0.9)), padGlowMat);
      padGlow.rotation.x = -Math.PI / 2;
      padGlow.position.set(PAD.x, TOP_Y + 0.01, PAD.z);
      group.add(padGlow);
      const padLight = new THREE.PointLight(0xe8ccd2, 0, 2);
      padLight.position.set(PAD.x, TOP_Y + 0.25, PAD.z);
      group.add(padLight);
      const dishLight = new THREE.PointLight(0xe8ccd2, 0, 2);
      dishLight.position.set(CUP.x, -0.6, CUP.z + 0.3);
      group.add(dishLight);

      // ---- Effects.
      const additive = (color: number, k = 1) =>
        track(new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
      // Touch ripples spreading from the pad.
      const ringG = track(new THREE.RingGeometry(0.2, 0.215, 64));
      const ripples = [0, 1, 2].map(() => {
        const m = new THREE.Mesh(ringG, additive(0xe8ccd2, 2));
        m.rotation.x = -Math.PI / 2;
        m.position.set(PAD.x, TOP_Y + 0.012, PAD.z);
        group.add(m);
        return m;
      });
      // The x-ray scan: a bright slice sweeping down the body.
      const scanMat = additive(0x9da2e0, 1.6);
      const scan = new THREE.Mesh(track(new THREE.PlaneGeometry(3.9, 1.8)), scanMat);
      scan.rotation.x = -Math.PI / 2;
      scan.position.z = 0.1;
      group.add(scan);
      const scanEdge = new THREE.Mesh(track(new THREE.PlaneGeometry(3.9, 0.012)), additive(0xd8dbff, 3));
      scanEdge.position.z = 1.0;
      group.add(scanEdge);

      const pointsMat = (size: number, color: number) =>
        track(new THREE.PointsMaterial({ map: sprite, size, color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, sizeAttenuation: true }));
      const rand = (() => {
        let a = 7;
        return () => ((a = (a * 16807) % 2147483647) / 2147483647);
      })();
      // Drifting motes inside the shell: the brand's points of light.
      const MOTES = 140;
      const moteBase = new Float32Array(MOTES * 3);
      for (let i = 0; i < MOTES; i++) {
        moteBase[i * 3] = (rand() - 0.5) * 3.2;
        moteBase[i * 3 + 1] = (rand() - 0.5) * 2.0;
        moteBase[i * 3 + 2] = (rand() - 0.5) * 1.4;
      }
      const moteGeo = track(new THREE.BufferGeometry());
      moteGeo.setAttribute("position", new THREE.BufferAttribute(moteBase.slice(), 3));
      const moteMat = pointsMat(0.035, 0xb9bdf0);
      group.add(new THREE.Points(moteGeo, moteMat));
      // Data: sparks running from the pad out to the phone and back.
      const linkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(PAD.x, TOP_Y + 0.05, PAD.z),
        new THREE.Vector3(PAD.x + 0.7, TOP_Y + 0.7, 0.4),
        new THREE.Vector3(2.4, 1.4, 1.2),
        new THREE.Vector3(3.6, 1.0, 1.8),
      ]);
      const SPARKS = 14;
      const sparkGeo = track(new THREE.BufferGeometry());
      sparkGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
      const sparkMat = pointsMat(0.07, 0xf3d6dc);
      group.add(new THREE.Points(sparkGeo, sparkMat));
      const linkLine = new THREE.Mesh(track(new THREE.TubeGeometry(linkCurve, 80, 0.004, 6, false)), additive(0xe8ccd2, 1.5));
      group.add(linkLine);
      // Finale: sparkles rising off the finished dose.
      const BURST = 50;
      const burstSeed = Array.from({ length: BURST }, () => [rand() * Math.PI * 2, 0.04 + rand() * 0.16, 0.25 + rand() * 0.55, rand()]);
      const burstGeo = track(new THREE.BufferGeometry());
      burstGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BURST * 3), 3));
      const burstMat = pointsMat(0.05, 0xf6dfe4);
      group.add(new THREE.Points(burstGeo, burstMat));
      const tmp = new THREE.Vector3();

      // Bloom on larger screens; phones render straight, to stay smooth.
      const lite = window.innerWidth < 768;
      let composer: EffectComposer | undefined;
      let bloom: UnrealBloomPass | undefined;
      if (!lite) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.72, 0.55, 0.97);
        composer.addPass(bloom);
        composer.addPass(new OutputPass());
      }

      // Drops the render resolution a step if the page starts missing frames.
      const governor = createQualityGovernor(
        (r) => {
          renderer.setPixelRatio(r);
          resize();
        },
        { max: maxRatio },
      );

      function resize() {
        const w = container!.clientWidth;
        const h = container!.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Pull back on tall, narrow screens so the device still fits.
        camera.fov = w / h < 0.8 ? 46 : 30;
        camera.updateProjectionMatrix();
        composer?.setPixelRatio(governor.ratio);
        composer?.setSize(w, h);
        bloom?.resolution.set(w / 2, h / 2);
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const camPos = new THREE.Vector3();
      const camTgt = new THREE.Vector3();
      let shown = 0; // smoothed progress
      let visible = true;
      let ready = false;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && ready) loop();
      });
      io.observe(container);
      let raf = 0;
      let first = true;
      const clock = new THREE.Clock();

      function frame() {
        const target = progress.get();
        const dt = Math.min(0.1, clock.getDelta());
        // Frame-rate independent easing toward the scroll position.
        shown += (target - shown) * (1 - Math.exp(-dt * 5));
        const p = shown;
        const time = clock.elapsedTime;

        shotAt(p, camPos, camTgt);
        // A slow handheld drift, so the frame never sits dead still.
        camPos.x += Math.sin(time * 0.35) * 0.035;
        camPos.y += Math.sin(time * 0.27 + 1.3) * 0.025;
        camera.position.copy(camPos);
        camera.lookAt(camTgt);

        // X-ray in, then back to solid at the end.
        const x = span(p, 0.03, 0.11) * (1 - span(p, 0.9, 0.98));
        ghostMat.uniforms.uAmt.value = x;
        solids.forEach(({ mesh, mat }) => {
          mesh.visible = x < 0.98;
          mat.opacity = 1 - x;
        });
        internals.visible = x > 0.02;

        // Fingertip comes down onto the pad, then lifts.
        const down = span(p, 0.12, 0.19) * (1 - span(p, 0.24, 0.29));
        finger.visible = down > 0.01;
        // Slides in along its own axis; presses a hair into the pad.
        const lift = 0.9 * (1 - down) - 0.012 * span(p, 0.185, 0.2);
        finger.position.set(PAD.x, TOP_Y + 0.005, PAD.z).addScaledVector(fingerAxis, lift);
        fingerKey.position.copy(finger.position).add(tmp.set(0.4, 0.5, 0.6));
        fingerKey.intensity = down * 1.2;
        const glow = span(p, 0.18, 0.22) * (1 - span(p, 0.3, 0.38));
        padGlowMat.opacity = glow * 0.7;
        padLight.intensity = glow * 3;

        // Cartridges brighten as the amounts arrive, then one by one.
        const ready = span(p, 0.32, 0.38);
        let poured = 0;
        lines.forEach((l, i) => {
          const s = PUMP_START + i * PUMP_EACH;
          const q = clamp((p - s) / PUMP_EACH);
          const on = p >= s && p < s + PUMP_EACH ? 1 : 0;
          l.flowMat.uniforms.uFill.value = smooth(q / 0.55);
          l.flowMat.uniforms.uOn.value = on;
          l.flowMat.uniforms.uTime.value = time;
          l.rotor.rotation.z = on ? time * 12 : 0;
          const dq = (q - 0.5) / 0.5;
          l.drop.visible = on === 1 && dq > 0;
          if (l.drop.visible) {
            const fall = (dq * 3) % 1;
            l.drop.position.y = NOZZLE_Y - (NOZZLE_Y - CUP.floor - 0.03) * fall * fall;
          }
          const liq = liquids[i];
          if (liq) liq.material.emissiveIntensity = 0.04 + ready * 0.08 * (1 - span(p, 0.8, 0.9)) + on * 0.6;
          poured += smooth(q);
        });
        const fill = poured / lines.length;
        doseMat.opacity = Math.min(1, fill * 1.4);
        doseMat.emissiveIntensity = 0.12 + span(p, 0.8, 0.86) * 0.25;
        if (dose) dose.scale.set(0.35 + 0.65 * fill, 0.12 + 0.2 * fill, 0.35 + 0.65 * fill);
        streamMat.opacity = 0;
        dishLight.intensity = span(p, 0.78, 0.86) * 1.2 * (1 - span(p, 0.95, 1));

        // Ripples while the pad reads.
        ripples.forEach((m, k) => {
          const ph = (time * 0.9 + k / 3) % 1;
          m.scale.setScalar(1 + ph * 2.6);
          (m.material as THREE.MeshBasicMaterial).opacity = glow * (1 - ph) * 0.9;
        });
        // The scan sweeps down as the x-ray switches on (and up at the end).
        const sIn = clamp((p - 0.03) / 0.08);
        const sOut = clamp((p - 0.9) / 0.08);
        const sweep = sIn < 1 ? sIn : sOut > 0 ? 1 - sOut : -1;
        scan.visible = scanEdge.visible = sweep > 0 && sweep < 1;
        if (scan.visible) {
          const y = 1.25 - sweep * 2.35;
          scan.position.y = y;
          scanEdge.position.y = y;
          scanMat.opacity = Math.sin(sweep * Math.PI) * 0.16;
          (scanEdge.material as THREE.MeshBasicMaterial).opacity = Math.sin(sweep * Math.PI);
        }
        // Motes drift slowly; only visible in x-ray.
        const mp = moteGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < MOTES; i++) {
          mp.setXYZ(
            i,
            moteBase[i * 3] + Math.sin(time * 0.2 + i) * 0.05,
            moteBase[i * 3 + 1] + Math.sin(time * 0.15 + i * 1.7) * 0.06,
            moteBase[i * 3 + 2] + Math.cos(time * 0.18 + i * 0.6) * 0.05,
          );
        }
        mp.needsUpdate = true;
        moteMat.opacity = x * 0.55;
        // Data out to the phone (0.25-0.31) and back (0.31-0.37).
        const out = clamp((p - 0.25) / 0.06);
        const back = clamp((p - 0.31) / 0.06);
        const linkOn = p > 0.25 && p < 0.37;
        (linkLine.material as THREE.MeshBasicMaterial).opacity = linkOn ? 0.35 * Math.sin(clamp((p - 0.25) / 0.12) * Math.PI) : 0;
        const sp = sparkGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < SPARKS; i++) {
          const lag = i * 0.045;
          const u = back > 0 ? 1 - clamp(back * 1.6 - lag) : clamp(out * 1.6 - lag);
          linkCurve.getPointAt(clamp(u), tmp);
          sp.setXYZ(i, tmp.x, tmp.y, tmp.z);
        }
        sp.needsUpdate = true;
        sparkMat.opacity = linkOn ? 1 : 0;
        // Sparkles rise off the dose once it's ready.
        const fin = clamp((p - 0.82) / 0.12);
        const bp = burstGeo.attributes.position as THREE.BufferAttribute;
        burstSeed.forEach(([a, r, h, d], i) => {
          const u = clamp((fin - d * 0.4) / 0.6);
          bp.setXYZ(
            i,
            CUP.x + Math.cos(a + time * 0.4) * r * (1 + u),
            CUP.floor + 0.05 + u * h,
            CUP.z + Math.sin(a + time * 0.4) * r * (1 + u),
          );
        });
        bp.needsUpdate = true;
        burstMat.opacity = fin > 0 && fin < 1 ? Math.sin(fin * Math.PI) : 0;

        if (composer) composer.render();
        else renderer.render(scene, camera);
        if (first) {
          first = false;
          el.style.opacity = "1";
        }
      }
      function loop() {
        cancelAnimationFrame(raf);
        let last = 0;
        const tick = (now: number) => {
          if (!visible) return;
          if (last) governor.sample(now - last);
          last = now;
          frame();
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
      // Compile every shader off the main thread before the first frame,
      // so the scene doesn't freeze the page when it first appears.
      let alive = true;
      const start = () => {
        if (!alive) return;
        ready = true;
        loop();
      };
      renderer.compileAsync(scene, camera).then(start, start);

      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        disposables.forEach((d) => d.dispose());
        own.forEach((d) => d.dispose());
        composer?.dispose();
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        el.remove();
      };
    }
  }, [progress, onUnsupported]);

  return <div ref={ref} className={className} />;
}
