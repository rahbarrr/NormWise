import React, { useState } from "react";
import { History, ChevronDown, ChevronUp, CheckCircle2, UserCheck, MessageSquare, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

export const RecordAuditTrail = ({ auditEvents = [], standard = "IS 2347:2023" }) => {
  const [expandedEvents, setExpandedEvents] = useState({});

  const toggleEvent = (idx) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getEventBadgeColor = (action = "") => {
    const act = action.toLowerCase();
    if (act.includes("accept")) return "bg-emerald-50 text-emerald-700 border-emerald-300";
    if (act.includes("technical") || act.includes("review")) return "bg-amber-50 text-amber-800 border-amber-300";
    if (act.includes("clarification")) return "bg-blue-50 text-blue-700 border-blue-300";
    if (act.includes("note")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  return (
    <Card className="border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
            Comprehensive Audit Trail
          </CardTitle>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {auditEvents.length} Recorded Milestone{auditEvents.length === 1 ? "" : "s"}
        </span>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {auditEvents.map((evt, idx) => {
            const isExpanded = !!expandedEvents[idx];
            const badgeClass = getEventBadgeColor(evt.action);

            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node dot on timeline */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-400 flex items-center justify-center group-hover:border-blue-600 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-blue-600"></div>
                </div>

                <div
                  onClick={() => toggleEvent(idx)}
                  className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {evt.action}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {evt.actor || "System"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="font-mono text-[11px] text-slate-400">
                        {evt.timestamp || evt.time}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {evt.details}
                  </p>

                  {/* Expandable Metadata Detail Box */}
                  {isExpanded && (
                    <div className="mt-2 pt-2.5 border-t border-slate-200 text-xs text-slate-700 bg-white p-3 rounded-lg border space-y-1.5 animate-in fade-in duration-100">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Actor / Origin:</span>
                          <span className="font-bold text-slate-800">{evt.actor || "System"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Associated Standard:</span>
                          <span className="font-mono font-bold text-blue-900">{standard}</span>
                        </div>
                      </div>
                      <div className="text-[11px] pt-1">
                        <span className="text-slate-400 block font-medium">Audit Description:</span>
                        <span className="text-slate-700">{evt.details}</span>
                      </div>
                    </div>
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
