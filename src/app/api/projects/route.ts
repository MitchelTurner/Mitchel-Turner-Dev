import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { serializeProject } from "@/lib/serialize";
import { safeHttpUrl } from "@/lib/safeUrl";
import { isValidCategory, isValidStage, parseTags } from "@/lib/types";

export const dynamic = "force-dynamic";

/** null when empty, undefined when the value is present but not a safe URL. */
function optionalUrl(value: unknown): string | null | undefined {
  if (typeof value !== "string" || !value.trim()) return null;
  return safeHttpUrl(value) ?? undefined;
}

// GET /api/projects?sort=top|new&category=hardware|software&stage=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "top";
  const category = searchParams.get("category");
  const stage = searchParams.get("stage");
  const voterKey = searchParams.get("voterKey") ?? undefined;

  const where: Record<string, unknown> = {};
  if (isValidCategory(category)) where.category = category;
  if (isValidStage(stage)) where.stage = stage;

  const projects = await prisma.project.findMany({
    where,
    orderBy:
      sort === "new"
        ? [{ createdAt: "desc" }]
        : [{ voteCount: "desc" }, { createdAt: "desc" }],
  });

  let votedIds = new Set<string>();
  if (voterKey) {
    const votes = await prisma.vote.findMany({
      where: { voterKey, projectId: { in: projects.map((p) => p.id) } },
      select: { projectId: true },
    });
    votedIds = new Set(votes.map((v) => v.projectId));
  }

  return NextResponse.json({
    projects: projects.map((p) => serializeProject(p, votedIds.has(p.id))),
  });
}

// POST /api/projects — create a new project (admin only).
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  const category = data.category;
  const stage = data.stage ?? "idea";

  if (!title || !summary || !description) {
    return NextResponse.json(
      { error: "Title, summary and description are required." },
      { status: 400 },
    );
  }
  if (!isValidCategory(category)) {
    return NextResponse.json(
      { error: "Category must be 'hardware' or 'software'." },
      { status: 400 },
    );
  }
  if (!isValidStage(stage)) {
    return NextResponse.json({ error: "Invalid stage." }, { status: 400 });
  }

  const tags =
    typeof data.tags === "string"
      ? parseTags(data.tags).join(",")
      : Array.isArray(data.tags)
        ? data.tags.map(String).map((t) => t.trim()).filter(Boolean).join(",")
        : "";

  const imageUrl = optionalUrl(data.imageUrl);
  const demoUrl = optionalUrl(data.demoUrl);
  if (imageUrl === undefined) {
    return NextResponse.json(
      { error: "Cover image must be an http(s) URL or an uploaded file path." },
      { status: 400 },
    );
  }
  if (demoUrl === undefined) {
    return NextResponse.json(
      { error: "Demo link must be an http(s) URL or a site path." },
      { status: 400 },
    );
  }
  const featured = data.featured === true;

  const project = await prisma.project.create({
    data: {
      title,
      summary,
      description,
      category,
      stage,
      tags,
      imageUrl,
      demoUrl,
      featured,
    },
  });

  return NextResponse.json({ project: serializeProject(project) }, {
    status: 201,
  });
}
