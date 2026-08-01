"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TrackedCtaLink } from "@/components/TrackedCtaLink";

const links = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const onAdmin = pathname.startsWith("/admin");
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (onAdmin) return;
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onAdmin]);

  // Admin is intentionally unlisted — no nav links on public pages.
  if (onAdmin) return null;

  return (
    <nav className={`site-nav${stuck ? " is-stuck" : ""}`} id="site-nav">
      <Link href="/" className="site-wordmark">
        Mitchel Turner <em>Dev</em>
      </Link>

      <div className="site-nav-right">
        <span className="site-nav-loc">55°20′N 131°38′W · Ketchikan, AK</span>
        <div className="site-nav-links">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-link${active ? " is-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <TrackedCtaLink
          href="/contact"
          ctaLocation="nav"
          className="site-btn site-btn--primary site-btn--sm"
        >
          <span>Get a quote</span>
        </TrackedCtaLink>
      </div>
    </nav>
  );
}
