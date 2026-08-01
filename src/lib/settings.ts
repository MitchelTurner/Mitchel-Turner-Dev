/**
 * Application settings — key/value store in SQLite with env and file fallbacks.
 *
 * GitHub username resolution order (first match wins):
 *   1. Admin dashboard (Prisma `Setting` table)
 *   2. `GITHUB_USERNAME` environment variable
 *   3. `github.config.json` in the project root (committed, serverless-safe)
 */
import "server-only";
import githubConfig from "../../github.config.json";
import { prisma } from "./prisma";

export const GITHUB_USERNAME_KEY = "github_username";

export type UsernameSource = "database" | "env" | "config" | null;

function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, "");
}

function readConfigUsername(): string | null {
  try {
    const username = githubConfig.username
      ? normalizeUsername(githubConfig.username)
      : "";
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

// Resolve the GitHub username from every supported source.
// Order: admin DB → GITHUB_USERNAME env → github.config.json (committed).
export async function resolveGithubUsernameWithSource(): Promise<{
  username: string | null;
  source: UsernameSource;
}> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: GITHUB_USERNAME_KEY },
    });
    if (row?.value?.trim()) {
      return {
        username: normalizeUsername(row.value),
        source: "database",
      };
    }
  } catch {
    // DB unavailable — fall through to env/config.
  }

  const env = process.env.GITHUB_USERNAME?.trim();
  if (env) {
    return { username: normalizeUsername(env), source: "env" };
  }

  const config = readConfigUsername();
  if (config) {
    return { username: config, source: "config" };
  }

  return { username: null, source: null };
}

export async function resolveGithubUsername(): Promise<string | null> {
  const { username } = await resolveGithubUsernameWithSource();
  return username;
}
