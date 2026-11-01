// The four-point star from the Katalyze mark. Used as the site's one
// recurring glyph: section markers, data points, the star chart.
export const SPARKLE_PATH =
  "M12 0C12.7 7.1 16.9 11.3 24 12C16.9 12.7 12.7 16.9 12 24C11.3 16.9 7.1 12.7 0 12C7.1 11.3 11.3 7.1 12 0Z";

export default function Sparkle({
  size = 10,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d={SPARKLE_PATH} />
    </svg>
  );
}
