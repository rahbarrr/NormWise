import React, { useState } from "react";
import { UserCheck, X, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export const TechnicalReviewDialog = ({
  isOpen,
  onClose,
  onSubmitTechnicalReview,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmitTechnicalReview({ reason });
    setReason("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Request Technical Review
              </h3>
              <p className="text-xs text-slate-500">
                Send this recommendation for additional technical review.
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
              Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is additional review required? (e.g. Involves specialized commercial safety release mechanisms requiring sectional committee verification...)"
              className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors leading-relaxed"
            ></textarea>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-lg text-xs text-amber-900">
            <p className="leading-relaxed">
              <strong>Process Notice:</strong> This item will be flagged in the divisional review queue and assigned to a technical committee specialist.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
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
              disabled={!reason.trim()}
              className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
            >
              <span>Request Review</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
