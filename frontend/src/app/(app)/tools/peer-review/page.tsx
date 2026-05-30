"use client";

import { useState } from "react";
import {
  Users, ShieldCheck, Eye, Lock, ArrowRight, Upload, MessageCircle, ThumbsUp, Star, Clock, Sparkles,
} from "lucide-react";

type Tab = "submit" | "queue" | "review";

type Rubric = { id: string; label: string; weight: number };
const rubric: Rubric[] = [
  { id: "hook",  label: "Opening hook",       weight: 15 },
  { id: "arc",   label: "Narrative arc",      weight: 20 },
  { id: "ev",    label: "Specific evidence",  weight: 20 },
  { id: "fit",   label: "Program / role fit", weight: 20 },
  { id: "voice", label: "Authentic voice",    weight: 15 },
  { id: "close", label: "Closing return",     weight: 10 },
];

type Submission = {
  id: string; alias: string; aliasColor: string;
  type: string; target: string;
  words: number; postedHrs: number; reviews: number; needed: number;
  preview: string;
};

const queue: Submission[] = [
  { id: "s1", alias: "OrangeFox-4421", aliasColor: "bg-amber-500", type: "SoP",          target: "MSc CS · UofT",      words: 612, postedHrs: 2,  reviews: 1, needed: 3, preview: "Ever since I was a kid in Kumasi, I have been fascinated by..." },
  { id: "s2", alias: "GreenLeaf-9812", aliasColor: "bg-leaf-500",  type: "Scholarship",   target: "Chevening 2026",     words: 480, postedHrs: 8,  reviews: 0, needed: 3, preview: "Climate change in the Niger Delta is not abstract to me. I grew up..." },
  { id: "s3", alias: "BlueRiver-7733", aliasColor: "bg-sky-500",    type: "Personal Stmt", target: "Oxford MPhil",       words: 700, postedHrs: 14, reviews: 2, needed: 3, preview: "My research is on indigenous governance in post-colonial East Africa..." },
  { id: "s4", alias: "PurpleDove-1230", aliasColor: "bg-clay-500", type: "Cover Letter",  target: "Software Eng · Stripe", words: 220, postedHrs: 26, reviews: 1, needed: 2, preview: "I'm applying for the Software Engineer role on Payments Infra..." },
];

export default function PeerReviewPage() {
  const [tab, setTab] = useState<Tab>("queue");

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-6 flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-clay-500/15 text-clay-600 flex items-center justify-center shrink-0">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Peer Essay Review</h1>
          <p className="text-sm text-ink-600 mt-0.5">
            Anonymous structured feedback from verified mentors + experienced students. Free for verified students.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 border border-cream-200 rounded-md p-1 bg-cream-100 w-fit mb-6">
        {([
          { k: "queue",  l: "Review queue" },
          { k: "submit", l: "Submit yours" },
          { k: "review", l: "My reviews" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              tab === t.k ? "bg-clay-500 text-white" : "text-ink-700 hover:bg-cream-200"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {tab === "submit" && <SubmitView />}
      {tab === "queue"  && <QueueView />}
      {tab === "review" && <MyReviewsView />}

      <div className="card mt-8 border-clay-300">
        <h3 className="font-display text-base font-semibold text-clay-600 mb-2 flex items-center gap-1.5">
          <Lock size={14} /> How peer review works
        </h3>
        <ul className="text-xs text-ink-700 space-y-1.5">
          <li>• You submit anonymously — reviewers see your essay + alias only, never your name</li>
          <li>• Three reviewers fill the rubric; aggregated comments come back to you</li>
          <li>• To submit one, review three of others first (Wikipedia model — keeps quality high)</li>
          <li>• Reviewers earn reputation badges; top 10% become Verified Mentors</li>
        </ul>
      </div>
    </div>
  );
}

function QueueView() {
  return (
    <div className="space-y-3">
      {queue.map((s) => (
        <article key={s.id} className="card">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full ${s.aliasColor} text-white flex items-center justify-center text-xs font-semibold shrink-0`}>?</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <p className="text-sm font-mono text-ink-700">{s.alias}</p>
                <span className="badge badge-clay text-[10px]">{s.type}</span>
                <span className="text-xs text-ink-500">→ {s.target}</span>
                <span className="text-xs text-ink-500 flex items-center gap-1"><Clock size={10} /> {s.postedHrs}h ago</span>
              </div>
              <p className="text-sm text-ink-700 mt-2 line-clamp-2 italic">&ldquo;{s.preview}&rdquo;</p>
              <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span>{s.words} words</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    Reviews: <span className="font-medium text-ink-900">{s.reviews}/{s.needed}</span>
                  </span>
                </div>
                <button className="btn-accent text-sm">
                  <Eye size={13} /> Review this <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function SubmitView() {
  return (
    <div className="card">
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label className="block">
          <span className="block text-xs font-medium text-ink-600 mb-1.5">Document type</span>
          <select className="input text-sm">
            <option>Statement of Purpose</option>
            <option>Personal Statement</option>
            <option>Scholarship Essay</option>
            <option>Motivation Letter (DE)</option>
            <option>Cover Letter</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-ink-600 mb-1.5">Target</span>
          <input className="input text-sm" placeholder="e.g. MSc CS · University of Toronto" />
        </label>
      </div>

      <label className="block mb-4">
        <span className="block text-xs font-medium text-ink-600 mb-1.5">What specifically do you want feedback on?</span>
        <input className="input text-sm" placeholder="e.g. Is my fit paragraph specific enough?" />
      </label>

      <div className="border-2 border-dashed border-cream-300 rounded-lg p-6 text-center mb-4">
        <Upload size={24} className="mx-auto text-ink-500 mb-2" />
        <p className="text-sm font-medium text-ink-900">Drop your draft (PDF or paste)</p>
        <p className="text-xs text-ink-500 mt-1">Reviewers see your alias only.</p>
      </div>

      <div className="rounded-md bg-clay-500/10 border border-clay-500/25 px-4 py-3 mb-4 flex items-start gap-3">
        <Lock size={16} className="text-clay-600 mt-0.5 shrink-0" />
        <div className="text-sm text-ink-700">
          You need <span className="font-medium text-clay-600">3 review credits</span> to submit. Review 3 other drafts first.
        </div>
      </div>

      <button className="btn-accent w-full" disabled>
        Submit for review (need credits) <ArrowRight size={13} />
      </button>
    </div>
  );
}

function MyReviewsView() {
  const myReviews = [
    { id: "r1", essay: "MSc CS · UofT (SoP)",          mentorAlias: "Verified Mentor",   score: 76, when: "2d ago", awaiting: false },
    { id: "r2", essay: "Chevening 2026 (Scholarship)", mentorAlias: "GreenLeaf-2412",     score: 82, when: "5d ago", awaiting: false },
    { id: "r3", essay: "Oxford MPhil (Personal Stmt)", mentorAlias: "Pending — 2/3 in",   score: 0,  when: "1d ago", awaiting: true },
  ];

  return (
    <div className="space-y-3">
      {myReviews.map((r) => (
        <article key={r.id} className="card flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-cream-200 text-ink-700 flex items-center justify-center shrink-0">
            <MessageCircle size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink-900">{r.essay}</p>
            <p className="text-xs text-ink-500 mt-0.5">From {r.mentorAlias} · {r.when}</p>
          </div>
          {r.awaiting ? (
            <span className="badge !bg-amber-500/15 !text-amber-500 text-[10px]">Awaiting reviews</span>
          ) : (
            <div className="text-right">
              <p className="text-sm font-semibold text-clay-600">{r.score}/100</p>
              <p className="text-[10px] text-ink-500">aggregate</p>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
