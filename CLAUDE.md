# Katalyze — Project Context

You are building the marketing website for **Katalyze**, a countertop device that reads the user's skin and mixes a fresh, personalized skincare dose on demand.

**The full spec is in `docs/PRD.md`. Read it before starting work on any new area of the site.**

Product/hardware facts live in `docs/product-engineering-spec.md`. Consult it before writing any copy that describes how the device works.

---

## Current state

Pre-launch. The product cannot be purchased. The site exists to build desire and capture waitlist emails.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS. Deployed to Vercel. Supabase for waitlist storage.

---

## Brand tokens — never hardcode these, always reference tokens

| Token | Hex | Role |
|---|---|---|
| `navy-900` | `#1f2441` | Primary dark surface; body text on light |
| `navy-700` | `#313f79` | Secondary dark; gradient midpoint; hover |
| `periwinkle` | `#8a8db3` | **Information** — stats, labels, secondary text on dark |
| `blush` | `#e8ccd2` | **Action** — CTAs, links, interactive elements |
| `cream` | `#f5eff7` | Light surface; body text on dark |

**Semantic rule:** periwinkle for things the user *reads*, blush for things the user *acts on*. Using blush as decoration dilutes every CTA on the page.

Do not introduce new hues. Derive surface depth only by interpolating between `navy-900` and `navy-700`, plus near-black `#15182e` for the deepest canvas.

⚠️ **Contrast trap:** blush on cream fails WCAG AA. Blush is legible as text only on dark surfaces, or as a filled background with `navy-900` text on it.

---

## Typography

**Display: Migra** — self-hosted, files in `/public/fonts`.
- **Only weights 200 and 800 exist.** Never request 400 or 500 — the browser fakes it and it looks visibly wrong.
- Use 200 for nearly everything. 800 is for rare emphasis only.
- **Italic is for emotional copy only** — taglines, hero lines, section openers. Never on buttons, nav, labels, or data.

**Body/UI: Inter** via `next/font/google`.

All headings use `clamp()` for fluid scaling.

⚠️ Migra files are Pangram Pangram's free **personal-use** tier. A commercial license is required before public launch. Keep this noted in the README.

---

## Design principles

**Dark canvas, luminous subject, generous emptiness.** When in doubt, add negative space and remove an element. The restraint *is* the aesthetic.

**One deliberate exception:** the "what's inside" cartridge section inverts to a light background. This is intentional, not an inconsistency.

**Motion:**
- Nothing is fully static — resting states drift imperceptibly. (Brand thesis: skin is never fixed.)
- User action produces visible reaction. This is a product about catalysis.
- Ease everything with `cubic-bezier(.16,1,.3,1)`. No linear except progress bars.
- `prefers-reduced-motion` disables parallax, canvas animation, and reveal transforms. Hard requirement.

**Signature motif — points of light:** sparse, slow-drifting luminous points in periwinkle and blush, with faint lines connecting only nearby points. Organic and barely-there. Never a starfield, never a tech "network graph."

---

## Hard rules — do not violate

### Product accuracy
- The sensor is a **capacitive pad read by fingertip contact**. It measures **relative hydration trends**, not absolute clinical values.
- **Never claim** clinical-grade precision, absolute hydration numbers, or sebum measurement.
- **Never depict or imply facial scanning.** The device does not scan faces. Points-of-light imagery is atmosphere and abstraction only.
- The device **dispenses into a cup**. The user applies the product themselves. The device never touches skin.
- **Six cartridges: three base + three active.** Not six actives.
- Formula generation is **rule-based within pre-set safe ranges**, running app-side. AI generates the natural-language *explanation* only, not the formula.

### Claims and compliance
- **Never write "FDA approved."** Cosmetics are FDA-*regulated*; no approval process exists. Use "formulated in compliance with FDA cosmetic regulations."
- No efficacy claims. No trial has been conducted.
- Never imply the product is currently purchasable.
- No fabricated testimonials, endorsements, or signup counts.
- No fake scarcity timers or invented "only N spots left." Real scarcity only: the first production run is genuinely limited (~2,000 units) and the waitlist genuinely hears first — say that plainly instead.

### Team accuracy
Katalyze is a **solo founder** (Katherine Yao) working with external manufacturing, formulation, and development partners. Never imply an in-house team.

---

## Copy voice

Plain and confident. The visuals carry the atmosphere, so the words stay grounded and factual. The prettier the visual, the more direct the copy next to it should be.

Primary slogan: **"Your catalyst to better skin."**

Approved supporting lines:
- We measure. They guess.
- Skin changes daily. So should your formula.
- Personalization that doesn't stop at signup.
- Every dose fresh. Every ounce used.
- Not a quiz. A conversation.

---

## Engineering conventions

- Keep components small and composable. The founder plans to drop in components from 21st.dev later — don't build anything that would require refactoring to accommodate that.
- Centralize all image paths in `/lib/images.ts`. Product renders don't exist yet; every image slot must be swap-ready with correct aspect ratios and explicit dimensions.
- Placeholders are soft brand-gradient fields, never gray boxes with an X.
- Secrets in `.env.local`, never committed. Supabase service role key is server-side only.
- Semantic HTML. Real `<nav>`, `<main>`, `<section>`. Correct heading order.
- Lighthouse target 90+ across all four categories.

---

## Build order (from PRD §12)

Get steps 1–6 fully working before writing any animation. A beautiful site with a broken signup form has failed at half its purpose.

1. Scaffold + deploy empty to Vercel (verify pipeline first)
2. Design tokens
3. Fonts loaded and verified
4. Nav, Footer, layout
5. **WaitlistForm + API route + Supabase, tested end to end**
6. PersistentCTA
7. Homepage sections (static)
8. Reveal component
9. PointField canvas
10. Parallax
11. Remaining pages
12. Accessibility + performance + responsive QA

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
