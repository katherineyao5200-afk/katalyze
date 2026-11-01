"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

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
export type Layer =
  | "shell"
  | "bay"
  | "cartridges"
  | "glass"
  | "controls"
  | "tray"
  | "feet";

// Anatomy view: where each layer travels when the device is pulled
// apart, and the point on it a label pins to (model units).
export const EXPLODE: Record<
  Layer,
  { offset: [number, number, number]; anchor: [number, number, number] }
> = {
  shell: { offset: [0, 0.1, -1.4], anchor: [1.55, 0.3, -0.2] },
  bay: { offset: [0, 0, -0.4], anchor: [0, 0.25, -0.1] },
  cartridges: { offset: [0, 1.05, 0.25], anchor: [-1.0, 0.95, 0.45] },
  glass: { offset: [0, 0.1, 1.3], anchor: [-1.4, 0.2, 0.9] },
  controls: { offset: [-0.2, -0.2, 1.05], anchor: [-1.05, -0.68, 0.9] },
  tray: { offset: [0.3, -0.45, 0.9], anchor: [1.25, -0.75, 1.1] },
  feet: { offset: [0, -0.3, 0], anchor: [1.3, -1.2, 0.4] },
};

// Local-space bounds of each labelled part, for the tracking boxes.
const PART_BOUNDS: Record<AnchorId, THREE.Box3> = {
  cartridges: new THREE.Box3(
    new THREE.Vector3(-1.18, -0.14, 0.15),
    new THREE.Vector3(1.18, 0.64, 0.8),
  ),
  controls: new THREE.Box3(
    new THREE.Vector3(-1.34, -0.84, 0.86),
    new THREE.Vector3(-0.2, -0.52, 0.9),
  ),
  cup: new THREE.Box3(
    new THREE.Vector3(-0.1, -0.88, 0.8),
    new THREE.Vector3(1.3, -0.54, 1.4),
  ),
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

function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D) => void,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Fine grain for a satin moulded-plastic finish.
function grainTexture() {
  const t = canvasTexture(256, 256, (g) => {
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 120 + Math.random() * 40;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

function buildDevice() {
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };
  // Every part is tagged with the layer it belongs to, so the anatomy
  // view can pull the device apart layer by layer.
  let layer: Layer = "shell";
  const add = (o: THREE.Object3D) => {
    o.userData.layer = layer;
    group.add(o);
  };

  const shell = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xeceaf0,
      roughness: 0.34,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xe8ccd2),
      roughnessMap: track(grainTexture()),
      bumpMap: undefined,
    }),
  );
  shell.bumpMap = shell.roughnessMap;
  shell.bumpScale = 0.4;

  layer = "shell";
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
  const bodyMesh = new THREE.Mesh(bodyGeo, shell);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  add(bodyMesh);

  layer = "bay";
  // Cavity liner: a slightly cooler, matte inner shell so the bay reads
  // as a recess, lit by a soft light strip along its ceiling.
  const lin = {
    x0: WIN.x0 + 0.16,
    x1: WIN.x1 - 0.16,
    y0: WIN.y0 + 0.16,
    y1: WIN.y1 - 0.16,
  };
  const linerMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd6d8e6,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  const linerDepth = FRONT + 0.1;
  const zMid = -0.1 + linerDepth / 2;
  const plane = (w: number, h: number) => track(new THREE.PlaneGeometry(w, h));
  const floor = new THREE.Mesh(plane(lin.x1 - lin.x0, linerDepth), linerMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, lin.y0, zMid);
  floor.receiveShadow = true;
  add(floor);
  const ceil = new THREE.Mesh(plane(lin.x1 - lin.x0, linerDepth), linerMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, lin.y1, zMid);
  add(ceil);
  [lin.x0, lin.x1].forEach((x) => {
    const wall = new THREE.Mesh(plane(linerDepth, lin.y1 - lin.y0), linerMat);
    wall.rotation.y = Math.PI / 2;
    wall.position.set(x, (lin.y0 + lin.y1) / 2, zMid);
    add(wall);
  });
  const strip = new THREE.Mesh(
    plane(lin.x1 - lin.x0 - 0.1, 0.05),
    track(new THREE.MeshBasicMaterial({ color: 0xf5f3ff, toneMapped: false })),
  );
  strip.rotation.x = Math.PI / 2;
  strip.position.set(0, lin.y1 - 0.002, 0.45);
  add(strip);
  const bayLight = new THREE.RectAreaLight(0xf3f0ff, 6, lin.x1 - lin.x0, 0.3);
  bayLight.position.set(0, lin.y1 - 0.01, 0.4);
  bayLight.lookAt(0, lin.y0, 0.4);
  add(bayLight);

  layer = "bay";
  // Back wall of the cartridge bay.
  const bayGeo = track(
    new THREE.ShapeGeometry(
      roundedRect(WIN.x0, WIN.y0, WIN.x1, WIN.y1, WIN.r),
      12,
    ),
  );
  const bay = new THREE.Mesh(
    bayGeo,
    track(new THREE.MeshStandardMaterial({ color: 0xe2e4ef, roughness: 0.85 })),
  );
  bay.position.z = -0.1;
  add(bay);

  layer = "cartridges";
  // Cartridges: three bases, three actives.
  const bottle = (
    x: number,
    h: number,
    r: number,
    tint: number,
    dropper: boolean,
  ) => {
    const g = new THREE.Group();
    const floorY = WIN.y0 + 0.16;
    const shellMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.32,
        transmission: 0.92,
        thickness: r * 1.5,
        ior: 1.45,
        clearcoat: 0.8,
        clearcoatRoughness: 0.15,
        attenuationColor: new THREE.Color(tint),
        attenuationDistance: 0.6,
      }),
    );
    const shellG = track(new THREE.CylinderGeometry(r, r, h, 48, 1));
    const shellMesh = new THREE.Mesh(shellG, shellMat);
    shellMesh.position.y = floorY + h / 2;
    shellMesh.castShadow = true;
    g.add(shellMesh);
    const fill = h * 0.78;
    const liquid = new THREE.Mesh(
      track(new THREE.CylinderGeometry(r * 0.9, r * 0.9, fill, 40)),
      track(
        new THREE.MeshPhysicalMaterial({
          color: tint,
          roughness: 0.18,
          sheen: 0.5,
          sheenColor: new THREE.Color(tint),
          emissive: tint,
          emissiveIntensity: 0.18,
        }),
      ),
    );
    liquid.position.y = floorY + 0.02 + fill / 2;
    g.add(liquid);
    const capMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xfafafc,
        roughness: 0.28,
        clearcoat: 0.6,
      }),
    );
    const capG = track(
      new THREE.CylinderGeometry(r * 0.62, r * 0.7, h * 0.14, 24),
    );
    const cap = new THREE.Mesh(capG, capMat);
    cap.position.y = WIN.y0 + 0.16 + h + h * 0.07;
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
      tip.position.y = WIN.y0 + 0.16 + h + h * 0.14 + h * 0.19;
      g.add(tip);
    }
    g.position.set(x, 0, 0.32);
    add(g);
  };
  bottle(-0.98, 0.56, 0.19, 0xb9c1e2, false);
  bottle(-0.52, 0.56, 0.19, 0xc9cde6, false);
  bottle(-0.06, 0.56, 0.19, 0xf3eadf, false);
  bottle(0.36, 0.34, 0.115, 0xaab3dc, true);
  bottle(0.66, 0.34, 0.115, 0xeec8cf, true);
  bottle(0.96, 0.34, 0.115, 0xeec8cf, true);

  layer = "glass";
  // Frosted glass over the bay.
  const glass = new THREE.Mesh(
    bayGeo,
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xf4f5fb,
        roughness: 0.4,
        transparent: true,
        opacity: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
      }),
    ),
  );
  glass.position.z = FRONT - 0.08;
  add(glass);

  layer = "controls";
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
  add(display);
  const btnG = track(new THREE.CylinderGeometry(0.065, 0.07, 0.04, 24));
  const btnM = track(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
  );
  [-0.68, -0.48, -0.28].forEach((x) => {
    const b = new THREE.Mesh(btnG, btnM);
    b.rotation.x = Math.PI / 2;
    b.position.set(x, -0.68, FRONT + 0.02);
    add(b);
  });

  layer = "tray";
  // Cup tray: a shallow oval bowl at the front right.
  const bowlG = track(
    new THREE.SphereGeometry(
      0.44,
      48,
      20,
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
  bowl.castShadow = true;
  bowl.scale.set(1.45, 0.62, 0.85);
  bowl.position.set(0.6, -0.56, FRONT + 0.2);
  add(bowl);

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
  dose.position.set(0.6, -0.62, FRONT + 0.2);
  add(dose);

  // ---- Fine detail ----

  layer = "glass";
  // Window frame: a thin raised clear-plastic surround.
  const frameShape = roundedRect(
    WIN.x0 - 0.1,
    WIN.y0 - 0.1,
    WIN.x1 + 0.1,
    WIN.y1 + 0.1,
    WIN.r + 0.08,
  );
  frameShape.holes.push(
    roundedRect(
      WIN.x0 + 0.12,
      WIN.y0 + 0.12,
      WIN.x1 - 0.12,
      WIN.y1 - 0.12,
      WIN.r,
    ),
  );
  const frameGeo = track(
    new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
      curveSegments: 24,
    }),
  );
  const frame = new THREE.Mesh(
    frameGeo,
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xf7f8fc,
        roughness: 0.12,
        clearcoat: 1,
        transmission: 0.3,
        thickness: 0.05,
      }),
    ),
  );
  frame.position.z = FRONT - 0.035;
  add(frame);

  layer = "shell";
  // Panel seam around the front face.
  const seamShape = roundedRect(
    -BODY_W / 2 + 0.06,
    -BODY_H / 2 + 0.06,
    BODY_W / 2 - 0.06,
    BODY_H / 2 - 0.06,
    0.5,
  );
  seamShape.holes.push(
    roundedRect(
      -BODY_W / 2 + 0.075,
      -BODY_H / 2 + 0.075,
      BODY_W / 2 - 0.075,
      BODY_H / 2 - 0.075,
      0.485,
    ),
  );
  const seam = new THREE.Mesh(
    track(new THREE.ShapeGeometry(seamShape, 32)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0xb9bac8,
        transparent: true,
        opacity: 0.55,
      }),
    ),
  );
  seam.position.z = FRONT + 0.003;
  add(seam);

  layer = "controls";
  // Display screen: the K mark and a "Ready" line, softly backlit.
  const screenTex = track(
    canvasTexture(256, 128, (g) => {
      const grad = g.createLinearGradient(0, 0, 256, 128);
      grad.addColorStop(0, "#1f2441");
      grad.addColorStop(1, "#313f79");
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 128);
      g.fillStyle = "#f5eff7";
      g.font = "600 54px Georgia, serif";
      g.fillText("K", 28, 84);
      g.fillStyle = "#8a8db3";
      g.font = "500 22px monospace";
      g.fillText("READY", 96, 60);
      g.fillStyle = "#e8ccd2";
      [0, 1, 2].forEach((i) => {
        g.beginPath();
        g.arc(104 + i * 22, 86, 5, 0, Math.PI * 2);
        g.fill();
      });
    }),
  );
  const screen = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.4, 0.2)),
    track(new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })),
  );
  screen.position.set(-1.08, -0.68, FRONT + 0.008);
  add(screen);

  layer = "controls";
  // Button rings.
  const ringG = track(new THREE.TorusGeometry(0.082, 0.008, 8, 32));
  const ringM = track(
    new THREE.MeshStandardMaterial({ color: 0xc4c6d4, roughness: 0.4 }),
  );
  [-0.68, -0.48, -0.28].forEach((x) => {
    const r = new THREE.Mesh(ringG, ringM);
    r.position.set(x, -0.68, FRONT + 0.006);
    add(r);
  });

  layer = "cartridges";
  // Cartridge labels: base B-01..03, active A-01..03.
  const labelFor = (text: string) =>
    track(
      canvasTexture(128, 128, (g) => {
        g.fillStyle = "#fbfbfd";
        g.fillRect(0, 0, 128, 128);
        g.fillStyle = "#313f79";
        g.font = "600 30px monospace";
        g.textAlign = "center";
        g.fillText(text, 64, 74);
      }),
    );
  const labels: [number, number, number, number, string][] = [
    [-0.98, 0.19, 0.56, 0, "B-01"],
    [-0.52, 0.19, 0.56, 0, "B-02"],
    [-0.06, 0.19, 0.56, 0, "B-03"],
    [0.36, 0.115, 0.34, 0, "A-01"],
    [0.66, 0.115, 0.34, 0, "A-02"],
    [0.96, 0.115, 0.34, 0, "A-03"],
  ];
  labels.forEach(([x, r, h, , text]) => {
    const lg = track(
      new THREE.CylinderGeometry(
        r * 1.01,
        r * 1.01,
        h * 0.32,
        40,
        1,
        true,
        -Math.PI / 2.4,
        Math.PI / 1.2,
      ),
    );
    const lm = track(
      new THREE.MeshStandardMaterial({
        map: labelFor(text),
        roughness: 0.6,
        transparent: true,
        opacity: 0.92,
      }),
    );
    const l = new THREE.Mesh(lg, lm);
    l.position.set(x, WIN.y0 + 0.16 + h * 0.42, 0.32);
    add(l);
  });

  layer = "tray";
  // Cup ledge: the lower lip the cup sits on.
  const ledgeShape = roundedRect(-0.12, -0.45, 1.32, 0.1, 0.14);
  const ledge = new THREE.Mesh(
    track(
      new THREE.ExtrudeGeometry(ledgeShape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 4,
        curveSegments: 16,
      }),
    ),
    shell,
  );
  ledge.rotation.x = -Math.PI / 2;
  ledge.position.set(0, -1.0, FRONT);
  ledge.castShadow = true;
  ledge.receiveShadow = true;
  add(ledge);

  layer = "feet";
  // Rubber feet.
  const footG = track(new THREE.CylinderGeometry(0.12, 0.13, 0.05, 24));
  const footM = track(
    new THREE.MeshStandardMaterial({ color: 0x2a2f4d, roughness: 0.9 }),
  );
  [
    [-1.25, -0.5],
    [1.25, -0.5],
    [-1.25, 0.5],
    [1.25, 0.5],
  ].forEach(([x, z]) => {
    const f = new THREE.Mesh(footG, footM);
    f.position.set(x, -BODY_H / 2 - BEVEL * 0 - 0.17, z);
    add(f);
  });

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
  boxes,
  className = "",
  onUnsupported,
  mode = "hero",
  explode,
  labels,
}: {
  /** "anatomy": pulled apart by `explode` (0-1), turned by dragging. */
  mode?: "hero" | "anatomy";
  explode?: MotionValue<number>;
  labels?: Partial<Record<Layer, RefObject<HTMLElement | null>>>;
  progress?: MotionValue<number>;
  anchors?: Partial<Record<AnchorId, RefObject<HTMLElement | null>>>;
  boxes?: Partial<Record<AnchorId, RefObject<HTMLElement | null>>>;
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    RectAreaLightUniformsLib.init();
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.45;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

    // Light: cool key from above left, blush and periwinkle rims.
    scene.add(new THREE.HemisphereLight(0xdfe3ff, 0x1f2441, 0.2));
    const key = new THREE.DirectionalLight(0xfff8f4, 2.6);
    key.position.set(-2.5, 8, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.radius = 14;
    key.shadow.blurSamples = 16;
    key.shadow.bias = -0.0005;
    const sc = key.shadow.camera;
    sc.left = -7;
    sc.right = 7;
    sc.top = 7;
    sc.bottom = -7;
    sc.near = 1;
    sc.far = 20;
    scene.add(key);
    // Studio softbox overhead: the long soft highlight across the top.
    const softbox = new THREE.RectAreaLight(0xffffff, 3.2, 7, 2.5);
    softbox.position.set(0, 5, 2.5);
    softbox.lookAt(0, 0, 0);
    scene.add(softbox);
    const rimL = new THREE.PointLight(0x8a8db3, 18, 12);
    rimL.position.set(-4, 1, -2);
    scene.add(rimL);
    const rimR = new THREE.PointLight(0xe8ccd2, 14, 12);
    rimR.position.set(4, 0.5, -1.5);
    scene.add(rimR);

    const { group, disposables, doseMat } = buildDevice();
    const anatomy = mode === "anatomy";
    const basePos = new Map<THREE.Object3D, THREE.Vector3>();
    group.children.forEach((c) => basePos.set(c, c.position.clone()));
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
    // Soft cast shadow from the key light on an invisible floor.
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.ShadowMaterial({
      opacity: 0.28,
      color: 0x0a0c1c,
    });
    const ground = new THREE.Mesh(floorGeo, floorMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -BODY_H / 2 - 0.19;
    ground.receiveShadow = true;
    pivot.add(ground);

    function resize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Fit about 4.4 x 3.0 units of model, whichever bound is tighter.
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const room = anatomy ? (camera.aspect < 1 ? 1.45 : 1.9) : 1;
      const dist =
        Math.max(2.2 / Math.tan(hHalf), 1.5 / Math.tan(vHalf)) * 1.08 * room;
      camera.position.set(0, dist * 0.18, dist);
      camera.lookAt(0, -0.1, 0);
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Project each part's 3D bounds to a screen rectangle; the box
    // element takes the rectangle, the label anchors to its side.
    const corner = new THREE.Vector3();
    function placeAnchors() {
      if (!anchors && !boxes) return;
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      group.updateWorldMatrix(true, false);
      for (const id of Object.keys(PART_BOUNDS) as AnchorId[]) {
        const bb = PART_BOUNDS[id];
        let x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;
        for (let i = 0; i < 8; i++) {
          corner
            .set(
              i & 1 ? bb.max.x : bb.min.x,
              i & 2 ? bb.max.y : bb.min.y,
              i & 4 ? bb.max.z : bb.min.z,
            )
            .applyMatrix4(group.matrixWorld)
            .project(camera);
          const sx = ((corner.x + 1) / 2) * w;
          const sy = ((1 - corner.y) / 2) * h;
          x0 = Math.min(x0, sx);
          x1 = Math.max(x1, sx);
          y0 = Math.min(y0, sy);
          y1 = Math.max(y1, sy);
        }
        const box = boxes?.[id]?.current;
        if (box) {
          box.style.left = `${x0}px`;
          box.style.top = `${y0}px`;
          box.style.width = `${x1 - x0}px`;
          box.style.height = `${y1 - y0}px`;
        }
        const el = anchors?.[id]?.current;
        if (el) {
          const left = el.dataset.side === "left";
          el.style.left = `${left ? x0 : x1}px`;
          el.style.top = `${(y0 + y1) / 2}px`;
        }
      }
    }

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clock = new THREE.Clock();

    // Drag to turn (anatomy only), with a little glide after release.
    let dragYaw = 0;
    let dragVel = 0;
    let dragging = false;
    let lastX = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      dragVel = 0;
      container!.setPointerCapture(e.pointerId);
      container!.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragVel = dx * 0.006;
      dragYaw += dragVel;
      if (still) frame();
    };
    const onUp = () => {
      dragging = false;
      container!.style.cursor = "grab";
    };
    if (anatomy) {
      container.style.cursor = "grab";
      container.style.touchAction = "pan-y";
      container.addEventListener("pointerdown", onDown);
      container.addEventListener("pointermove", onMove);
      container.addEventListener("pointerup", onUp);
      container.addEventListener("pointercancel", onUp);
    }

    const pt = new THREE.Vector3();
    function frameAnatomy(t: number) {
      const raw = explode?.get() ?? 1;
      const e = raw * raw * (3 - 2 * raw); // smoothstep
      for (const [c, base] of basePos) {
        const l = c.userData.layer as Layer | undefined;
        if (!l) continue;
        const o = EXPLODE[l].offset;
        c.position.set(base.x + o[0] * e, base.y + o[1] * e, base.z + o[2] * e);
      }
      if (!dragging) {
        dragYaw += dragVel;
        dragVel *= 0.94;
        // Ease back to the labelled view once the glide has settled.
        if (Math.abs(dragVel) < 0.002) dragYaw *= 0.97;
      }
      dragYaw = Math.max(-1.1, Math.min(1.1, dragYaw));
      const drift = still ? 0 : Math.sin(t * 0.4) * 0.05;
      pivot.rotation.set(0.32, -0.62 + drift + dragYaw, 0);
      pivot.position.y = 0.3;
      renderer.render(scene, camera);

      if (!labels) return;
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      group.updateWorldMatrix(true, false);
      // Labels sit on whichever side of the device their part is on
      // right now, so turning it never crosses a label over the model.
      pt.set(0, 0, 0).applyMatrix4(group.matrixWorld).project(camera);
      const midX = ((pt.x + 1) / 2) * w;
      for (const l of Object.keys(EXPLODE) as Layer[]) {
        const el = labels[l]?.current;
        if (!el) continue;
        const { offset: o, anchor: a } = EXPLODE[l];
        pt.set(a[0] + o[0] * e, a[1] + o[1] * e, a[2] + o[2] * e)
          .applyMatrix4(group.matrixWorld)
          .project(camera);
        const sx = ((pt.x + 1) / 2) * w;
        el.dataset.side = sx < midX ? "left" : "right";
        el.style.left = `${sx}px`;
        el.style.top = `${((1 - pt.y) / 2) * h}px`;
        // Labels belong to the labelled view: they fade while the
        // device is turned away from it.
        const turned = Math.max(
          0,
          Math.min(1, (Math.abs(dragYaw) - 0.15) / 0.25),
        );
        el.style.opacity = String(
          Math.max(0, (e - 0.55) / 0.45) * (1 - turned),
        );
      }
    }

    function frame() {
      const t = clock.getElapsedTime();
      if (anatomy) {
        frameAnatomy(t);
        return;
      }
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
      cupLight.intensity = dose * 0.8;
      doseMat.opacity = dose * 0.9;
      doseMat.emissiveIntensity = dose * 0.6;

      renderer.render(scene, camera);
      placeAnchors();
    }

    let raf = 0;
    let visible = true;
    const loop = () => {
      // Skip rendering while the entry gate covers the page.
      if (document.documentElement.dataset.gate !== "open") frame();
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
    const driver = progress ?? explode;
    const unsub =
      still && driver
        ? driver.on("change", () => visible && frame())
        : undefined;
    frame();

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      io.disconnect();
      ro.disconnect();
      unsub?.();
      disposables.forEach((d) => d.dispose());
      shadowGeo.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress, anchors, boxes, onUnsupported, mode, explode, labels]);

  return (
    <div
      ref={containerRef}
      className={className.includes("absolute") ? className : `relative ${className}`}
    />
  );
}
