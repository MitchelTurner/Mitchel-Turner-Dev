"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const serviceLinks = [
  { href: "/web-design", label: "Web design" },
  { href: "/custom-software", label: "Custom software" },
  { href: "/hardware", label: "Hardware" },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="site-footer">
      <span>Mitchel Turner Dev, LLC · Ketchikan, Alaska</span>
      <span className="site-footer-links">
        {serviceLinks.map((link, i) => (
          <span key={link.href}>
            {i > 0 ? " · " : null}
            <Link href={link.href}>{link.label}</Link>
          </span>
        ))}
        {" · "}
        <Link href="/">Home</Link>
      </span>
    </footer>
  );
}
