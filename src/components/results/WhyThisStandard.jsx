import React from "react";
import { CheckCircle2, ArrowRight, FileCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export const WhyThisStandard = ({ whyItems, onOpenEvidence }) => {
  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
            Why this standard?
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            NormWise identified this standard based on the requirement attributes.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {whyItems?.map((item) => (
          <div
            key={item.id}
            className="p-3 sm:p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors hover:bg-slate-50"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>

              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{item.attribute}</span>
                  <span className="text-slate-400 font-normal">({item.value})</span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {item.matchText}
                </p>
              </div>
            </div>

            {/* Evidence Available Link */}
            {item.evidenceRef && (
              <button
                type="button"
                onClick={() => onOpenEvidence(item)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-center"
              >
                <span>Evidence available</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
