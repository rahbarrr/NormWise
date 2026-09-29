import React from "react";
import { Clock, Check, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";

export const CurrentnessEvidence = () => {
  const timelineItems = [
    {
      label: "Previous Edition",
      version: "Sixth Revision (Superseded)",
      status: "Checked — Demo",
      evidence: "Gazette notification of withdrawal upon enforcement of revision.",
    },
    {
      label: "Current Edition",
      version: "IS 2347:2023 (Seventh Revision)",
      status: "Checked — Demo",
      evidence: "Active BIS standards catalogue entry confirmed.",
      isCurrent: true,
    },
    {
      label: "Amendment",
      version: "Amendment No. 1 (October 2024)",
      status: "Checked — Demo",
      evidence: "Technical corrigendum incorporated into active printing.",
    },
  ];

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Currentness & Version Evidence
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Historical revision audit trail corroborating the active applicability of the recommended standard.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3.5">
        <div className="divide-y divide-slate-100">
          {timelineItems.map((item, idx) => (
            <div
              key={idx}
              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px] w-28">
                    {item.label}:
                  </span>
                  <span
                    className={`font-mono text-xs ${
                      item.isCurrent
                        ? "font-bold text-blue-900"
                        : "font-semibold text-slate-800"
                    }`}
                  >
                    {item.version}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] pl-28">
                  Evidence: {item.evidence}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-400 leading-snug">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Demonstration version data. Do not claim live verification. Always consult the official Bureau of Indian Standards portal before finalizing procurement tender schedules.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
