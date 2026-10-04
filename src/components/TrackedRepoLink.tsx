"use client";

import { trackViewDemo } from "@/lib/analytics";

export function TrackedRepoLink({
  href,
  repoName,
  className,
  children,
}: {
  href: string;
  repoName: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackViewDemo(repoName)}
      className={className}
    >
      {children}
    </a>
  );
}
