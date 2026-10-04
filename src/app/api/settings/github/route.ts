/**
 * GitHub settings API
 *
 * GET  /api/settings/github — resolved username + active source
 * POST /api/settings/github — set username (admin only, writes to SQLite)
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  GITHUB_USERNAME_KEY,
  resolveGithubUsernameWithSource,
  setSetting,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

// GET — resolved GitHub username and where it came from.
export async function GET() {
  const [resolved, authed] = await Promise.all([
    resolveGithubUsernameWithSource(),
    isAuthenticated(),
  ]);

  let dbValue: string | null = null;
  try {
    const row = await prisma.setting.findUnique({
      where: { key: GITHUB_USERNAME_KEY },
    });
    dbValue = row?.value?.trim() || null;
  } catch {
    // DB unavailable (common on serverless without persistent storage).
  }

  return NextResponse.json({
    username: resolved.username ?? "",
    activeSource: resolved.source,
    hasToken: authed && !!process.env.GITHUB_TOKEN?.trim(),
    persistedInDatabase: !!dbValue,
    databaseUsername: dbValue ?? "",
    configFile: "github.config.json",
  });
}

// POST — set the GitHub username (admin only).
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const raw = (body as Record<string, unknown>)?.username;
  const username = typeof raw === "string" ? raw.trim().replace(/^@/, "") : "";

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    return NextResponse.json(
      { error: "Enter a valid GitHub username." },
      { status: 400 },
    );
  }

  try {
    await setSetting(GITHUB_USERNAME_KEY, username);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not write to the database.";
    return NextResponse.json(
      {
        error:
          "Could not save to the database. On serverless hosts, set the GITHUB_USERNAME environment variable or edit github.config.json in the repo instead.",
        detail: message,
      },
      { status: 503 },
    );
  }

  let persisted = false;
  try {
    const row = await prisma.setting.findUnique({
      where: { key: GITHUB_USERNAME_KEY },
    });
    persisted = row?.value === username;
  } catch {
    persisted = false;
  }

  revalidatePath("/");
  revalidatePath("/github");

  return NextResponse.json({
    ok: true,
    username,
    persisted,
    activeSource: persisted ? "database" : null,
    hint: persisted
      ? null
      : "Set GITHUB_USERNAME in your host's environment variables, or commit your username in github.config.json.",
  });
}
