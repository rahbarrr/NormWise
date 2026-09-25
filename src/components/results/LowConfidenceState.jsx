import React from "react";
import { AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export const LowConfidenceState = ({ lowConfidenceData, onClarify }) => {
  if (!lowConfidenceData) return null;

  return (
    <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-900">
            {lowConfidenceData.bannerTitle || "Additional clarification may improve this recommendation."}
          </h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            {lowConfidenceData.bannerDesc || "NormWise identified more than one potentially applicable standard."}
          </p>
        </div>
      </div>

      {/* Option A vs Option B Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {lowConfidenceData.options?.map((opt, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-white border border-amber-200/80 shadow-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-blue-900">
                Option {idx === 0 ? "A" : "B"}: {opt.code}
              </span>
              <Badge variant={opt.status === "Current" ? "current" : "review"} dot className="text-[10px]">
                {opt.status}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-slate-800 leading-snug">
              {opt.title}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {opt.focus}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-amber-800">
          Refining wattage, ingress rating, or optical parameters can distinguish candidate standards.
        </span>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClarify}
          className="text-xs border-amber-300 bg-white hover:bg-amber-100 text-amber-900 font-medium"
        >
          <span>Clarify Requirement</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
