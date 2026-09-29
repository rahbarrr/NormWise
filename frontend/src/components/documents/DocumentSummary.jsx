import React from "react";
import { CheckCircle2, FileText, Layers, ListChecks, Check } from "lucide-react";
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';

export const DocumentSummary = ({
  filename = "pressure_cooker_specification.pdf",
  pages = 8,
  requirementsCount = 5,
  status = "Ready for review",
}) => {
  return (
    <Card className="border-emerald-200/90 bg-emerald-50/30 shadow-2xs overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Document processed
              </h4>
              <p className="text-xs text-slate-500">
                Technical parameters extracted from specification document.
              </p>
            </div>
          </div>

          <Badge variant="verified" dot className="self-start sm:self-auto text-xs py-1 px-3">
            {status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Document
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate" title={filename}>
              {filename}
            </span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Pages Analyzed
            </span>
            <span className="font-bold text-slate-900 mt-0.5 block">
              {pages} Pages
            </span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Text Extracted
            </span>
            <span className="font-semibold text-emerald-700 mt-0.5 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Yes (100%)</span>
            </span>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Requirements Identified
            </span>
            <span className="font-bold text-blue-900 mt-0.5 block">
              {requirementsCount} Parameters
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
