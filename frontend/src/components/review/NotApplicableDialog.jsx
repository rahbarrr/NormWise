import React, { useState } from "react";
import { Ban, X, Check } from "lucide-react";
import { Button } from '../common/Button';

const NOT_APPLICABLE_REASONS = [
  "Product mismatch",
  "Application mismatch",
  "Material mismatch",
  "Currentness concern",
  "Insufficient evidence",
  "Other",
];

export const NotApplicableDialog = ({
  isOpen,
  onClose,
  onSubmitNotApplicable,
}) => {
  const [selectedReason, setSelectedReason] = useState("Product mismatch");
  const [explanation, setExplanation] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!explanation.trim()) return;
    onSubmitNotApplicable({
      reason: selectedReason,
      explanation: explanation.trim(),
    });
    setExplanation("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Ban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Mark recommendation as not applicable
              </h3>
              <p className="text-xs text-slate-500">
                Record rationale for non-applicability in departmental audit logs.
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Reason <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {NOT_APPLICABLE_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={`text-xs p-2 rounded-lg border text-left font-medium transition-colors flex items-center justify-between ${
                    selectedReason === r
                      ? "bg-rose-50 border-rose-400 text-rose-950 font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{r}</span>
                  {selectedReason === r && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Why is this recommendation not applicable? <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Provide specific technical justification for why this standard does not apply to this tender requirement..."
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors leading-relaxed"
            ></textarea>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed">
            Marking non-applicable archives this result and permits reformulation of the procurement requirement.
          </div>

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
              type="submit"
              variant="primary"
              size="sm"
              disabled={!explanation.trim()}
              className="text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white"
            >
              <span>Record Decision</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
