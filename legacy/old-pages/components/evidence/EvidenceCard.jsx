import React from "react";
import { FileText, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const EVIDENCE_TYPE_STYLES = {
  Scope: "bg-blue-50 text-blue-800 border-blue-200",
  Material: "bg-emerald-50 text-emerald-800 border-emerald-200",
  Requirement: "bg-purple-50 text-purple-800 border-purple-200",
  Certification: "bg-amber-50 text-amber-800 border-amber-200",
  Currentness: "bg-slate-100 text-slate-800 border-slate-200",
  "Related Standard": "bg-indigo-50 text-indigo-800 border-indigo-200",
};

export const EvidenceCard = ({ record, onViewDetails }) => {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3.5 hover:border-slate-300 transition-all">
      {/* Top Header: ID, Type Badge, and Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {record.id}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              EVIDENCE_TYPE_STYLES[record.type] || "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {record.type}
          </span>
        </div>

        <Badge variant="current" dot className="text-[11px]">
          {record.status}
        </Badge>
      </div>

      {/* Standard & Reference */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono font-bold text-sm text-blue-900">
            {record.standard}
          </span>
          <span className="text-xs text-slate-500 truncate">
            {record.documentTitle}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-800 mt-1 font-sans">
          {record.reference}
        </p>
      </div>

      {/* Relationship */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
          Relationship
        </span>
        <span className="font-medium text-slate-700 block">
          {record.relationship}: <strong className="text-slate-900">{record.supports}</strong>
        </span>
      </div>

      {/* Snippet Preview */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
        "{record.evidenceText}"
      </p>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Source: {record.sourceStatus}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(record)}
          className="text-xs h-8 px-2.5 text-blue-700 font-medium"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
