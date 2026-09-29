import React from "react";
import { FileCheck, ShieldCheck, Database, Calendar } from "lucide-react";

export const EvidenceSummary = ({ count = 5 }) => {
  const metrics = [
    {
      label: "Evidence Items",
      value: count.toString(),
      subtext: "Traceable records",
      icon: FileCheck,
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
    },
    {
      label: "Recommendation Support",
      value: "Strong",
      subtext: "Demonstration UI indicator",
      icon: ShieldCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
    },
    {
      label: "Source Status",
      value: "Demo Dataset",
      subtext: "Simulated catalogue data",
      icon: Database,
      color: "text-slate-700",
      bg: "bg-slate-100 border-slate-200",
    },
    {
      label: "Last Validated",
      value: "Demo Date",
      subtext: "October 2026",
      icon: Calendar,
      color: "text-slate-700",
      bg: "bg-slate-100 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {m.label}
              </span>
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center border ${m.bg}`}
              >
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
            </div>

            <div>
              <span className="text-xl sm:text-2xl font-bold font-sans text-slate-900 tracking-tight block">
                {m.value}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {m.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
