interface ImagePlaceholderProps {
  width: number;
  height: number;
  alt: string;
  className?: string;
  /** Overrides the default var(--r-lg) — e.g. for edge-bleeding crops. */
  radius?: string;
}

/**
 * Stands in for a product render that doesn't exist yet. Swap for
 * next/image once real renders land — keep the same width/height from
 * lib/images.ts so layout doesn't shift.
 */
export default function ImagePlaceholder({
  width,
  height,
  alt,
  className = "",
  radius = "var(--r-lg)",
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`grain w-full ${className}`}
      style={{
        aspectRatio: `${width} / ${height}`,
        borderRadius: radius,
        backgroundImage: "var(--grad-atmosphere)",
      }}
    />
  );
}
