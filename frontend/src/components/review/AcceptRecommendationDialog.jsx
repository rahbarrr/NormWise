import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, X, ShieldCheck } from "lucide-react";
import { Button } from '../common/Button';

export const AcceptRecommendationDialog = ({
  isOpen,
  onClose,
  onConfirmAccept,
  standard = "IS 2347:2023",
  confidence = 94,
  checklistCompleted = 0,
  checklistTotal = 7,
  evidenceReviewed = 6,
  evidenceTotal = 6,
}) => {
  const [acknowledgedSourceVerification, setAcknowledgedSourceVerification] = useState(false);

  if (!isOpen) return null;

  const isChecklistIncomplete = checklistCompleted < checklistTotal;

  const handleConfirm = () => {
    onConfirmAccept();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Accept this recommendation?
              </h3>
              <p className="text-xs text-slate-500">
                Formal procurement sign-off and audit log entry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Summary Details */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Recommended Standard:</span>
              <span className="font-mono font-bold text-slate-900">{standard}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Confidence:</span>
              <span className="font-bold text-emerald-700">{confidence}%</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">Evidence reviewed:</span>
              <span className="font-bold text-slate-800">
                {evidenceReviewed} / {evidenceTotal}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500 font-medium">Checklist:</span>
              <span className={`font-bold ${isChecklistIncomplete ? "text-amber-700" : "text-emerald-700"}`}>
                {checklistCompleted} / {checklistTotal} completed
              </span>
            </div>
          </div>

          {/* Warning if checklist incomplete */}
          {isChecklistIncomplete && (
            <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">
                  Some review items have not been completed.
                </p>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  You have completed {checklistCompleted} of {checklistTotal} review checklist items. You may still proceed if you have verified these criteria externally.
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Notice */}
          <div className="text-xs text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/70 leading-relaxed space-y-1.5">
            <p>
              Accepting records your review decision in the audit history. Verify the applicable authorized source before using the recommendation in procurement documents.
            </p>
            <label className="flex items-start gap-2 pt-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acknowledgedSourceVerification}
                onChange={(e) => setAcknowledgedSourceVerification(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] font-medium text-slate-700">
                I confirm this standard has been evaluated against our tender requirements.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!acknowledgedSourceVerification}
              onClick={handleConfirm}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Accept Recommendation</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
