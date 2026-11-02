"use client";

import { FormEvent, useId, useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

type Source = "hero" | "closing" | "persistent" | "pricing" | "footer" | "investors" | "quick";

interface WaitlistFormProps {
  source: Source;
  className?: string;
  /** Marks this as a full inline form so PersistentCTA can hide while it's in view. */
  trackVisibility?: boolean;
  /** "light" for forms sitting on the pale homepage grounds. */
  tone?: "dark" | "light";
}

const buttonFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-midnight";

export default function WaitlistForm({
  source,
  className = "",
  trackVisibility = false,
  tone = "dark",
}: WaitlistFormProps) {
  const light = tone === "light";
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [joinedEmail, setJoinedEmail] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const inputId = useId();

  const isDone = status === "success" || status === "duplicate";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || isDone) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      } else if (data.duplicate) {
        setStatus("duplicate");
        setMessage("You're already on the list.");
        setJoinedEmail(email.trim().toLowerCase());
      } else {
        setStatus("success");
        setMessage("You're on the list. Katherine will email you when the first run opens.");
        setJoinedEmail(email.trim().toLowerCase());
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-inline-form={trackVisibility ? "" : undefined}
      className={`flex flex-col gap-3 ${className}`}
    >
      <div
        className={
          light
            ? "flex flex-col gap-2 sm:flex-row"
            : "glass flex items-center gap-1 rounded-full p-1.5 focus-within:!border-blush/60 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-blush/70"
        }
      >
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === "loading" || isDone}
          className={`min-w-0 flex-1 rounded-[var(--r-sm)] border px-5 py-3 disabled:opacity-60 ${
            light
              ? "border-[color:var(--rule-on-light)] bg-white text-midnight placeholder:text-[color:var(--faint-on-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo"
              : "rounded-full border-0 bg-transparent py-2 pl-4 text-white placeholder:text-periwinkle focus-visible:outline-none"
          }`}
          style={{ fontSize: "var(--text-base)" }}
        />

        {/* Honeypot: invisible to people, catches bots that fill every field. */}
        <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor={`${inputId}-company`}>Company</label>
          <input
            id={`${inputId}-company`}
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || isDone}
          className={`whitespace-nowrap rounded-[var(--r-md)] px-6 py-3 font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-soft)] disabled:opacity-60 ${
            light
              ? "bg-midnight text-white hover:bg-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              : `btn-primary group inline-flex items-center gap-2 rounded-full px-5 py-2.5 ${buttonFocusRing}`
          }`}
          style={{ fontSize: "var(--text-base)" }}
        >
          {status === "loading"
            ? "Joining…"
            : isDone
              ? "Joined"
              : (
                  <>
                    {/* Narrow phones: a shorter label leaves room to type. */}
                    <span className="max-[420px]:hidden">Join the waitlist</span>
                    <span className="min-[421px]:hidden">Join</span>
                  </>
                )}
          {!light && status !== "loading" && !isDone && (
            <span
              aria-hidden="true"
              className="btn-arrow"
            >
              →
            </span>
          )}
        </button>
      </div>

      {isDone && joinedEmail && (
        <PlanQuestion
          light={light}
          chosen={plan}
          onChoose={(p) => {
            setPlan(p);
            fetch("/api/waitlist", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: joinedEmail, plan: p }),
            }).catch(() => {});
          }}
        />
      )}

      <p
        ref={statusRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className={`font-mono text-2xs focus:outline-none ${light ? "text-indigo" : "text-periwinkle"} ${message ? "" : "sr-only"}`}
      >
        {message}
      </p>
    </form>
  );
}

const PLAN_OPTIONS = [
  { id: "basic", label: "Basic · $25" },
  { id: "full", label: "Full · $45" },
  { id: "premium", label: "Premium · $89" },
  { id: "unsure", label: "Not sure yet" },
];

// One optional question after joining. It helps decide what the first
// run ships with; skipping it changes nothing.
function PlanQuestion({
  light,
  chosen,
  onChoose,
}: {
  light: boolean;
  chosen: string | null;
  onChoose: (plan: string) => void;
}) {
  return (
    <fieldset className="order-last mt-1 flex flex-col gap-2">
      <legend className={`mb-2 ${light ? "text-midnight" : "text-white/80"}`} style={{ fontSize: "var(--text-sm)" }}>
        {chosen ? "Thanks, noted." : "Optional: which refill plan would you probably pick?"}{" "}
        <a href="/pricing" className={`${light ? "text-indigo" : "text-blush"} underline underline-offset-4`}>
          See plans
        </a>
      </legend>
      <div className="flex flex-wrap gap-2">
        {PLAN_OPTIONS.map((o) => {
          const on = chosen === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChoose(o.id)}
              className={`rounded-full border px-3.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush ${
                on
                  ? "border-blush bg-blush text-midnight"
                  : light
                    ? "border-[color:var(--rule-on-light)] text-midnight hover:border-indigo"
                    : "border-white/20 text-white/85 hover:border-white/50"
              }`}
              style={{ fontSize: "var(--text-sm)" }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
