"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Opt-in ambient sound, off by default. A slow, warm pad (three detuned
 * voices through a low-pass filter that breathes) with a faint glassy
 * chime now and then, all synthesised in the browser: no audio files to
 * download. Fades in and out; pauses when the tab is hidden.
 */

type Rig = {
  ctx: AudioContext;
  master: GainNode;
  stop: () => void;
};

function buildRig(): Rig {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);

  // A soft room: a short feedback delay pair standing in for reverb.
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  const dl = ctx.createDelay(1);
  dl.delayTime.value = 0.43;
  const fb = ctx.createGain();
  fb.gain.value = 0.45;
  const damp = ctx.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 1800;
  dl.connect(damp).connect(fb).connect(dl);
  dl.connect(wet).connect(master);

  // Pad: D-flat major add9, low and wide.
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 700;
  filter.Q.value = 0.6;
  filter.connect(master);
  filter.connect(dl);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoAmt = ctx.createGain();
  lfoAmt.gain.value = 320;
  lfo.connect(lfoAmt).connect(filter.frequency);
  lfo.start();

  const voices: OscillatorNode[] = [];
  [69.3, 103.83, 138.59, 155.56, 174.61].forEach((f, i) => {
    for (const detune of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = i < 2 ? "sine" : "triangle";
      o.frequency.value = f;
      o.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = i < 2 ? 0.07 : 0.025;
      o.connect(g).connect(filter);
      o.start();
      voices.push(o);
    }
  });

  // Chimes: a quiet pentatonic bell every few seconds.
  const bells = [554.37, 622.25, 739.99, 830.61, 932.33, 1108.73];
  let timer = 0;
  const chime = () => {
    const t = ctx.currentTime;
    const f = bells[Math.floor(Math.random() * bells.length)];
    for (const [mult, amp] of [
      [1, 0.05],
      [2.76, 0.012],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f * mult;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      o.connect(g);
      g.connect(master);
      g.connect(dl);
      o.start(t);
      o.stop(t + 3.3);
    }
    timer = window.setTimeout(chime, 3500 + Math.random() * 6000);
  };
  timer = window.setTimeout(chime, 1800);

  return {
    ctx,
    master,
    stop: () => {
      clearTimeout(timer);
      voices.forEach((v) => v.stop());
      lfo.stop();
      ctx.close();
    },
  };
}

export default function AmbientSound() {
  const [on, setOn] = useState(false);
  const rig = useRef<Rig | null>(null);

  // Fade the master gain to match the toggle.
  useEffect(() => {
    if (on && !rig.current) {
      try {
        rig.current = buildRig();
      } catch {
        return;
      }
    }
    const r = rig.current;
    if (!r) return;
    const t = r.ctx.currentTime;
    r.master.gain.cancelScheduledValues(t);
    r.master.gain.setValueAtTime(r.master.gain.value, t);
    r.master.gain.linearRampToValueAtTime(on ? 0.55 : 0, t + (on ? 2.5 : 0.8));
    if (on) r.ctx.resume();
  }, [on]);

  // Hidden tab: suspend; back: resume if it was on.
  useEffect(() => {
    const onVis = () => {
      const r = rig.current;
      if (!r) return;
      if (document.hidden) r.ctx.suspend();
      else if (on) r.ctx.resume();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [on]);

  useEffect(
    () => () => {
      rig.current?.stop();
      rig.current = null;
    },
    [],
  );

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      data-on={on ? "" : undefined}
      className="sound-toggle corner-link fixed bottom-6 right-6 z-40 hidden items-center gap-2.5 text-white mix-blend-difference lg:flex"
      style={{ fontSize: "var(--text-xs)" }}
    >
      <span className="sound-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      Sound {on ? "on" : "off"}
    </button>
  );
}
