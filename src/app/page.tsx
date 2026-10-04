import type { Metadata } from "next";
import { LiveWorkPortfolio } from "@/components/LiveWorkPortfolio";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mitchel Turner — Live Work",
  description:
    "A portfolio auto-built from public GitHub repositories — cover art, language breakdowns, and live deployments.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ fresh?: string }>;
}) {
  const params = await searchParams;
  // Public ?fresh=1 links stay as a retry, but only an admin session may
  // bypass the GitHub cache. Otherwise anyone can burn the API rate limit.
  const fresh = params.fresh === "1" && (await isAuthenticated());
  return <LiveWorkPortfolio fresh={fresh} />;
}
