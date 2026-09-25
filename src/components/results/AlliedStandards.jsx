import React from "react";
import { Layers, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const RELATIONSHIP_BADGES = {
  MATERIAL: "bg-blue-50 text-blue-800 border-blue-200",
  COMPONENT: "bg-slate-100 text-slate-800 border-slate-200",
  "TEST METHOD": "bg-emerald-50 text-emerald-800 border-emerald-200",
  SAFETY: "bg-amber-50 text-amber-800 border-amber-200",
  INSTALLATION: "bg-purple-50 text-purple-800 border-purple-200",
  GENERAL: "bg-slate-50 text-slate-600 border-slate-200",
};

export const AlliedStandards = ({ alliedStandards, onViewAll }) => {
  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                Related / Allied Standards
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Other standards identified as relevant to the product, components, materials or testing.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-xs h-7 text-blue-700 hover:text-blue-900 font-medium self-start sm:self-auto p-0"
          >
            <span>View all related standards</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="divide-y divide-slate-100">
          {alliedStandards?.map((std, idx) => (
            <div
              key={idx}
              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-blue-900">
                    {std.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded border ${
                      RELATIONSHIP_BADGES[std.relationship] ||
                      RELATIONSHIP_BADGES.GENERAL
                    }`}
                  >
                    {std.relationship}
                  </span>
                </div>
                <p className="text-slate-800 font-medium mt-0.5">{std.title}</p>
                {std.desc && (
                  <p className="text-slate-500 text-[11px] mt-0.5">{std.desc}</p>
                )}
              </div>

              <span className="text-[11px] text-slate-400 shrink-0">
                Cross-referenced
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
