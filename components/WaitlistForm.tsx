"use client";

import { FormEvent, useId, useRef, useState } from "react";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

type Source = "hero" | "closing" | "persistent" | "pricing" | "footer";

interface WaitlistFormProps {
  source: Source;
  className?: string;
}

const inputFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blush focus-visible:ring-offset-2 focus-visible:ring-offset-near-black";

const buttonFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2 focus-visible:ring-offset-blush";

export default function WaitlistForm({ source, className = "" }: WaitlistFormProps) {
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
      className={`flex flex-col gap-3 ${className}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
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
          className={`flex-1 rounded-full border border-periwinkle/40 bg-transparent px-5 py-3 font-sans text-body text-cream placeholder:text-periwinkle disabled:opacity-60 ${inputFocusRing}`}
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
          className={`rounded-full bg-blush px-6 py-3 font-sans text-body font-medium text-navy-900 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-[1.03] disabled:opacity-60 disabled:hover:scale-100 ${buttonFocusRing}`}
        >
          {status === "loading"
            ? "Joining…"
            : isDone
              ? "Joined"
              : "Join the waitlist"}
        </button>
      </div>

      <p
        ref={statusRef}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className={`font-sans text-eyebrow text-periwinkle focus:outline-none ${message ? "" : "sr-only"}`}
      >
        {message}
      </p>
    </form>
  );
}
