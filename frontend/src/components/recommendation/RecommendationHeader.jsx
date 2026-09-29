import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, PlusCircle, Bookmark, Check, ShieldCheck } from "lucide-react";
import { Button } from '../common/Button';

export const RecommendationHeader = ({ onSaveResult, isSaved = false }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 pb-2 border-b border-slate-200/80">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-blue-700 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/recommend" className="hover:text-blue-700 transition-colors">
          New Recommendation
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link to="/analyze" className="hover:text-blue-700 transition-colors">
          Analysis
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-semibold">Recommendation</span>
      </nav>

      {/* Main Heading & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Standards Recommendation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Review the standards identified for your procurement requirement.
          </p>
        </div>

        {/* Top-Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant={isSaved ? "secondary" : "secondary"}
            size="sm"
            onClick={onSaveResult}
            className="text-xs h-9 font-medium"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span className="text-emerald-700">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>Save Result</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate("/recommend")}
            className="text-xs h-9 font-semibold shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            <span>New Recommendation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
