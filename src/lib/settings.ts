/**
 * Application settings — key/value store in SQLite with env and file fallbacks.
 *
 * Live Work always syncs MitchelTurner. A database, GITHUB_USERNAME, or
 * github.config.json value is used as the reported source only when it is
 * that account. Anything else is ignored.
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  selectPortfolioUsername,
  type UsernameSource,
} from "./githubUsername";
import { prisma } from "./prisma";

export const GITHUB_USERNAME_KEY = "github_username";

export type { UsernameSource };

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, "");
}

function readConfigUsername(): string | null {
  try {
    const raw = readFileSync(
      join(process.cwd(), "github.config.json"),
      "utf8",
    );
    const data = JSON.parse(raw) as { username?: string };
    const username = data.username ? normalizeUsername(data.username) : "";
    return username || null;
  } catch {
    return null;
  }
}

// Read a setting from the DB, falling back to an environment variable.
export async function getSetting(
  key: string,
  envFallback?: string,
): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row?.value?.trim()) return row.value.trim();
  } catch {
    // Table may not exist yet (pre-migration) or DB unavailable on serverless.
  }
  const env = envFallback ? process.env[envFallback] : undefined;
  return env && env.trim() ? env.trim() : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// Resolve the GitHub username. Live Work stays on MitchelTurner even when
// GITHUB_USERNAME or a saved admin value points somewhere else.
export async function resolveGithubUsernameWithSource(): Promise<{
  username: string;
  source: UsernameSource;
}> {
  let database: string | null = null;
  try {
    const row = await prisma.setting.findUnique({
      where: { key: GITHUB_USERNAME_KEY },
    });
    database = row?.value ?? null;
  } catch {
    // DB unavailable — fall through to env/config.
  }

  return selectPortfolioUsername({
    database,
    env: process.env.GITHUB_USERNAME,
    config: readConfigUsername(),
  });
}

export async function resolveGithubUsername(): Promise<string | null> {
  const { username } = await resolveGithubUsernameWithSource();
  return username;
}
