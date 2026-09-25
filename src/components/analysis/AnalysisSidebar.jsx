import React from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ShieldCheck, BookOpen, Layers, XCircle, Info } from "lucide-react";

export const AnalysisSidebar = ({
  attributes,
  potentialMatches = 6,
  relatedStandards = 3,
  isComplete = false,
  onCancelClick,
}) => {
  return (
    <div className="space-y-5">
      {/* Requirement Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Requirement Parameters
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Scope Summary
          </h3>
        </div>

        {attributes ? (
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Product:</span>
              <strong className="text-slate-800 text-right truncate max-w-[160px]">
                {attributes.product || "Standard Product"}
              </strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Material:</span>
              <strong className="text-slate-800 text-right truncate max-w-[160px]">
                {attributes.material || "Standard Grade"}
              </strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Capacity:</span>
              <strong className="text-slate-800 text-right truncate max-w-[160px]">
                {attributes.capacity || "Standard Rating"}
              </strong>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Application:</span>
              <strong className="text-slate-800 text-right truncate max-w-[160px]">
                {attributes.application || "Institutional Procurement"}
              </strong>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Loading parameters...</p>
        )}

        {/* Live Metrics */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              Potential matches
            </span>
            <span className="font-bold text-slate-800 font-mono">
              {potentialMatches} standards
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              Related standards
            </span>
            <span className="font-bold text-slate-800 font-mono">
              {relatedStandards} standards
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500">Status</span>
            <Badge
              variant={isComplete ? "current" : "blue"}
              dot
              className="text-[11px]"
            >
              {isComplete ? "Analysis complete" : "Analysis in progress"}
            </Badge>
          </div>
        </div>

        {/* Cancel Action */}
        {!isComplete && (
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancelClick}
              className="w-full text-center text-xs text-slate-400 hover:text-rose-600 transition-colors py-1 font-medium focus:outline-none"
            >
              Cancel analysis
            </button>
          </div>
        )}
      </div>

      {/* Dataset / Institutional Notice */}
      <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>BIS Knowledge Base</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Matching candidate Indian Standards across Mechanical, Electrical, Civil, and Metallurgical Division Councils.
        </p>
      </div>
    </div>
  );
};
