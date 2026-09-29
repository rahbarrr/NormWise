import React, { useEffect } from "react";
import { X, ShieldCheck, FileText, Calendar, Info, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export const EvidenceDrawer = ({ isOpen, onClose, record }) => {
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

  if (!isOpen || !record) return null;

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
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Evidence Details
              </h3>
              <p className="text-xs text-slate-500">
                Audit record: <span className="font-mono font-semibold">{record.id}</span>
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

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Evidence ID
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {record.id}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Evidence Type
              </span>
              <Badge variant="blue" className="text-[11px]">
                {record.type}
              </Badge>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Source Document
              </span>
              <span className="font-mono font-semibold text-blue-900 text-xs">
                {record.standard}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Status
              </span>
              <Badge variant="current" dot className="text-[11px]">
                {record.status}
              </Badge>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Reference
              </span>
              <span className="font-semibold text-slate-800">
                {record.reference}
              </span>
            </div>

            <div className="col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Supports
              </span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                {record.supports}
              </span>
            </div>
          </div>

          {/* Evidence Snippet Section */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Evidence Content
            </span>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800">
              "{record.evidenceText}"
            </div>
            <p className="text-[10px] text-slate-400">
              Note: Demonstration evidence content. Replace with authorized source text when the real evidence pipeline is connected.
            </p>
          </div>

          {/* Source Information Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Source Information
            </h4>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Source type:</span>
                <span className="font-semibold text-slate-800">{record.sourceType}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Document:</span>
                <span className="font-mono font-bold text-blue-900">{record.standard}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Edition:</span>
                <span className="font-semibold text-slate-800">{record.edition}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Amendment:</span>
                <span className="font-semibold text-slate-800">{record.amendment}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Source status:</span>
                <span className="font-semibold text-slate-700">{record.sourceStatus}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last validated:</span>
                <span className="font-semibold text-slate-700">{record.lastValidated}</span>
              </div>
            </div>

            <div className="flex items-start gap-1.5 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 leading-relaxed text-[11px]">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Source and currentness information must be verified against the applicable authorized source before procurement use.
              </span>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
};
