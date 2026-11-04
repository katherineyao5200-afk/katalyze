/*
 * The whole site sits under a thin layer of film: a fine moving grain and
 * a soft vignette that darkens the corners, so every section reads like
 * one continuous, lit scene rather than a stack of flat panels. Both are
 * fixed, pointer-transparent and compositor-only (transform + opacity),
 * so they add nothing to scroll cost. Grain holds still under reduced
 * motion; the light sections (text-midnight) aren't affected because the
 * layer blends with `soft-light`.
 */
export default function Atmosphere() {
  return (
    <div aria-hidden="true" className="atmosphere">
      <div className="atmosphere-grain" />
      <div className="atmosphere-vignette" />
    </div>
  );
}
