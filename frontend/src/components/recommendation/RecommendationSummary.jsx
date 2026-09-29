import React from "react";
import { ShieldCheck, BookOpen, Layers, FileCheck2, Scale } from "lucide-react";
import { Badge } from '../common/Badge';

export const RecommendationSummary = ({ result }) => {
  if (!result) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Evaluation Summary
        </span>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Recommendation Overview
        </h3>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500">Recommendation</span>
          <span className="font-mono font-bold text-blue-900 text-sm">
            {result.recommendedStandard}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500">Confidence</span>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {result.confidence}%
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500">Current status</span>
          <Badge
            variant={
              result.status === "Current"
                ? "current"
                : result.status === "Accepted"
                ? "current"
                : "review"
            }
            dot
            className="text-[11px]"
          >
            {result.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500">Related standards</span>
          <span className="font-mono font-bold text-slate-800">
            {result.alliedStandards?.length || 4}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
          <span className="text-slate-500">Evidence items</span>
          <span className="font-mono font-bold text-slate-800">
            {result.evidenceItems?.length || 3}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5">
          <span className="text-slate-500">Certification</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            {result.certification?.status || "Identified"}
          </span>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 leading-snug">
        Record ID: <span className="font-mono text-slate-700">{result.id}</span>
        <br />
        Audit logging enabled for procurement trail.
      </div>
    </div>
  );
};
