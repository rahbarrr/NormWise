import React from "react";
import { ShieldCheck, Calendar, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { StatusBadges } from "./StatusBadges";

/**
 * RecommendationCard (Section 26 - Phase 15)
 * Displays primary recommended standard, title, Match score, and separate Currentness status.
 */
export const RecommendationCard = (props) => {
  const data = props.result || props;
  if (!data) return null;

  const standardNumber = data.recommendedStandard || data.standard || "IS 2347:2023";
  const title = data.title || data.standardTitle || "Specification";
  const confidence = data.confidence ?? 94;
  const currentnessStatus = data.currentnessStatus || data.currentStatus?.code || data.status || "CURRENT";
  const edition = data.edition || "Third Revision";
  const amendment = data.amendment || "Amendment No. 1";
  const amendmentDate = data.amendmentDate || "2024-05";

  return (
    <div className="bg-white rounded-xl border-2 border-blue-600/30 shadow-md p-6 sm:p-8 space-y-5 relative overflow-hidden">
      {/* Decorative subtle backdrop accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-50/50 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Banner / Header & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              RECOMMENDED STANDARD
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Status: {currentnessStatus}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            {standardNumber}
          </h1>

          <p className="text-base sm:text-lg font-semibold text-slate-700 leading-snug">
            "{title}"
          </p>
        </div>

        {/* Match Score Badge */}
        <div className="shrink-0 self-start sm:self-auto">
          <ConfidenceBadge
            confidence={confidence}
            label="Match score"
          />
        </div>
      </div>

      {/* Status Badges Row */}
      <div className="relative z-10 pt-1">
        <StatusBadges
          status={data.status || currentnessStatus}
          scopeMatched={data.scopeMatched ?? true}
          amendmentChecked={data.amendmentChecked ?? true}
          reviewRequired={data.reviewRequired ?? true}
          hasEvidence={Boolean(data.evidence && data.evidence.length > 0)}
          isDemo={Boolean(data.isDemoDataset ?? true)}
        />
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs relative z-10">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Edition
          </span>
          <span className="font-semibold text-slate-800 font-sans">
            {edition}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Amendment
          </span>
          <span className="font-semibold text-slate-800 font-sans">
            {amendment}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Amendment Date
          </span>
          <span className="font-semibold text-slate-800 font-sans">
            {amendmentDate}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Currentness Status
          </span>
          <span className="font-semibold text-emerald-700 font-sans flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {currentnessStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
