import React from "react";
import { ArrowRight, ArrowLeft, Bookmark, CheckCircle2 } from "lucide-react";
import { Button } from '../common/Button';

export const DocumentActionBar = ({
  onBack,
  onSaveDraft,
  onAnalyze,
  isDraftSaved = false,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Guidance context */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 tracking-tight">
          Review extracted information
        </h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          NormWise will use the information below to identify potentially applicable Indian Standards.
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onBack}
          disabled={isLoading}
          className="text-xs h-9 font-medium text-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>Upload Another</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onSaveDraft}
          disabled={isLoading}
          className="text-xs h-9 font-medium text-slate-700"
        >
          <Bookmark className={`w-3.5 h-3.5 mr-1 ${isDraftSaved ? "fill-amber-500 text-amber-500" : "text-slate-500"}`} />
          <span>{isDraftSaved ? "Draft Saved" : "Save Draft"}</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onAnalyze}
          disabled={isLoading}
          className="text-xs h-9 font-semibold shadow-xs"
        >
          <span>{isLoading ? "Starting Recommendation..." : "Analyze Requirements"}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
