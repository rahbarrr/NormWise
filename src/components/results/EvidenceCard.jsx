import React from "react";
import { FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

export const EvidenceCard = ({ item, onViewEvidence }) => {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            {item.source}
          </span>
          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {item.evidenceType}
          </span>
        </div>

        <span className="text-xs font-bold text-slate-900 block font-sans">
          {item.reference}
        </span>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          "{item.evidenceSnippet}"
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Status: {item.sourceStatus}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewEvidence(item)}
          className="text-xs h-7 px-2 text-blue-700 font-medium"
        >
          <span>View Evidence</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};
