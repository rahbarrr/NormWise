import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Database, FileSearch, Sparkles } from "lucide-react";
import { BrandMark } from "../components/common/BrandMark";

export function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fffaf5] text-slate-900">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <BrandMark />
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link to="/login" className="rounded-full px-4 py-2 text-slate-700 hover:bg-white">Sign in</Link>
          <Link to="/login" className="rounded-full bg-slate-950 px-5 py-2.5 text-white shadow-lg shadow-slate-900/15 hover:bg-violet-700">Choose access</Link>
        </nav>
      </header>
      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-20">
          <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-fuchsia-200/60 blur-3xl" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-violet-700"><Sparkles className="h-3.5 w-3.5" /> Standards intelligence for procurement</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-.05em] sm:text-6xl">Turn a procurement brief into a <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">defensible standard</span>.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">NormWise connects your product requirement to real Indian Standards, currentness signals, and source evidence your review team can inspect.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link to="/recommend" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-violet-600/25 hover:bg-violet-700">Try a recommendation <ArrowRight className="h-4 w-4" /></Link><Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800 hover:border-fuchsia-400">Choose access</Link></div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verified backend results</span><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Evidence-linked output</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-orange-200/70 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-slate-950 p-5 shadow-2xl shadow-violet-900/20 sm:p-7"><div className="rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 p-[1px]"><div className="rounded-3xl bg-slate-950 p-6 text-white"><div className="flex items-center justify-between text-xs text-white/60"><span>LIVE ANALYSIS</span><span className="rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-300">Database connected</span></div><div className="mt-12 text-3xl font-bold">Pressure cooker</div><div className="mt-2 text-sm text-white/55">Stainless steel · 5 litre · institutional kitchen</div><div className="mt-8 rounded-2xl bg-white/10 p-4"><div className="text-xs text-white/50">PRIMARY STANDARD</div><div className="mt-2 text-xl font-bold">IS 2347:2023</div><div className="mt-1 text-sm text-emerald-300">Domestic pressure cooker — Specification</div></div></div></div><div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-white/60"><div className="rounded-xl bg-white/10 p-3"><FileSearch className="mx-auto mb-2 h-4 w-4 text-fuchsia-300" />Evidence</div><div className="rounded-xl bg-white/10 p-3"><Database className="mx-auto mb-2 h-4 w-4 text-orange-300" />Supabase</div><div className="rounded-xl bg-white/10 p-3"><Sparkles className="mx-auto mb-2 h-4 w-4 text-violet-300" />Traceable</div></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}
