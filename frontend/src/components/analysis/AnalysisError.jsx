import React from "react";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from '../common/Button';

export const AnalysisError = ({ onRetry, onBack }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Analysis could not be completed
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            We couldn't complete the analysis. Please try again.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onRetry}
          className="font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          <span>Retry Analysis</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onBack}
          className="font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          <span>Back to Requirement</span>
        </Button>
      </div>
    </div>
  );
};
