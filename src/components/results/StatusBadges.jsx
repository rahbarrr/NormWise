import React from "react";
import { Check, AlertTriangle, ShieldCheck, Database, Info } from "lucide-react";
import { Badge } from "../ui/Badge";

export const StatusBadges = ({
  status = "Current",
  scopeMatched = true,
  amendmentChecked = true,
  reviewRequired = true,
  hasEvidence = true,
  isDemo = true,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. Current / Review / Withdrawn Status */}
      {status === "Current" && (
        <Badge variant="current" dot className="text-xs">
          Current
        </Badge>
      )}

      {status === "Accepted" && (
        <Badge variant="current" dot className="text-xs">
          Accepted
        </Badge>
      )}

      {status === "Under Review" && (
        <Badge variant="review" dot className="text-xs">
          Under Review
        </Badge>
      )}

      {status === "Withdrawn" && (
        <Badge variant="withdrawn" dot className="text-xs">
          Withdrawn
        </Badge>
      )}

      {/* 2. Scope Matched / Currentness Checked */}
      {scopeMatched && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Check className="w-3 h-3 stroke-[3]" />
          <span>Currentness checked</span>
        </span>
      )}

      {/* 3. Evidence-Backed Recommendation */}
      {hasEvidence && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Evidence-backed recommendation</span>
        </span>
      )}

      {/* 4. Human Review Required */}
      {reviewRequired && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Human review required</span>
        </span>
      )}

      {/* 5. Demo Data Indicator */}
      {isDemo && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <Info className="w-3 h-3 text-slate-500" />
          <span>Demo Data</span>
        </span>
      )}
    </div>
  );
};
