import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileCheck2, ArrowUpRight, ShieldCheck, Building2, Calendar, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const RecordOverview = ({ record, onOpenEvidence }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* 1. Main Recommendation Details Card */}
      <Card className="border-slate-200/90 shadow-2xs">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              Recommended Standard
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/results?standard=${encodeURIComponent(record.standard)}`)}
              className="text-xs h-8 font-medium text-slate-700"
            >
              <span>Open in Results</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenEvidence("EV-001")}
              className="text-xs h-8 font-medium text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100"
            >
              <FileCheck2 className="w-3.5 h-3.5 mr-1" />
              <span>Evidence Drawer</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-2xl font-extrabold text-blue-950">
                  {record.standard}
                </span>
                <Badge variant="verified" dot className="text-xs font-semibold">
                  Current
                </Badge>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 mt-1">
                {record.standardTitle}
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
              <span className="text-[11px] text-slate-500 font-medium">Confidence:</span>
              <span className="text-sm font-bold text-slate-900">{record.confidence}%</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          {/* Requirement Quote Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Evaluated Procurement Requirement
            </span>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              "{record.requirement}"
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Procuring Unit / Department
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                {record.department || "General Public Procurement"}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Review Status
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                {record.status}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Evaluation Officer
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                {record.reviewer}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Review Decision Notes (if any) */}
      {record.decisionNotes && (
        <Card className="border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
              Reviewer Recorded Rationale
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{record.decisionNotes}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
