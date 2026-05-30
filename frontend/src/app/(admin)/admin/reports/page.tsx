"use client";

import { useState } from "react";
import { Flag, AlertTriangle, MessageCircle, FileText, Home, User, Check, X, ExternalLink } from "lucide-react";

type Kind = "scam" | "spam" | "harassment" | "fake_listing" | "fraud_agent";
type Target = "user" | "listing" | "message" | "post";

type Report = {
  id: string; kind: Kind; target: Target; targetTitle: string;
  reporters: number; first: string; severity: "low" | "med" | "high"; status: "open" | "resolved";
  excerpt: string;
};

const initial: Report[] = [
  { id: "r_001", kind: "scam",         target: "listing", targetTitle: "Suspicious work-from-home gig $$$", reporters: 7, first: "12m ago",  severity: "high", status: "open",     excerpt: "Asks for upfront 'training fee' via crypto." },
  { id: "r_002", kind: "fake_listing", target: "listing", targetTitle: "Cheap luxury apartment downtown???", reporters: 4, first: "1h ago",   severity: "high", status: "open",     excerpt: "Photos copied from Airbnb. Landlord won't video call." },
  { id: "r_003", kind: "harassment",   target: "message", targetTitle: "DM thread w/ @anon_xyz",            reporters: 1, first: "3h ago",   severity: "med",  status: "open",     excerpt: "Repeated unsolicited contact after blocked." },
  { id: "r_004", kind: "spam",         target: "post",    targetTitle: "Forum post in /ghana-students",      reporters: 2, first: "5h ago",   severity: "low",  status: "open",     excerpt: "Posting the same essay-writing service link in every thread." },
  { id: "r_005", kind: "fraud_agent",  target: "user",    targetTitle: "User @VisaConsultantPro",            reporters: 11, first: "1d ago",  severity: "high", status: "resolved", excerpt: "Suspended. Funds returned to 3 affected users." },
];

export default function ReportsPage() {
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const filtered = initial.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Reports</h1>
          <p className="text-sm text-ink-600 mt-1">Community + AI-flagged content. {filtered.length} shown.</p>
        </div>
        <div className="flex gap-1 rounded-md border border-cream-200 p-1 bg-cream-100">
          {(["open", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition ${
                filter === f ? "bg-clay-500 text-white" : "text-ink-700 hover:bg-cream-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className={`card ${r.severity === "high" && r.status === "open" ? "border-red-300 dark:border-red-900/40" : ""}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                r.severity === "high" ? "bg-red-500/15 text-red-600" :
                r.severity === "med"  ? "bg-amber-500/15 text-amber-500" :
                                        "bg-cream-200 text-ink-600"
              }`}>
                <Flag size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-ink-900">{r.targetTitle}</h3>
                  <SeverityChip s={r.severity} />
                  <KindChip k={r.kind} />
                  <span className="text-xs text-ink-500 flex items-center gap-1">
                    <TargetIcon t={r.target} /> {r.target}
                  </span>
                </div>
                <p className="text-sm text-ink-600 mt-1">{r.excerpt}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-ink-500">
                  <span>{r.reporters} {r.reporters === 1 ? "report" : "reports"}</span>
                  <span>·</span>
                  <span>First flagged {r.first}</span>
                  {r.status === "resolved" && <span className="badge badge-verified !text-[10px]">Resolved</span>}
                </div>
              </div>

              {r.status === "open" && (
                <div className="flex items-center gap-1 shrink-0">
                  <button className="btn-ghost text-xs border border-cream-300 !py-1.5"><ExternalLink size={12} /> Open</button>
                  <button title="Dismiss"  className="p-1.5 rounded-md text-ink-500 hover:bg-cream-200"><X size={14} /></button>
                  <button title="Resolve"  className="p-1.5 rounded-md text-leaf-600 hover:bg-leaf-500/10"><Check size={14} /></button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card text-center text-sm text-ink-500 py-10">
            <Check size={20} className="mx-auto mb-2 text-leaf-600" /> No reports here.
          </div>
        )}
      </div>
    </div>
  );
}

function SeverityChip({ s }: { s: "low" | "med" | "high" }) {
  const map = {
    low:  { c: "!bg-cream-200 !text-ink-700",       l: "Low" },
    med:  { c: "!bg-amber-500/15 !text-amber-500",  l: "Medium" },
    high: { c: "!bg-red-500/15 !text-red-600",      l: "High" },
  };
  return <span className={`badge ${map[s].c}`}>{s === "high" && <AlertTriangle size={10} />} {map[s].l}</span>;
}

function KindChip({ k }: { k: Kind }) {
  const labels: Record<Kind, string> = {
    scam: "Scam", spam: "Spam", harassment: "Harassment", fake_listing: "Fake listing", fraud_agent: "Fraud agent",
  };
  return <span className="badge !bg-cream-200 !text-ink-700">{labels[k]}</span>;
}

function TargetIcon({ t }: { t: Target }) {
  if (t === "user")    return <User size={11} />;
  if (t === "listing") return <Home size={11} />;
  if (t === "message") return <MessageCircle size={11} />;
  return <FileText size={11} />;
}
