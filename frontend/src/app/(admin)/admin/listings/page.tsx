"use client";

import { useState } from "react";
import { Home, Award, Briefcase, ShieldCheck, AlertTriangle, MoreVertical, Eye } from "lucide-react";

type Kind = "housing" | "opportunity" | "job";
type State = "live" | "pending" | "flagged";

type Listing = {
  id: string; title: string; kind: Kind; state: State;
  owner: string; created: string; views: number; reports: number;
};

const initial: Listing[] = [
  { id: "l_001", title: "Cozy studio near University of Toronto", kind: "housing",    state: "live",    owner: "Sarah Lee",      created: "2026-05-18", views: 312, reports: 0 },
  { id: "l_002", title: "MasterCard Foundation Scholarship 2026",  kind: "opportunity",state: "live",    owner: "Admin",          created: "2026-05-15", views: 1402, reports: 0 },
  { id: "l_003", title: "Frontend Intern (visa sponsor)",          kind: "job",       state: "pending", owner: "TechCo Ltd",     created: "2026-05-23", views: 0,   reports: 0 },
  { id: "l_004", title: "Cheap luxury apartment downtown???",      kind: "housing",   state: "flagged", owner: "anon_xyz",       created: "2026-05-22", views: 87,  reports: 4 },
  { id: "l_005", title: "Chevening Scholarship (UK)",              kind: "opportunity",state: "live",    owner: "Admin",          created: "2026-05-12", views: 2104, reports: 0 },
  { id: "l_006", title: "Suspicious work-from-home gig $$$",       kind: "job",       state: "flagged", owner: "scammer_x",      created: "2026-05-21", views: 22,  reports: 7 },
];

export default function ListingsPage() {
  const [kindFilter, setKindFilter] = useState<Kind | "all">("all");
  const [stateFilter, setStateFilter] = useState<State | "all">("all");

  const filtered = initial.filter((l) =>
    (kindFilter === "all" || l.kind === kindFilter) &&
    (stateFilter === "all" || l.state === stateFilter),
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-display font-semibold text-ink-900">Listings</h1>
        <p className="text-sm text-ink-600 mt-1">Housing, opportunities, and jobs. {filtered.length} shown.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as Kind | "all")} className="input text-sm max-w-[180px]">
          <option value="all">All kinds</option>
          <option value="housing">Housing</option>
          <option value="opportunity">Opportunity</option>
          <option value="job">Job</option>
        </select>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value as State | "all")} className="input text-sm max-w-[180px]">
          <option value="all">All states</option>
          <option value="live">Live</option>
          <option value="pending">Pending review</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((l) => (
          <div key={l.id} className={`card ${l.state === "flagged" ? "border-red-300 dark:border-red-900/40" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                  l.kind === "housing" ? "bg-sky-500/15 text-sky-600" :
                  l.kind === "opportunity" ? "bg-leaf-500/15 text-leaf-600" :
                  "bg-amber-500/15 text-amber-500"
                }`}>
                  {l.kind === "housing" ? <Home size={16} /> : l.kind === "opportunity" ? <Award size={16} /> : <Briefcase size={16} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-ink-900 truncate">{l.title}</h3>
                  <p className="text-xs text-ink-500 mt-0.5">by {l.owner} · {l.created}</p>
                </div>
              </div>
              <button className="p-1.5 rounded-md text-ink-500 hover:bg-cream-200 shrink-0"><MoreVertical size={14} /></button>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <StateChip state={l.state} />
                <span className="text-ink-500 flex items-center gap-1"><Eye size={11} /> {l.views}</span>
                {l.reports > 0 && (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <AlertTriangle size={11} /> {l.reports} reports
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {l.state !== "live" && (
                  <button className="text-xs px-2 py-1 rounded-md text-leaf-600 hover:bg-leaf-500/10 transition flex items-center gap-1">
                    <ShieldCheck size={11} /> Approve
                  </button>
                )}
                {l.state !== "flagged" && (
                  <button className="text-xs px-2 py-1 rounded-md text-red-600 hover:bg-red-500/10 transition">Take down</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StateChip({ state }: { state: State }) {
  if (state === "live")    return <span className="badge badge-verified">Live</span>;
  if (state === "pending") return <span className="badge !bg-amber-500/15 !text-amber-500">Pending</span>;
  return <span className="badge !bg-red-500/15 !text-red-600">Flagged</span>;
}
