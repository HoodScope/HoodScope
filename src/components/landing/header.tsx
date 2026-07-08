import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const navLinks = [
  { href: "#analyze", label: "Live Scan" },
  { href: "#install", label: "Install" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Docs" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-hood-green/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo size="sm" showName nameClassName="text-black font-display font-black" />
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-black/55 transition-colors hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="#install" className="btn-pill-primary h-9 px-4 text-xs sm:px-5 sm:text-sm">
          Install Agent
        </Link>
      </div>
    </header>
  );
}
