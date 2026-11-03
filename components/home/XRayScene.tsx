"use client";

import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";

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
      { rootMargin: "80% 0px" },
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
      const fingerMat = track(
        new THREE.MeshPhysicalMaterial({ color: 0xf0cfd4, roughness: 0.55, sheen: 1, sheenColor: new THREE.Color(0xffe4e8) }),
      );
      const finger = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.1, 0.5, 8, 24)), fingerMat);
      finger.rotation.z = 0.25;
      scene.add(finger);
      const padGlowMat = track(
        new THREE.MeshBasicMaterial({ color: new THREE.Color(0xe8ccd2).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      const padGlow = new THREE.Mesh(track(new THREE.CircleGeometry(0.34, 48)), padGlowMat);
      padGlow.rotation.x = -Math.PI / 2;
      padGlow.position.set(PAD.x, TOP_Y + 0.01, PAD.z);
      group.add(padGlow);
      const padLight = new THREE.PointLight(0xe8ccd2, 0, 2);
      padLight.position.set(PAD.x, TOP_Y + 0.25, PAD.z);
      group.add(padLight);
      const dishLight = new THREE.PointLight(0xe8ccd2, 0, 2);
      dishLight.position.set(CUP.x, -0.6, CUP.z + 0.3);
      group.add(dishLight);

      function resize() {
        const w = container!.clientWidth;
        const h = container!.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Pull back on tall, narrow screens so the device still fits.
        camera.fov = w / h < 0.8 ? 46 : 30;
        camera.updateProjectionMatrix();
      }
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const camPos = new THREE.Vector3();
      const camTgt = new THREE.Vector3();
      let shown = 0; // smoothed progress
      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) loop();
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
        finger.position.set(PAD.x + 0.08 - 0.08 * down, TOP_Y + 0.37 + 0.6 * (1 - down), PAD.z + 0.02);
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
          if (liq) liq.material.emissiveIntensity = 0.06 + ready * 0.25 * (1 - span(p, 0.8, 0.9)) + on * 0.9;
          poured += smooth(q);
        });
        const fill = poured / lines.length;
        doseMat.opacity = Math.min(1, fill * 1.4);
        doseMat.emissiveIntensity = 0.2 + span(p, 0.8, 0.86) * 0.5;
        if (dose) dose.scale.set(0.35 + 0.65 * fill, 0.12 + 0.2 * fill, 0.35 + 0.65 * fill);
        streamMat.opacity = 0;
        dishLight.intensity = span(p, 0.78, 0.86) * 2.5 * (1 - span(p, 0.95, 1));

        renderer.render(scene, camera);
        if (first) {
          first = false;
          el.style.opacity = "1";
        }
      }
      function loop() {
        cancelAnimationFrame(raf);
        const tick = () => {
          if (!visible) return;
          frame();
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
      loop();

      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        disposables.forEach((d) => d.dispose());
        own.forEach((d) => d.dispose());
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        el.remove();
      };
    }
  }, [progress, onUnsupported]);

  return <div ref={ref} className={className} />;
}
