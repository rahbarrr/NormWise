import React from "react";
import { ArrowRight, ArrowDown, GitCommit, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export const TraceabilityMap = () => {
  const steps = [
    {
      stage: "PROCUREMENT REQUIREMENT",
      title: "User Requirement",
      desc: '"Stainless steel pressure cooker, 5 litre..."',
      accent: "border-blue-200 bg-blue-50/50 text-blue-900",
    },
    {
      stage: "EXTRACTED ATTRIBUTE",
      title: "Scope & Metallurgy",
      desc: '"Pressure cooker" (SS 304, 5L)',
      accent: "border-slate-200 bg-slate-50 text-slate-900",
    },
    {
      stage: "RECOMMENDED STANDARD",
      title: "Catalogue Match",
      desc: "IS 2347:2023 (Seventh Rev.)",
      accent: "border-blue-400 bg-blue-50 text-blue-950 font-bold",
    },
    {
      stage: "SUPPORTING EVIDENCE",
      title: "Clause Grounding",
      desc: "Scope & Material — Demo",
      accent: "border-emerald-200 bg-emerald-50/50 text-emerald-900",
    },
    {
      stage: "PROCUREMENT DRAFT",
      title: "Enforceable Clause",
      desc: "Draft procurement wording",
      accent: "border-slate-200 bg-slate-50 text-slate-800",
    },
  ];

  return (
    <Card className="border-slate-200/90 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Recommendation Traceability
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            End-to-end evidence lineage connecting your input requirement to the recommended standard and tender clause.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Horizontal Desktop Lineage / Vertical Mobile */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {steps.map((st, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`p-3 rounded-xl border text-xs flex-1 flex flex-col justify-between space-y-1 shadow-2xs ${st.accent}`}
              >
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  {st.stage}
                </span>
                <span className="font-bold text-xs block font-sans">
                  {st.title}
                </span>
                <span className="text-[11px] text-slate-600 block line-clamp-1">
                  {st.desc}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div className="flex items-center justify-center py-0.5 lg:py-0 text-slate-300">
                  <ArrowRight className="hidden lg:block w-4 h-4 shrink-0 text-slate-400" />
                  <ArrowDown className="lg:hidden w-4 h-4 shrink-0 text-slate-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
