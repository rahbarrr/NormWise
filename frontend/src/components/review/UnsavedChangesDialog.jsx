import React from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from '../common/Button';

export const UnsavedChangesDialog = ({
  isOpen,
  onStay,
  onLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Unsaved changes</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onStay}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your review changes have not been saved. If you navigate away now, any unsaved checklist updates or notes will be lost.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onLeave}
              className="text-xs text-rose-700 hover:bg-rose-50"
            >
              Leave Without Saving
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onStay}
              className="text-xs font-semibold"
            >
              Stay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
