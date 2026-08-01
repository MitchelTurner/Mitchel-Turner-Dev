import type { Metadata } from "next";
import { TrackedCtaLink } from "@/components/TrackedCtaLink";

export const metadata: Metadata = {
  title: "About — Mitchel Turner",
  description:
    "Mitchel Turner — developer in Ketchikan, Alaska. Data pipelines, machine learning, API integrations, hardware, and custom tools.",
};

const WORK_AREAS = [
  {
    title: "Data pipelines & cleanup",
    description:
      "I take messy, proprietary, or raw data and turn it into something usable. I built a converter that pulls Garmin sonar data out of its locked-down format into clean CSVs — the kind of unglamorous plumbing that makes everything downstream possible.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 6h16M4 12h10M4 18h6" />
        <circle cx="18" cy="12" r="3" />
        <circle cx="14" cy="18" r="3" />
      </svg>
    ),
  },
  {
    title: "Machine learning on real-world data",
    description:
      "I've trained models to estimate Rockfish population health from sonar readings. If you've got data and a question you think it can answer, that's the work I like most.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 17l6-6 4 4 8-10" />
        <path d="M17 5h4v4" />
      </svg>
    ),
  },
  {
    title: "API integrations",
    description:
      "I've worked with trading APIs and third-party SDKs to connect systems that weren't built to talk to each other.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 6l-2 12" />
      </svg>
    ),
  },
  {
    title: "Hardware & sensor work",
    description:
      "Drone SDKs, wearable integration, sonar hardware — I'm comfortable where software meets a physical device.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
      </svg>
    ),
  },
  {
    title: "Custom tools & automation",
    description:
      "A lot of what I do is one-off tooling: the script or small app that solves a specific, annoying problem and saves someone hours.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-20">
      <div className="mb-12">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/70">
          Ketchikan, Alaska
        </span>

        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
          Hi, I&apos;m{" "}
          <span className="text-gradient">Mitchel Turner</span>
        </h1>

        <p className="mt-5 text-lg leading-relaxed text-white/65">
          I&apos;m a developer based in Ketchikan, Alaska. I build practical
          software for people who have data or a device and need it to actually
          do something.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/40">
          What I work on
        </h2>
        <div className="space-y-4">
          {WORK_AREAS.map((area) => (
            <div
              key={area.title}
              className="glass rounded-2xl p-5 transition hover:border-white/15"
            >
              <div className="flex items-start gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 via-cyan-400/20 to-teal-300/20 text-cyan-300 ring-1 ring-cyan-400/20">
                  {area.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-white">{area.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                    {area.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12 glass rounded-2xl p-6 sm:p-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/40">
          Stack &amp; approach
        </h2>
        <p className="leading-relaxed text-white/65">
          <span className="font-medium text-white">Python</span> is my main
          language, with{" "}
          <span className="font-medium text-white">Java</span> in the mix when a
          project calls for it. I care less about using the trendiest stack and
          more about shipping something that works and earns its keep.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Python", "Java", "ML / Data", "APIs", "Hardware"].map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-white/5 px-3 py-1 text-xs text-white/50 ring-1 ring-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-sky-500/10 via-cyan-400/5 to-teal-300/10 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white">Available for work</h2>
        <p className="mt-3 leading-relaxed text-white/60">
          If you&apos;ve got a project — a data problem, an integration, a
          model, or just a piece of software that needs building — I&apos;m
          available for freelance and contract work. Get in touch and let&apos;s
          talk about what you need, or email me at{" "}
          <a
            href="mailto:info@mitchelturner.dev"
            className="font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            info@mitchelturner.dev
          </a>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedCtaLink
            href="/contact"
            ctaLocation="about"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v12H5.2L4 17.2z" />
            </svg>
            Get in touch
          </TrackedCtaLink>
          <a
            href="https://github.com/MitchelTurner"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl glass px-5 py-2.5 text-sm font-medium text-white/80 transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
            </svg>
            GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
