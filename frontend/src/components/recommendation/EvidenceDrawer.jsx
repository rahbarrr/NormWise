import React, { useEffect } from "react";
import { X, ShieldCheck, FileText, Calendar, CheckCircle2, Info } from "lucide-react";
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const EvidenceDrawer = ({ isOpen, onClose, evidence }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div
        className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Evidence & Source
              </h3>
              <p className="text-xs text-slate-500">
                Grounding information for this standard recommendation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Source & Reference Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Source Document
              </span>
              <span className="text-sm font-bold text-slate-900 font-sans">
                {evidence.source || "Bureau of Indian Standards Official Publication"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Reference
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {evidence.reference || evidence.evidenceRef || "Clause Reference — demo"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Evidence Type
                </span>
                <Badge variant="blue" className="text-[11px]">
                  {evidence.evidenceType || evidence.attribute || "Scope"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Evidence Snippet */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Evidence Snippet
            </span>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800">
              "{evidence.evidenceSnippet || evidence.matchText || "Demonstration evidence content: Standard clause requirements verified against product taxonomy and scope."}"
            </div>
          </div>

          {/* Verification Status Metadata */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Source Status
              </span>
              <span className="font-semibold text-slate-700 mt-0.5 block">
                {evidence.sourceStatus || "Demo dataset"}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Last Validated
              </span>
              <span className="font-semibold text-slate-700 mt-0.5 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {evidence.lastValidated || "October 2026"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-snug">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <span>
              Always verify the latest authorized source before using this information in procurement.
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Close Evidence Drawer
          </Button>
        </div>
      </div>
    </div>
  );
};
