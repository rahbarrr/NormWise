import React from "react";
import { Layers, CheckCircle2, UserCheck, HelpCircle } from "lucide-react";
import { Card, CardContent } from "../ui/Card";

export const HistoryStats = ({ stats }) => {
  const statItems = [
    {
      label: "Total Recommendations",
      value: stats?.total || 0,
      icon: Layers,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200/80",
    },
    {
      label: "Accepted",
      value: stats?.accepted || 0,
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200/80",
    },
    {
      label: "Under Review",
      value: stats?.underReview || 0,
      icon: UserCheck,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200/80",
    },
    {
      label: "Clarification Requested",
      value: stats?.clarificationRequested || 0,
      icon: HelpCircle,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      border: "border-indigo-200/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <Card
            key={i}
            className={`border ${item.border} ${item.bg}/30 shadow-2xs hover:shadow-xs transition-shadow`}
          >
            <CardContent className="p-4 sm:p-4.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {item.label}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 block">
                  {item.value}
                </span>
              </div>
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 border ${item.border}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
