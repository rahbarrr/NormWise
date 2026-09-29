import React from "react";

export function BrandMark({ compact = false, light = false }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "gap-3"}`}>
      <span className="grid place-items-center w-10 h-10 rounded-2xl bg-white/90 shadow-lg shadow-violet-500/20 p-2">
        <img src="/favicon.svg" alt="NormWise logo" className="w-full h-full object-contain" />
      </span>
      {!compact && <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-slate-950"}`}>NormWise</span>}
    </div>
  );
}
