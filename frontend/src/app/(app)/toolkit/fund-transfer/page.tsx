"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Banknote, ArrowLeft, AlertTriangle, CheckCircle2, ExternalLink, TrendingUp } from "lucide-react";

type Origin = "ng" | "gh" | "zw" | "et" | "eg";

const labels: Record<Origin, string> = { ng: "Nigeria", gh: "Ghana", zw: "Zimbabwe", et: "Ethiopia", eg: "Egypt" };
const flags: Record<Origin, string> = { ng: "ng", gh: "gh", zw: "zw", et: "et", eg: "eg" };

type Channel = {
  name: string; type: "official" | "fintech" | "stablecoin";
  speed: string; fee: string; limit: string; legal: boolean;
  pros: string[]; cons: string[]; url: string;
};

const channels: Record<Origin, Channel[]> = {
  ng: [
    {
      name: "Form A — CBN official route", type: "official",
      speed: "1–3 weeks", fee: "~1% + bank charges", limit: "USD 4,000 / quarter for studies",
      legal: true,
      pros: ["100% legal", "Officially recognized for student fees", "Banks issue Form A → tuition receipt"],
      cons: ["Slow", "Bank may demand many documents", "FX rate often worse than parallel"],
      url: "#",
    },
    {
      name: "Wise (transferwise)", type: "fintech",
      speed: "1–3 days", fee: "0.6–1.2%", limit: "Variable — KYC tiered",
      legal: true,
      pros: ["Mid-market FX rate", "Transparent fees", "Recipient in CAD/GBP/EUR direct"],
      cons: ["NGN funding limited — usually via debit card up to NGN limits", "May need DOM account"],
      url: "https://wise.com",
    },
    {
      name: "Domiciliary account → SWIFT", type: "official",
      speed: "3–7 days", fee: "$25–50 SWIFT + 1% spread", limit: "Per CBN rules",
      legal: true,
      pros: ["Universally accepted abroad", "Good for one-time large transfers"],
      cons: ["Banks may delay", "Need active DOM account", "Higher fees for small transfers"],
      url: "#",
    },
    {
      name: "USDC / USDT stablecoin", type: "stablecoin",
      speed: "Minutes", fee: "0.5–2% (P2P spread)", limit: "—",
      legal: false,
      pros: ["Fastest", "Best rate vs parallel market", "Always available"],
      cons: ["Not officially recognized for tuition receipts", "Bank scrutiny on receiving end", "Counter-party risk on P2P"],
      url: "#",
    },
  ],
  gh: [
    {
      name: "BoG-approved bank transfer", type: "official",
      speed: "2–5 days", fee: "~$30 SWIFT + 1.5% spread", limit: "USD 20,000 / yr for fees (declared)",
      legal: true,
      pros: ["Legal, leaves paper trail", "Most universities accept"],
      cons: ["GHS depreciating fast — timing matters", "Banks may run out of FX"],
      url: "#",
    },
    {
      name: "Wise / Remitly", type: "fintech",
      speed: "1–3 days", fee: "0.6–1.5%", limit: "App tiers",
      legal: true,
      pros: ["Better rate than banks", "Digital-only, fast verification"],
      cons: ["GHS funding limited to card", "FX corridor sometimes paused"],
      url: "https://wise.com",
    },
    {
      name: "USDC / USDT P2P", type: "stablecoin",
      speed: "Minutes", fee: "1–3%", limit: "—",
      legal: false,
      pros: ["Bypasses BoG FX rationing", "Best rate during shortages"],
      cons: ["No tuition receipt", "Receiving bank may freeze", "Scam risk on Binance P2P"],
      url: "#",
    },
  ],
  zw: [
    {
      name: "Auction System (Form CD1)", type: "official",
      speed: "Weeks", fee: "~2% + auction discount", limit: "Per RBZ allocation",
      legal: true,
      pros: ["Legal", "Required for tuition transfer documentation"],
      cons: ["Allocation rare for student fees", "USD limit tiny vs need"],
      url: "#",
    },
    {
      name: "Mukuru / Mama Money", type: "fintech",
      speed: "Minutes — 1 day", fee: "5–10% (bundled)", limit: "Small amounts only",
      legal: true,
      pros: ["Works for living expenses", "Reaches relatives in many countries"],
      cons: ["High fees", "Not suitable for full tuition"],
      url: "#",
    },
    {
      name: "USDT P2P", type: "stablecoin",
      speed: "Minutes", fee: "2–5%", limit: "—",
      legal: false,
      pros: ["Only practical full-tuition path for many ZW students"],
      cons: ["Illegal under RBZ rules", "Documentation gap for university", "Counter-party risk"],
      url: "#",
    },
  ],
  et: [
    {
      name: "NBE-approved bank SWIFT", type: "official",
      speed: "Weeks", fee: "Bank fees + spread", limit: "NBE allocation per quarter",
      legal: true,
      pros: ["Only legal route", "Universities accept"],
      cons: ["NBE quota tiny vs demand", "Long delays"],
      url: "#",
    },
    {
      name: "Hawala (informal)", type: "fintech",
      speed: "Days", fee: "Hidden in FX rate (5–15%)", limit: "—",
      legal: false,
      pros: ["Works when banks can't", "Trusted in diaspora communities"],
      cons: ["Illegal", "Zero recourse if lost", "Spread eats your money"],
      url: "#",
    },
  ],
  eg: [
    {
      name: "Bank EGP → USD transfer", type: "official",
      speed: "2–5 days", fee: "~1% + spread", limit: "Per CBE rules",
      legal: true,
      pros: ["Legal", "Tuition receipt"],
      cons: ["FX rationing — banks may say no", "Spread vs parallel can be wide"],
      url: "#",
    },
    {
      name: "Wise / Remitly", type: "fintech",
      speed: "1–3 days", fee: "0.6–2%", limit: "App tiers",
      legal: true,
      pros: ["Better rate vs official"],
      cons: ["EGP funding via card sometimes limited"],
      url: "https://wise.com",
    },
    {
      name: "Crypto P2P", type: "stablecoin",
      speed: "Minutes", fee: "1–4%", limit: "—",
      legal: false,
      pros: ["Bypasses FX rationing"],
      cons: ["Egyptian Central Bank actively cracking down", "No recourse"],
      url: "#",
    },
  ],
};

const typeBadge = {
  official:   "!bg-leaf-500/15 !text-leaf-600",
  fintech:    "!bg-sky-500/15 !text-sky-600",
  stablecoin: "!bg-amber-500/15 !text-amber-500",
};

export default function FundTransferPage() {
  const [origin, setOrigin] = useState<Origin>("ng");
  const [amount, setAmount] = useState(10000); // USD
  const list = channels[origin];

  const totals = useMemo(() => {
    return list.map((c) => {
      // very rough cost simulation
      const feePct = parseFloat(c.fee) / 100 || 0.01;
      return { ...c, estCost: Math.round(amount * feePct) };
    });
  }, [list, amount]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/toolkit" className="text-sm text-ink-600 hover:text-clay-600 inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={13} /> Back to Toolkit
      </Link>

      <header className="mb-8 flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
          <Banknote size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Blocked-Country Fund Transfer Guide</h1>
          <p className="text-sm text-ink-600 mt-0.5">
            How to legally send tuition + living costs out of countries with strict FX controls.
          </p>
        </div>
      </header>

      {/* Country tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(labels) as Origin[]).map((c) => (
          <button
            key={c}
            onClick={() => setOrigin(c)}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
              origin === c ? "bg-clay-500 text-white" : "bg-cream-100 text-ink-700 hover:bg-cream-200"
            }`}
          >
            <span className={`fi fi-${flags[c]}`} aria-hidden="true" />
            {labels[c]}
          </button>
        ))}
      </div>

      {/* Amount slider */}
      <div className="card mb-6">
        <label className="block">
          <span className="block text-xs font-medium text-ink-600 mb-1.5">
            Amount to transfer — <span className="text-clay-600 font-semibold">USD {amount.toLocaleString()}</span>
          </span>
          <input type="range" min={500} max={50000} step={500} value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} className="w-full accent-clay-500" />
        </label>
      </div>

      {/* Channels */}
      <div className="space-y-4">
        {totals.map((c) => (
          <div key={c.name} className={`card ${!c.legal ? "border-amber-300 dark:border-amber-900/40" : ""}`}>
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-ink-900">{c.name}</h3>
                  <span className={`badge ${typeBadge[c.type]} capitalize`}>{c.type}</span>
                  {c.legal ? (
                    <span className="badge badge-verified">Legal</span>
                  ) : (
                    <span className="badge !bg-amber-500/15 !text-amber-500"><AlertTriangle size={11} /> Restricted</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-ink-500">
                  <span>Speed: <span className="text-ink-700 font-medium">{c.speed}</span></span>
                  <span>Fee: <span className="text-ink-700 font-medium">{c.fee}</span></span>
                  <span>Limit: <span className="text-ink-700 font-medium">{c.limit}</span></span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-ink-500">Estimated cost</p>
                <p className="text-2xl font-display font-semibold text-clay-600">~USD {c.estCost.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-md bg-leaf-500/5 border border-leaf-500/15 px-3 py-2">
                <p className="text-xs font-semibold text-leaf-600 mb-1.5 flex items-center gap-1"><CheckCircle2 size={11} /> Pros</p>
                <ul className="text-xs text-ink-700 space-y-1">{c.pros.map((p) => <li key={p}>• {p}</li>)}</ul>
              </div>
              <div className="rounded-md bg-red-500/5 border border-red-500/15 px-3 py-2">
                <p className="text-xs font-semibold text-red-600 mb-1.5 flex items-center gap-1"><AlertTriangle size={11} /> Cons</p>
                <ul className="text-xs text-ink-700 space-y-1">{c.cons.map((p) => <li key={p}>• {p}</li>)}</ul>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-clay-600 font-medium hover:underline inline-flex items-center gap-1">
                Open <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 border-clay-300">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-clay-600 mb-2">
          <TrendingUp size={14} /> Pro strategy for students
        </h3>
        <ol className="space-y-2 text-sm text-ink-700 list-decimal pl-5">
          <li>Use the <strong>official route</strong> for tuition — you need a paper trail for visa renewals and tax</li>
          <li>Use <strong>Wise / Remitly</strong> for monthly living expenses — better rate, faster</li>
          <li>If you must use stablecoin: only with vetted P2P merchants + always transfer to a foreign exchange you control</li>
          <li>Keep <strong>all receipts</strong> — banks and immigration can ask for proof of source up to 7 years later</li>
        </ol>
      </div>

      <p className="text-xs text-ink-500 mt-6">
        ⚠ Not legal/financial advice. Currency-control rules change without notice — verify w/ a licensed broker before sending large amounts.
      </p>
    </div>
  );
}
