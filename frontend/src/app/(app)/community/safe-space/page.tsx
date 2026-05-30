"use client";

import { useState } from "react";
import {
  Lock, Heart, Shield, MessageCircle, Plus, Eye, EyeOff, AlertTriangle, ChevronUp, Scale, Globe,
} from "lucide-react";

type Topic = "all" | "mental-health" | "discrimination" | "legal" | "burnout" | "relationships";

const topics: { key: Topic; label: string; icon: React.ReactNode; tone: string }[] = [
  { key: "all",            label: "All",                icon: <Globe size={13} />,       tone: "text-ink-600" },
  { key: "mental-health",  label: "Mental health",      icon: <Heart size={13} />,       tone: "text-clay-600" },
  { key: "discrimination", label: "Discrimination",     icon: <Shield size={13} />,      tone: "text-amber-500" },
  { key: "legal",          label: "Legal issues",       icon: <Scale size={13} />,       tone: "text-sky-600" },
  { key: "burnout",        label: "Academic burnout",   icon: <AlertTriangle size={13} />, tone: "text-red-600" },
  { key: "relationships",  label: "Relationships",      icon: <MessageCircle size={13} />, tone: "text-leaf-600" },
];

type Post = {
  id: string; topic: Exclude<Topic, "all">;
  alias: string; aliasColor: string;
  title: string; body: string;
  replies: number; upvotes: number; supportCount: number;
  posted: string;
  pinned?: boolean; flagged?: boolean;
};

const posts: Post[] = [
  {
    id: "p_001", topic: "mental-health", alias: "PurpleBird-4421", aliasColor: "bg-clay-500",
    title: "First semester abroad, feeling completely alone — does this get better?",
    body: "Been here 3 months. Classes are fine but I haven't made one real friend. Calling home makes it worse. Some days I can't get out of bed. Has anyone been through this?",
    replies: 14, upvotes: 42, supportCount: 28, posted: "3h ago", pinned: true,
  },
  {
    id: "p_002", topic: "discrimination", alias: "QuietLeaf-9981", aliasColor: "bg-leaf-500",
    title: "Was singled out in class for my accent — what do I do?",
    body: "Professor publicly mocked the way I pronounced a term during a discussion. Whole class laughed. I'm too embarrassed to go back. Do I report? Talk to him?",
    replies: 22, upvotes: 67, supportCount: 51, posted: "Yesterday",
  },
  {
    id: "p_003", topic: "legal", alias: "BlueRiver-1144", aliasColor: "bg-sky-500",
    title: "Employer asked for my passport for 'verification' and won't return it",
    body: "Started a part-time job 2 weeks ago. Manager took my passport on day one saying she needed to copy it for HR. It's been 14 days and she keeps making excuses. Is this normal?",
    replies: 31, upvotes: 89, supportCount: 47, posted: "2d ago", flagged: true,
  },
  {
    id: "p_004", topic: "burnout", alias: "AmberFox-3320", aliasColor: "bg-amber-500",
    title: "Failed my first midterm — losing my scholarship if I don't recover",
    body: "GPA must stay 3.5+. After failing one test, math says I need straight As in everything else. Working 20h/week, sleeping 5h. Considering quitting. Talk me out of it.",
    replies: 18, upvotes: 54, supportCount: 39, posted: "3d ago",
  },
  {
    id: "p_005", topic: "relationships", alias: "GreenDove-7708", aliasColor: "bg-leaf-500",
    title: "Long distance with partner back home — slowly drifting apart",
    body: "5 months in. We were great before I left. Now WhatsApp feels like a chore. Neither of us wants to end it but it's heavy. Anyone navigated this?",
    replies: 11, upvotes: 28, supportCount: 19, posted: "5d ago",
  },
];

const helplines: Record<Exclude<Topic, "all">, { label: string; phone: string }[]> = {
  "mental-health":  [{ label: "Samaritans (UK)", phone: "116 123" }, { label: "988 (US)", phone: "988" }, { label: "Talk Suicide (CA)", phone: "1-833-456-4566" }],
  "discrimination": [{ label: "EEOC (US)", phone: "1-800-669-4000" }, { label: "EHRC (UK)", phone: "0808 800 0082" }],
  "legal":          [{ label: "Free legal aid (UK)", phone: "0345 345 4 345" }, { label: "Legal Aid (CA)", phone: "1-800-668-8258" }],
  "burnout":        [{ label: "Samaritans", phone: "116 123" }, { label: "Crisis Text Line", phone: "Text HOME to 741741" }],
  "relationships":  [{ label: "BetterHelp", phone: "betterhelp.com" }],
};

export default function SafeSpacePage() {
  const [topic, setTopic] = useState<Topic>("all");
  const [showFlagged, setShowFlagged] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = posts
    .filter((p) => topic === "all" || p.topic === topic)
    .filter((p) => showFlagged || !p.flagged)
    .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false));

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="badge !bg-clay-500/15 !text-clay-600 mb-3 inline-flex items-center gap-1">
              <Lock size={11} /> Anonymous · End-to-end moderated
            </span>
            <h1 className="text-3xl font-display font-semibold text-ink-900">Safe Space</h1>
            <p className="text-sm text-ink-600 mt-1">
              For sensitive topics. Your identity stays hidden — even from admins reviewing flags.
            </p>
          </div>
          <button onClick={() => setComposeOpen((v) => !v)} className="btn-accent text-sm">
            <Plus size={13} /> Post anonymously
          </button>
        </div>
      </header>

      {/* Compose */}
      {composeOpen && (
        <div className="card mb-6 border-clay-300">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-clay-500" />
            <p className="text-sm font-medium text-ink-900">You&apos;ll post as a random color-animal alias. Nobody can link this to your account.</p>
          </div>
          <select className="input mb-3 max-w-xs text-sm">
            <option value="">— Pick a topic —</option>
            {topics.slice(1).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input className="input mb-3" placeholder="Title (keep it specific)" />
          <textarea className="input min-h-[120px]" placeholder="Share what's going on. Vague is fine. Mods can't see your identity." />
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs text-ink-500">
            <span>⚠ Posts about active self-harm trigger crisis-line outreach — your alias is preserved.</span>
            <div className="flex gap-2">
              <button onClick={() => setComposeOpen(false)} className="btn-ghost border border-cream-300 !py-1.5">Cancel</button>
              <button className="btn-accent !py-1.5">Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {topics.map((t) => (
          <button
            key={t.key}
            onClick={() => setTopic(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              topic === t.key ? "bg-clay-500 text-white" : "bg-cream-100 text-ink-700 hover:bg-cream-200"
            }`}
          >
            <span className={topic === t.key ? "text-white" : t.tone}>{t.icon}</span>
            {t.label}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={() => setShowFlagged((v) => !v)}
            className="text-xs text-ink-500 hover:text-ink-700 inline-flex items-center gap-1"
          >
            {showFlagged ? <Eye size={12} /> : <EyeOff size={12} />}
            {showFlagged ? "Hide flagged posts" : "Show flagged posts"}
          </button>
        </div>
      </div>

      {/* Posts */}
      <ul className="space-y-3">
        {filtered.map((p) => {
          const topicMeta = topics.find((t) => t.key === p.topic)!;
          const hl = helplines[p.topic];
          return (
            <li key={p.id} className={`card ${p.flagged ? "border-amber-300 dark:border-amber-900/40" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full ${p.aliasColor} text-white flex items-center justify-center text-xs font-semibold shrink-0`}>
                  ?
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-ink-500">
                    <span className="font-mono">{p.alias}</span>
                    <span>·</span>
                    <span className={`badge !text-[10px] capitalize ${topicMeta.tone.replace("text-", "!text-").replace("-600", "-600 !bg-")}500/15`}>
                      {topicMeta.icon} {topicMeta.label}
                    </span>
                    <span>·</span>
                    <span>{p.posted}</span>
                    {p.flagged && <span className="badge !bg-amber-500/15 !text-amber-500 !text-[10px]"><AlertTriangle size={9} /> Under review</span>}
                  </div>
                  <h3 className="font-medium text-ink-900 mt-2">{p.title}</h3>
                  <p className="text-sm text-ink-700 mt-1 leading-relaxed">{p.body}</p>

                  {/* Helpline strip for sensitive topics */}
                  {hl && hl.length > 0 && (
                    <div className="mt-3 px-3 py-2 rounded-md bg-clay-500/5 border border-clay-500/15 flex items-center gap-2 flex-wrap text-xs">
                      <Heart size={12} className="text-clay-600 shrink-0" />
                      <span className="text-ink-700">Crisis support:</span>
                      {hl.map((h) => (
                        <span key={h.label} className="font-mono font-medium text-clay-600">{h.label} · {h.phone}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs text-ink-500">
                    <button className="flex items-center gap-1 hover:text-clay-600 transition">
                      <ChevronUp size={12} /> {p.upvotes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-clay-600 transition">
                      <MessageCircle size={12} /> {p.replies} replies
                    </button>
                    <span className="flex items-center gap-1 text-leaf-600">
                      <Heart size={12} /> {p.supportCount} sent support
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {filtered.length === 0 && (
          <li className="card text-center text-sm text-ink-500 py-10">No posts here yet.</li>
        )}
      </ul>

      {/* Footer disclaimer */}
      <div className="card mt-6 border-clay-300">
        <p className="text-xs font-semibold uppercase tracking-wider text-clay-600 mb-2 flex items-center gap-1">
          <Lock size={11} /> How anonymity works
        </p>
        <ul className="text-xs text-ink-700 space-y-1">
          <li>• Random alias generated per session — even your past safe-space posts are unlinkable from your main profile</li>
          <li>• AI screens for self-harm + abuse cues — flags trigger crisis outreach via alias only</li>
          <li>• Admin moderation sees alias + content only. Your account ID is hashed beyond their access</li>
          <li>• Threats of imminent harm to self or others may trigger legal disclosure — read full policy in <a href="/privacy" className="text-clay-600 underline">Privacy</a></li>
        </ul>
      </div>
    </div>
  );
}
