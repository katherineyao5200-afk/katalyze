/**
 * Runs `start` once the opening intro has lifted (or at once if there is
 * no intro), then waits for an idle moment so heavy WebGL setup never
 * competes with the intro's animation. Returns a cancel function.
 */
export function afterIntro(start: () => void): () => void {
  const root = document.documentElement;
  let done = false;
  let idle = 0;
  let timer = 0;
  const go = () => {
    if (done) return;
    done = true;
    mo.disconnect();
    const ric = window.requestIdleCallback;
    if (ric) idle = ric(() => start(), { timeout: 600 });
    else timer = window.setTimeout(start, 50);
  };
  // The boot script marks pages with no intro as `no-intro`; Intro adds
  // `intro-done` once its curtain has fully lifted.
  const ready = () =>
    root.classList.contains("no-intro") ||
    root.classList.contains("intro-done");
  const mo = new MutationObserver(() => {
    if (ready()) go();
  });
  if (ready()) go();
  else mo.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => {
    done = true;
    mo.disconnect();
    if (idle) window.cancelIdleCallback?.(idle);
    clearTimeout(timer);
  };
}
