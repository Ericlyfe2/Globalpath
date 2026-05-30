"use client";

import { useMemo, useState } from "react";
import {
  Headphones, Play, Video, Mic, ShieldCheck, Clock, Search, Filter, Sparkles,
} from "lucide-react";

type Type = "all" | "podcast" | "video" | "vlog";
type Topic = "all" | "visa" | "arrival" | "academic" | "career" | "life";

const types: { key: Type; label: string; icon: React.ReactNode }[] = [
  { key: "all",     label: "All",      icon: <Sparkles size={13} /> },
  { key: "podcast", label: "Podcasts", icon: <Mic size={13} /> },
  { key: "video",   label: "Videos",   icon: <Video size={13} /> },
  { key: "vlog",    label: "Vlogs",    icon: <Play size={13} /> },
];

const topics: { key: Topic; label: string }[] = [
  { key: "all",      label: "All topics" },
  { key: "visa",     label: "Visa interviews" },
  { key: "arrival",  label: "First week / arrival" },
  { key: "academic", label: "Academic life" },
  { key: "career",   label: "Career & internships" },
  { key: "life",     label: "Daily life" },
];

type Item = {
  id: string; title: string; creator: string; verified: boolean;
  type: Exclude<Type, "all">; topic: Exclude<Topic, "all">;
  durationMin: number; published: string; plays: number;
  origin: string; originFlag: string; destination: string; destFlag: string;
  thumb: string; // tailwind gradient class
};

const items: Item[] = [
  { id: "i1", title: "I passed my F-1 visa interview in 90 seconds — here's exactly what I said",
    creator: "Amara O.", verified: true, type: "video", topic: "visa", durationMin: 12, published: "May 2026", plays: 4820,
    origin: "Lagos", originFlag: "ng", destination: "Boston", destFlag: "us",
    thumb: "bg-gradient-to-br from-clay-500 to-clay-700" },

  { id: "i2", title: "From KNUST to Shopify: a 3-year journey to Toronto",
    creator: "Kwame A.", verified: true, type: "podcast", topic: "career", durationMin: 48, published: "Apr 2026", plays: 2340,
    origin: "Accra", originFlag: "gh", destination: "Toronto", destFlag: "ca",
    thumb: "bg-gradient-to-br from-leaf-500 to-leaf-700" },

  { id: "i3", title: "First 48 hours in Berlin — what nobody tells you",
    creator: "Liu W.", verified: true, type: "vlog", topic: "arrival", durationMin: 22, published: "Mar 2026", plays: 8910,
    origin: "Shanghai", originFlag: "cn", destination: "Berlin", destFlag: "de",
    thumb: "bg-gradient-to-br from-sky-500 to-sky-700" },

  { id: "i4", title: "Chevening interview — every question I got + how I answered",
    creator: "Adaeze N.", verified: true, type: "podcast", topic: "visa", durationMin: 36, published: "Feb 2026", plays: 6710,
    origin: "Abuja", originFlag: "ng", destination: "London", destFlag: "gb",
    thumb: "bg-gradient-to-br from-amber-500 to-amber-600" },

  { id: "i5", title: "Surviving a German thesis defence (Verteidigung) as an outsider",
    creator: "Priya S.", verified: false, type: "vlog", topic: "academic", durationMin: 18, published: "Feb 2026", plays: 1240,
    origin: "Mumbai", originFlag: "in", destination: "Munich", destFlag: "de",
    thumb: "bg-gradient-to-br from-clay-400 to-clay-600" },

  { id: "i6", title: "How I got 4 internship offers without an American CV",
    creator: "Tunde A.", verified: true, type: "podcast", topic: "career", durationMin: 52, published: "Jan 2026", plays: 9420,
    origin: "Lagos", originFlag: "ng", destination: "Boston", destFlag: "us",
    thumb: "bg-gradient-to-br from-leaf-600 to-leaf-800" },

  { id: "i7", title: "A day in the life: MSc Data Science at Imperial",
    creator: "Sarah L.", verified: true, type: "vlog", topic: "life", durationMin: 14, published: "Jan 2026", plays: 5630,
    origin: "Accra", originFlag: "gh", destination: "London", destFlag: "gb",
    thumb: "bg-gradient-to-br from-sky-400 to-sky-600" },

  { id: "i8", title: "The IRCC processing-time anxiety podcast",
    creator: "Multiple students", verified: false, type: "podcast", topic: "visa", durationMin: 41, published: "Dec 2025", plays: 3120,
    origin: "Multi", originFlag: "ng", destination: "Toronto", destFlag: "ca",
    thumb: "bg-gradient-to-br from-amber-400 to-amber-600" },
];

const typeIcon = {
  podcast: <Headphones size={14} />,
  video:   <Video size={14} />,
  vlog:    <Play size={14} />,
};

export default function LibraryPage() {
  const [type, setType]   = useState<Type>("all");
  const [topic, setTopic] = useState<Topic>("all");
  const [q, setQ]         = useState("");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (type !== "all" && i.type !== type) return false;
      if (topic !== "all" && i.topic !== topic) return false;
      if (q && !`${i.title} ${i.creator}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [type, topic, q]);

  const featured = items[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-6 flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
          <Headphones size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-semibold text-ink-900">Podcast &amp; Video Library</h1>
          <p className="text-sm text-ink-600 mt-0.5">
            Authentic student stories. Visa interview prep videos. Arrival vlogs. Contributed by verified community members.
          </p>
        </div>
      </header>

      {/* Featured */}
      <article className={`rounded-xl overflow-hidden mb-8 relative aspect-[16/6] ${featured.thumb} flex items-end p-8 text-white`}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="relative max-w-2xl">
          <span className="badge !bg-white/20 !text-white text-[10px] backdrop-blur"><Sparkles size={10} /> Featured this week</span>
          <h2 className="mt-3 text-2xl md:text-3xl font-display font-semibold">{featured.title}</h2>
          <p className="mt-2 text-sm text-white/85">
            {featured.creator} {featured.verified && "· verified"} · {featured.durationMin} min
          </p>
          <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-slate-900 font-medium text-sm hover:bg-slate-100 transition">
            <Play size={14} /> Watch now
          </button>
        </div>
      </article>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9 text-sm" placeholder="Search title or creator" />
        </div>
        <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)} className="input text-sm max-w-[180px]">
          {topics.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border border-cream-200 rounded-md p-1 bg-cream-100 w-fit">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition ${
              type === t.key ? "bg-clay-500 text-white" : "text-ink-700 hover:bg-cream-200"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((i) => (
          <article key={i.id} className="card !p-0 overflow-hidden group cursor-pointer hover:border-clay-300 transition">
            {/* Thumbnail */}
            <div className={`relative aspect-video ${i.thumb} flex items-center justify-center text-white`}>
              <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/40 transition" />
              <button className="relative w-14 h-14 rounded-full bg-white/90 text-clay-600 flex items-center justify-center group-hover:scale-105 transition">
                {typeIcon[i.type]}
              </button>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/70 text-white text-xs flex items-center gap-1 backdrop-blur">
                <Clock size={10} /> {i.durationMin}m
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <h3 className="font-medium text-ink-900 leading-snug line-clamp-2">{i.title}</h3>
              <p className="text-xs text-ink-500 mt-1 flex items-center gap-1.5">
                {i.creator}
                {i.verified && <ShieldCheck size={11} className="text-leaf-600" />}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ink-500">
                <span className="flex items-center gap-1.5">
                  <span className={`fi fi-${i.originFlag}`} aria-hidden="true" />
                  → <span className={`fi fi-${i.destFlag}`} aria-hidden="true" />
                </span>
                <span>{i.plays.toLocaleString()} plays</span>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full card text-center text-sm text-ink-500 py-10">
            <Filter size={20} className="mx-auto mb-2 opacity-50" /> Nothing matches these filters.
          </div>
        )}
      </div>

      <p className="text-xs text-ink-500 mt-8 text-center">
        Want to contribute? Verified mentors can upload via Dashboard → Profile → Contribute.
      </p>
    </div>
  );
}
