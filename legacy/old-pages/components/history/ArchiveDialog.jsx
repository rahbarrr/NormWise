import React from "react";
import { Archive, X } from "lucide-react";
import { Button } from "../ui/Button";

export const ArchiveDialog = ({
  isOpen,
  onClose,
  onConfirmArchive,
  record,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Archive this recommendation?
              </h3>
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
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Archived records will no longer appear in the main recommendation history list. The audit trail remains preserved for compliance purposes.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Record ID:</span>
              <span className="font-mono font-bold text-slate-900">{record.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Standard:</span>
              <span className="font-mono font-bold text-blue-900">{record.standard}</span>
            </div>
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
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onConfirmArchive(record.id);
                onClose();
              }}
              className="text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white"
            >
              <span>Archive Record</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
