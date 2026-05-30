"use client";

import { useState } from "react";
import { ShieldCheck, FileText, Check as CheckIcon, X, Clock, Eye } from "lucide-react";

type Doc = "passport" | "national_id" | "study_permit" | "acceptance_letter" | "residence_card";

type Submission = {
  id: string; name: string; role: "student" | "mentor"; doc: Doc;
  submitted: string; country: string; preview: string;
};

const initialQueue: Submission[] = [
  { id: "v_001", name: "Ada Lovelace",  role: "student", doc: "passport",          submitted: "14m ago", country: "GH", preview: "Passport scan · MRZ visible" },
  { id: "v_002", name: "Tunde Adebayo", role: "mentor",  doc: "study_permit",      submitted: "38m ago", country: "NG", preview: "Canadian Study Permit (valid until 2027)" },
  { id: "v_003", name: "Liu Wei",       role: "student", doc: "acceptance_letter", submitted: "1h ago",  country: "CN", preview: "University of Toronto offer letter" },
  { id: "v_004", name: "Adaeze N.",     role: "mentor",  doc: "residence_card",    submitted: "2h ago",  country: "NG", preview: "German Aufenthaltstitel" },
  { id: "v_005", name: "Priya Sharma",  role: "student", doc: "national_id",       submitted: "3h ago",  country: "IN", preview: "Aadhaar card front + back" },
];

export default function VerificationsPage() {
  const [queue, setQueue] = useState(initialQueue);
  const [selected, setSelected] = useState<Submission | null>(initialQueue[0] ?? null);

  function approve(id: string) {
    setQueue((q) => q.filter((s) => s.id !== id));
    setSelected(null);
  }
  function reject(id: string) {
    setQueue((q) => q.filter((s) => s.id !== id));
    setSelected(null);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Verifications</h1>
          <p className="text-sm text-ink-600 mt-1">{queue.length} pending · SLA 24h</p>
        </div>
        <span className="badge !bg-amber-500/15 !text-amber-500"><Clock size={11} /> 12 over SLA</span>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Queue */}
        <div className="card !p-0 overflow-hidden lg:col-span-1">
          <div className="px-4 py-3 border-b border-cream-200 text-xs font-semibold uppercase tracking-wider text-ink-600">
            Queue ({queue.length})
          </div>
          <ul className="divide-y divide-cream-200">
            {queue.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-cream-100 transition ${
                    selected?.id === s.id ? "bg-clay-500/5 border-l-2 border-l-clay-500" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{s.name}</p>
                    <p className="text-xs text-ink-500 capitalize">{s.role} · {s.doc.replace(/_/g, " ")}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{s.submitted}</p>
                  </div>
                </button>
              </li>
            ))}
            {queue.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-ink-500">
                <CheckIcon size={20} className="mx-auto mb-2 text-leaf-600" /> Queue clear.
              </li>
            )}
          </ul>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink-900">{selected.name}</h2>
                  <p className="text-sm text-ink-600 capitalize">{selected.role} · {selected.country} · Submitted {selected.submitted}</p>
                </div>
                <span className="badge badge-clay capitalize">{selected.doc.replace(/_/g, " ")}</span>
              </div>

              {/* Doc preview placeholder */}
              <div className="aspect-[4/3] rounded-lg bg-cream-100 border border-cream-200 flex items-center justify-center text-ink-500 mb-4 relative overflow-hidden">
                <FileText size={48} className="opacity-40" />
                <span className="absolute bottom-3 left-3 text-xs">{selected.preview}</span>
                <button className="absolute top-3 right-3 btn-ghost text-xs border border-cream-300 !py-1.5">
                  <Eye size={12} /> Full screen
                </button>
              </div>

              {/* Checklist */}
              <div className="space-y-2 mb-6">
                <Check label="Document is legible and not expired" />
                <Check label="Name matches profile" />
                <Check label="No signs of tampering / forgery" warn />
                <Check label="Country of issue matches declared origin" />
              </div>

              {/* Notes */}
              <label className="block mb-4">
                <span className="block text-xs font-medium text-ink-600 mb-1.5">Internal notes (visible to admins only)</span>
                <textarea className="input min-h-[80px]" placeholder="Add notes..." />
              </label>

              <div className="flex items-center justify-end gap-2">
                <button onClick={() => reject(selected.id)} className="btn-ghost border border-red-300 text-red-600 hover:!bg-red-500/10">
                  <X size={15} /> Reject
                </button>
                <button onClick={() => approve(selected.id)} className="btn-accent">
                  <CheckIcon size={15} /> Approve & verify
                </button>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center py-16 text-ink-500">
              <ShieldCheck size={32} className="mb-3 opacity-50" />
              <p className="text-sm">Select a submission to review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Check({ label, warn = false }: { label: string; warn?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
      <input type="checkbox" defaultChecked={!warn} className="w-4 h-4 accent-clay-500" />
      <span>{label}</span>
      {warn && <span className="text-xs text-amber-500 ml-1">⚠ verify manually</span>}
    </label>
  );
}
