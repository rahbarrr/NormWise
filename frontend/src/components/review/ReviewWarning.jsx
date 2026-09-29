import React from "react";
import { AlertTriangle, HelpCircle, FileCheck2, UserCheck } from "lucide-react";
import { Button } from '../common/Button';

export const ReviewWarning = ({
  type = "low-confidence", // "low-confidence" | "insufficient-evidence"
  onRequestClarification,
  onRequestTechnicalReview,
  onViewEvidence,
}) => {
  if (type === "insufficient-evidence") {
    return (
      <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              Limited supporting evidence
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              Some recommendation details could not be sufficiently supported by the available demonstration data.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRequestTechnicalReview}
          className="text-xs shrink-0 self-start sm:self-auto border-amber-300 text-amber-900 bg-white hover:bg-amber-100 font-semibold"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1" />
          <span>Request Technical Review</span>
        </Button>
      </div>
    );
  }

  // Low confidence banner
  return (
    <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950">
              Additional review recommended
            </h4>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
              Confidence 72%
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            The recommendation has limited confidence or supporting evidence. Review the evidence and consider requesting clarification.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onViewEvidence}
          className="text-xs border-amber-300 text-amber-900 bg-white hover:bg-amber-100"
        >
          <FileCheck2 className="w-3.5 h-3.5 mr-1" />
          <span>Review Evidence</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onRequestClarification}
          className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5 mr-1" />
          <span>Request Clarification</span>
        </Button>
      </div>
    </div>
  );
};
