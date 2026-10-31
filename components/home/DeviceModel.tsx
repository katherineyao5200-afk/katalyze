"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The Katalyze device, modelled in code from the product render:
 * a soft white body, a frosted window over six cartridges (three tall
 * bases, three small actives), a display with three buttons and a cup
 * tray at the front. Proportions follow the render; it is an
 * illustration, not CAD.
 *
 * `progress` (0..1, the hero's scroll) drives the turn. `anchors` are
 * DOM elements that get pinned, every frame, to the screen position of
 * the real part they label.
 */

export type AnchorId = "cartridges" | "controls" | "cup";

// Local-space points on the model for each label.
const ANCHOR_POINTS: Record<AnchorId, THREE.Vector3> = {
  cartridges: new THREE.Vector3(1.3, 0.35, 0.6),
  controls: new THREE.Vector3(-1.08, -0.68, 0.88),
  cup: new THREE.Vector3(1.2, -0.5, 1.05),
};

const BODY_W = 3.4;
const BODY_H = 2.1;
const DEPTH = 1.3;
const BEVEL = 0.2;
const FRONT = DEPTH / 2 + BEVEL; // z of the front face

const WIN = { x0: -1.34, x1: 1.34, y0: -0.3, y1: 0.8, r: 0.16 };

function roundedRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
) {
  const s = new THREE.Shape();
  s.moveTo(x0 + r, y0);
  s.lineTo(x1 - r, y0);
  s.quadraticCurveTo(x1, y0, x1, y0 + r);
  s.lineTo(x1, y1 - r);
  s.quadraticCurveTo(x1, y1, x1 - r, y1);
  s.lineTo(x0 + r, y1);
  s.quadraticCurveTo(x0, y1, x0, y1 - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

// Interpolate a keyframed value on progress, eased.
function keyframe(p: number, stops: [number, number][]) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [p1, v1] = stops[i];
    const [p0, v0] = stops[i - 1];
    if (p <= p1) {
      const t = (p - p0) / (p1 - p0);
      const e = 1 - Math.pow(1 - t, 3);
      return v0 + (v1 - v0) * e;
    }
  }
  return stops[stops.length - 1][1];
}

function buildDevice() {
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  const shell = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6e5ec,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.4,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xe8ccd2),
    }),
  );

  // Body: rounded outline with the window cut through, softly bevelled.
  const outline = roundedRect(
    -BODY_W / 2,
    -BODY_H / 2,
    BODY_W / 2,
    BODY_H / 2,
    0.62,
  );
  outline.holes.push(roundedRect(WIN.x0, WIN.y0, WIN.x1, WIN.y1, WIN.r));
  const bodyGeo = track(
    new THREE.ExtrudeGeometry(outline, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: 0.16,
      bevelSegments: 10,
      curveSegments: 24,
    }),
  );
  bodyGeo.translate(0, 0, -DEPTH / 2);
  group.add(new THREE.Mesh(bodyGeo, shell));

  // Back wall of the cartridge bay.
  const bayGeo = track(
    new THREE.ShapeGeometry(
      roundedRect(WIN.x0, WIN.y0, WIN.x1, WIN.y1, WIN.r),
      12,
    ),
  );
  const bay = new THREE.Mesh(
    bayGeo,
    track(new THREE.MeshStandardMaterial({ color: 0xe9eaf2, roughness: 0.8 })),
  );
  bay.position.z = -0.1;
  group.add(bay);

  // Cartridges: three bases, three actives.
  const bottle = (
    x: number,
    h: number,
    r: number,
    tint: number,
    dropper: boolean,
  ) => {
    const g = new THREE.Group();
    const mat = track(
      new THREE.MeshPhysicalMaterial({
        color: tint,
        roughness: 0.25,
        transmission: 0.35,
        thickness: 0.3,
        clearcoat: 0.6,
      }),
    );
    const bodyG = track(new THREE.CylinderGeometry(r, r, h, 32));
    const b = new THREE.Mesh(bodyG, mat);
    b.position.y = WIN.y0 + h / 2;
    g.add(b);
    const capMat = track(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 }),
    );
    const capG = track(
      new THREE.CylinderGeometry(r * 0.62, r * 0.7, h * 0.14, 24),
    );
    const cap = new THREE.Mesh(capG, capMat);
    cap.position.y = WIN.y0 + h + h * 0.07;
    g.add(cap);
    if (dropper) {
      const tipG = track(
        new THREE.CylinderGeometry(r * 0.28, r * 0.4, h * 0.38, 16),
      );
      const tip = new THREE.Mesh(
        tipG,
        track(
          new THREE.MeshPhysicalMaterial({
            color: 0xf6f7fb,
            transmission: 0.6,
            roughness: 0.15,
            thickness: 0.1,
          }),
        ),
      );
      tip.position.y = WIN.y0 + h + h * 0.14 + h * 0.19;
      g.add(tip);
    }
    g.position.set(x, 0, 0.3);
    group.add(g);
  };
  bottle(-1.0, 0.82, 0.2, 0xb9c1e2, false);
  bottle(-0.52, 0.82, 0.2, 0xc9cde6, false);
  bottle(-0.04, 0.82, 0.2, 0xf3eadf, false);
  bottle(0.4, 0.5, 0.125, 0xaab3dc, true);
  bottle(0.74, 0.5, 0.125, 0xeec8cf, true);
  bottle(1.08, 0.5, 0.125, 0xeec8cf, true);

  // Frosted glass over the bay.
  const glass = new THREE.Mesh(
    bayGeo,
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.15,
        transparent: true,
        opacity: 0.16,
        clearcoat: 1,
      }),
    ),
  );
  glass.position.z = FRONT - 0.08;
  group.add(glass);

  // Display and three buttons.
  const display = new THREE.Mesh(
    track(
      new THREE.ShapeGeometry(roundedRect(-1.3, -0.8, -0.86, -0.56, 0.05), 6),
    ),
    track(
      new THREE.MeshStandardMaterial({
        color: 0x1f2441,
        emissive: 0x8a8db3,
        emissiveIntensity: 0.35,
        roughness: 0.2,
      }),
    ),
  );
  display.position.z = FRONT + 0.004;
  group.add(display);
  const btnG = track(new THREE.CylinderGeometry(0.065, 0.07, 0.04, 24));
  const btnM = track(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
  );
  [-0.68, -0.48, -0.28].forEach((x) => {
    const b = new THREE.Mesh(btnG, btnM);
    b.rotation.x = Math.PI / 2;
    b.position.set(x, -0.68, FRONT + 0.02);
    group.add(b);
  });

  // Cup tray: a shallow oval bowl at the front right.
  const bowlG = track(
    new THREE.SphereGeometry(
      0.38,
      40,
      16,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2,
    ),
  );
  const bowl = new THREE.Mesh(
    bowlG,
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xfbfbfd,
        roughness: 0.3,
        clearcoat: 0.5,
        side: THREE.DoubleSide,
      }),
    ),
  );
  bowl.scale.set(1.5, 0.6, 0.85);
  bowl.position.set(0.6, -0.48, FRONT + 0.16);
  group.add(bowl);

  // The dose: a thin blush disc inside the bowl, visible when lit.
  const doseMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xe8ccd2,
      emissive: 0xe8ccd2,
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0,
    }),
  );
  const dose = new THREE.Mesh(
    track(new THREE.CircleGeometry(0.3, 32)),
    doseMat,
  );
  dose.rotation.x = -Math.PI / 2;
  dose.scale.set(1.35, 0.72, 1);
  dose.position.set(0.6, -0.56, FRONT + 0.16);
  group.add(dose);

  return { group, disposables, doseMat };
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(10,12,28,0.75)");
  grad.addColorStop(1, "rgba(10,12,28,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export default function DeviceModel({
  progress,
  anchors,
  className = "",
  onUnsupported,
}: {
  progress?: MotionValue<number>;
  anchors?: Partial<Record<AnchorId, RefObject<HTMLElement | null>>>;
  className?: string;
  onUnsupported?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      onUnsupported?.();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.4;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

    // Light: cool key from above left, blush and periwinkle rims.
    scene.add(new THREE.HemisphereLight(0xdfe3ff, 0x1f2441, 0.3));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-5, 5, 4);
    scene.add(key);
    const rimL = new THREE.PointLight(0x8a8db3, 18, 12);
    rimL.position.set(-4, 1, -2);
    scene.add(rimL);
    const rimR = new THREE.PointLight(0xe8ccd2, 14, 12);
    rimR.position.set(4, 0.5, -1.5);
    scene.add(rimR);

    const { group, disposables, doseMat } = buildDevice();
    const pivot = new THREE.Group();
    pivot.add(group);
    scene.add(pivot);

    const cupLight = new THREE.PointLight(0xe8ccd2, 0, 2.5);
    cupLight.position.set(0.6, -0.2, FRONT + 0.5);
    group.add(cupLight);

    const shadowTex = shadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowGeo = new THREE.PlaneGeometry(5.4, 2.6);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -BODY_H / 2 - 0.2;
    pivot.add(shadow);

    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Fit about 4.4 x 3.0 units of model, whichever bound is tighter.
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const dist =
        Math.max(2.2 / Math.tan(hHalf), 1.5 / Math.tan(vHalf)) * 1.08;
      camera.position.set(0, dist * 0.18, dist);
      camera.lookAt(0, -0.1, 0);
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const v = new THREE.Vector3();
    function placeAnchors() {
      if (!anchors) return;
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      group.updateWorldMatrix(true, false);
      for (const id of Object.keys(anchors) as AnchorId[]) {
        const el = anchors[id]?.current;
        if (!el) continue;
        v.copy(ANCHOR_POINTS[id])
          .applyMatrix4(group.matrixWorld)
          .project(camera);
        el.style.left = `${((v.x + 1) / 2) * w}px`;
        el.style.top = `${((1 - v.y) / 2) * h}px`;
      }
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();

    function frame() {
      const t = clock.getElapsedTime();
      const p = progress?.get() ?? 0.4;
      // Turn: three-quarter from the right, settle to near-front while
      // the parts are read, then swing on through for the close.
      const yaw = keyframe(p, [
        [0, -0.75],
        [0.26, -0.32],
        [0.72, -0.12],
        [1, 0.9],
      ]);
      const pitch = keyframe(p, [
        [0, 0.16],
        [0.26, 0.1],
        [1, 0.22],
      ]);
      const drift = still ? 0 : Math.sin(t * 0.5) * 0.035;
      pivot.rotation.set(pitch, yaw + drift, 0);
      pivot.position.y = still ? 0 : Math.sin(t * 0.7) * 0.03;

      const dose = keyframe(p, [
        [0.54, 0],
        [0.62, 1],
        [0.72, 1],
        [0.8, 0],
      ]);
      cupLight.intensity = dose * 3;
      doseMat.opacity = dose * 0.9;
      doseMat.emissiveIntensity = dose * 0.6;

      renderer.render(scene, camera);
      placeAnchors();
    }

    let raf = 0;
    let visible = true;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !still) raf = requestAnimationFrame(loop);
      else if (visible) frame();
    });
    io.observe(container);

    // Reduced motion: render on scroll changes only, no idle drift.
    const unsub =
      still && progress
        ? progress.on("change", () => visible && frame())
        : undefined;
    frame();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      unsub?.();
      disposables.forEach((d) => d.dispose());
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, anchors, onUnsupported]);

  return <div ref={containerRef} className={`relative ${className}`} />;
}
