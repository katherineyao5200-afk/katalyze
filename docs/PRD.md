# Katalyze Website — Product Requirements Document

**Version:** 2.0
**Purpose:** Implementation spec for building the Katalyze marketing site with Claude Code.
**Read this entire document before writing any code.** Sections 2 and 3 explain *why* — they matter more than the specs, because they let you make good decisions on the hundred details this document doesn't cover.

---

## 1. What we're building

A marketing site for Katalyze, a countertop device that reads your skin and mixes a fresh, personalized skincare dose on demand.

The product is **pre-launch**. It cannot be purchased. The site's entire job is to **make people want it and get their email address.**

### Success looks like
Someone lands on the homepage, is immediately drawn in, understands what the product does within ten seconds, feels a flicker of *"I want this in my bathroom,"* and leaves their email — ideally feeling like they got in early on something rather than signing up for a newsletter.

### Pages
| Route | Page | Priority | Job |
|---|---|---|---|
| `/` | Home | P0 | Immersive. Create desire. Convert. |
| `/how-it-works` | How It Works | P0 | Make the daily ritual feel real and desirable |
| `/pricing` | Pricing | P1 | Tease structure, convert to waitlist |
| `/story` | Our Story | P1 | Build personal connection to the founder |

Architecture must allow new pages without refactoring.

---

## 2. Design intent — read this before the specs

### The feeling we're building
**Quiet precision with a touch of magic.** This is a measuring instrument that happens to be beautiful. Not clinical, not cutesy, not sci-fi. Think Dyson's engineering confidence softened by the warmth of a good skincare brand.

### The three emotional beats, in order
1. **Intrigue** — what *is* this object? (hero)
2. **Recognition** — oh, that's my problem exactly (the stats, the daily-ritual narrative)
3. **Anticipation** — I want to be there when this exists (closing CTA)

If a design decision serves one of those three, it's right. If it's decoration that serves none, cut it.

### The single most important visual principle
**Dark canvas, luminous subject, generous emptiness.**

Nearly every reference the founder gathered is a near-black field with one glowing focal object and a lot of breathing room. That restraint is the aesthetic. Resist the urge to fill space. When in doubt, add more negative space and remove an element.

### The signature motif: points of light
The founder's references repeatedly show **measurement visualized as points of light** — small luminous dots scattered across skin, occasionally connected by faint lines. This is the brand's core visual idea because it's *literally what the product does*: it reads small signals and connects them into one picture.

Implement this as an ambient background layer: sparse, slow-drifting luminous points in periwinkle and blush, with faint connecting lines appearing only between nearby points. It should read as *organic and barely-there*, never as a tech "network graph" or a starfield.

**Critical accuracy constraint:** the real sensor reads a fingertip on a small contact pad. It does **not** scan a face. Use points-of-light as atmosphere and abstraction only. Never depict or imply facial scanning — that's a capability the product doesn't have.

### The one deliberate inversion
The site is dark throughout **except** the "what's inside" cartridge section, which flips to a soft light background. This is intentional: the reference imagery for ingredients is bright, airy, and clinical-in-a-good-way (soft radial glows over glass vessels on white). That single flip becomes a moment of breath in the scroll, and makes the ingredients feel clean and safe.

Treat it as a feature, not an inconsistency. Transition into and out of it smoothly.

---

## 3. Reference aesthetic (what "good" looks like)

Descriptions of the founder's actual reference set, so you understand the target:

- **A portrait with small blue-white luminous dots scattered across the skin** — dark background, soft focus, quietly beautiful. This is the brand's north star for the points-of-light motif.
- **A dark hero page with a floating 3D product, off-axis, lit with an ambient purple glow**, headline overlapping the object, small "scroll to discover" cue. This is the target layout for the product hero once renders exist.
- **A cool-toned skin close-up with a fine luminous grid** — measurement made visible, elegant rather than technical.
- **Three ingredient orbs on white** — soft radial color glows above glass petri dishes, each labeled with an evocative ingredient name. This is the model for the cartridge section.
- **A dark editorial site pairing a clean grotesque headline with an italic serif second line** — exactly our Inter + Migra-italic pairing.
- **A skincare site organized around day/night phases**, with light and dark treatments of the same product, and product options offered as Vessel / Refill / Discovery. Structurally close in spirit to our four-tier model (Machine / Basic / Full / Premium) — the takeaway is the clean tiered-card layout, not the exact tier names.

### Component sourcing
The founder plans to source polished front-end components from **21st.dev**. Build with clean, composable, Tailwind-based components so drop-in additions later don't require refactoring. Keep component boundaries sensible and props explicit.

---

## 4. Stack

**Next.js (App Router) + TypeScript + Tailwind CSS**, deployed to Vercel.

```
npx create-next-app@latest katalyze --typescript --tailwind --app
```

```
/app
  layout.tsx                  # fonts, nav, footer, persistent CTA
  page.tsx                    # home
  how-it-works/page.tsx
  pricing/page.tsx
  story/page.tsx
  api/waitlist/route.ts
/components
  Nav.tsx
  Footer.tsx
  WaitlistForm.tsx            # reusable, variant prop
  PersistentCTA.tsx           # always-accessible email card
  PointField.tsx              # canvas points-of-light motif
  ParallaxLayer.tsx
  Reveal.tsx
  /sections                   # homepage sections
/lib
  supabase.ts
  images.ts                   # centralized image paths
/public/fonts, /public/images
/styles/globals.css           # design tokens
```

**Dependencies:** keep them minimal. Framer Motion is worth adding for orchestrated reveals. Do not add a heavy 3D library — the device will be a rendered image, not real 3D geometry.

---

## 5. Design tokens

Define once in `globals.css` and Tailwind config. **Never hardcode a hex value in a component.**

### Colors (locked brand kit — do not invent new hues)

| Token | Hex | Role |
|---|---|---|
| `navy-900` | `#1f2441` | Primary dark surface, body text on light |
| `navy-700` | `#313f79` | Secondary dark, gradient midpoint, hover |
| `periwinkle` | `#8a8db3` | **Information** — stats, labels, secondary text on dark |
| `blush` | `#e8ccd2` | **Action** — CTAs, links, interactive highlights |
| `cream` | `#f5eff7` | Light surface, body text on dark |

**Semantic discipline:** periwinkle = information the user reads. Blush = things the user acts on. Never use blush for passive decoration — it dilutes every CTA on the page.

Generate darker/lighter surface steps only by interpolating between `navy-900` and `navy-700`, plus a near-black (`#15182e`) for the deepest canvas.

⚠️ **Contrast trap:** blush on cream fails WCAG AA badly. Blush works as text *only* on dark surfaces, or as a filled background with `navy-900` text on top. Check every pairing.

### Typography

**Display — Migra** (self-hosted, files provided):
- Only weights **200 (Extralight)** and **800 (Extrabold)** exist. Referencing 400 or 500 makes the browser synthesize a fake weight that looks visibly wrong. Use 200 almost everywhere.
- **Italic is reserved for emotional copy only** — taglines, hero lines, section openers. Never on buttons, labels, nav, or data.

⚠️ **License:** provided files are Pangram Pangram's free *personal-use* tier. A commercial license is required before public launch. Note this in the README.

**Body/UI — Inter** via `next/font/google`. (The brand kit specifies Helvetica World, which isn't free for web; Inter is the closest substitute. Tokenize the font family so swapping later is one line.)

**Scale:** `clamp()` for all headings. Fluid, never stepped.

### Motion
1. **Nothing is fully static.** The brand thesis is "skin is never fixed" — resting states should have imperceptible drift.
2. **Action produces reaction.** This is a product about catalysis. Hovers, submits, and scroll should visibly cause something.
3. Ease everything with `cubic-bezier(.16,1,.3,1)`. No linear except progress bars.
4. **`prefers-reduced-motion` disables parallax, the point field animation, and reveal transforms.** Hard requirement.

---

## 6. Homepage — the immersive scroll

Dark-dominant. Parallax depth layers as the signature technique. This page should feel like an experience, not a brochure.

### Parallax implementation
- Drive with `transform: translate3d()` only — never `top` or `background-position`. Only transforms are GPU-composited.
- Throttle with `requestAnimationFrame`. Never compute inside the scroll event.
- `IntersectionObserver` to skip layers outside the viewport.
- **Disable below 768px.** Parallax on touch scroll feels broken. Fall back to fade-up reveals.
- Target 60fps. If it drops, reduce layer count before reducing motion range.

### The point field (`PointField.tsx`)
Canvas-based ambient layer used in the hero and closing section.
- 40–70 points depending on viewport area. Sparse, not dense.
- Slow drift, ~0.2px/frame. Barely perceptible.
- Faint connecting lines only when two points are within ~140px, opacity scaling with proximity.
- Colors: periwinkle and blush at low opacity.
- Subtle mouse influence — points drift slightly toward the cursor. This is the "action produces reaction" principle at ambient scale.
- Pause rendering when offscreen. Respect reduced-motion by rendering a static field.

### Section sequence

**1. Hero — intrigue**
Three parallax depths: ambient gradient (slowest) → point field (mid) → text and CTA (front).

- Eyebrow: `NOW DEVELOPING`
- H1: **"Skincare, mixed fresh, every morning."** — "fresh" in Migra italic with a slow gradient shimmer.
- Sub: *"Katalyze reads your skin and blends a single dose on demand — no half-used bottles, no guessing what today calls for."*
- Tagline, small, near the logo or beneath H1: *"Your catalyst to better skin."*
- Inline email capture.
- Subtle scroll cue at the bottom edge.

**2. The problem — recognition**
Three stats, count-up on scroll, periwinkle numerals.
- **71%** — say their skin changes with the weather, but their products stay the same
- **78%** — have bought a product that ended up not working for their skin
- **86%** — say proven results, not features, are what would earn their trust

Header: *"Your skin changes by the day. Your routine hasn't."*

**3. The device — desire**
The emotional peak. Product render floating off-axis on near-black, ambient glow behind it, rising and scaling slightly on scroll. Headline may overlap the object. Give this section a lot of vertical room — let it be quiet.

Copy: *"One object. Six cartridges. A different formula every day."*

**4. The daily ritual — anticipation**
This section's job is to make the reader *imagine owning it.* Write in second person, present tense, describing the morning:

> You rest a finger on the pad. It reads your skin in three seconds. Today's blend appears on your phone — a little more hydration, it's dry out. You tap once. It mixes. You collect the dose and go.

Four steps (Read → Mix → Apply → Learn) with the emphasis on *feeling*, not mechanism. Links to `/how-it-works`.

**5. What's inside — the light inversion**
Flips to a soft cream/light background. Six cartridges — **three base, three active** (not six actives; getting this wrong misrepresents the product). Present each with a soft radial glow above it, echoing the ingredient-orb reference. Name actives plainly: hyaluronic acid, niacinamide, ceramide.

**6. Closing — conversion**
Back to deep dark. Point field returns. Full-width, centered, minimal.
- H2: *"Be the first to try it."*
- Sub: *"We'll tell our waitlist before anyone else."*
- Email capture, prominent.

---

## 7. Persistent email capture

**Requirement: an email card is always within reach, on every page.**

`PersistentCTA.tsx` — a compact floating element, bottom-right on desktop, sticky bottom bar on mobile.
- Collapsed state: a small blush pill reading *"Get early access."*
- Expands on click into a compact card with the email field inline.
- Dismissible. Store dismissal in `sessionStorage` (not `localStorage`) so it returns on a future visit but doesn't nag within one session.
- Hide it while a full inline form is in the viewport — two competing forms on screen is bad UX. Use `IntersectionObserver` on the inline forms.
- Never blocks content. Never a modal. Never an interstitial.

Inline forms additionally appear in: homepage hero, homepage closing, pricing page, footer.

---

## 8. Email capture — must actually work

### Supabase (recommended — you own the list)
```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now(),
  source text
);
```

Keys in `.env.local`, never committed. Service role key **server-side only**, inside the API route.

`POST /api/waitlist` → validate → insert → handle conflict gracefully.

*Faster alternative if you want it working in ten minutes: Formspree or Tally. Less ownership.*

### Requirements regardless of provider
- Validate format client-side **and** server-side. Never trust the client.
- **Duplicates are a success case**, not an error. "You're already on the list" — friendly, not red.
- Loading state on the button during submit.
- Success: *"You're on the list. We'll be in touch."*
- `source` field records which form converted (hero / closing / persistent / pricing / footer).
- Honeypot field and basic rate limiting.
- Accessible: real `<label>` (visually hidden ok), `aria-live` on status, keyboard submittable, focus returns sensibly after submit.

### On building anticipation honestly
Do **not** fabricate signup counts, fake scarcity timers, or invented "only 200 spots" claims. It's dishonest and easy to see through.

What *is* honest and works: the first production run genuinely is limited (~2,000 units), and waitlist members genuinely will hear first. Frame it accurately — *"Our first production run is limited. The waitlist hears first."* Real scarcity communicated plainly beats manufactured urgency.

---

## 9. Other pages

### `/how-it-works`
Expand the ritual into the full daily loop. Keep it desirable, not technical. **Do not overclaim:**

- **Read** — A capacitive pad reads your skin's relative hydration. *(Relative trends over time — not clinically calibrated absolute values. Never claim clinical precision. Never claim sebum measurement.)*
- **Mix** — Six independent channels — three base formulas, three actives — dispense by weight, then mix.
- **Apply** — One dose, made for one use. You apply it yourself, like a serum. *(The device does not touch your skin.)*
- **Learn** — You log how your skin feels. That plus local weather shapes tomorrow's blend.

Include that formula generation is **rule-based within pre-set safe ranges**. Frame this as a deliberate safety choice and a credibility asset — it is one.

### `/pricing`
**Real numbers now — this has changed from earlier drafts of this PRD.** The founder has finalized a 4-tier structure. Show it plainly; this is no longer a "tease only" page.

| Tier | Price | Positioning | What it includes |
|---|---|---|---|
| **Machine Purchase** | $279 one-time | — | Katalyze device + one starter cartridge set based on initial skin screening |
| **Basic Subscription** | $25/month | Best for price-conscious, single users | Replenish only the actives running low |
| **Full Subscription** | $45/month | Best for daily, all-active routines | Automatic full replenishment across all actives |
| **Premium Subscription** | $89/month | Best for advanced routines & multi-user households | Full replenishment + priority access to advanced formulations + multi-user profiles + expedited shipping |

Layout: four cards side by side (desktop), stacked on mobile, in ascending price order (Machine → Basic → Full → Premium). Each card: tier name, "best for" line in italic, 2–3 line description, price, CTA into the waitlist form — since nothing is purchasable yet, the CTA reads *"Join the waitlist"*, not "Buy now."

Close the page with an email capture and a line acknowledging early pricing may still refine slightly before launch — honest, not hedgy.

### `/story`
Founder narrative, plainly told. Katherine Yao. The origin: an overflowing bathroom cabinet, constantly irritated skin, and realizing the problem wasn't the products — it was that formulas are static while skin isn't.

Usable line: *"Why can't skincare be as dynamic and fresh as the food we cook in our kitchens?"*

Warm and specific. **Do not** inflate credentials or imply a team — Katalyze is a solo founder working with external manufacturing, formulation, and development partners.

---

## 10. Assets

**Product renders are still being generated. Do not block on them.**
- Build every image slot to accept a real render later: correct aspect ratio, `next/image`, explicit dimensions to prevent layout shift, meaningful `alt`.
- Placeholders should be soft brand-color gradient fields — never gray boxes with an X. It should look intentional if seen mid-build.
- Centralize all paths in `/lib/images.ts` so swapping renders is one edit each.

**App mockup:** one-line mention only, no screenshots. Do not build an app showcase section.

---

## 11. Non-negotiables

### Accessibility
- WCAG AA contrast everywhere. Re-check every blush pairing.
- Full keyboard nav, visible focus states.
- Semantic HTML. Real `<nav>`, `<main>`, `<section>`. Correct heading order. No div soup.
- `prefers-reduced-motion` disables parallax, point-field animation, reveals.
- Meaningful `alt` on every image. Decorative canvas gets `aria-hidden`.

### Performance
- Lighthouse 90+ all four categories.
- Self-hosted fonts, `font-display: swap`, subset if possible.
- WebP/AVIF via `next/image`.
- Lazy-load below the fold. Canvas pauses offscreen.
- Zero layout shift.

### Responsive
- Mobile-first. Test 375 / 768 / 1024 / 1440.
- Parallax off below 768px. Persistent CTA becomes a bottom bar.
- Tap targets ≥ 44×44px.

### Claims accuracy — compliance, not style
- **Never write "FDA approved."** Cosmetics are FDA-*regulated*; no approval process exists. Use "formulated in compliance with FDA cosmetic regulations."
- No clinical-grade measurement claims, no absolute hydration values, no sebum measurement.
- No efficacy results — no trial has been run.
- Never imply the product is purchasable now.
- No fabricated testimonials, endorsements, or signup counts.
- Never depict or imply facial scanning.

### SEO
Unique title + meta description per page. OG and Twitter cards. `sitemap.xml`, `robots.txt`, favicons (provided).

---

## 12. Build order

1. Scaffold, install, **deploy empty to Vercel** — verify the pipeline before writing features
2. Design tokens in `globals.css` + Tailwind config
3. Fonts loaded, weights verified visually
4. `Nav`, `Footer`, root layout
5. **`WaitlistForm` + `/api/waitlist` + Supabase, working end to end, tested with a real submission** — highest-risk piece, do it early
6. `PersistentCTA`
7. Homepage sections, static, no animation
8. `Reveal` (IntersectionObserver fade-up)
9. `PointField` canvas
10. Parallax layers
11. Remaining pages
12. Accessibility audit, Lighthouse, responsive QA
13. Swap in real renders

**Complete 1–6 before any animation.** A gorgeous site with a broken signup form has failed at half its purpose.

---

## 13. Definition of done

- [ ] Four pages built and routed
- [ ] Email capture writes to DB, verified with a real submission
- [ ] Duplicates handled gracefully
- [ ] Persistent CTA on every page, hides near inline forms, dismissible per session
- [ ] Parallax 60fps desktop, off below 768px
- [ ] `prefers-reduced-motion` fully respected
- [ ] Lighthouse 90+ all categories
- [ ] Zero contrast failures
- [ ] Keyboard navigable end to end
- [ ] No hardcoded hex outside tokens
- [ ] No §11 claims violations
- [ ] Image slots render-ready
- [ ] Deployed to Vercel with custom domain
- [ ] README notes Migra commercial license requirement

---

## 14. Open items

| Item | Status |
|---|---|
| Product renders | In generation |
| App mockup | In progress — mention only |
| Domain purchased/connected | Unconfirmed |
| Migra commercial license | Required before public launch |
| Final pricing figures | **Resolved** — 4-tier structure finalized (§9 `/pricing`), may still refine slightly before launch |
| Supabase project | Needed before step 5 |
| 21st.dev components | Founder will source later — keep components composable |
