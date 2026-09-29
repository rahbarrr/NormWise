import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileCheck2, ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const RecommendationReviewCard = ({
  standard = "IS 2347:2023",
  title = "Pressure cookers — Specification",
  confidence = 94,
  status = "Current",
  edition = "Seventh Revision",
  amendment = "Amendment No. 1",
  application = "Institutional kitchen",
  onViewEvidence,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="border-slate-200/90 shadow-xs overflow-hidden">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-700" />
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
            Recommended Standard
          </CardTitle>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Primary Procurement Match
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/results")}
            className="text-xs h-8 font-medium text-slate-700"
          >
            <span>View Full Recommendation</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onViewEvidence}
            className="text-xs h-8 font-medium text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100"
          >
            <FileCheck2 className="w-3.5 h-3.5 mr-1" />
            <span>View Evidence</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 sm:pt-5 space-y-4">
        {/* Main Standard Code & Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-blue-950 tracking-tight">
                {standard}
              </span>
              <Badge variant="verified" dot className="text-xs font-semibold">
                {status}
              </Badge>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 mt-1">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium">Match Confidence:</span>
            <span className="text-sm font-bold text-slate-900">{confidence}%</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        {/* Structured Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Standard Edition
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {edition}
            </span>
          </div>

          <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Applicable Amendment
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
              {amendment}
            </span>
          </div>

          <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200/70">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Target Application
            </span>
            <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
              {application}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
