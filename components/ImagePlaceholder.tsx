interface ImagePlaceholderProps {
  width: number;
  height: number;
  alt: string;
  className?: string;
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
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={`w-full rounded-2xl bg-gradient-to-br from-navy-700 via-navy-900 to-near-black ${className}`}
    />
  );
}
