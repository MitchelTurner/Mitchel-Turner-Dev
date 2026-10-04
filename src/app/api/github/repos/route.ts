/**
 * GitHub repos API
 *
 * GET  /api/github/repos?limit=12&fresh=1 — fetch normalized portfolio repos
 * POST /api/github/repos                     — admin-only force refresh
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { fetchPortfolioRepos } from "@/lib/github";

export const dynamic = "force-dynamic";

// GET /api/github/repos?limit=12&fresh=1 — normalized portfolio repositories.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), 30)
      : 12;
  // Uncached fetches hit GitHub on every request. Keep that to admin sessions.
  const fresh =
    searchParams.get("fresh") === "1" && (await isAuthenticated());

  const result = await fetchPortfolioRepos(limit, { fresh });
  return NextResponse.json(result);
}

// POST /api/github/refresh — force-refresh cached GitHub data (admin only).
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/github");

  const result = await fetchPortfolioRepos(24, { fresh: true });
  return NextResponse.json({ ok: true, ...result });
}
