/**
 * Prisma client singleton.
 *
 * Reuses one instance across hot reloads in development to avoid exhausting
 * SQLite connection handles. In production each serverless invocation gets
 * a fresh instance — keep queries lightweight.
 */
import "server-only";
import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient instance across hot reloads in development to
// avoid exhausting the database connection pool.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
