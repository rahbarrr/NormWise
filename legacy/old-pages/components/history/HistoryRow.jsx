import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  UserCheck,
  Archive,
  History as HistoryIcon,
} from "lucide-react";
import { TableRow, TableCell } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export const HistoryRow = ({
  record,
  onToggleSave,
  onArchiveRequest,
  onOpenEvidenceDrawer,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <TableRow
      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
      onClick={() => navigate(`/history/${record.id}`)}
    >
      {/* 1. Bookmark & ID */}
      <TableCell className="w-24 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(record.id);
            }}
            className="text-slate-400 hover:text-amber-500 transition-colors p-0.5"
            aria-label={record.saved ? "Unsave record" : "Save record"}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                record.saved ? "fill-amber-500 text-amber-500" : "text-slate-300 hover:text-slate-500"
              }`}
            />
          </button>
          <span className="font-mono text-xs font-bold text-slate-800">
            {record.id}
          </span>
        </div>
      </TableCell>

      {/* 2. Requirement */}
      <TableCell className="max-w-xs">
        <div className="pr-2">
          <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
            {record.requirement}
          </p>
          {record.department && (
            <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
              {record.department}
            </span>
          )}
        </div>
      </TableCell>

      {/* 3. Recommended Standard */}
      <TableCell className="whitespace-nowrap">
        <div>
          <span className="font-mono text-xs font-extrabold text-blue-950 block">
            {record.standard}
          </span>
          <span className="text-[11px] text-slate-500 max-w-[200px] truncate block mt-0.5">
            {record.standardTitle}
          </span>
        </div>
      </TableCell>

      {/* 4. Confidence */}
      <TableCell className="whitespace-nowrap">
        <span
          className={`inline-block font-mono text-xs font-bold px-2 py-0.5 rounded border ${getConfidenceColor(
            record.confidence
          )}`}
        >
          {record.confidence}%
        </span>
      </TableCell>

      {/* 5. Status Badge */}
      <TableCell className="whitespace-nowrap">
        {getStatusBadge(record.status)}
      </TableCell>

      {/* 6. Reviewer */}
      <TableCell className="whitespace-nowrap text-xs text-slate-600">
        <span className="font-medium text-slate-800">{record.reviewer}</span>
      </TableCell>

      {/* 7. Date */}
      <TableCell className="whitespace-nowrap font-mono text-xs text-slate-500">
        {record.createdAt}
      </TableCell>

      {/* 8. Action & Dropdown */}
      <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/history/${record.id}`)}
            className="text-xs h-7.5 px-2.5 font-medium text-slate-700"
          >
            <span>View</span>
            <ChevronRight className="w-3 h-3 ml-0.5 text-slate-400" />
          </Button>

          {/* Three-dot context menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left animate-in fade-in duration-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/results?standard=${encodeURIComponent(record.standard)}`);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Recommendation</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/evidence?standard=${encodeURIComponent(record.standard)}`);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Evidence</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/review?standard=${encodeURIComponent(record.standard)}`);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/history/${record.id}?tab=audit`);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Audit Trail</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onArchiveRequest(record);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-700 flex items-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5 text-rose-500" />
                  <span>Archive Record</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
