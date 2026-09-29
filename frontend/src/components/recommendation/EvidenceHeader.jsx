import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Download, UserCheck } from "lucide-react";
import { Button } from '../common/Button';

export const EvidenceHeader = ({ onDownloadReport, standardCode = "IS 2347:2023" }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 pb-2 border-b border-slate-200/80">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-blue-700 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/results" className="hover:text-blue-700 transition-colors">
          Recommendation
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Evidence</span>
      </nav>

      {/* Main Heading & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Evidence & Traceability
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Review the source information supporting this recommendation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/results")}
            className="text-xs h-9 font-medium text-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Back to Recommendation</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/review")}
            className="text-xs h-9 font-medium text-blue-700 border-blue-200 hover:bg-blue-50"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
            <span>Human Review</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onDownloadReport}
            className="text-xs h-9 font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Download Evidence Report</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
