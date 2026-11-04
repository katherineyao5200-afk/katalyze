/*
 * Keeps a WebGL scene smooth on slower machines. Feed it the time between
 * animation frames; when the page is consistently missing frames it lowers
 * the render resolution a step, and when there's plenty of headroom again
 * it raises it back, never above `max`.
 */
export function createQualityGovernor(
  apply: (pixelRatio: number) => void,
  { max, min = 0.75, step = 0.25 }: { max: number; min?: number; step?: number },
) {
  let ratio = max;
  let ema = 16.7;
  let n = 0;
  let good = 0;
  return {
    get ratio() {
      return ratio;
    },
    /** Call once per animation frame with the time since the last one, in ms. */
    sample(dtMs: number) {
      // Ignore gaps from background tabs or the section scrolling off.
      if (dtMs <= 0 || dtMs > 250) return;
      ema += (dtMs - ema) * 0.08;
      if (++n < 45) return;
      n = 0;
      if (ema > 24 && ratio > min) {
        ratio = Math.max(min, ratio - step);
        good = 0;
        apply(ratio);
      } else if (ema < 14 && ratio < max) {
        // Step back up only after a few smooth windows in a row.
        if (++good >= 4) {
          ratio = Math.min(max, ratio + step);
          good = 0;
          apply(ratio);
        }
      } else {
        good = 0;
      }
    },
  };
}
