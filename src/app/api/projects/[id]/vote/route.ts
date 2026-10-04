import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clientAddress, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// POST /api/projects/:id/vote — toggle a vote for an anonymous voter.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const voterKey =
    typeof (body as Record<string, unknown>)?.voterKey === "string"
      ? ((body as Record<string, unknown>).voterKey as string).trim()
      : "";

  if (!/^[A-Za-z0-9_-]{8,80}$/.test(voterKey)) {
    return NextResponse.json(
      { error: "A voterKey is required." },
      { status: 400 },
    );
  }

  const ip = clientAddress(req.headers);
  if (
    rateLimit(`vote:${ip}`, 20, 60_000) ||
    rateLimit("vote:global", 60, 60_000)
  ) {
    return NextResponse.json(
      { error: "Too many votes. Please try again shortly." },
      { status: 429 },
    );
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const existing = await prisma.vote.findUnique({
    where: { projectId_voterKey: { projectId: id, voterKey } },
  });

  try {
    if (existing) {
      // Toggle off: remove the vote.
      const [, updated] = await prisma.$transaction([
        prisma.vote.delete({ where: { id: existing.id } }),
        prisma.project.update({
          where: { id },
          data: { voteCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({
        hasVoted: false,
        voteCount: Math.max(0, updated.voteCount),
      });
    }

    const [, updated] = await prisma.$transaction([
      prisma.vote.create({ data: { projectId: id, voterKey } }),
      prisma.project.update({
        where: { id },
        data: { voteCount: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({
      hasVoted: true,
      voteCount: updated.voteCount,
    });
  } catch (err) {
    // Unique-constraint race: the vote already exists, treat as voted.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const current = await prisma.project.findUnique({ where: { id } });
      return NextResponse.json({
        hasVoted: true,
        voteCount: current?.voteCount ?? project.voteCount,
      });
    }
    throw err;
  }
}
