import React from "react";
import { SearchX, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from '../common/Button';

export const NoResultState = ({ onEditRequirement, onTryAgain }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
        <SearchX className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Could not identify a sufficiently supported recommendation
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Try adding more information about the product, material, intended use or technical characteristics.
        </p>
      </div>

      <div className="pt-3 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onEditRequirement}
          className="font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Edit Requirement</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onTryAgain}
          className="font-medium"
        >
          <RotateCcw className="w-4 h-4 mr-1.5 text-slate-500" />
          <span>Try Again</span>
        </Button>
      </div>
    </div>
  );
};

export const ErrorState = ({ onRetry, onBack }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
        <span className="text-2xl font-bold">!</span>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          Recommendation unavailable
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          We couldn't prepare the recommendation. Please try again.
        </p>
      </div>

      <div className="pt-3 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onRetry}
          className="font-medium"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          <span>Retry</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onBack}
          className="font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 text-slate-500" />
          <span>Back to Requirement</span>
        </Button>
      </div>
    </div>
  );
};
