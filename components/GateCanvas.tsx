"use client";

import { useEffect, useRef } from "react";

/**
 * The paint surface for System C (§11) — raw WebGL2, no three.js (this
 * doesn't need a scene graph). Semi-Lagrangian dye + velocity advection
 * with decay, at half resolution, painted at the pointer. This is a
 * deliberate simplification of "stable-fluids advection-diffusion":
 * semi-Lagrangian backwards sampling (the technique that makes Stam's
 * method unconditionally stable) without the pressure-projection step
 * that makes it a true incompressible solver. A full NS solve is much
 * harder to debug correctly without live visual iteration, which this
 * environment doesn't reliably have (see ParticleField's history). The
 * result reads as soft painted trails that drift and fade rather than
 * swirl with real vortices — it still delivers "trace blooms into the
 * gradient," which is the actual design goal.
 */

const DISSIPATION = 0.985;
const DYE_DISSIPATION = 0.982;
const DT = 0.016;
const INJECT_RADIUS = 0.03;

const VERTEX = /* glsl */ `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const VELOCITY_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uVelocity;
uniform vec2 uPointer;
uniform vec2 uPointerVelocity;
uniform float uPointerActive;

void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 backUv = vUv - vel * ${DT};
  vec2 advected = texture(uVelocity, backUv).xy * ${DISSIPATION};

  float d = distance(vUv, uPointer);
  if (uPointerActive > 0.5 && d < ${INJECT_RADIUS}) {
    float falloff = 1.0 - d / ${INJECT_RADIUS};
    advected += uPointerVelocity * falloff * 0.6;
  }
  outColor = vec4(advected, 0.0, 1.0);
}
`;

const DYE_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uDye;
uniform sampler2D uVelocity;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform vec3 uInjectColor;

void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 backUv = vUv - vel * ${DT};
  vec3 advected = texture(uDye, backUv).rgb * ${DYE_DISSIPATION};

  float d = distance(vUv, uPointer);
  if (uPointerActive > 0.5 && d < ${INJECT_RADIUS}) {
    float falloff = smoothstep(${INJECT_RADIUS}, 0.0, d);
    advected += uInjectColor * falloff * 0.35;
  }
  outColor = vec4(advected, 1.0);
}
`;

const RENDER_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uDye;

void main() {
  vec3 color = texture(uDye, vUv).rgb;
  float alpha = clamp(max(max(color.r, color.g), color.b) * 2.2, 0.0, 1.0);
  outColor = vec4(color, alpha);
}
`;

// Dye palette ramp: midnight -> indigo -> periwinkle -> blush (§11),
// one hue family, picked by pointer speed like the particle field.
const MIDNIGHT: [number, number, number] = [0x1f / 255, 0x24 / 255, 0x41 / 255];
const INDIGO: [number, number, number] = [0x31 / 255, 0x3f / 255, 0x79 / 255];
const PERIWINKLE: [number, number, number] = [0x8a / 255, 0x8d / 255, 0xb3 / 255];
const BLUSH: [number, number, number] = [0xe8 / 255, 0xcc / 255, 0xd2 / 255];

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${info}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, fragSrc: string) {
  const program = gl.createProgram()!;
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${info}`);
  }
  return program;
}

function createFbo(gl: WebGL2RenderingContext, w: number, h: number) {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return { texture, fbo };
}

interface GateCanvasProps {
  onPathLength: (delta: number) => void;
}

export default function GateCanvas({ onPathLength }: GateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onPathLengthRef = useRef(onPathLength);

  useEffect(() => {
    onPathLengthRef.current = onPathLength;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const ext = gl.getExtension("EXT_color_buffer_float");
    if (!ext) return;

    const simScale = 0.5; // half resolution, per spec
    let simW = 0;
    let simH = 0;

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const velocityProgram = createProgram(gl, VELOCITY_FRAGMENT);
    const dyeProgram = createProgram(gl, DYE_FRAGMENT);
    const renderProgram = createProgram(gl, RENDER_FRAGMENT);

    function bindQuad(program: WebGLProgram) {
      const loc = gl!.getAttribLocation(program, "position");
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
    }

    let velocityFbos = [
      createFbo(gl, 2, 2),
      createFbo(gl, 2, 2),
    ];
    let dyeFbos = [createFbo(gl, 2, 2), createFbo(gl, 2, 2)];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      simW = Math.max(2, Math.floor(canvas!.width * simScale));
      simH = Math.max(2, Math.floor(canvas!.height * simScale));

      for (const { texture, fbo } of [...velocityFbos, ...dyeFbos]) {
        gl!.deleteTexture(texture);
        gl!.deleteFramebuffer(fbo);
      }
      velocityFbos = [createFbo(gl!, simW, simH), createFbo(gl!, simW, simH)];
      dyeFbos = [createFbo(gl!, simW, simH), createFbo(gl!, simW, simH)];
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let pointerActive = false;
    let pointer = { x: 0.5, y: 0.5 };
    let pointerVel = { x: 0, y: 0 };
    let lastPointer = { x: 0.5, y: 0.5 };
    let injectColor: [number, number, number] = INDIGO;

    function onMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      const prevPointer = lastPointer;

      pointerVel = { x: (x - prevPointer.x) * 5, y: (y - prevPointer.y) * 5 };
      lastPointer = { x, y };
      pointer = { x, y };
      pointerActive = true;

      const speed = Math.min(1, Math.hypot(pointerVel.x, pointerVel.y) * 3);
      injectColor =
        speed > 0.6
          ? lerp3(PERIWINKLE, BLUSH, (speed - 0.6) / 0.4)
          : speed > 0.25
            ? lerp3(INDIGO, PERIWINKLE, (speed - 0.25) / 0.35)
            : lerp3(MIDNIGHT, INDIGO, speed / 0.25);

      const dxPx = (x - prevPointer.x) * rect.width;
      const dyPx = (y - prevPointer.y) * rect.height;
      onPathLengthRef.current(Math.hypot(dxPx, dyPx));
    }
    function onLeave() {
      pointerActive = false;
    }

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerup", onLeave);

    let rafId: number;
    function step(gl: WebGL2RenderingContext, program: WebGLProgram, target: { fbo: WebGLFramebuffer }, w: number, h: number, setUniforms: () => void) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      bindQuad(program);
      setUniforms();
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function frame() {
      // Velocity step
      const [vRead, vWrite] = velocityFbos;
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, vRead.texture);
      step(gl!, velocityProgram, vWrite, simW, simH, () => {
        gl!.uniform1i(gl!.getUniformLocation(velocityProgram, "uVelocity"), 0);
        gl!.uniform2f(gl!.getUniformLocation(velocityProgram, "uPointer"), pointer.x, pointer.y);
        gl!.uniform2f(
          gl!.getUniformLocation(velocityProgram, "uPointerVelocity"),
          pointerVel.x,
          pointerVel.y,
        );
        gl!.uniform1f(
          gl!.getUniformLocation(velocityProgram, "uPointerActive"),
          pointerActive ? 1 : 0,
        );
      });
      velocityFbos = [vWrite, vRead];

      // Dye step
      const [dRead, dWrite] = dyeFbos;
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, dRead.texture);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, velocityFbos[0].texture);
      step(gl!, dyeProgram, dWrite, simW, simH, () => {
        gl!.uniform1i(gl!.getUniformLocation(dyeProgram, "uDye"), 0);
        gl!.uniform1i(gl!.getUniformLocation(dyeProgram, "uVelocity"), 1);
        gl!.uniform2f(gl!.getUniformLocation(dyeProgram, "uPointer"), pointer.x, pointer.y);
        gl!.uniform1f(
          gl!.getUniformLocation(dyeProgram, "uPointerActive"),
          pointerActive ? 1 : 0,
        );
        gl!.uniform3f(
          gl!.getUniformLocation(dyeProgram, "uInjectColor"),
          injectColor[0],
          injectColor[1],
          injectColor[2],
        );
      });
      dyeFbos = [dWrite, dRead];

      // Composite to screen
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.useProgram(renderProgram);
      bindQuad(renderProgram);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, dyeFbos[0].texture);
      gl!.uniform1i(gl!.getUniformLocation(renderProgram, "uDye"), 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onLeave);
      for (const { texture, fbo } of [...velocityFbos, ...dyeFbos]) {
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(fbo);
      }
      gl.deleteProgram(velocityProgram);
      gl.deleteProgram(dyeProgram);
      gl.deleteProgram(renderProgram);
      gl.deleteBuffer(quad);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ cursor: "none" }}
    />
  );
}
