import {
  Users,
  ShieldCheck,
  Flag,
  FileText,
  TrendingUp,
  AlertTriangle,
  Activity,
  Bot,
} from "lucide-react";
import Link from "next/link";

export default function AdminOverview() {
  const stats = [
    { label: "Total users", value: "12,438", delta: "+8.2%", icon: Users, tone: "clay" },
    { label: "Pending verifications", value: "47", delta: "12 over 24h SLA", icon: ShieldCheck, tone: "amber", warn: true },
    { label: "Open reports", value: "23", delta: "5 new today", icon: Flag, tone: "red" },
    { label: "Active listings", value: "892", delta: "+34 this week", icon: FileText, tone: "leaf" },
  ];

  const queue = [
    { type: "verification", title: "Ada Lovelace — ID upload", meta: "Submitted 14m ago", href: "/admin/verifications" },
    { type: "report", title: "Suspicious housing listing #4421", meta: "Reported by 3 users", href: "/admin/reports" },
    { type: "verification", title: "Tunde Adebayo — Mentor status", meta: "Submitted 38m ago", href: "/admin/verifications" },
    { type: "report", title: "Scam alert: fake scholarship link", meta: "AI auto-flagged", href: "/admin/reports" },
  ];

  const activity = [
    { who: "Admin: Sarah", what: "Verified 4 mentor profiles", when: "12m ago" },
    { who: "AI", what: "Auto-flagged listing #4421 for review", when: "27m ago" },
    { who: "Admin: Eric", what: "Suspended user @scammer_x", when: "1h ago" },
    { who: "System", what: "Translation pipeline back online", when: "2h ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-display font-semibold text-ink-900">Admin overview</h1>
        <p className="text-sm text-ink-600 mt-1">Platform health, moderation queue, and recent admin activity.</p>
      </header>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                s.tone === "clay" ? "bg-clay-500/15 text-clay-600" :
                s.tone === "amber" ? "bg-amber-500/15 text-amber-500" :
                s.tone === "red" ? "bg-red-500/15 text-red-600" :
                "bg-leaf-500/15 text-leaf-600"
              }`}>
                <s.icon size={18} />
              </div>
              {s.warn && <AlertTriangle size={14} className="text-amber-500" />}
            </div>
            <p className="mt-4 text-2xl font-display font-semibold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-500 mt-1">{s.label}</p>
            <p className={`mt-2 text-xs font-medium flex items-center gap-1 ${
              s.warn ? "text-amber-500" : s.tone === "red" ? "text-red-600" : "text-leaf-600"
            }`}>
              <TrendingUp size={11} /> {s.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Moderation queue */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">Moderation queue</h2>
            <Link href="/admin/verifications" className="text-xs text-clay-600 font-medium hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-cream-200">
            {queue.map((q, i) => (
              <li key={i}>
                <Link href={q.href} className="flex items-center gap-3 py-3 hover:bg-cream-100 -mx-3 px-3 rounded-md transition">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    q.type === "verification" ? "bg-amber-500/15 text-amber-500" : "bg-red-500/15 text-red-600"
                  }`}>
                    {q.type === "verification" ? <ShieldCheck size={14} /> : <Flag size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{q.title}</p>
                    <p className="text-xs text-ink-500">{q.meta}</p>
                  </div>
                  <span className="text-xs text-clay-600 font-medium shrink-0">Review →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Activity feed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-ink-900">Recent activity</h2>
            <Activity size={14} className="text-ink-500" />
          </div>
          <ul className="space-y-3">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-clay-500 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-ink-900"><span className="font-medium">{a.who}</span> {a.what}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{a.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI status */}
      <div className="card flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-clay-500/15 text-clay-600 flex items-center justify-center shrink-0">
          <Bot size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-900">AI Immigration Assistant — Online</p>
          <p className="text-xs text-ink-500">Powered by Claude · 1,284 conversations today · 99.8% uptime</p>
        </div>
        <Link href="/admin/ai" className="btn-ghost text-sm border border-cream-300">Configure</Link>
      </div>
    </div>
  );
}
