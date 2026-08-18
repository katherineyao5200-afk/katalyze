# Visual References — Index

These are the founder's actual mood-board references. **Look at the images directly** — the descriptions below tell you what to notice in each, not a substitute for viewing them.

Cross-reference with PRD §2–3 ("Design intent" and "Reference aesthetic"), which describes these same images in words. If the written spec and an image ever seem to conflict, the image is the source of truth — the PRD text is a translation of these, not the other way around.

---

### 01 — points-of-light-portrait.png
A portrait with small luminous blue-white dots scattered across the skin, dark background, soft focus. **This is the north star for the `PointField` component.** Notice: the dots are sparse, vary in brightness, sit at irregular intervals — not a grid, not evenly spaced. Soft glow, not sharp points. This is what "organic and barely-there" means in practice.

### 02 — skin-measurement-grid.png
A cool-toned skin close-up with a fine luminous grid mapped across it, small bright nodes at intersections. Used here as **atmosphere/reference only** — remember the product does not scan faces (see CLAUDE.md hard rules). Notice the *restraint*: thin lines, small nodes, nothing overdone. This is the ceiling for how much "tech visualization" is tasteful before it tips into gimmicky.

### 03 — floating-product-hero.png
A dark hero page, a 3D product floating off-axis, lit with ambient purple glow, headline overlapping the object, small "scroll to discover" cue bottom-left. **This is the literal target layout for homepage section 3 ("The device")** once product renders exist. Notice the generous negative space around the object — it's maybe 30% of the frame, surrounded by emptiness.

### 04 — ingredient-orbs-light-inversion.png
Three soft radial color glows on white background, each above a glass petri dish containing a visual representing an ingredient, labeled with an evocative name. **This is the model for homepage section 5 ("What's inside") — the one deliberate light inversion.** Notice the glow-to-vessel relationship: the color glow sits *above*, the vessel is beneath and grounds it.

### 05 — headline-typography-pairing.png
A dark editorial hero pairing a clean grotesque sans headline with an italic serif second line. **This is the Inter + Migra-italic pairing in practice** — notice the weight contrast and how the italic line carries the emotional beat while the sans line stays plain.

### 06 — product-tiers-day-night.png
A skincare site structured around day/night phases, with light and dark treatments of the same product photography, and pricing tiers offered as "Vessel / Refill / Discovery." Structurally close to the device/refill/starter model. Notice the clean, editorial product photography style — soft shadows, minimal props.

### 07 — particle-field-dark.png
A dark UI with a denser particle/network field as a background texture behind a product headline. **Useful as a "too much" reference** — this is denser and more grid-like than our `PointField` should ever be. If the point field starts looking like this, dial it back toward reference 01 instead.

### 08 — wellness-product-layout.png
A wellness/supplement product page layout — general reference for how stats, product imagery, and treatment options can be organized on a page. Lower priority than the others; useful for `/pricing` page layout ideas only.

### 09 — constellation-line-sphere.png
A sphere formed from flowing light-blue lines converging at bright points on black. This is where the "constellation" idea originated before being refined down to the sparser points-of-light motif (reference 01). **Keep this as historical context, not a literal target** — it's denser and more illustration-like than the final direction. If in doubt, prefer reference 01's restraint over this one's density.

---

## Quick priority guide

| If building... | Look at |
|---|---|
| `PointField` component | 01, then 07 and 09 as "don't go this far" references |
| Homepage device section | 03 |
| "What's inside" cartridge section | 04 |
| Typography/headline treatment | 05 |
| Pricing page layout | 06, 08 |
