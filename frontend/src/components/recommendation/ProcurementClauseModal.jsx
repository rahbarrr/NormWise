import React, { useState } from "react";
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Copy, Check, Edit2, AlertCircle, FileText } from "lucide-react";

export const ProcurementClauseModal = ({ isOpen, onClose, initialClause }) => {
  const [clauseText, setClauseText] = useState(
    initialClause ||
      "The supplied pressure cooker shall comply with the applicable requirements of IS 2347:2023, subject to verification of the current applicable edition, amendments and regulatory requirements."
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(clauseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Draft Procurement Clause"
      description="Create a draft specification clause based on the selected recommendation."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Status Warning Pill */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>DRAFT — REVIEW BEFORE USE</span>
          </div>
          <span className="text-[11px] text-amber-700">Demonstration template</span>
        </div>

        {/* Clause Editor / Viewer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Technical Specification Clause Text:
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditing ? "Lock Text" : "Edit Clause"}</span>
            </button>
          </div>

          {isEditing ? (
            <textarea
              rows={4}
              value={clauseText}
              onChange={(e) => setClauseText(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed select-all border border-slate-800">
              {clauseText}
            </div>
          )}
        </div>

        {/* Disclaimer Warning */}
        <p className="text-[11px] text-slate-400 leading-snug">
          Important: This generated draft clause is for demonstration purposes. It should be vetted by your department's technical evaluation committee before publication in tender schedules or GeM Additional Terms & Conditions (ATC).
        </p>

        {/* Modal Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={copied ? "success" : "primary"}
              size="sm"
              onClick={handleCopy}
              className="font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Clause</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
