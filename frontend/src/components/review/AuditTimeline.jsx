import React from "react";
import { History, CheckCircle2, UserCheck, MessageSquare, HelpCircle, Ban, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';

export const AuditTimeline = ({ events = [] }) => {
  const getEventIcon = (action = "") => {
    const act = action.toLowerCase();
    if (act.includes("accept")) return CheckCircle2;
    if (act.includes("technical") || act.includes("review")) return UserCheck;
    if (act.includes("clarification")) return HelpCircle;
    if (act.includes("not applicable")) return Ban;
    if (act.includes("note")) return MessageSquare;
    return Sparkles;
  };

  const getEventBadgeColor = (action = "") => {
    const act = action.toLowerCase();
    if (act.includes("accept")) return "bg-emerald-50 text-emerald-700 border-emerald-300";
    if (act.includes("technical")) return "bg-amber-50 text-amber-800 border-amber-300";
    if (act.includes("clarification")) return "bg-blue-50 text-blue-700 border-blue-300";
    if (act.includes("not applicable")) return "bg-rose-50 text-rose-700 border-rose-300";
    if (act.includes("note")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
            Audit Trail
          </CardTitle>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {events.length} Event{events.length === 1 ? "" : "s"} Recorded
        </span>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {events.map((evt, idx) => {
            const Icon = getEventIcon(evt.action);
            const badgeClass = getEventBadgeColor(evt.action);

            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node dot on timeline */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-400 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-blue-600"></div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {evt.action}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}
                      >
                        {evt.actor || "System"}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-slate-400">
                      {evt.time}
                    </span>
                  </div>

                  {evt.details && (
                    <p className="text-xs text-slate-600 leading-relaxed pl-0.5">
                      {evt.details}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
