import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AlertTriangle, UserCheck } from "lucide-react";

export const ReviewDialog = ({ isOpen, onClose, onSubmitReview }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview(reason);
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request human review"
      description="Refer standard recommendation to senior technical compliance officer"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Flag borderline technical ratings, committee drafts, or dual regulatory jurisdictions for compliance review.
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Reason for Review Request
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Add a note for the reviewer..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
            required
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="bg-amber-600 hover:bg-amber-700"
          >
            Submit Review Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
