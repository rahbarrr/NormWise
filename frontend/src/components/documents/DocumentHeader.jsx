import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Edit3, FileUp } from "lucide-react";
import { Button } from '../common/Button';

export const DocumentHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 pb-3 border-b border-slate-200/80">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-blue-700 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Upload Specification</span>
      </nav>

      {/* Main Heading & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Upload Specification
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Upload a procurement document and extract the information needed for standards analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/recommend")}
            className="text-xs h-9 font-medium text-slate-700 hover:text-blue-700"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Enter Requirement Manually</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
