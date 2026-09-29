import React from "react";
import { FileQuestion, ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";

export const EvidenceEmptyState = ({ onBack }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
        <FileQuestion className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          No supporting evidence available
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          NormWise could not display supporting evidence for this recommendation.
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onBack}
          className="font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Recommendation</span>
        </Button>
      </div>
    </div>
  );
};

export const EvidenceErrorState = ({ onRetry, onBack }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
        <span className="text-2xl font-bold">!</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Evidence could not be loaded
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Please try again or return to the recommendation.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onRetry}
          className="font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          <span>Retry</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onBack}
          className="font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          <span>Back to Recommendation</span>
        </Button>
      </div>
    </div>
  );
};

export const EvidenceWarning = ({ message }) => {
  return (
    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-medium">
          {message || "Some recommendation details have limited supporting evidence."}
        </span>
      </div>
      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded border border-amber-200">
        Review recommended
      </span>
    </div>
  );
};
