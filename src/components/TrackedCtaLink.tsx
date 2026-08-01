"use client";

import Link from "next/link";
import { trackCtaClick } from "@/lib/analytics";

export function TrackedCtaLink({
  href,
  ctaLocation,
  landingPage,
  className,
  children,
}: {
  href: string;
  ctaLocation: string;
  landingPage?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackCtaClick(ctaLocation, landingPage)}
    >
      {children}
    </Link>
  );
}
