"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { CATEGORIES, STAGES, type ProjectDTO } from "@/lib/types";

const empty = {
  title: "",
  summary: "",
  description: "",
  category: "software",
  stage: "idea",
  tags: "",
  imageUrl: "",
  demoUrl: "",
  featured: false,
};

export function ProjectForm({ onCreated }: { onCreated: (p: ProjectDTO) => void }) {
  const [form, setForm] = useState({ ...empty });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      update("imageUrl", data.url);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create project.");
        return;
      }
      onCreated(data.project);
      setForm({ ...empty });
      if (fileRef.current) fileRef.current.value = "";
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  const label = "block text-sm font-medium text-white/70 mb-1.5";
  const input =
    "w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-cyan-400/50";

  return (
    <form onSubmit={submit} className="glass-strong space-y-5 rounded-3xl p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight">New project</h2>
        <p className="text-sm text-white/50">
          Add a hardware or software idea to the showcase.
        </p>
      </div>

      <div>
        <label className={label}>Title *</label>
        <input
          className={input}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Solar-powered mesh router"
          required
        />
      </div>

      <div>
        <label className={label}>Short summary *</label>
        <input
          className={input}
          value={form.summary}
          onChange={(e) => update("summary", e.target.value)}
          placeholder="One line that explains the idea"
          required
        />
      </div>

      <div>
        <label className={label}>Full description *</label>
        <textarea
          className={`${input} min-h-32 resize-y`}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Explain the concept, how it works, and why it matters…"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Category *</label>
          <select
            className={input}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Stage *</label>
          <select
            className={input}
            value={form.stage}
            onChange={(e) => update("stage", e.target.value)}
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} — {s.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Tags (comma separated)</label>
        <input
          className={input}
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
          placeholder="iot, low-power, 3d-printed"
        />
      </div>

      {/* Image */}
      <div>
        <label className={label}>Cover image</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/30 sm:w-48">
            {form.imageUrl ? (
              <Image
                src={form.imageUrl}
                alt="preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-white/30">
                No image
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <input
              className={input}
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="…or paste an image URL"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={label}>Demo / link (optional)</label>
        <input
          className={input}
          value={form.demoUrl}
          onChange={(e) => update("demoUrl", e.target.value)}
          placeholder="https://…"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) => update("featured", e.target.checked)}
          className="h-4 w-4 accent-cyan-500"
        />
        <span className="text-sm text-white/70">
          Feature this project (highlighted with a badge)
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-400/20">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 ring-1 ring-emerald-400/20">
          Project published to the showcase.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 disabled:opacity-50"
      >
        {submitting ? "Publishing…" : "Publish project"}
      </button>
    </form>
  );
}
