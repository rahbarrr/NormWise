import React from "react";
import { ChevronRight, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";

export const AnalysisHeader = ({ requirement }) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb & Main Titles */}
      <div className="space-y-1.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-blue-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/recommend" className="hover:text-blue-700 transition-colors">
            New Recommendation
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-semibold">Analysis</span>
        </nav>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Analyzing your requirement
        </h2>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          NormWise is identifying potentially applicable Indian Standards and checking supporting information.
        </p>
      </div>

      {/* Submitted Requirement Compact Card */}
      {requirement && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Requirement
            </span>
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
              "{requirement}"
            </p>
          </div>

          <Badge variant="blue" className="self-start sm:self-center shrink-0 text-xs px-2.5 py-1">
            Procurement requirement
          </Badge>
        </div>
      )}
    </div>
  );
};
