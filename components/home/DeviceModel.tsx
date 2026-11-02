"use client";

import type { MotionValue } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

import { afterIntro } from "@/lib/afterIntro";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

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
const BAND_Y = -0.85; // top of the navy base band
const TOP_Y = BODY_H / 2 + 0.16; // the flat top surface

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
  const t = canvasTexture(512, 512, (g) => {
    const img = g.createImageData(512, 512);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 132 + Math.random() * 18;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
  t.colorSpace = THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(10, 10);
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
      color: 0xf2f1f4,
      roughness: 0.4,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
      sheen: 0.25,
      sheenColor: new THREE.Color(0xe8ccd2),
      roughnessMap: track(grainTexture()),
    }),
  );
  shell.bumpMap = shell.roughnessMap;
  shell.bumpScale = 0.05;

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
      bevelSegments: 16,
      curveSegments: 48,
    }),
  );
  bodyGeo.translate(0, 0, -DEPTH / 2);
  // The body shares the shell finish, with the navy ABS base band from
  // the spec (#1f2441) and a fine parting line where the two meet.
  const bodyMat = track(shell.clone());
  bodyMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vLY;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvLY = position.y;",
      );
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vLY;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float band = 1.0 - smoothstep(${(BAND_Y - 0.004).toFixed(3)}, ${(BAND_Y + 0.004).toFixed(3)}, vLY);
        float seamLine = 1.0 - smoothstep(0.0, 0.012, abs(vLY - ${(BAND_Y + 0.012).toFixed(3)}));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.026, 0.032, 0.085), band);
        diffuseColor.rgb *= 1.0 - 0.45 * seamLine;`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.62, band);",
      )
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\nmaterial.clearcoat *= 1.0 - 0.75 * band;",
      );
  };
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
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
          emissiveIntensity: 0.06,
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
      // Frosted PMMA: diffuses what's behind it, still shows each
      // cartridge's colour, with a glossy outer face.
      new THREE.MeshPhysicalMaterial({
        color: 0xf6f6fb,
        roughness: 0.13,
        transmission: 1,
        thickness: 0.04,
        ior: 1.49,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        specularIntensity: 0.6,
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
  // Dispensing station, after the spec: a sheltered bay under the window.
  // A hood overhangs the cup with the six-nozzle cluster set into its
  // underside, a dark recessed back panel closes the bay, and a
  // removable navy drip tray with a steel grille catches the drips.
  // CUP is the dose dish: a small, shallow pod you scoop from with a
  // fingertip (kat, Nov 2026), not a drinking cup.
  const CUP = { x: 0.62, z: FRONT + 0.22, floor: -0.905, h: 0.07, r: 0.17 };
  const BAY = { x0: CUP.x - 0.34, x1: CUP.x + 0.34 };
  const HOOD = { top: -0.43, bot: -0.52, depth: 0.44 };

  // Recessed back panel: soft-matte navy, so the bay reads as a hollow.
  const bayPanel = new THREE.Mesh(
    track(
      new THREE.ShapeGeometry(
        roundedRect(BAY.x0 + 0.02, -0.98, BAY.x1 - 0.02, HOOD.bot + 0.02, 0.06),
        8,
      ),
    ),
    track(
      new THREE.MeshStandardMaterial({ color: 0x161a33, roughness: 0.75 }),
    ),
  );
  bayPanel.position.z = FRONT + 0.003;
  bayPanel.receiveShadow = true;
  add(bayPanel);

  // Hood: a bevelled slab in the shell finish, flush with the front face.
  const hoodGeo = track(
    new THREE.ExtrudeGeometry(
      roundedRect(BAY.x0, -HOOD.depth, BAY.x1, 0.06, 0.12),
      {
        depth: HOOD.top - HOOD.bot - 0.05,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 6,
        curveSegments: 24,
      },
    ),
  );
  const hood = new THREE.Mesh(hoodGeo, shell);
  hood.rotation.x = -Math.PI / 2;
  hood.position.set(0, HOOD.bot + 0.025, FRONT);
  hood.castShadow = true;
  hood.receiveShadow = true;
  add(hood);

  // Under the hood: a dark nozzle plate, six steel nozzles in a ring (one
  // per cartridge channel), and a faint status-light ring around them.
  const NZ = { x: CUP.x, z: CUP.z, y: HOOD.bot - 0.002 };
  const nozzlePlate = new THREE.Mesh(
    track(new THREE.CircleGeometry(0.105, 40)),
    track(
      new THREE.MeshStandardMaterial({
        color: 0x1a1e38,
        roughness: 0.45,
        metalness: 0.3,
      }),
    ),
  );
  nozzlePlate.rotation.x = Math.PI / 2;
  nozzlePlate.position.set(NZ.x, NZ.y, NZ.z);
  add(nozzlePlate);
  const steelNozzle = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6e8f0,
      metalness: 1,
      roughness: 0.18,
    }),
  );
  const tipGeo = track(new THREE.CylinderGeometry(0.009, 0.013, 0.035, 16));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const t = new THREE.Mesh(tipGeo, steelNozzle);
    t.position.set(
      NZ.x + Math.cos(a) * 0.042,
      NZ.y - 0.017,
      NZ.z + Math.sin(a) * 0.042,
    );
    add(t);
  }
  const ledRing = new THREE.Mesh(
    track(new THREE.RingGeometry(0.088, 0.096, 48)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0xb9bce0,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      }),
    ),
  );
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.set(NZ.x, NZ.y - 0.001, NZ.z);
  add(ledRing);

  // Drip tray: navy, sitting in front of the base, with a raised rim.
  const trayGeo = track(
    new THREE.ExtrudeGeometry(
      roundedRect(BAY.x0 + 0.01, -HOOD.depth - 0.02, BAY.x1 - 0.01, 0.04, 0.1),
      {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 5,
        curveSegments: 20,
      },
    ),
  );
  const tray = new THREE.Mesh(
    trayGeo,
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0x1f2441,
        roughness: 0.55,
        clearcoat: 0.3,
        clearcoatRoughness: 0.4,
      }),
    ),
  );
  tray.rotation.x = -Math.PI / 2;
  tray.position.set(0, CUP.floor - 0.1, FRONT);
  tray.castShadow = true;
  tray.receiveShadow = true;
  add(tray);

  // Steel grille set into the tray: brushed plate with rounded slots.
  const grilleTex = track(
    canvasTexture(512, 320, (g) => {
      g.fillStyle = "#c9ccd8";
      g.fillRect(0, 0, 512, 320);
      for (let y = 0; y < 320; y += 2) {
        g.fillStyle = `rgba(255,255,255,${0.04 + Math.random() * 0.06})`;
        g.fillRect(0, y, 512, 1);
      }
      g.fillStyle = "#0e1124";
      for (let i = 0; i < 13; i++) {
        g.beginPath();
        g.roundRect(44 + i * 34, 40, 12, 240, 6);
        g.fill();
      }
    }),
  );
  const gw = BAY.x1 - BAY.x0 - 0.12;
  const gd = HOOD.depth - 0.1;
  const grille = new THREE.Mesh(
    track(
      new THREE.ShapeGeometry(roundedRect(-gw / 2, -gd / 2, gw / 2, gd / 2, 0.06), 8),
    ),
    track(
      new THREE.MeshStandardMaterial({
        map: grilleTex,
        roughness: 0.32,
        metalness: 0.85,
      }),
    ),
  );
  grilleTex.repeat.set(1 / gw, 1 / gd);
  grilleTex.offset.set(0.5, 0.5);
  grille.rotation.x = -Math.PI / 2;
  grille.position.set(CUP.x, CUP.floor + 0.002, FRONT + HOOD.depth / 2 - 0.01);
  grille.receiveShadow = true;
  add(grille);

  // The dish: a low, glazed white pod with a rolled lip, turned on a lathe.
  const dishPts = [
    [0, 0.012],
    [CUP.r * 0.55, 0.0],
    [CUP.r * 0.82, 0.008],
    [CUP.r * 0.97, CUP.h * 0.7],
    [CUP.r, CUP.h],
    [CUP.r - 0.018, CUP.h + 0.004],
    [CUP.r * 0.8, CUP.h * 0.55],
    [CUP.r * 0.5, 0.026],
    [0, 0.022],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cup = new THREE.Mesh(
    track(new THREE.LatheGeometry(dishPts, 64)),
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xf7f6f9,
        roughness: 0.22,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
      }),
    ),
  );
  cup.position.set(CUP.x, CUP.floor, CUP.z);
  cup.castShadow = true;
  cup.receiveShadow = true;
  add(cup);

  // The dose: a pale blush serum pooled in the dish when lit.
  const doseMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf1d9de,
      emissive: 0xe8ccd2,
      emissiveIntensity: 0,
      roughness: 0.12,
      clearcoat: 1,
      transparent: true,
      opacity: 0,
    }),
  );
  // A soft dome of serum sitting in the dish.
  const dose = new THREE.Mesh(
    track(new THREE.SphereGeometry(CUP.r * 0.62, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2)),
    doseMat,
  );
  dose.scale.set(1, 0.32, 1);
  dose.position.set(CUP.x, CUP.floor + 0.024, CUP.z);
  add(dose);
  // A thin stream from the nozzle while it pours.
  const streamMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xf1d9de,
      emissive: 0xe8ccd2,
      emissiveIntensity: 0.3,
      roughness: 0.1,
      transparent: true,
      opacity: 0,
    }),
  );
  const streamTop = HOOD.bot - 0.035;
  const streamBot = CUP.floor + 0.04;
  const stream = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.008, 0.012, streamTop - streamBot, 12)),
    streamMat,
  );
  stream.position.set(CUP.x, (streamTop + streamBot) / 2, CUP.z);
  add(stream);

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

  layer = "shell";
  // Fingertip sensor: two brushed-steel half-disc electrodes set flush
  // into the top surface, inside a faint status-light ring.
  const PAD = { x: 0.68, z: 0.02, r: 0.19 };
  const steel = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xd9dbe4,
      metalness: 0.9,
      roughness: 0.38,
      anisotropy: 0.8,
      clearcoat: 0.4,
    }),
  );
  [0, Math.PI].forEach((start) => {
    const half = new THREE.Mesh(
      track(new THREE.CircleGeometry(PAD.r, 40, start + 0.06, Math.PI - 0.12)),
      steel,
    );
    half.rotation.x = -Math.PI / 2;
    half.position.set(PAD.x, TOP_Y + 0.003, PAD.z);
    add(half);
  });
  const padWell = new THREE.Mesh(
    track(new THREE.RingGeometry(PAD.r, PAD.r + 0.035, 48)),
    track(new THREE.MeshStandardMaterial({ color: 0xc9cad6, roughness: 0.7 })),
  );
  padWell.rotation.x = -Math.PI / 2;
  padWell.position.set(PAD.x, TOP_Y + 0.002, PAD.z);
  add(padWell);
  const statusRing = new THREE.Mesh(
    track(new THREE.RingGeometry(PAD.r + 0.035, PAD.r + 0.05, 64)),
    track(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xe8ccd2).multiplyScalar(1.4),
        toneMapped: false,
      }),
    ),
  );
  statusRing.rotation.x = -Math.PI / 2;
  statusRing.position.set(PAD.x, TOP_Y + 0.0025, PAD.z);
  add(statusRing);

  layer = "shell";
  // Printed above the window: which three are bases, which three are
  // actives, each with a bracket over its group.
  const groupTex = track(
    canvasTexture(1024, 48, (g) => {
      g.clearRect(0, 0, 1024, 48);
      // model x -1.34..1.34 maps to 0..1024
      const px = (x: number) => ((x + 1.34) / 2.68) * 1024;
      g.strokeStyle = "rgba(49,63,121,0.5)";
      g.lineWidth = 3;
      g.font = "600 24px ui-monospace, Menlo, monospace";
      g.textBaseline = "middle";
      const groups: [string, number, number][] = [
        ["BASE · 3", -1.19, 0.15],
        ["ACTIVE · 3", 0.22, 1.09],
      ];
      for (const [label, a, b] of groups) {
        const x0 = px(a);
        const x1 = px(b);
        g.beginPath();
        g.moveTo(x0, 42);
        g.lineTo(x0, 30);
        g.lineTo(x1, 30);
        g.lineTo(x1, 42);
        g.stroke();
        const w = g.measureText(label).width;
        const cx = (x0 + x1) / 2;
        g.clearRect(cx - w / 2 - 12, 14, w + 24, 32);
        g.fillStyle = "#313f79";
        g.fillText(label, cx - w / 2, 30);
      }
    }),
  );
  const groupMark = new THREE.Mesh(
    track(new THREE.PlaneGeometry(2.68, 0.1256)),
    track(
      new THREE.MeshStandardMaterial({
        map: groupTex,
        transparent: true,
        roughness: 0.5,
      }),
    ),
  );
  groupMark.position.set(0, 0.975, FRONT + 0.004);
  add(groupMark);

  layer = "shell";
  // Wordmark pad-printed on the navy base band.
  const markTex = track(
    canvasTexture(512, 64, (g) => {
      g.clearRect(0, 0, 512, 64);
      g.fillStyle = "#f5eff7";
      g.font = "300 34px Inter, Helvetica, Arial, sans-serif";
      g.textBaseline = "middle";
      const text = "KATALYZE";
      let x = 4;
      for (const ch of text) {
        g.fillText(ch, x, 34);
        x += g.measureText(ch).width + 14;
      }
    }),
  );
  const mark = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.72, 0.09)),
    track(
      new THREE.MeshStandardMaterial({
        map: markTex,
        transparent: true,
        roughness: 0.5,
        opacity: 0.85,
      }),
    ),
  );
  mark.position.set(-0.92, -0.99, FRONT + 0.002);
  add(mark);

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

  return { group, disposables, doseMat, streamMat };
}

// A photo-studio reflection environment: a dim navy room with a large
// overhead softbox, two tall strip lights and a faint warm bounce card.
// This is what the glossy shell and steel reflect.
function studioEnvironment() {
  const scene = new THREE.Scene();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const room = new THREE.BoxGeometry(30, 30, 30);
  const roomMat = new THREE.MeshBasicMaterial({
    color: 0x272c48,
    side: THREE.BackSide,
  });
  geos.push(room);
  mats.push(roomMat);
  scene.add(new THREE.Mesh(room, roomMat));
  const panel = (
    w: number,
    h: number,
    color: number,
    strength: number,
    pos: [number, number, number],
  ) => {
    const g = new THREE.PlaneGeometry(w, h);
    const m = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(strength),
      side: THREE.DoubleSide,
    });
    geos.push(g);
    mats.push(m);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  };
  panel(14, 6, 0xffffff, 4, [0, 12, 2]); // overhead softbox
  panel(2.2, 12, 0xffffff, 3, [-11, 1, 5]); // key strip, left
  panel(1.6, 10, 0xeef0ff, 2, [11, 0, 3]); // fill strip, right
  panel(8, 4, 0xe8ccd2, 0.6, [4, -2, -12]); // warm bounce behind
  panel(30, 3, 0xffffff, 0.35, [0, -1, 14]); // soft horizon front
  panel(12, 5, 0xffffff, 2.2, [0, 9, -9]); // high back light, for the top
  return {
    scene,
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}

// The counter scene: a white stone worktop against a navy tiled wall,
// window light falling across both, and a few things you'd find there.
function buildCounter(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };
  const topY = -BODY_H / 2 - 0.19;
  const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
    const t = track(canvasTexture(w, h, draw));
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };

  // Worktop: honed white stone with soft grey-lilac veins.
  const r = rng2(7);
  const stone = tex(1024, 512, (g) => {
    g.fillStyle = "#ecebf0";
    g.fillRect(0, 0, 1024, 512);
    g.filter = "blur(3px)";
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(${130 + r() * 30},${130 + r() * 25},${160 + r() * 20},${0.08 + r() * 0.14})`;
      g.lineWidth = 0.6 + r() * 2.4;
      g.beginPath();
      let x = r() * 1024;
      let y = r() * 512;
      g.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        const nx = x + 80 + r() * 140;
        const ny = y + (r() - 0.5) * 120;
        g.quadraticCurveTo(x + (r() - 0.3) * 120, y + (r() - 0.5) * 140, nx, ny);
        x = nx;
        y = ny;
      }
      g.stroke();
    }
    g.filter = "none";
  });
  const slab = new THREE.Mesh(
    track(new THREE.BoxGeometry(14, 0.32, 5.5)),
    track(
      new THREE.MeshPhysicalMaterial({
        map: stone,
        roughness: 0.32,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
      }),
    ),
  );
  slab.position.set(0, topY - 0.16, 0.6);
  slab.receiveShadow = true;
  scene.add(slab);

  // Wall: tall navy tiles, each glazed slightly differently.
  const tiles = tex(1024, 1024, (g) => {
    const cols = 8;
    const rows = 4;
    const w = 1024 / cols;
    const h = 1024 / rows;
    g.fillStyle = "#11142a";
    g.fillRect(0, 0, 1024, 1024);
    for (let c = 0; c < cols; c++)
      for (let k = 0; k < rows; k++) {
        const v = r() * 10;
        g.fillStyle = `rgb(${28 + v},${33 + v},${66 + v * 1.4})`;
        g.fillRect(c * w + 3, k * h + 3, w - 6, h - 6);
        const sh = g.createLinearGradient(c * w, 0, c * w + w, 0);
        sh.addColorStop(0, "rgba(255,255,255,0.05)");
        sh.addColorStop(0.5, "rgba(255,255,255,0)");
        g.fillStyle = sh;
        g.fillRect(c * w + 3, k * h + 3, w - 6, h - 6);
      }
  });
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;
  tiles.repeat.set(2.5, 1.5);
  const wall = new THREE.Mesh(
    track(new THREE.PlaneGeometry(16, 8)),
    track(new THREE.MeshPhysicalMaterial({ map: tiles, roughness: 0.28, clearcoat: 0.6 })),
  );
  wall.position.set(0, topY + 4, -1.6);
  wall.receiveShadow = true;
  scene.add(wall);

  // Window light thrown across the wall and worktop.
  const shaft = tex(512, 512, (g) => {
    g.clearRect(0, 0, 512, 512);
    g.filter = "blur(14px)";
    g.fillStyle = "rgba(225,232,255,0.55)";
    const pane = (x: number) => {
      g.beginPath();
      g.moveTo(x, 40);
      g.lineTo(x + 120, 40);
      g.lineTo(x + 200, 470);
      g.lineTo(x + 80, 470);
      g.closePath();
      g.fill();
    };
    pane(60);
    pane(210);
    g.filter = "none";
  });
  const lightMat = track(
    new THREE.MeshBasicMaterial({
      map: shaft,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.5,
    }),
  );
  const patch = new THREE.Mesh(track(new THREE.PlaneGeometry(6, 5)), lightMat);
  patch.position.set(-3.2, topY + 2.6, -1.58);
  scene.add(patch);
  const pool = new THREE.Mesh(track(new THREE.PlaneGeometry(6, 3.4)), lightMat);
  pool.rotation.x = -Math.PI / 2;
  pool.rotation.z = 0.5;
  pool.position.set(-2.4, topY + 0.004, 0.4);
  scene.add(pool);

  // A glass of water.
  const glassPts = [
    [0, 0],
    [0.24, 0],
    [0.26, 0.04],
    [0.28, 0.72],
    [0.265, 0.72],
    [0.245, 0.06],
    [0, 0.06],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const glassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.03,
      transmission: 1,
      thickness: 0.08,
      ior: 1.5,
      clearcoat: 1,
    }),
  );
  const glass = new THREE.Mesh(track(new THREE.LatheGeometry(glassPts, 48)), glassMat);
  glass.position.set(-2.55, topY, 0.9);
  glass.castShadow = true;
  scene.add(glass);
  const water = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.245, 0.24, 0.42, 40)),
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xe8f0ff,
        roughness: 0.02,
        transmission: 1,
        thickness: 0.4,
        ior: 1.33,
      }),
    ),
  );
  water.position.set(-2.55, topY + 0.27, 0.9);
  scene.add(water);

  // A small stoneware pot with a trailing plant.
  const potMat = track(
    new THREE.MeshStandardMaterial({ color: 0xd9d3cf, roughness: 0.85 }),
  );
  const pot = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.42, 0.34, 0.62, 40)),
    potMat,
  );
  pot.position.set(2.75, topY + 0.31, -0.7);
  pot.castShadow = true;
  scene.add(pot);
  const leafMat = track(
    new THREE.MeshStandardMaterial({ color: 0x2f4a3f, roughness: 0.6, side: THREE.DoubleSide }),
  );
  const leafG = track(new THREE.SphereGeometry(0.16, 12, 8));
  const plant = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2;
    const h = 0.2 + r() * 1.1;
    const leaf = new THREE.Mesh(leafG, leafMat);
    leaf.scale.set(1, 0.18, 0.55);
    leaf.position.set(Math.cos(a) * (0.1 + h * 0.35), h, Math.sin(a) * (0.1 + h * 0.3));
    leaf.rotation.set(r() - 0.5, a, 0.4 + r() * 0.6);
    leaf.castShadow = true;
    plant.add(leaf);
  }
  plant.position.set(2.75, topY + 0.6, -0.7);
  scene.add(plant);

  // A folded towel.
  const towel = new THREE.Mesh(
    track(new RoundedBoxGeometry(1.3, 0.22, 0.75, 4, 0.1)),
    track(new THREE.MeshStandardMaterial({ color: 0xe8ccd2, roughness: 0.95 })),
  );
  towel.position.set(2.1, topY + 0.11, 1.15);
  towel.rotation.y = 0.25;
  towel.castShadow = true;
  towel.receiveShadow = true;
  scene.add(towel);

  return {
    tick(t: number) {
      lightMat.opacity = 0.44 + Math.sin(t * 0.3) * 0.06;
      plant.rotation.y = Math.sin(t * 0.4) * 0.03;
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
}

function rng2(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
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
  onReady,
}: {
  /** Called once the first frame is on screen. */
  onReady?: () => void;
  /** "anatomy": pulled apart by `explode` (0-1), turned by dragging. */
  mode?: "hero" | "anatomy" | "counter";
  explode?: MotionValue<number>;
  labels?: Partial<Record<Layer, RefObject<HTMLElement | null>>>;
  progress?: MotionValue<number>;
  anchors?: Partial<Record<AnchorId, RefObject<HTMLElement | null>>>;
  boxes?: Partial<Record<AnchorId, RefObject<HTMLElement | null>>>;
  className?: string;
  onUnsupported?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    // Heavy WebGL setup waits until the intro has lifted, so the intro
    // stays smooth.
    // It also waits until the device is close to the viewport, so a model
    // further down the page costs nothing until you scroll near it.
    let cleanup: (() => void) | undefined;
    let cancelIntro = () => {};
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        cancelIntro = afterIntro(() => {
          cleanup = init();
        });
      },
      { rootMargin: "60% 0px" },
    );
    if (containerRef.current) near.observe(containerRef.current);
    return () => {
      near.disconnect();
      cancelIntro();
      cleanup?.();
    };

    function init(): (() => void) | undefined {
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
      // 1.5x is visually indistinguishable from 2x behind the soft
      // materials here, at a little over half the pixels.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      // The frosted parts refract a half-resolution copy of the scene.
      renderer.transmissionResolutionScale = 0.5;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      // The shadow is redrawn only when the device has actually moved.
      renderer.shadowMap.autoUpdate = false;
      RectAreaLightUniformsLib.init();
      renderer.toneMappingExposure = 1.0;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.setAttribute("aria-hidden", "true");
      // Fades in once it has drawn, rather than popping in.
      renderer.domElement.style.opacity = "0";
      renderer.domElement.style.transition =
        "opacity 900ms cubic-bezier(.16,1,.3,1)";
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const studio = studioEnvironment();
      const envTex = pmrem.fromScene(studio.scene, 0.02).texture;
      studio.dispose();
      scene.environment = envTex;
      scene.environmentIntensity = 1.05;

      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

      // Light: cool key from above left, blush and periwinkle rims.
      scene.add(new THREE.HemisphereLight(0xdfe3ff, 0x1f2441, 0.2));
      const key = new THREE.DirectionalLight(0xfff8f4, 2.6);
      key.position.set(-2.5, 8, 3.5);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.radius = 6;
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
      const rimL = new THREE.PointLight(0x8a8db3, 11, 12);
      rimL.position.set(-4, 1, -2);
      scene.add(rimL);
      const rimR = new THREE.PointLight(0xe8ccd2, 14, 12);
      rimR.position.set(4, 0.5, -1.5);
      scene.add(rimR);

      const { group, disposables, doseMat, streamMat } = buildDevice();
      const anatomy = mode === "anatomy";
      const counter = mode === "counter";
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
      const room = counter ? buildCounter(scene, renderer) : undefined;
      if (counter) {
        shadow.visible = false;
        ground.visible = false;
        scene.environmentIntensity = 0.8;
        key.position.set(-6, 7, 2);
        key.color.set(0xe4e9ff);
        key.intensity = 3.2;
        rimL.intensity = 4;
      }

      function resize() {
        const w = container!.clientWidth;
        const h = container!.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Fit about 4.4 x 3.0 units of model, whichever bound is tighter.
        const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
        const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
        const room = anatomy
          ? camera.aspect < 1
            ? 1.45
            : 1.9
          : camera.aspect < 1
            ? 1.3
            : 1.45;
        const dist =
          Math.max(2.2 / Math.tan(hHalf), 1.5 / Math.tan(vHalf)) * 1.08 * room;
        if (counter) {
          const narrow = camera.aspect < 1;
          const d = narrow ? dist * 0.8 : dist * 1.05;
          camera.position.set(0.4, 0.9, d);
          camera.lookAt(narrow ? 0.2 : -1.7, narrow ? 1.5 : 0.15, 0);
        } else {
          camera.position.set(0, dist * 0.18, dist);
          camera.lookAt(0, -0.1, 0);
        }
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

      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
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
        container.dataset.cursor = "Drag to turn";
        container.style.touchAction = "pan-y";
        container.addEventListener("pointerdown", onDown);
        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerup", onUp);
        container.addEventListener("pointercancel", onUp);
      }

      let lastPose = NaN;
      function markShadow(pose: number) {
        if (Math.abs(pose - lastPose) > 0.004 || Number.isNaN(lastPose)) {
          renderer.shadowMap.needsUpdate = true;
          lastPose = pose;
        }
      }

      const pt = new THREE.Vector3();
      function frameAnatomy(t: number) {
        const raw = explode?.get() ?? 1;
        const e = raw * raw * (3 - 2 * raw); // smoothstep
        for (const [c, base] of basePos) {
          const l = c.userData.layer as Layer | undefined;
          if (!l) continue;
          const o = EXPLODE[l].offset;
          c.position.set(
            base.x + o[0] * e,
            base.y + o[1] * e,
            base.z + o[2] * e,
          );
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
        markShadow(drift + dragYaw + e * 7);
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
        if (counter) {
          // Morning: the device sits still; the light breathes and the
          // camera drifts a little, as if handheld.
          pivot.rotation.set(0, -0.38, 0);
          camera.position.x = 0.4 + (still ? 0 : Math.sin(t * 0.18) * 0.25);
          if (!still) room?.tick(t);
          markShadow(0);
          renderer.render(scene, camera);
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
        markShadow(pitch + yaw + drift);

        const dose = keyframe(p, [
          [0.54, 0],
          [0.62, 1],
          [0.72, 1],
          [0.8, 0],
        ]);
        const pour = keyframe(p, [
          [0.52, 0],
          [0.56, 1],
          [0.64, 1],
          [0.68, 0],
        ]);
        cupLight.intensity = dose * 0.8;
        doseMat.opacity = dose * 0.95;
        doseMat.emissiveIntensity = dose * 0.25;
        streamMat.opacity = pour * 0.9;

        renderer.render(scene, camera);
        placeAnchors();
      }

      let raf = 0;
      let visible = true;
      let ready = false;
      const loop = () => {
        // Skip rendering while the entry gate covers the page.
        if (document.documentElement.dataset.gate !== "open") frame();
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (!ready) return;
        cancelAnimationFrame(raf);
        if (visible && !still) raf = requestAnimationFrame(loop);
        else if (visible) frame();
      });
      io.observe(container);

      // Reduced motion: render on scroll changes only, no idle drift.
      const driver = progress ?? explode;
      const unsub =
        still && driver
          ? driver.on("change", () => ready && visible && frame())
          : undefined;

      // Compile every shader off the main thread where the browser allows
      // it, so the first frame doesn't freeze scrolling. Then fade in.
      let disposed = false;
      const begin = () => {
        if (disposed) return;
        ready = true;
        frame();
        renderer.domElement.style.opacity = "1";
        onReadyRef.current?.();
        if (visible && !still) raf = requestAnimationFrame(loop);
      };
      renderer.compileAsync(scene, camera).then(begin, begin);

      return () => {
        disposed = true;
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
        room?.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
  }, [progress, anchors, boxes, onUnsupported, mode, explode, labels]);

  return (
    <div
      ref={containerRef}
      className={
        className.includes("absolute") ? className : `relative ${className}`
      }
    />
  );
}
