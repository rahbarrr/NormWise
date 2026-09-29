import React from "react";
import { Check, Clock, ChevronDown, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';

export const CurrentStatusCard = ({ currentness }) => {
  if (!currentness) return null;

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
            Current Standard Status
          </CardTitle>
          <Badge variant="current" dot className="text-xs">
            {currentness.validationStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Simple Version Timeline */}
        <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Standard Version Timeline
          </span>

          <div className="space-y-1.5 text-xs">
            {currentness.timeline?.map((step, idx) => {
              const isCurrent = step.label === "Current";
              const isAmendment = step.label === "Amendment";

              return (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isCurrent
                        ? "bg-blue-600 text-white"
                        : isAmendment
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-slate-500 font-semibold w-16">
                    {step.label}:
                  </span>
                  <span
                    className={`font-mono text-xs ${
                      isCurrent
                        ? "font-bold text-blue-900"
                        : isAmendment
                        ? "font-semibold text-emerald-800"
                        : "text-slate-600"
                    }`}
                  >
                    {step.version}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Current edition
            </span>
            <span className="font-mono font-bold text-slate-800 mt-0.5 block">
              {currentness.currentEdition}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Revision
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {currentness.revision}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Amendment
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {currentness.amendment}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">
              Validation status
            </span>
            <span className="font-semibold text-emerald-700 mt-0.5 block flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              {currentness.validationStatus}
            </span>
          </div>
        </div>

        {/* Subtle Source Notice */}
        <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-400 leading-snug">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>{currentness.notice}</span>
        </div>
      </CardContent>
    </Card>
  );
};
