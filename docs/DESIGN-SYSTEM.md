# CLAUDE.md — Katalyze

Design system and working agreement. Read this file in full before writing any markup, CSS, or copy. Every value here is literal. If a request conflicts with a rule in this file, say so and ask before deviating. If a value you need is not in this file, ask — do not invent one.

---

## 1. The brand

Katalyze is a personalized skincare printer. It reads real data about a person's skin and lifestyle and dispenses custom cartridge-based formulations.

**Slogan:** Your catalyst to better skin.

**Position:** The beauty industry sells insecurity through vagueness. Katalyze sells measurement. We know things about your skin that a shelf product cannot.

**Tone:** Precise, quiet, a little cosmic. Never cheerful, never reassuring, never flattering.

### The visual thesis — read this before every design decision

**A constellation of measurements, mapped onto skin.**

Skin photographed in the dark, lit by points of data. Deep midnight opening into periwinkle and then into a pale dusty rose, the way night opens into dawn. Sharp high-contrast serif italic against flat neutral sans. Tiny monospaced labels with hairline leader lines pointing at things, like a scientific plate.

It is editorial and dark, not clinical and white. It is atmospheric, not decorative. Every glowing point on the page is a data point, never an ornament.

---

## 2. Non-negotiables

1. Every value comes from `tokens.css`. No hex, px, or easing curve in a stylesheet unless it is a token. Need a new one? Add it to the token file and say why.
2. The palette is exactly four brand colors plus white and the gradient. Nothing else.
3. Two typefaces only: Migra (display) and Helvetica World (everything else). No third face.
4. Dark is the default. Light sections are deliberate exceptions, not the baseline.
5. Left-aligned by default. Centering is reserved for one hero line at most, and usually not even that.
6. Grain is applied over every gradient surface. A clean gradient is a bug.
7. WCAG AA: 4.5:1 body, 3:1 large text, 44×44px touch targets, visible `:focus-visible`, `prefers-reduced-motion` honored globally.
8. Real product imagery and real formulation data. No lorem ipsum, no invented clinical claims, no fabricated percentages. If an asset or number does not exist, ask for it.
9. No meta-commentary in the page — no "built with," no design rationale, no AI disclaimers, no explanatory HTML comments about the design.

---

## 3. Tokens

Create `tokens.css` with exactly this. These hex values come from the brand kit and are not open to interpretation.

```css
:root {
  /* ---- Brand core ---- */
  --midnight:    #1F2441;  /* primary ground, deepest value */
  --indigo:      #313F79;  /* structural mid, panels, active states */
  --periwinkle:  #8A8DB3;  /* secondary text on dark, hairlines, data points */
  --blush:       #E8CCD2;  /* accent — light terminus, icon mark, sparing highlight */
  --white:       #FFFFFF;  /* primary text on dark */

  /* ---- Derived neutrals (do not add more) ---- */
  --ink-on-light:   #1F2441;
  --muted-on-dark:  #8A8DB3;
  --faint-on-dark:  rgb(138 141 179 / 0.55);
  --rule-on-dark:   rgb(232 204 210 / 0.18);  /* hairlines — always alpha */
  --rule-on-light:  rgb(31 36 65 / 0.14);
  --panel:          rgb(49 63 121 / 0.28);    /* translucent card over gradient */

  /* ---- The brand gradient (sampled from the kit) ---- */
  --grad-atmosphere: linear-gradient(
    100deg,
    #1B2034 0%,
    #1E254D 22%,
    #2C3D7D 40%,
    #475C96 56%,
    #667DAE 70%,
    #8F97BC 84%,
    #C2B3C5 100%
  );
  /* Vertical variant for full-page grounds */
  --grad-vertical: linear-gradient(178deg, #1B2034 0%, #2C3D7D 45%, #8F97BC 82%, #E8CCD2 100%);
  /* Radial glow for data points and hero light sources */
  --grad-point: radial-gradient(circle, rgb(232 204 210 / 0.9) 0%, rgb(138 141 179 / 0.35) 40%, transparent 70%);

  /* ---- Type scale (1.25 minor third — editorial, tight) ---- */
  --text-2xs:   0.6875rem;   /* mono micro-labels */
  --text-xs:    0.75rem;
  --text-sm:    0.875rem;
  --text-base:  1rem;
  --text-lg:    1.25rem;
  --text-xl:    1.5625rem;
  --text-2xl:   1.953rem;
  --text-3xl:   clamp(2.4rem, 4.5vw, 3.75rem);
  --text-display: clamp(3.5rem, 8vw, 7rem);
  --text-hero:  clamp(4.5rem, 13vw, 12rem);   /* Migra only, one per page */

  --leading-display: 0.92;   /* Migra at hero size — set it TIGHT */
  --leading-tight:   1.08;
  --leading-snug:    1.3;
  --leading-body:    1.55;
  --measure:         58ch;

  --track-display: -0.02em;
  --track-body:     0;
  --track-label:    0.14em;   /* uppercase mono labels */

  /* ---- Spacing (4px base) ---- */
  --s-1: 0.25rem;  --s-2: 0.5rem;   --s-3: 0.75rem;
  --s-4: 1rem;     --s-6: 1.5rem;   --s-8: 2rem;
  --s-12: 3rem;    --s-16: 4rem;    --s-24: 6rem;
  --s-32: 8rem;    --s-40: 10rem;   --s-56: 14rem;

  /* ---- Grid ---- */
  --grid-cols: 12;
  --gutter: 1.5rem;
  --margin: clamp(1.25rem, 5vw, 5rem);
  --max-w: 1600px;

  /* ---- Radii — near-sharp. This brand is not soft. ---- */
  --r-none: 0;
  --r-sm: 2px;    /* inputs, chips */
  --r-md: 3px;    /* buttons */
  --r-lg: 8px;    /* cards, panels */
  --r-full: 999px; /* mono label pills and nothing else */

  /* ---- Motion ---- */
  --ease-glide: cubic-bezier(0.22, 1, 0.36, 1);   /* default entrance */
  --ease-soft:  cubic-bezier(0.4, 0, 0.2, 1);     /* state change */
  --dur-fast:  180ms;
  --dur-base:  420ms;
  --dur-slow:  900ms;
  --dur-cine:  1600ms;   /* hero reveals only */
}
```

### Color usage rules

| Color        | Allowed use                                                                              |
| ------------ | ---------------------------------------------------------------------------------------- |
| `--midnight` | Page ground, dark sections, footer, text on light sections                                |
| `--indigo`   | Panels, translucent cards, chart mid-tones, active nav state                              |
| `--periwinkle` | Secondary text on dark, hairlines, grid lines, non-active data points                   |
| `--blush`    | The K mark, one accent moment per screen, active data points, underline on hover          |
| `--white`    | Primary text on dark, hero display type                                                   |

Blush is not a button color and not a background for large areas. It is the light at the end of the gradient. Treat it as scarce.

### Grain — mandatory over every gradient

Never ship a clean gradient. Overlay this on every gradient surface.

```css
.grain::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.19;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Grain opacity range: 0.14–0.22. Never animate it. Never let it sit above text.

---

## 4. Typography

```css
--font-display: 'Migra', 'Zodiak', Georgia, serif;      /* Pangram Pangram */
--font-body:    'Helvetica World', 'Switzer', system-ui, sans-serif;
--font-mono:    ui-monospace, 'SF Mono', Menlo, monospace;  /* labels only, see below */
```

Migra and Helvetica World are licensed faces — self-host the woff2 files in `/fonts` with `font-display: swap`. If a license is missing, fall back to Zodiak and Switzer from Fontshare and flag it, but do not silently substitute a Google font.

The system monospace is permitted **only** for micro-labels, measurements, ingredient codes, and part numbers. Never for prose, never above `--text-xs`. It does not count as a third typeface because it never sets a sentence.

### Rules

- **Migra:** hero, section titles, pull quotes. Regular and Italic only. Set at `--leading-display` — tight enough that ascenders and descenders nearly touch. Never below 32px. Never bold-faked.
- **The italic is the signature.** Mix roman and italic within a single headline, one idea per line: roman for the statement, italic for the turn. `We measure.` roman / `They guess.` italic. Do this on the hero and once or twice more per page — not everywhere.
- **Helvetica World:** all body, nav, buttons, captions. Regular and Medium only. Flat and unstyled — it is the neutral against Migra's drama. No letterspacing except on uppercase labels.
- **Micro-labels:** mono, `--text-2xs`, uppercase, `--track-label`, `--periwinkle`. These carry the scientific-plate feel. Use them for section numbers, ingredient names, phase markers, spec values.
- Scale contrast must be extreme. A hero at `--text-hero` sitting next to a `--text-2xs` label is correct. If your largest and smallest type on a screen are within 4× of each other, the page is under-designed.

---

## 5. Layout system — read this twice

This is where the build has been going generic. The following are requirements, not suggestions.

### Grid

12 columns, `--gutter` gutters, `--margin` page margins, `--max-w` cap. Every element snaps to columns. **State the column span in a comment above each major block** so the grid stays legible in the code.

### The four layout devices that make this brand look like itself

**1. Annotated plate.** Any specimen — a cartridge, an ingredient, the device, a skin macro — gets a mono uppercase micro-label connected by a 1px `--periwinkle` hairline leader line. The label sits off to the side, never centered underneath. This single device does more for the brand than any other. Use it in at least three places on the homepage.

**2. Full-bleed atmospheric split.** Two panels edge to edge, no gutter between them, no container padding, different value on each side — a dark skin macro against a lighter gradient field. Text sits inside the image at the lower left in small type, not in a separate caption block below.

**3. Oversized numeral or measurement.** A single figure set in Migra at `--text-display` or larger, partially cropped by the container edge, with a mono label beside it. Numbers are the product. Show them at architectural scale.

**4. Data-point overlay.** Small glowing points using `--grad-point` positioned over imagery, connected by hairlines to labels. This is the constellation-on-skin idea made literal. It appears on the hero and in the analysis section.

### Section rhythm — no two sections may be alike

Vertical padding cycles through `--s-16`, `--s-40`, `--s-24`, `--s-56` and repeats. Never give consecutive sections the same padding. Alternate between:

- full-bleed (no container, no margin)
- wide container (12 cols)
- narrow text column (cols 2–7, never centered)

**At least two sections per page must break the container entirely.**

### Hard layout requirements

- Minimum three distinct grid structures per page. If every section is a centered container with a heading and a row of items, it fails.
- At least one element per screen extends past the text column or is cropped by the viewport edge.
- Asymmetry by default. Perfectly symmetrical layouts require justification in chat.
- Nested radius math: inner radius = outer radius − gap.
- Mobile-first. The 375px view is designed alongside desktop, not after. Full-bleed splits stack; leader lines shorten but stay; the hero drops to `clamp(3rem, 16vw, 5rem)`.

---

## 6. Homepage section spec

Build in this order, one at a time. Copy shown is final — use it verbatim.

| # | Section | Layout device | Notes |
|---|---------|---------------|-------|
| 01 | Hero | Full-bleed atmospheric, dark left → light right, grain | Migra hero: `Your catalyst` roman / `to better skin.` italic. Set at the lower-left, not centered. Skin macro with data-point overlay on the right two-thirds. One mono label bottom-right. |
| 02 | Thesis | Narrow column, cols 2–7, deep midnight | `We measure. They guess.` at `--text-3xl`, italic on the second sentence. Two short paragraphs max. Enormous surrounding whitespace. |
| 03 | Analysis | Annotated plate | Skin macro with 5–7 labeled data points and leader lines: the inputs the device reads. Real input names only. |
| 04 | How it works | Numbered technical sequence, asymmetric | Four steps at different sizes — intake, analysis, formulation, dispense. Not four equal cards. Step 03 is the largest. |
| 05 | Formulation | Annotated plate, light ground | Ingredient specimens on pale gradient, mono labels with leader lines. Tabular percentages. |
| 06 | Freshness | Full-bleed split, oversized numeral | `Every dose fresh. Every ounce used.` Pair with a real figure at display scale. |
| 07 | Not a quiz | Narrow column, dark | `Personalization that doesn't stop at signup.` / `Not a quiz. A conversation.` |
| 08 | Close | Full-bleed vertical gradient, midnight → blush | Single Migra line, one button, mono legal row. This is where the gradient resolves into light. |

---

## 7. Components

**Buttons.** Solid `--white` with `--midnight` text, or 1px `--rule-on-dark` outline with white text. `--r-md`. Never a gradient fill. Never blush fill. Hover: background shifts, no scale, `--dur-fast`.

**Cards / panels.** `--panel` translucent over the gradient with `backdrop-filter: blur(12px)` and a `--rule-on-dark` hairline. No left border accents. Shadows tinted to midnight, never pure black, never heavier than `0 2px 12px rgb(31 36 65 / 0.35)`.

**Nav.** Thin, fixed, transparent over the hero, gaining a blurred midnight backdrop after 80px of scroll. Wordmark left, links right in Helvetica World at `--text-sm`. Active state is a blush underline offset 6px.

**Data and charts.** Sequential data uses tints of `--indigo`; categorical uses indigo / periwinkle / blush. Label directly on the data. Tabular lining numerals everywhere. No pie charts, no 3D, no dual axes.

**Forms and skin intake.** Stepped, never one long stack. Progress shown as a labeled mono sequence. Inline validation, not toasts.

**Empty and loading states.** Written in Helvetica World with personality. No spinners, no skeleton blocks.

---

## 8. Motion

Cinematic and slow, never bouncy. The reference feel is a camera move, not a UI transition.

- Entrances: 16–24px translate plus opacity, `--dur-base`, `--ease-glide`. Stagger siblings by 70–90ms.
- Hero: `--dur-cine`, a slow gradient drift and data points fading in out of sequence. Runs once.
- Leader lines draw in — animate `stroke-dashoffset` over `--dur-slow` when the plate enters the viewport.
- Data points pulse subtly, at most two at a time, never all together.
- One scroll-linked effect for the entire site. Choose the hero gradient parallax and nothing else.
- Hover: `--dur-fast`, color or transform only. No scale above 1.02.
- Never animate more than three properties at once. Never animate layout properties. Never animate the grain.
- Under `prefers-reduced-motion: reduce`, everything collapses to opacity-only or nothing.

---

## 9. Copy

Approved lines — use these, do not rewrite them:

- Your catalyst to better skin.
- We measure. They guess.
- Skin changes daily. So should your formula.
- Personalization that doesn't stop at signup.
- Every dose fresh. Every ounce used.
- Not a quiz. A conversation.

**Rules.** Short declarative sentences. Sentence case. Mechanism before feeling. Numbers specific and sourced. Never flatter the reader, never imply something is wrong with them, never promise transformation.

**Banned:** glow, radiant, your best skin, self-care, empowering, your journey, unlock, revolutionary, clean beauty, transform, game-changing. No exclamation points. No emoji. No all-lowercase styling as an aesthetic.

---

## 10. Hard bans

- Any color outside the four brand hexes, white, and the defined gradient
- Purple/violet SaaS gradients — ours is a specific sampled indigo-to-blush ramp and nothing else
- Gradient buttons, gradient text, glowing orbs, floating blobs, wavy SVG dividers
- Clean ungrained gradients
- Blush used as a large background field or a button fill
- The 3-column feature grid with an icon in a colored circle above a bold title and two lines of text
- Icons inside colored circles or rounded squares, anywhere
- Emoji as icons or bullets
- `text-align: center` on body copy, feature descriptions, or card content
- One border-radius applied uniformly; large bubbly radii anywhere
- Identical padding on consecutive sections
- Solid gray borders — hairlines are always alpha
- Pure black shadows or pure black backgrounds (`#000`). The dark is `--midnight`.
- Stock lifestyle photography, dewy-skin clichés, before/after imagery
- Any efficacy claim without a source

---

## 11. Signature interactive systems

Three reference builds define the target. Each is specified below as an implementable system. **Only one may be the centerpiece.** Layering all three produces noise. The decision: system A owns the hero, system B owns the page body, system C is optional and must be skippable.

---

### System A — The Field (hero particle system)

Reference: [aaronjcunningham.com](https://www.aaronjcunningham.com/) — a GPU point cloud on a near-black ground, glowing, drifting, and repelled by the cursor. It is labeled "WEBGPU / TSL" in the corner and runs Three.js r185.

**Concept for Katalyze:** the constellation made literal. A dense cloud of points resolves into the contour of a face, holds, then disperses into a sphere. Each point is a measurement.

**Stack**

- Three.js r18x with `WebGPURenderer` and TSL node materials.
- Fallback chain: WebGPU → WebGL2 GPGPU (ping-pong FBO) → static hero image. Detect with `navigator.gpu`, never assume.
- Particle count: 250k desktop, 60k mobile, 0 under `prefers-reduced-motion` (serve the static image).

**Simulation**

- Positions and velocities in storage buffers. Curl-noise drift at low amplitude — this is atmosphere, not a screensaver.
- Pointer force: inverse-square repulsion, influence radius ≈ 0.22 × viewport height, velocity damping 0.94, spring back to rest position at 0.02. The reference labels this "MOVE TO DISTURB" — the interaction must be discoverable, so include an equivalent mono hint.
- Target rest shape: a face contour point cloud on load, dispersing to a sphere after the hero copy finishes animating in.

**Look**

- Ground `--midnight`, never pure black. The reference uses `#030304`; ours is `#1F2441`.
- Additive blending, `depthWrite: false`, soft circular sprite, size attenuation on.
- Color ramp by velocity and radius: `--indigo` at the dense core, `--periwinkle` through the body, `--blush` on the fastest and outermost points only. Blush is under 10% of points.
- Subtle bloom. If the field reads as a purple neon orb, the bloom is too strong and the ramp is wrong.

**Budget**

- DPR capped at 1.5. Pause the loop via `IntersectionObserver` when the hero leaves the viewport. Hard 60fps target on an M1; if it misses, cut particle count, not resolution.

---

### System B — Pinned specimens (scroll and layout)

Reference: [alethia.earth](https://www.alethia.earth/) — roughly 14,700px of page across about 15 viewports, 11 sticky elements, 5 inline videos, one canvas. This is the structural model for the whole Katalyze page body.

**The pattern that does the work:** a media or 3D specimen column pinned with `position: sticky; top: 0; height: 100vh` while a text column scrolls past it. The specimen changes state at scroll thresholds; the text carries the argument. Use this for the analysis and formulation sections.

**Floating annotated specimens.** Objects suspended in space with a thin connector line to a bracketed mono readout — `[SENSIBLE HEAT FLUX]`, `-8.3 tCO₂e`. This is the same annotated-plate device from section 5, and Alethia proves it at scale. Our version reads `[BARRIER FUNCTION]`, `[SEBUM INDEX]`, `[TEWL 11.4 g/m²h]`.

**Section openers.** A small mono uppercase chip in a filled pill, then enormous whitespace, then a two-line headline at display scale, then more whitespace, then the content. The gap between chip and headline is roughly `--s-16`; between headline and content, `--s-40`. That spacing is most of the reason it reads as considered.

**Media cards.** Full-bleed imagery at `--r-lg`, two-up with a single gutter, label set inside the image at the top left in bracketed mono — never in a caption below. A circular arrow affordance sits at the top right of each card.

**Smooth scroll.** Lenis at `lerp: 0.08`. Every pin and threshold reads off Lenis, not native scroll events.

**Rule:** at least two pinned-specimen sequences per page, and no pinned section shorter than 2.5 viewports — pinning for less than that feels like a bug.

---

### System C — The gate (immersion, optional)

Reference: [why.zero.university](https://why.zero.university/) — a fixed full-viewport WebGL fluid simulation you paint into with the cursor. The page has no native scroll at all; body height equals viewport height and scrolling is virtualized. It instructs `DRAW A ZERO` and will not proceed until you do.

**Concept for Katalyze:** the visitor traces the K mark, or draws a line across a dark skin surface, and the trace blooms into the brand gradient — the catalyst reacting. The site opens only after the gesture.

**Stack**

- OGL or raw WebGL2, single fixed canvas at `z-index: 0`, all UI above it.
- Stable-fluids advection–diffusion at half resolution, dye injected along pointer velocity. GSAP for the entry sequence.
- Dye palette ramps `--midnight` → `--indigo` → `--periwinkle` → `--blush`. One hue family, exactly like the reference.
- Custom cursor: a small dot in `--blush`, plus the native cursor hidden only while over the canvas.

**Non-negotiable guardrails**

- A `SKIP` control is visible within 2 seconds, keyboard-focusable, and first in tab order.
- The gate is bypassed entirely under `prefers-reduced-motion`, on touch devices, and on repeat visits (`sessionStorage`).
- The gate never blocks a deep link or a search crawler. Content must be in the DOM behind it.
- No audio.

**Only build this if the homepage is otherwise finished.** It is the most expensive element here and the least load-bearing.

---

### What to take from each — and what not to

| Reference | Take | Do not take |
|---|---|---|
| aaronjcunningham | GPU particle field, cursor disturbance, mono `//00` section numbering, cream-on-near-black restraint | Its purple. Ours is the brand ramp. |
| alethia | Sticky specimen pinning, bracketed mono annotations, chip-then-whitespace-then-headline openers, full-bleed labeled media | Its green, its Geist type, its card uniformity |
| zero.university | Interactive gate, painted fluid, single-hue immersion, mono-only overlay UI | Killing native scroll site-wide. We keep real scroll. |

**All three share the same three traits, which matter more than any effect: near-monochrome palettes, mono micro-typography as the only UI voice, and one big idea per screen with nothing else competing.** If a section has two ideas, split it.

---

## 12. Working agreement

1. **Tokens before pixels.** Build `tokens.css`, the grain utility, and the grid before any section. Get sign-off.
2. **One section at a time.** Build it, screenshot at 1280px and 375px, check it against sections 5 and 10, fix, then move on. No visual debt.
3. **Name the layout device.** Before building any section, state which of the four devices in section 5 it uses. If the answer is "a container with a heading and some items," pick a different device.
4. **Justify off-spec choices** in one line in chat. "It's the common pattern" is a reason to choose something else.
5. **Squint test.** Blur the screenshot. You should see one dominant value shift, one type moment, and one point of blush. Even mush means it fails.
6. **Never invent** product specs, ingredient data, or clinical results. A missing fact is a question, not a placeholder.
7. **Commit after each section** with a short message.

---

## 13. Pre-handoff checklist

- [ ] Zero values outside `tokens.css`
- [ ] Grain present on every gradient surface
- [ ] Migra roman/italic mix used on the hero, sparingly elsewhere
- [ ] Mono micro-labels with leader lines in at least three places
- [ ] At least three distinct grid structures on the page
- [ ] At least two sections break the container entirely
- [ ] No two consecutive sections share vertical padding
- [ ] Largest and smallest type differ by more than 4×
- [ ] Blush appears fewer than three times per screen
- [ ] Nothing from section 10 is present
- [ ] Every number real, tabular, sourced
- [ ] Keyboard-navigable with visible focus; contrast checked on every pair
- [ ] 375px reviewed — nothing squished, leader lines intact
- [ ] All copy from section 9 or approved by me
- [ ] Exactly one of systems A/B/C is the centerpiece
- [ ] Particle field: WebGPU path, WebGL2 fallback, and static image fallback all verified
- [ ] Field holds 60fps on an M1 at DPR 1.5, pauses when off-screen
- [ ] Two or more pinned sequences, each 2.5 viewports or longer
- [ ] Gate (if built) is skippable within 2s, keyboard-first, bypassed on touch and reduced-motion
