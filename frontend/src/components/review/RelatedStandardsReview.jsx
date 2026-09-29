import React from "react";
import { Layers, FileCheck2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const RelatedStandardsReview = ({
  relatedStandards = [],
  onViewEvidence,
}) => {
  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
            Related Standards
          </CardTitle>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Normative References
        </span>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {relatedStandards.map((std) => (
            <div
              key={std.code}
              className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-2.5 hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-blue-950">
                    {std.code}
                  </span>
                  <Badge variant="blue" className="text-[10px] font-semibold py-0 px-2">
                    {std.relationship}
                  </Badge>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1 leading-snug">
                  {std.title}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-400">Status: {std.status || "Active"}</span>
                <button
                  type="button"
                  onClick={() => onViewEvidence(std.evidenceId || "EV-005")}
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                >
                  <FileCheck2 className="w-3 h-3 text-blue-600" />
                  <span>View Evidence</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
