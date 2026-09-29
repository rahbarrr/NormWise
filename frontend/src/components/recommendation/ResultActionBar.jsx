import React from "react";
import { CheckCircle2, UserCheck, Edit2, Bookmark, FileText } from "lucide-react";
import { Button } from '../common/Button';

export const ResultActionBar = ({
  onEditRequirement,
  onSaveResult,
  onAcceptRecommendation,
  onRequestReview,
  onGenerateClause,
  isSaved,
  isAccepted,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onEditRequirement}
          className="text-xs h-9 font-medium"
        >
          <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>Edit Requirement</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onSaveResult}
          className="text-xs h-9 font-medium"
        >
          <Bookmark className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>{isSaved ? "Saved" : "Save Result"}</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onGenerateClause}
          className="text-xs h-9 font-medium text-blue-700 hover:bg-blue-50 border-blue-200"
        >
          <FileText className="w-3.5 h-3.5 mr-1" />
          <span>Generate Procurement Clause</span>
        </Button>
      </div>

      {/* Right Decision Buttons */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRequestReview}
          className="text-xs h-9 font-medium border-amber-300 text-amber-900 bg-amber-50/70 hover:bg-amber-100"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1 text-amber-700" />
          <span>Request Review</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onAcceptRecommendation}
          disabled={isAccepted}
          className="text-xs h-9 font-semibold shadow-xs bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-100 disabled:text-emerald-700"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          <span>{isAccepted ? "Recommendation Accepted" : "Accept Recommendation"}</span>
        </Button>
      </div>
    </div>
  );
};
