/*
 * Close-ups for the How it works deck, one per step, instead of the
 * whole machine every time: the pad under a fingertip, the app's blend
 * screen, the dose dish being scooped, and the morning check-in. The app
 * screens are labelled as a concept, since the app is still being built.
 * Nothing here shows a number for skin: readings are relative trends.
 */

const LABEL = {
  fontSize: "9px",
  letterSpacing: "0.18em",
} as const;

function Phone({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="phone relative mx-auto aspect-[9/18.5] h-full max-h-[520px]">
      <div className="phone-screen absolute inset-[7px] flex flex-col overflow-hidden rounded-[34px] px-5 pb-5 pt-9">
        <span className="absolute left-1/2 top-2.5 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
        <p className="flex items-center justify-between font-mono uppercase text-white/45" style={LABEL}>
          <span>{title}</span>
          <span>App concept</span>
        </p>
        {children}
      </div>
    </div>
  );
}

/* 01 · Read: a fingertip on the two-electrode pad. */
export function PadCloseUp() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="pad-closeup relative aspect-square w-[min(78%,420px)]">
        {/* the device's top surface, seen close */}
        <div className="absolute inset-0 rounded-[38%] bg-[radial-gradient(70%_70%_at_40%_30%,#fbfaff,#dcdeee_70%,#b9bcd6)] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.6),inset_0_-10px_30px_rgb(49_63_121/0.25),inset_0_6px_14px_rgb(255_255_255/0.9)]" />
        {/* the pad */}
        <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle_at_38%_32%,#3a4687,#1f2441_62%,#15182e)] shadow-[inset_0_6px_18px_rgb(0_0_0/0.55),0_1px_0_rgb(255_255_255/0.9),0_0_0_6px_rgb(255_255_255/0.5)]">
          <svg viewBox="0 0 100 100" className="absolute inset-[14%]" aria-hidden="true">
            {/* interdigitated electrodes */}
            {[22, 34, 46, 58, 70].map((y, i) => (
              <path
                key={y}
                d={i % 2 ? `M 22 ${y} H 82` : `M 18 ${y} H 78`}
                stroke="#c9ccea"
                strokeOpacity={0.55}
                strokeWidth={3.4}
                strokeLinecap="round"
              />
            ))}
            <path d="M 18 22 V 70 M 82 34 V 58" stroke="#c9ccea" strokeOpacity={0.55} strokeWidth={3.4} strokeLinecap="round" />
          </svg>
          <span className="pad-ripple absolute inset-0 rounded-full" />
          <span className="pad-ripple absolute inset-0 rounded-full [animation-delay:1.2s]" />
        </div>
        {/* the fingertip */}
        <div className="fingertip absolute left-[31%] top-[-46%] h-[100%] w-[38%]">
          <div style={{ borderRadius: "0 0 50% 50% / 0 0 26% 26%" }} className="absolute inset-0 bg-[linear-gradient(90deg,#c99c9f,#ecc9c8_30%,#f6dfe0_55%,#d9adae)] shadow-[0_28px_30px_-12px_rgb(21_24_46/0.65)] [mask-image:linear-gradient(to_bottom,transparent,black_30%)]" />
          <div className="absolute inset-x-[20%] bottom-[5%] h-[30%] rounded-t-[42%] rounded-b-[50%] bg-[linear-gradient(180deg,#f3dcd9,#fff6f4)] shadow-[inset_0_2px_4px_rgb(150_100_110/0.3),0_0_0_1.5px_rgb(201_156_159/0.5)]" />
          <div className="absolute left-[30%] bottom-[22%] h-[8%] w-[16%] rounded-full bg-white/70 blur-[2px]" />
        </div>
      </div>
      <div className="glass absolute bottom-[6%] right-[4%] flex flex-col gap-1 rounded-2xl px-4 py-3 md:right-[10%]">
        <span className="font-mono uppercase text-periwinkle" style={LABEL}>
          Today vs your usual
        </span>
        <span className="flex items-center gap-2 text-white" style={{ fontSize: "var(--text-sm)" }}>
          <span className="inline-block size-2 rounded-full bg-periwinkle shadow-[0_0_10px_var(--periwinkle)]" />
          A little drier
        </span>
      </div>
    </div>
  );
}

const BLEND = [
  { name: "Toner", v: 0.28, base: true },
  { name: "Serum", v: 0.62, base: true },
  { name: "Cream", v: 0.5, base: true },
  { name: "Hyaluronic acid", v: 0.7, base: false },
  { name: "Niacinamide", v: 0.22, base: false },
  { name: "Ceramide", v: 0.46, base: false },
];

/* 02 · Mix: the app shows what went into today's blend, and why. */
export function BlendScreen() {
  return (
    <Phone title="Today">
      <h3 className="mt-5 font-display font-extralight text-white" style={{ fontSize: "26px", lineHeight: 1.05 }}>
        Today&apos;s blend
      </h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Drier than usual", "Cold, dry air", "Feels tight"].map((t) => (
          <span key={t} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/75" style={{ fontSize: "10px" }}>
            {t}
          </span>
        ))}
      </div>
      <ul className="mt-5 flex flex-col gap-2.5">
        {BLEND.map((b, i) => (
          <li key={b.name} className="flex flex-col gap-1">
            <span className="flex justify-between text-white/70" style={{ fontSize: "11px" }}>
              <span>{b.name}</span>
              <span className="font-mono uppercase text-white/35" style={{ fontSize: "8px", letterSpacing: "0.16em" }}>
                {b.base ? "Base" : "Active"}
              </span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <span
                className="blend-bar block h-full rounded-full"
                style={{
                  width: `${b.v * 100}%`,
                  animationDelay: `${i * 90}ms`,
                  background: b.base
                    ? "linear-gradient(90deg, var(--indigo), var(--periwinkle))"
                    : "linear-gradient(90deg, var(--periwinkle), #f3e2e6)",
                }}
              />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-auto rounded-2xl bg-white/[0.06] p-3 text-white/75" style={{ fontSize: "11px", lineHeight: 1.45 }}>
        Your skin read drier than your usual and the air is cold, so there&apos;s
        more cream and hyaluronic acid today.
      </p>
      <span className="mt-3 grid h-10 place-items-center rounded-full bg-blush font-medium text-midnight" style={{ fontSize: "12px" }}>
        Mix today&apos;s dose
      </span>
    </Phone>
  );
}

/* 03 · Apply: one dose in the dish, scooped with a fingertip. */
export function DishCloseUp() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="relative aspect-[4/3] w-[min(86%,460px)]">
        {/* shadow */}
        <div className="absolute inset-x-[8%] bottom-[10%] h-[16%] rounded-[50%] bg-black/50 blur-xl" />
        {/* the dish */}
        <div className="absolute inset-x-[6%] bottom-[16%] h-[44%] rounded-b-[50%] rounded-t-[46%/40%] bg-[linear-gradient(180deg,#ffffff,#e9eaf3_55%,#bfc2da)] shadow-[inset_0_-14px_24px_rgb(49_63_121/0.25),0_2px_0_rgb(255_255_255/0.6)]" />
        <div className="absolute inset-x-[6%] top-[30%] h-[28%] rounded-[50%] bg-[radial-gradient(60%_70%_at_50%_40%,#d9dbea,#f7f7fb)] shadow-[inset_0_8px_16px_rgb(49_63_121/0.28)]" />
        {/* the dose: a soft dome with a scoop taken out */}
        <div className="dose-dome absolute left-[28%] top-[30%] h-[22%] w-[44%] rounded-[50%] bg-[radial-gradient(70%_80%_at_40%_30%,#ffffff,#f6eef4_45%,#e3d3e0)] shadow-[0_6px_10px_rgb(49_63_121/0.25),inset_0_-6px_10px_rgb(180_160_185/0.45)]">
          <span className="absolute left-[52%] top-[18%] h-[46%] w-[34%] rounded-[50%] bg-[radial-gradient(circle_at_60%_70%,#efe4ec,#d8c7d6)] shadow-[inset_2px_4px_6px_rgb(120_100_130/0.35)]" />
          <span className="absolute left-[16%] top-[12%] h-[18%] w-[26%] rounded-[50%] bg-white/90 blur-[1px]" />
        </div>
        {/* fingertip with a little product on it */}
        <div className="scoop-finger absolute right-[4%] top-[-40%] h-[80%] w-[22%] rotate-[28deg]">
          <div style={{ borderRadius: "0 0 50% 50% / 0 0 26% 26%" }} className="absolute inset-0 bg-[linear-gradient(90deg,#c99c9f,#ecc9c8_30%,#f6dfe0_55%,#d9adae)] shadow-[0_18px_24px_-10px_rgb(21_24_46/0.6)] [mask-image:linear-gradient(to_bottom,transparent,black_35%)]" />
          <div className="absolute inset-x-[12%] bottom-[-2%] h-[26%] rounded-[50%] bg-[radial-gradient(circle_at_40%_30%,#ffffff,#eadfe9)] shadow-[0_3px_5px_rgb(49_63_121/0.25)]" />
        </div>
      </div>
      <div className="glass absolute bottom-[6%] left-[4%] flex flex-col gap-1 rounded-2xl px-4 py-3 md:left-[10%]">
        <span className="font-mono uppercase text-periwinkle" style={LABEL}>
          One dose
        </span>
        <span className="text-white" style={{ fontSize: "var(--text-sm)" }}>
          Scoop with a fingertip
        </span>
      </div>
    </div>
  );
}

const WEEK = [0.55, 0.5, 0.38, 0.3, 0.36, 0.46, 0.52];

/* 04 · Learn: the morning check-in, and the trend it feeds. */
export function CheckInScreen() {
  const pts = WEEK.map((v, i) => `${8 + i * 34},${70 - v * 80}`).join(" ");
  return (
    <Phone title="Check-in">
      <h3 className="mt-5 font-display font-extralight text-white" style={{ fontSize: "24px", lineHeight: 1.1 }}>
        How does your skin feel this morning?
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {["Tight", "Comfortable", "Shiny", "Irritated"].map((t) => (
          <span
            key={t}
            className={`grid h-10 place-items-center rounded-xl border ${
              t === "Tight"
                ? "border-blush/70 bg-blush/15 text-white shadow-[0_0_18px_rgb(232_204_210/0.25)]"
                : "border-white/12 bg-white/[0.04] text-white/65"
            }`}
            style={{ fontSize: "11px" }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-white/[0.06] p-3">
        <p className="flex justify-between font-mono uppercase text-white/45" style={LABEL}>
          <span>Your week</span>
          <span>vs your usual</span>
        </p>
        <svg viewBox="0 0 220 80" className="mt-2 w-full" aria-hidden="true">
          <line x1="0" x2="220" y1="30" y2="30" stroke="white" strokeOpacity="0.2" strokeDasharray="3 4" />
          <polyline points={pts} fill="none" stroke="var(--periwinkle)" strokeWidth="2" strokeLinejoin="round" />
          {WEEK.map((v, i) => (
            <circle key={i} cx={8 + i * 34} cy={70 - v * 80} r={i === 6 ? 4 : 2.2} fill={i === 6 ? "white" : "var(--periwinkle)"} />
          ))}
        </svg>
        <p className="flex justify-between text-white/40" style={{ fontSize: "9px" }}>
          <span>Mon</span>
          <span>Today</span>
        </p>
      </div>
      <p className="mt-auto text-white/70" style={{ fontSize: "11px", lineHeight: 1.45 }}>
        Midweek ran drier, and it&apos;s heading back to your usual.
        Tomorrow&apos;s blend eases off the cream.
      </p>
    </Phone>
  );
}

export const STEP_VISUALS = [PadCloseUp, BlendScreen, DishCloseUp, CheckInScreen];
