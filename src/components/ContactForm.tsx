"use client";

import { useState } from "react";
import { trackEvent, trackGenerateLead } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [showMailto, setShowMailto] = useState(false);

  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(
    "Portfolio inquiry",
  )}&body=${encodeURIComponent(message || "")}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError(null);
    setShowMailto(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: from, message, company }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        code?: string;
      };

      if (res.ok && data.ok) {
        trackGenerateLead("contact-form");
        setStatus("success");
        setName("");
        setFrom("");
        setMessage("");
        return;
      }

      setStatus("error");
      setError(data.error ?? "Something went wrong. Please try again.");
      // Offer a mailto fallback when server delivery is unavailable.
      if (data.code === "not_configured" || data.code === "send_failed") {
        setShowMailto(true);
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again or email me directly.");
      setShowMailto(true);
    }
  }

  if (status === "success") {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Message sent</h3>
        <p className="mt-2 text-sm text-white/55">
          Thanks for reaching out — I&apos;ll get back to you at the email you
          provided.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 inline-flex rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5"
        >
          Send another
        </button>
      </div>
    );
  }

  const fieldClasses =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20";

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8">
      {/* Honeypot — hidden from users, filled only by bots. */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          Company
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/70">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={fieldClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={254}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="you@example.com"
            className={fieldClasses}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-white/70">
          Message
        </label>
        <textarea
          id="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about your project, data problem, or idea…"
          className={`${fieldClasses} resize-y`}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
          {showMailto && (
            <>
              {" "}
              <a href={mailtoHref} className="font-medium underline decoration-red-300/50 underline-offset-2 hover:decoration-red-200">
                Email {email} directly
              </a>
              .
            </>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        <a
          href={`mailto:${email}`}
          onClick={() => trackEvent("contact", { method: "email" })}
          className="text-sm text-white/50 transition hover:text-white/80"
        >
          or email {email}
        </a>
      </div>
    </form>
  );
}
