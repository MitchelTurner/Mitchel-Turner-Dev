import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact — Mitchel Turner",
  description:
    "Get in touch with Mitchel Turner about freelance and contract work — data pipelines, machine learning, API integrations, hardware, and custom tools.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <div className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
          </span>
          Available for work
        </span>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Let&apos;s <span className="text-gradient">talk</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/60">
          Have a project — a data problem, an integration, a model, or a piece
          of software that needs building? Send a message and I&apos;ll get back
          to you. You can also reach me directly at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          or{" "}
          <a
            href={CONTACT_PHONE_HREF}
            className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            {CONTACT_PHONE}
          </a>
          .
        </p>
      </div>

      <ContactForm email={CONTACT_EMAIL} />
    </div>
  );
}
