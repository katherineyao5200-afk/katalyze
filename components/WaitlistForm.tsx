"use client";

import { FormEvent, useId, useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

type Source = "hero" | "closing" | "persistent" | "pricing" | "footer";

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
      } else {
        setStatus("success");
        setMessage("You're on the list. We'll be in touch.");
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
            : "flex items-center gap-1 rounded-full border border-[color:var(--rule-on-dark)] bg-white/[0.03] p-1.5 transition-colors duration-[var(--dur-fast)] focus-within:border-blush/70 hover:border-white/30 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-blush"
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
              : `group inline-flex items-center gap-2 rounded-full bg-blush px-5 py-2.5 text-midnight hover:bg-white ${buttonFocusRing}`
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
              className="transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
            >
              →
            </span>
          )}
        </button>
      </div>

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
