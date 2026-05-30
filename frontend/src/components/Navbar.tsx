"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

const links = [
  { href: "/opportunities", label: "Opportunities" },
  { href: "/housing", label: "Housing" },
  { href: "/community", label: "Community" },
  { href: "/jobs", label: "Jobs" },
  { href: "/assistant", label: "AI Assistant" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream-50/80 border-b border-cream-200">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-ink-700 hover:bg-cream-200 transition"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login" className="btn-ghost text-sm">
            Sign in
          </Link>
          <Link href="/register" className="btn-accent text-sm">
            Get started
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 rounded-md hover:bg-cream-200"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-cream-200 px-6 py-4 space-y-2 bg-cream-50">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink-700 hover:bg-cream-200"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-cream-200 flex flex-col gap-2">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn-accent text-sm">Get started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
