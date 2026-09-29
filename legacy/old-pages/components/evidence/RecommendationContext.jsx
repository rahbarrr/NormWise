import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const RecommendationContext = ({
  standard = "IS 2347:2023",
  title = "Pressure cookers — Specification",
  confidence = 94,
  status = "Current",
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            RECOMMENDATION
          </span>
          <Badge variant="current" dot className="text-xs">
            {status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-blue-900 tracking-tight">
            {standard}
          </h3>
          <span className="text-sm font-semibold text-slate-700">
            "{title}"
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 self-start sm:self-center">
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Match Confidence
          </span>
          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-sm">
            {confidence}% Match
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => navigate("/results")}
          className="text-xs h-9 font-medium text-blue-700 border-blue-200 hover:bg-blue-50"
        >
          <span>View Recommendation</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
