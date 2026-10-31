# Visual references

Screenshots of the four sites kat picked as references, captured October 2026.
They live in `docs/references/`. **Open the image before working on the section
it maps to.** Words alone don't carry layout, so look at the picture.

`docs/DESIGN-SYSTEM.md` still wins on color, type and motion. Borrow structure,
spacing and rhythm from these, never their colors or fonts. Katalyze stays navy,
Migra and Inter.

| Image | What to take from it | Katalyze section |
|---|---|---|
| `zero-hero-gate.jpg` | A full-screen interactive gate before the site, with the mark drawn by the visitor | `Gate.tsx` ("Trace the K") |
| `alethia-hero-specimens.jpg` | Floating objects with thin annotation readouts pointing at them, plus a left-aligned headline | `Hero.tsx`, `Formulation.tsx` (specimens) |
| `alethia-photo-text-overlay.jpg` | Text set over a soft, blurred photo that sharpens on scroll | `DeviceShowcase.tsx` |
| `alethia-centered-statement.jpg` | A small mono chip above a centered display statement | `Thesis.tsx`, section openers |
| `alethia-bracket-image-cards.jpg` | Full-bleed image cards with bracketed mono labels and a round arrow button | `Prototype.tsx` photos |
| `alethia-dark-closing.jpg` | A dark closing block with a centered statement and a single action | `ClosingCTA.tsx` |
| `sharplink-hero-annotated-object.jpg` | One object in the hero with thin bounding boxes annotating it | `Hero.tsx` (device render, when it exists) |
| `sharplink-grid-data-card.jpg` | Dotted grid rules, numbered chips (01, 02, 03) and a dark data card between text columns | `Analysis.tsx`, `HowItWorks.tsx` |
| `sharplink-numbered-section.jpg` | A label chip, a big two-line headline, and a quiet paragraph off to one side | `HowItWorks.tsx`, `/story` |
| `truekind-hero.jpg` | A centered headline mixing roman and italic, and a pill-shaped call to action | `Hero.tsx` (waitlist form) |
| `truekind-plain-value-cards.jpg` | Three plain-language cards, each one idea with a small icon, readable by anyone | A new "what / how / how far along" strip under the hero |
| `truekind-section-opener.jpg` | A centered two-word opener (caps plus italic) with a thin rule above | Section openers |

## Why truekind matters

kat flagged truekind as "more clear for admissions officers." Use it as the
check for clarity. A visitor who knows nothing about skincare should understand
what Katalyze is, how it works and how far along it is within one screen of
scrolling.

## Workflow

Work one section at a time. Pick the reference image for that section, open
it, build the section, then screenshot the result at 390px and 1440px wide and
compare the two side by side before moving on.
