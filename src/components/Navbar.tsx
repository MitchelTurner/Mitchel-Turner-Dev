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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the phone menu when navigation changes, without an effect.
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (onAdmin) return;
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onAdmin]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Admin is intentionally unlisted — no nav links on public pages.
  if (onAdmin) return null;

  return (
    <nav
      className={`site-nav${stuck || menuOpen ? " is-stuck" : ""}${menuOpen ? " is-open" : ""}`}
      id="site-nav"
    >
      <Link href="/" className="site-wordmark">
        Mitchel Turner <em>Dev</em>
      </Link>

      <div className="site-nav-right">
        <span className="site-nav-loc">55°20′N 131°38′W · Ketchikan, AK</span>
        <div
          id="site-nav-menu"
          className={`site-nav-links${menuOpen ? " is-open" : ""}`}
        >
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
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          className="site-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
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
