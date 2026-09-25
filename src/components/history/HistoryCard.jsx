import React from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ChevronRight, Calendar, User } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const HistoryCard = ({ record, onToggleSave, onArchiveRequest }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <Badge variant="verified" dot>Accepted</Badge>;
      case "Under Technical Review":
        return <Badge variant="warning" dot>Under Review</Badge>;
      case "Clarification Requested":
        return <Badge variant="blue" dot>Clarification</Badge>;
      case "Not Applicable":
        return <Badge variant="withdrawn" dot>Not Applicable</Badge>;
      default:
        return <Badge variant="review" dot>Pending Review</Badge>;
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (conf >= 75) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-amber-700 bg-amber-50 border-amber-200";
  };

  return (
    <Card
      className="border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer p-4 space-y-3"
      onClick={() => navigate(`/history/${record.id}`)}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(record.id);
            }}
            className="text-slate-400 hover:text-amber-500 p-0.5"
            aria-label={record.saved ? "Unsave" : "Save"}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                record.saved ? "fill-amber-500 text-amber-500" : "text-slate-300"
              }`}
            />
          </button>
          <span className="font-mono text-xs font-bold text-slate-800">
            {record.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border ${getConfidenceColor(
              record.confidence
            )}`}
          >
            {record.confidence}%
          </span>
          {getStatusBadge(record.status)}
        </div>
      </div>

      <div>
        <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
          {record.requirement}
        </p>
      </div>

      <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200/70">
        <span className="font-mono text-xs font-extrabold text-blue-950 block">
          {record.standard}
        </span>
        <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
          {record.standardTitle}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span>{record.createdAt}</span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/history/${record.id}`);
          }}
          className="text-xs h-7 px-2.5 font-medium text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100"
        >
          <span>View Record</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </div>
    </Card>
  );
};
