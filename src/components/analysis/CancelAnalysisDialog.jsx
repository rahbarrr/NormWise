import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AlertTriangle } from "lucide-react";

export const CancelAnalysisDialog = ({ isOpen, onClose, onConfirmCancel }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel this analysis?"
      description="Standards matching is currently underway"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Are you sure you want to cancel? Your current analysis progress will be discontinued and you will return to the requirement input screen.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Continue Analysis
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirmCancel}
          >
            Cancel Analysis
          </Button>
        </div>
      </div>
    </Modal>
  );
};
