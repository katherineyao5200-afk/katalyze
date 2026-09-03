"use client";

import type { CSSProperties } from "react";

/**
 * Coded SVG illustration of the device, front elevation — built from the
 * real render's proportions and layout (body, frosted window, six
 * cartridges, display + buttons, dispensing tray), not traced pixel for
 * pixel. No image-generation tool is available in this environment, and
 * a hand-built SVG can do things a static photo can't: individual parts
 * can be highlighted per active list item, and it holds up at any scale
 * with zero raster artifacts. Colors come from tokens.css via inline
 * `style` (SVG respects CSS custom properties when embedded in JSX).
 *
 * `activePart` highlights one named part (brightens its fill/stroke,
 * dims the rest slightly) — used to sync the illustration to whichever
 * list item is active in a pinned-scroll section.
 */

export type DevicePart =
  | "body"
  | "window"
  | "cartridge-base"
  | "cartridge-active"
  | "display"
  | "buttons"
  | "tray";

interface DeviceIllustrationProps {
  activePart?: DevicePart | null;
  className?: string;
}

const REST_OPACITY = 0.55;

export default function DeviceIllustration({
  activePart = null,
  className = "",
}: DeviceIllustrationProps) {
  function partStyle(part: DevicePart): CSSProperties {
    if (!activePart) return {};
    const isActive = activePart === part;
    return {
      transition: "opacity var(--dur-base) var(--ease-soft)",
      opacity: isActive ? 1 : REST_OPACITY,
    };
  }

  return (
    <svg
      viewBox="0 0 400 232"
      className={className}
      role="img"
      aria-label="Illustration of the Katalyze device: a rounded countertop unit with a frosted window revealing six cartridges, a display and button cluster, and a dispensing tray."
    >
      {/* Grounding shadow */}
      <ellipse
        cx="200"
        cy="214"
        rx="150"
        ry="10"
        style={{ fill: "var(--midnight)", opacity: 0.25 }}
      />

      {/* Body */}
      <g style={partStyle("body")}>
        <rect
          x="30"
          y="30"
          width="340"
          height="170"
          rx="34"
          style={{ fill: "var(--white)" }}
        />
      </g>

      {/* Frosted window */}
      <g style={partStyle("window")}>
        <rect
          x="54"
          y="58"
          width="292"
          height="98"
          rx="14"
          style={{ fill: "var(--white)", opacity: 0.55 }}
        />
        <rect
          x="54"
          y="58"
          width="292"
          height="98"
          rx="14"
          style={{ fill: "none", stroke: "var(--rule-on-light)", strokeWidth: 1.5 }}
        />
      </g>

      {/* Base-formula cartridges (three taller bottles, left) */}
      <g style={partStyle("cartridge-base")}>
        {[92, 132, 172].map((cx, i) => (
          <g key={cx}>
            <rect
              x={cx - 16}
              y={78}
              width="32"
              height="66"
              rx="10"
              style={{
                fill:
                  i === 0
                    ? "var(--indigo)"
                    : i === 1
                      ? "var(--periwinkle)"
                      : "var(--white)",
                opacity: 0.9,
                stroke: "var(--rule-on-light)",
                strokeWidth: 1,
              }}
            />
            <rect
              x={cx - 8}
              y={68}
              width="16"
              height="14"
              rx="4"
              style={{ fill: "var(--periwinkle)", opacity: 0.8 }}
            />
          </g>
        ))}
      </g>

      {/* Active cartridges (three dropper bottles, right) */}
      <g style={partStyle("cartridge-active")}>
        {[224, 256, 288].map((cx, i) => (
          <g key={cx}>
            <rect
              x={cx - 10}
              y={98}
              width="20"
              height="46"
              rx="8"
              style={{
                fill: i === 0 ? "var(--periwinkle)" : "var(--blush)",
                opacity: 0.85,
                stroke: "var(--rule-on-light)",
                strokeWidth: 1,
              }}
            />
            <rect
              x={cx - 5}
              y={82}
              width="10"
              height="18"
              rx="3"
              style={{ fill: "var(--white)", stroke: "var(--rule-on-light)", strokeWidth: 1 }}
            />
          </g>
        ))}
      </g>

      {/* Display + buttons */}
      <g style={partStyle("display")}>
        <rect
          x="54"
          y="168"
          width="34"
          height="20"
          rx="5"
          style={{ fill: "var(--midnight)", opacity: 0.85 }}
        />
        <circle cx="71" cy="178" r="4" style={{ fill: "var(--blush)" }} />
      </g>
      <g style={partStyle("buttons")}>
        {[104, 122, 140].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy="178"
            r="7"
            style={{ fill: "none", stroke: "var(--rule-on-light)", strokeWidth: 1.5 }}
          />
        ))}
      </g>

      {/* Dispensing tray */}
      <g style={partStyle("tray")}>
        <path
          d="M 260 172 Q 260 188 296 188 Q 332 188 332 172 Z"
          style={{ fill: "var(--white)", stroke: "var(--rule-on-light)", strokeWidth: 1.5 }}
        />
      </g>
    </svg>
  );
}
