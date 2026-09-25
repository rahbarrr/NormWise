import React from "react";
import { Check, AlertTriangle, AlertCircle } from "lucide-react";
import { Badge } from "../ui/Badge";

export const StatusBadges = ({
  status = "Current",
  scopeMatched = true,
  amendmentChecked = true,
  reviewRequired = false,
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

      {/* 2. Scope Matched */}
      {scopeMatched && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Check className="w-3 h-3 stroke-[3]" />
          <span>Scope matched</span>
        </span>
      )}

      {/* 3. Amendment Checked */}
      {amendmentChecked && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <Check className="w-3 h-3 stroke-[3]" />
          <span>Amendment checked</span>
        </span>
      )}

      {/* 4. Review Required (Only when appropriate) */}
      {reviewRequired && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          <span>Review required</span>
        </span>
      )}
    </div>
  );
};
