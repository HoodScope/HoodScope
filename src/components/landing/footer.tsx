import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { GITHUB_REPO_URL } from "@/lib/project";

const footerLinks = {
  Product: [
    { href: "#install", label: "Install Agent" },
    { href: "#features", label: "Features" },
    { href: "#install", label: "Install CLI" },
  ],
  Resources: [
    { href: "#how-it-works", label: "Documentation" },
    { href: "/api/scan", label: "API" },
    { href: GITHUB_REPO_URL, label: "GitHub" },
    { href: "https://x.com/gohoodscope", label: "X / Twitter" },
  ],
  Legal: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-black/8 bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="md" showName nameClassName="text-black font-display font-black" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-black/50">
              AI token security for Robinhood Chain. Transparent intelligence, trusted data, explainable reports.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold text-black">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-black/50 transition-colors hover:text-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-black/8 pt-8">
          <p className="text-sm text-black/40">© 2026 HoodScope</p>
        </div>
      </div>
    </footer>
  );
}
