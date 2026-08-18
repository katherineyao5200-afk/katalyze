# Katalyze v1 — Engineering & Materials Specification
*Concept-functional build, cost-constrained to business plan targets*

---

## Cost envelope (from your business plan — this constrains everything below)

| Line | Target |
|---|---|
| Retail price | $279 |
| Landed cost (Year 1) | ~$130 |
| Ex-factory (Year 1) | ~$85 |
| — Components | $31–44 |
| — Enclosure & assembly | $5–8 |
| — Testing & packaging | $5–7 |
| — Yield loss, factory margin, contingency | $18–26 |

Everything specified below is chosen to fit inside that component budget at 2,000-unit volume.

---

## 1. Core architecture

**6 fluid channels: 3 base + 3 active.**
Each channel is fully independent: its own cartridge, pump, tube, and nozzle. No shared fluid path, which eliminates cross-contamination without needing a purge/cleaning cycle between doses.

**Flow:** cartridges (top bay) → peristaltic pumps (mid bay) → nozzle cluster over cup (dispensing station) → cup transfers to mixing station → magnetic stir → user collects dose.

---

## 2. Component specification & cost allocation

| Component | Spec | Qty | Est. unit cost @2k | Subtotal |
|---|---|---|---|---|
| Controller | ESP32-S3 module (bare WROOM-1, not devkit) | 1 | $3.00 | $3.00 |
| Base pumps | 6V/12V mini peristaltic, ~30–60 mL/min | 3 | $3.00 | $9.00 |
| Active pumps | 6V/12V micro peristaltic, ~5–20 mL/min | 3 | $2.75 | $8.25 |
| Motor driver | Dual H-bridge ICs (DRV8833 ×4) | 4 | $0.60 | $2.40 |
| Load cell | 1 kg strain gauge | 1 | $1.20 | $1.20 |
| ADC | HX711 24-bit | 1 | $0.45 | $0.45 |
| Stir motor | Small DC gear motor + magnet carrier | 1 | $1.50 | $1.50 |
| Transfer servo | 9g micro servo (cup shuttle) | 1 | $1.30 | $1.30 |
| Display | 0.96" monochrome OLED, I²C | 1 | $1.20 | $1.20 |
| Status ring | WS2812B addressable LEDs (×8 segment) | 1 | $0.70 | $0.70 |
| Buzzer | Piezo | 1 | $0.15 | $0.15 |
| Cartridge detect | Microswitch (6 slots + cup + door) | 8 | $0.09 | $0.72 |
| Skin sensor | Stainless electrode pair (see §4) | 1 | $0.60 | $0.60 |
| PCB | 2-layer custom, assembled | 1 | $4.50 | $4.50 |
| Power | 12V 3A external brick (UL/CE) | 1 | $4.00 | $4.00 |
| Buck converter | 12V→5V/3.3V regulation | 1 | $0.70 | $0.70 |
| Tubing | Platinum-cure silicone, cosmetic-grade | ~1.5m | — | $2.20 |
| Fasteners/wiring | Harness, screws, grommets | — | — | $1.80 |
| **Component total** | | | | **~$43.67** |

**Honest note:** this lands at the top of your $31–44 component band. The dominant cost is the six pumps (~$17 combined, ~40% of the component budget). If real quotes come back higher, the pumps are where cost pressure will show up first — worth getting those quoted before anything else.

---

## 3. Materials — enclosure & structure

The $5–8 enclosure budget is the tightest constraint in the whole build. Here's what it realistically buys:

| Part | Material | Why |
|---|---|---|
| Main housing shell | ABS or PP, injection-moulded, soft-matte texture | Cheap, durable, takes a matte finish that reads premium; avoids the shiny-cheap-plastic look |
| Cartridge window | SAN or PMMA (acrylic), frosted | PMMA is more scratch-resistant and optically cleaner; SAN is ~30% cheaper. Frosting hides internal mechanical clutter while still showing cartridge colour |
| Base band | ABS, colour-matched to brand navy (#1f2441) | Visual grounding; hides the heaviest components (power, motor) at the base for a low centre of gravity |
| Drip tray | PP, removable, dishwasher-safe | Must be removable — this is a wet product |
| Cup | Borosilicate glass or PP | Glass reads premium but adds cost/breakage risk; PP is the safe v1 choice |
| Internal chassis | Stamped/folded sheet metal or moulded PP frame | Rigidity for pump mounting; pumps vibrate and need a stiff mount or the load cell reads noise |

### ⚠️ Tooling amortisation — a real problem at 2,000 units
Injection-mould tooling for a housing this size runs roughly **$8,000–20,000**. Amortised over only 2,000 Year-1 units, that's **$4–10/unit** — which alone blows past your $5–8 enclosure budget before you've paid for a single gram of plastic.

**Three realistic ways to handle this:**
1. **Vacuum-forming / thermoforming** the shell instead — tooling drops to ~$500–2,000, so amortisation is ~$0.25–1/unit. Trade-off: softer forms, fewer sharp details, thicker wall look.
2. **Off-the-shelf enclosure + custom moulded faceplate** — only tool the one part people actually look at. Cuts tooling by ~70%.
3. **Amortise tooling across Years 1–3 volume (~11,000 units)** rather than Year 1 alone — brings it to ~$1–2/unit, and is the honest way to model it since the tool doesn't expire after one year.

I'd recommend option 3 for your financial model and option 2 for actual v1 production.

---

## 4. The skin sensor — making it real and cheap

Your pitch says the device reads the skin; your current technical spec has no sensor. Here's a way to make that real **without breaking the budget**, and it's scientifically defensible:

**Method: capacitive skin measurement (corneometry).**
Clinical skin-hydration measurement is fundamentally capacitance-based — the stratum corneum's dielectric constant changes sharply with water content. This is exactly what the gold-standard Corneometer does.

**Implementation:** two small stainless-steel or gold-plated electrodes set flush into the housing's top surface. The user rests a fingertip or presses the pad to their cheek for ~3 seconds.

**The key cost trick:** the **ESP32-S3 has capacitive touch sensing built into the silicon**. You can read relative capacitance across the electrode pair using the chip you're already paying for — no dedicated analogue front-end chip (an AD5941 would cost $5–8, more than 10% of your component budget).

**BOM impact: ~$0.60** (just the electrodes and traces).

**Honest limitations to state internally and in the pitch:**
- This gives a **relative**, trend-over-time reading, not a clinically calibrated absolute hydration value
- It measures hydration reliably; **sebum measurement is a much weaker claim** with this method and shouldn't be asserted without testing
- Accuracy depends on consistent contact pressure and time — the app should coach the user through a standard 3-second read

This is the honest version of "reads your skin": real, grounded in actual dermatological measurement science, cheap enough to ship, and defensible if an engineer asks how it works.

---

## 5. Cartridges (consumable — separate from device BOM)

| Attribute | Spec |
|---|---|
| Base cartridge | 100 mL, PP, opaque |
| Active cartridge | 20 mL, PP, opaque or amber |
| Seal | Foil or silicone septum, pierced by a spike on insertion |
| Interface | Bayonet twist-lock (positive seating, tactile feedback, hard to insert wrong) |
| Keying | Physically keyed so base cartridges can't fit active slots |
| Light protection | Opaque/amber walls — Vitamin C and retinol degrade under UV; this is a functional requirement, not aesthetic |
| Identification | Colour-coded cap + printed label (NFC is possible but adds ~$0.30/cartridge — skip for v1) |

**Note:** cartridge tooling amortises over far more units than the device does (every user buys many cartridges), so per-unit tooling cost here is negligible by comparison.

---

## 6. What is explicitly NOT in v1 (avoid in renders and claims)

- ❌ Touchscreen — only a small monochrome OLED status display
- ❌ Camera or facial scanning
- ❌ Device applying product to skin — it dispenses into a cup, user applies manually
- ❌ Absolute clinical hydration values — relative trends only
- ❌ Reliable sebum measurement — not supported by this sensor method
- ❌ Onboard AI — formula logic is rule-based, running app-side; AI generates the natural-language *explanation* only
- ❌ Wireless charging, holographic display, or other sci-fi elements

---

## 7. Physical form factor & design latitude

**Rough scale (keeps it believable as a countertop appliance):**

| Dimension | Target |
|---|---|
| Footprint | roughly 180–220mm wide, 180–220mm deep |
| Height | roughly 300–360mm |
| Weight | ~2–3 kg |
| Comparison | Single-serve espresso machine |

### Elements that must be present somewhere
These exist in the engineering, so a render without them isn't depicting the real product. **Where** they sit is open to design:

- **Six cartridges, visible** — the transparency is the point; users need to see what's in their formula. Two rows of three, a single row of six, an arc, a carousel — all fine.
- **A dispensing point with a cup beneath it** — the device fills a vessel; it doesn't apply product to skin.
- **A skin-contact sensor pad** — a small, flat conductive surface the user can comfortably press. Top surface, front face, angled shelf, or a pull-out — all workable.
- **A small status display and/or light indicator** — must read as *small and simple*, not a tablet.
- **A drip tray or catch surface** — this is a wet product.

### Constraints that keep it physically plausible
- **Cartridges sit above the dispensing point.** Gravity assists the pumps and this is how the fluid path actually runs.
- **Heavy components sit low.** Pumps, motor, and power live near the base — a top-heavy design would tip when a cartridge is swapped.
- **The cup area is recessed or sheltered**, not fully exposed, to contain splashes.
- **Some opaque body mass between the cartridge bay and the dispensing area** — the pumps, tubing, and board have to physically live somewhere.
- **Cartridges must be reachable and swappable** without tools or disassembly.

### Free to interpret
Overall silhouette, proportions, curvature vs. hard edges, how the cartridge window is framed, where the sensor and display sit, whether the base band wraps or is a foot, surface texture and material breaks, colour distribution across the brand palette.

---

## 8. Compliance requirements (real, and they cost money)

| Requirement | Why | Rough cost |
|---|---|---|
| FCC Part 15 | Any Wi-Fi/BLE device sold in the US | $3–10k |
| CE/UKCA | If selling in Europe | $2–8k |
| UL/ETL on power supply | Use a pre-certified external brick — never design your own mains supply | Included in brick cost |
| FDA cosmetic facility registration | Applies to the formulator, not the device | Low |
| RoHS/REACH | Materials compliance | Usually supplier-provided |

Using an **externally certified power brick** (rather than an internal mains supply) is the single biggest compliance cost-saver — it keeps mains voltage entirely out of your enclosure and off your certification burden.

---

## 9. Summary — the buildable v1

A countertop appliance roughly the size of a single-serve espresso machine, in matte moulded plastic with a frosted window revealing six colour-coded cartridges. Six independently pumped fluid channels (3 base + 3 active) dispense by weight into a cup, which is then stirred magnetically before the user collects the dose. A small capacitive electrode pad takes a relative skin-hydration reading; the app combines that with a questionnaire, local weather data, and the user's daily feedback to generate the day's formula through a rule-based engine. A small display and status light handle on-device feedback; everything else lives in the app over Wi-Fi/BLE.

Form, proportion, and layout are open — the constraints in §7 exist only to keep the design physically buildable. Every component listed is off-the-shelf or standard-process manufacturable, and the whole BOM lands inside the business plan's cost envelope.
