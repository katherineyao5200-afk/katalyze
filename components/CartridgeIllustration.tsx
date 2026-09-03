"use client";

/**
 * Close-up SVG of the six cartridges alone — for Formulation's light-
 * ground pinned section, where DeviceIllustration's white body would
 * vanish against a white background. "Cartridge, not the whole device"
 * for this section's subject. `activeIndex` (0-5, base formulas then
 * actives, matching Formulation's SPECIMENS order) highlights one
 * bottle per the currently-active list item.
 */

interface CartridgeIllustrationProps {
  activeIndex?: number;
  className?: string;
}

const BASE_X = [70, 130, 190];
const ACTIVE_X = [260, 310, 360];

export default function CartridgeIllustration({
  activeIndex,
  className = "",
}: CartridgeIllustrationProps) {
  const baseColors = ["var(--indigo)", "var(--periwinkle)", "var(--white)"];
  const activeColors = ["var(--periwinkle)", "var(--blush)", "var(--blush)"];

  return (
    <svg
      viewBox="0 0 420 200"
      className={className}
      role="img"
      aria-label="Illustration of the six Katalyze cartridges: three base formulas and three active ingredients."
    >
      <ellipse
        cx="210"
        cy="182"
        rx="190"
        ry="8"
        style={{ fill: "var(--ink-on-light)", opacity: 0.08 }}
      />

      {BASE_X.map((cx, i) => {
        const index = i;
        const isActive = activeIndex === index;
        return (
          <g
            key={`base-${cx}`}
            style={{
              transition: "opacity var(--dur-base) var(--ease-soft)",
              opacity: activeIndex == null || isActive ? 1 : 0.4,
            }}
          >
            <rect
              x={cx - 24}
              y={40}
              width="48"
              height="128"
              rx="16"
              style={{
                fill: baseColors[i],
                opacity: 0.9,
                stroke: "var(--rule-on-light)",
                strokeWidth: 1.5,
              }}
            />
            <rect
              x={cx - 12}
              y={22}
              width="24"
              height="22"
              rx="6"
              style={{ fill: "var(--indigo)", opacity: 0.8 }}
            />
          </g>
        );
      })}

      {ACTIVE_X.map((cx, i) => {
        const index = 3 + i;
        const isActive = activeIndex === index;
        return (
          <g
            key={`active-${cx}`}
            style={{
              transition: "opacity var(--dur-base) var(--ease-soft)",
              opacity: activeIndex == null || isActive ? 1 : 0.4,
            }}
          >
            <rect
              x={cx - 15}
              y={80}
              width="30"
              height="88"
              rx="12"
              style={{
                fill: activeColors[i],
                opacity: 0.9,
                stroke: "var(--rule-on-light)",
                strokeWidth: 1.5,
              }}
            />
            <rect
              x={cx - 7}
              y={54}
              width="14"
              height="28"
              rx="5"
              style={{ fill: "var(--white)", stroke: "var(--rule-on-light)", strokeWidth: 1.5 }}
            />
          </g>
        );
      })}
    </svg>
  );
}
