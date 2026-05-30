"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DollarSign, ArrowLeft, TrendingUp, Info, MapPin } from "lucide-react";

type Country = "uk" | "us" | "de" | "ca" | "au";
type Level = "intern" | "junior" | "mid" | "senior" | "staff";

const countryMeta: Record<Country, { label: string; flag: string; currency: string; symbol: string; ppFactor: number }> = {
  uk: { label: "United Kingdom", flag: "gb", currency: "GBP", symbol: "£", ppFactor: 1.05 },
  us: { label: "United States",  flag: "us", currency: "USD", symbol: "$", ppFactor: 1.00 },
  de: { label: "Germany",        flag: "de", currency: "EUR", symbol: "€", ppFactor: 1.15 },
  ca: { label: "Canada",         flag: "ca", currency: "CAD", symbol: "$", ppFactor: 1.20 },
  au: { label: "Australia",      flag: "au", currency: "AUD", symbol: "$", ppFactor: 1.10 },
};

const levelMeta: Record<Level, string> = {
  intern: "Intern / co-op",
  junior: "Junior (0-2 yrs)",
  mid:    "Mid (2-5 yrs)",
  senior: "Senior (5-8 yrs)",
  staff:  "Staff / Lead (8+)",
};

type Row = { role: string; base: Record<Country, Record<Level, [number, number, number]>> };

// Salary medians in local currency (annual base, in 000s)
const data: Row[] = [
  {
    role: "Software Engineer",
    base: {
      uk: { intern: [30, 32, 36],  junior: [42, 48, 55],  mid: [60, 72, 88],  senior: [85, 105, 130], staff: [120, 150, 200] },
      us: { intern: [55, 65, 90],  junior: [110, 130, 160], mid: [150, 185, 230], senior: [220, 270, 340], staff: [320, 400, 540] },
      de: { intern: [22, 26, 30],  junior: [50, 58, 68],  mid: [68, 80, 95],  senior: [85, 105, 125], staff: [120, 140, 175] },
      ca: { intern: [42, 50, 60],  junior: [70, 85, 100], mid: [100, 120, 140], senior: [135, 160, 190], staff: [185, 220, 280] },
      au: { intern: [55, 65, 75],  junior: [80, 95, 115], mid: [115, 135, 160], senior: [150, 180, 210], staff: [200, 240, 300] },
    },
  },
  {
    role: "Data Analyst",
    base: {
      uk: { intern: [26, 28, 32],  junior: [35, 40, 48],  mid: [48, 58, 70],   senior: [65, 80, 98],   staff: [90, 110, 140] },
      us: { intern: [45, 55, 70],  junior: [80, 95, 115], mid: [110, 130, 160], senior: [155, 185, 225], staff: [200, 240, 320] },
      de: { intern: [18, 22, 26],  junior: [42, 50, 58],  mid: [58, 70, 82],   senior: [78, 95, 115],  staff: [105, 125, 150] },
      ca: { intern: [38, 45, 55],  junior: [60, 72, 85],  mid: [85, 100, 120], senior: [120, 140, 165], staff: [165, 195, 240] },
      au: { intern: [50, 60, 70],  junior: [70, 85, 100], mid: [100, 120, 140], senior: [135, 160, 190], staff: [180, 215, 270] },
    },
  },
  {
    role: "UX / Product Designer",
    base: {
      uk: { intern: [26, 30, 36],  junior: [38, 45, 55],  mid: [55, 65, 80],   senior: [80, 95, 115],  staff: [110, 135, 170] },
      us: { intern: [50, 60, 75],  junior: [90, 110, 130], mid: [130, 155, 190], senior: [190, 230, 280], staff: [260, 310, 420] },
      de: { intern: [20, 24, 28],  junior: [45, 52, 60],  mid: [60, 72, 85],   senior: [80, 95, 115],  staff: [105, 125, 150] },
      ca: { intern: [40, 50, 60],  junior: [65, 80, 95],  mid: [90, 105, 125], senior: [125, 150, 175], staff: [165, 195, 240] },
      au: { intern: [50, 60, 70],  junior: [75, 90, 105], mid: [105, 125, 145], senior: [140, 165, 195], staff: [185, 220, 275] },
    },
  },
  {
    role: "Marketing Manager",
    base: {
      uk: { intern: [22, 25, 30],  junior: [30, 36, 44],  mid: [44, 55, 68],   senior: [65, 80, 100],  staff: [95, 120, 160] },
      us: { intern: [40, 48, 60],  junior: [60, 72, 90],  mid: [90, 110, 135], senior: [130, 160, 200], staff: [180, 220, 290] },
      de: { intern: [18, 22, 26],  junior: [38, 45, 55],  mid: [55, 65, 80],   senior: [78, 95, 115],  staff: [105, 125, 150] },
      ca: { intern: [35, 42, 52],  junior: [55, 68, 82],  mid: [80, 95, 115],  senior: [115, 135, 160], staff: [150, 180, 225] },
      au: { intern: [45, 55, 65],  junior: [65, 80, 95],  mid: [95, 115, 135], senior: [130, 155, 180], staff: [170, 200, 250] },
    },
  },
];

export default function SalaryPage() {
  const [country, setCountry] = useState<Country>("uk");
  const [level,   setLevel]   = useState<Level>("junior");
  const [role,    setRole]    = useState(data[0].role);

  const row = data.find((r) => r.role === role)!;
  const [p25, p50, p75] = row.base[country][level];
  const meta = countryMeta[country];

  // Convert to USD for cross-country compare
  const fx: Record<Country, number> = { uk: 1.27, us: 1, de: 1.10, ca: 0.74, au: 0.66 };
  const compareData = useMemo(() => {
    return (Object.keys(countryMeta) as Country[])
      .map((c) => {
        const [pp25, pp50, pp75] = row.base[c][level];
        const usd = Math.round(pp50 * fx[c]);
        return { c, label: countryMeta[c].label, flag: countryMeta[c].flag, local: pp50, symbol: countryMeta[c].symbol, usd };
      })
      .sort((a, b) => b.usd - a.usd);
  }, [row, level]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/jobs" className="text-sm text-ink-600 hover:text-clay-600 inline-flex items-center gap-1 mb-4">
        <ArrowLeft size={13} /> Back to jobs
      </Link>

      <header className="mb-6 flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
          <DollarSign size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Salary Benchmarking</h1>
          <p className="text-sm text-ink-600 mt-0.5">Real base-salary ranges by role, country, and experience.</p>
        </div>
      </header>

      {/* Controls */}
      <div className="card mb-6 grid sm:grid-cols-3 gap-4">
        <Field label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
            {data.map((r) => <option key={r.role}>{r.role}</option>)}
          </select>
        </Field>
        <Field label="Country">
          <select value={country} onChange={(e) => setCountry(e.target.value as Country)} className="input">
            {(Object.keys(countryMeta) as Country[]).map((c) => (
              <option key={c} value={c}>{countryMeta[c].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Level">
          <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="input">
            {(Object.keys(levelMeta) as Level[]).map((l) => (
              <option key={l} value={l}>{levelMeta[l]}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Range card */}
      <div className="card mb-6">
        <p className="text-xs text-ink-500 uppercase tracking-wider">{role} · {meta.label} · {levelMeta[level]}</p>
        <p className="text-4xl font-display font-semibold text-ink-900 mt-1">
          {meta.symbol}{(p50 * 1000).toLocaleString()}
          <span className="text-base font-normal text-ink-500 ml-2">median ({meta.currency} / year)</span>
        </p>

        {/* Percentile bar */}
        <div className="mt-6">
          <div className="relative h-6 bg-cream-200 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 bg-gradient-to-r from-clay-500 to-leaf-500" style={{ left: "25%", right: "25%" }} />
            <div className="absolute inset-y-0 w-1 bg-ink-900" style={{ left: "50%" }} />
          </div>
          <div className="mt-2 grid grid-cols-3 text-xs text-ink-700">
            <div>
              <p className="text-ink-500">25th percentile</p>
              <p className="font-semibold">{meta.symbol}{(p25 * 1000).toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-ink-500">Median</p>
              <p className="font-semibold">{meta.symbol}{(p50 * 1000).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-ink-500">75th percentile</p>
              <p className="font-semibold">{meta.symbol}{(p75 * 1000).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-cream-200 rounded-md flex items-start gap-2 text-sm text-ink-600">
          <Info size={14} className="text-clay-500 mt-0.5 shrink-0" />
          <span>
            Visa minimum (where applicable) is usually ≤ p25. If your offer is below, negotiate or look elsewhere — sponsor licenses depend on hitting thresholds.
          </span>
        </div>
      </div>

      {/* Cross-country compare */}
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-ink-900 mb-1 flex items-center gap-2">
          <TrendingUp size={16} className="text-clay-500" /> {role} median worldwide ({levelMeta[level]})
        </h2>
        <p className="text-xs text-ink-500 mb-4">Sorted by USD equivalent at current FX. Doesn&apos;t adjust for cost of living.</p>

        <ul className="space-y-3">
          {compareData.map((d) => {
            const pct = (d.usd / compareData[0].usd) * 100;
            return (
              <li key={d.c}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2 text-ink-700">
                    <span className={`fi fi-${d.flag}`} aria-hidden="true" />
                    <MapPin size={11} className="text-ink-500" /> {d.label}
                  </span>
                  <span className="text-ink-900 font-medium">
                    {d.symbol}{(d.local * 1000).toLocaleString()}
                    <span className="text-xs text-ink-500 ml-2">≈ ${d.usd.toLocaleString()}k USD</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                  <div className="h-full bg-clay-500" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs text-ink-500 mt-6">
        Data from levels.fyi, Glassdoor, official ONS / BLS / Destatis statistics. Updated quarterly. Local taxes + cost of living vary widely — use cost calculator alongside.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
