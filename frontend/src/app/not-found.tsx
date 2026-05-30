import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-cream-50">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-clay-500/15 text-clay-600 flex items-center justify-center mb-6">
          <Compass size={28} />
        </div>

        <p className="text-xs uppercase tracking-wider text-clay-600 mb-2">Error 404</p>
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-ink-900">
          Took a wrong turn?
        </h1>
        <p className="text-sm text-ink-600 mt-3 leading-relaxed">
          This page doesn&apos;t exist (or moved). Even verified mentors get lost their first week — happens to the best of us.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/" className="btn-accent text-sm">
            <Home size={14} /> Home
          </Link>
          <Link href="/dashboard" className="btn-ghost border border-cream-300 text-sm">
            Dashboard
          </Link>
          <Link href="/assistant" className="btn-ghost border border-cream-300 text-sm">
            <Search size={14} /> Ask AI
          </Link>
        </div>

        <p className="mt-10 text-xs text-ink-500">
          Press <kbd className="px-1.5 py-0.5 border border-cream-300 rounded text-[10px]">⌘K</kbd> /{" "}
          <kbd className="px-1.5 py-0.5 border border-cream-300 rounded text-[10px]">Ctrl K</kbd> to search anywhere.
        </p>
      </div>
    </div>
  );
}
