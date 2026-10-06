"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Source = "database" | "env" | "config" | null;

const SOURCE_LABEL: Record<NonNullable<Source>, string> = {
  database: "admin dashboard",
  env: "GITHUB_USERNAME env var",
  config: "github.config.json",
};

export function GithubSettings() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [initial, setInitial] = useState("");
  const [activeSource, setActiveSource] = useState<Source>(null);
  const [hasToken, setHasToken] = useState(false);
  const [persistedInDb, setPersistedInDb] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function loadSettings() {
    const res = await fetch("/api/settings/github", { cache: "no-store" });
    const d = await res.json();
    setUsername(d.username ?? "");
    setInitial(d.username ?? "");
    setActiveSource(d.activeSource ?? null);
    setHasToken(!!d.hasToken);
    setPersistedInDb(!!d.persistedInDatabase);
    setLoading(false);
  }

  useEffect(() => {
    // loadSettings only updates state after an awaited fetch, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings().catch(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Could not save." });
        return;
      }
      setInitial(data.username);
      await loadSettings();
      router.refresh();
      setMessage({
        kind: "ok",
        text: data.persisted
          ? `Saved. Live Work syncs @${data.username}.`
          : `Saved in session only. Live Work syncs @${data.username}. ${data.hint ?? "Set GITHUB_USERNAME or edit github.config.json for production."}`,
      });
    } finally {
      setSaving(false);
    }
  }

  async function forceRefresh() {
    setRefreshing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/github/repos", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Refresh failed." });
        return;
      }
      router.refresh();
      setMessage({
        kind: "ok",
        text: `Synced ${data.repos?.length ?? 0} repositories from @${data.username}.`,
      });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
            <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
          </svg>
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight">GitHub sync</h2>
          <p className="text-sm text-white/50">
            Auto-build your portfolio from a GitHub account.
          </p>
        </div>
      </div>

      {initial && activeSource && (
        <p className="mb-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/55">
          Currently syncing{" "}
          <span className="font-medium text-white">@{initial}</span> from{" "}
          <span className="text-white/75">{SOURCE_LABEL[activeSource]}</span>
          {!persistedInDb && activeSource !== "database" && (
            <span className="mt-1 block text-amber-300/90">
              Admin saves may not persist on serverless hosts — use{" "}
              <code className="text-white/70">GITHUB_USERNAME</code> or{" "}
              <code className="text-white/70">github.config.json</code>.
            </span>
          )}
        </p>
      )}

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/70">
            GitHub username
          </label>
          <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-3 focus-within:border-cyan-400/50">
            <span className="text-white/40">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="octocat"
              disabled={loading}
              className="w-full bg-transparent px-2 py-2.5 text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 ${
              hasToken
                ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                : "bg-amber-500/15 text-amber-300 ring-amber-400/30"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${hasToken ? "bg-emerald-400" : "bg-amber-400"}`} />
            {hasToken ? "Token configured" : "No token (60 req/hr limit)"}
          </span>
        </div>

        {message && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ring-1 ${
              message.kind === "ok"
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                : "bg-red-500/10 text-red-300 ring-red-400/20"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving || loading || !username || username === initial}
            className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:shadow-cyan-500/40 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & sync"}
          </button>
          <button
            type="button"
            onClick={forceRefresh}
            disabled={refreshing || !initial}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Force refresh"}
          </button>
          {initial && (
            <Link
              href="/"
              className="text-sm font-medium text-white/60 transition hover:text-white"
            >
              View portfolio →
            </Link>
          )}
        </div>
        <p className="text-xs text-white/35">
          Production tip: set <code className="text-white/55">GITHUB_USERNAME</code>{" "}
          on your host, or edit <code className="text-white/55">github.config.json</code>{" "}
          in the repo. Add <code className="text-white/55">GITHUB_TOKEN</code> for
          higher rate limits and deployment status.
        </p>
      </form>
    </div>
  );
}
