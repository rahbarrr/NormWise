import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CheckCircle2 } from "lucide-react";

export const AcceptDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Accept this recommendation?"
      description="Record conformity verdict for procurement audit log"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Accepting records this recommendation in the audit history. You can still review or edit the result later.
          </span>
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
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            Accept Recommendation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
