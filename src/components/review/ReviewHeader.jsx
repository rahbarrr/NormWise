import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export const ReviewHeader = ({
  recommendationId = "REC-DEMO-001",
  status = "Pending Review",
  onBack,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = () => {
    switch (status) {
      case "Accepted":
        return (
          <Badge variant="verified" dot className="font-semibold text-xs py-1 px-3">
            Accepted
          </Badge>
        );
      case "Under Technical Review":
        return (
          <Badge variant="warning" dot className="font-semibold text-xs py-1 px-3">
            Under Technical Review
          </Badge>
        );
      case "Clarification Requested":
        return (
          <Badge variant="blue" dot className="font-semibold text-xs py-1 px-3">
            Clarification Requested
          </Badge>
        );
      case "Not Applicable":
        return (
          <Badge variant="withdrawn" dot className="font-semibold text-xs py-1 px-3">
            Not Applicable
          </Badge>
        );
      default:
        return (
          <Badge variant="review" dot className="font-semibold text-xs py-1 px-3">
            Pending Review
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3 pb-3 border-b border-slate-200/80">
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
        <span className="text-slate-900 font-semibold">Human Review</span>
      </nav>

      {/* Main Heading & Recommendation ID / Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Review Recommendation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Review the recommendation, supporting evidence and compliance information before recording a decision.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Recommendation ID
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">
              {recommendationId}
            </span>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onBack || (() => navigate("/results"))}
            className="text-xs h-9 font-medium text-slate-700 ml-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Back</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
