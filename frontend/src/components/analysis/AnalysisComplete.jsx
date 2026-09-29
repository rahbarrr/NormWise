import React from "react";
import { Check, ArrowRight, ArrowLeft, ShieldCheck, FileCheck2 } from "lucide-react";
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const AnalysisComplete = ({
  recommendedStandard = "IS 2347:2023",
  onViewResults,
  onBackToRequirement,
}) => {
  const verifiedPoints = [
    "Requirement understood",
    "Standards identified",
    "Current status checked",
    "Related standards checked",
    "Recommendation prepared",
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Analysis complete
            </h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            NormWise has prepared a standards recommendation for your requirement.
          </p>
        </div>

        <Badge variant="current" dot className="self-start sm:self-center">
          Conformity Prepared
        </Badge>
      </div>

      {/* Recommended Standard Banner Preview */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">
              Primary Recommended Indian Standard
            </span>
            <span className="font-mono font-bold text-base text-blue-950">
              {recommendedStandard}
            </span>
          </div>
        </div>

        <span className="text-xs text-blue-700 font-semibold bg-white/80 px-3 py-1 rounded-md border border-blue-200 self-start sm:self-auto">
          Audit-Ready Clause Generated
        </span>
      </div>

      {/* 5 Verified Checkpoints */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Completed Stages
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {verifiedPoints.map((point, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70 text-emerald-950 font-medium"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onBackToRequirement}
          className="order-2 sm:order-1 text-slate-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Requirement</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onViewResults}
          className="order-1 sm:order-2 font-semibold shadow-xs px-6 bg-blue-700 hover:bg-blue-800"
        >
          <span>View Recommendation →</span>
        </Button>
      </div>
    </div>
  );
};
