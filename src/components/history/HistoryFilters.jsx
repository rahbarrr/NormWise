import React from "react";
import { Filter, Bookmark, RotateCcw, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/Button";

const STATUS_OPTIONS = [
  "All",
  "Pending Review",
  "Accepted",
  "Under Technical Review",
  "Clarification Requested",
  "Not Applicable",
];

const CONFIDENCE_OPTIONS = [
  { label: "All Confidence", value: "All" },
  { label: "High (90–100%)", value: "High" },
  { label: "Medium (75–89%)", value: "Medium" },
  { label: "Low (<75%)", value: "Low" },
];

const DATE_OPTIONS = [
  { label: "All Dates", value: "All" },
  { label: "Today", value: "Today" },
  { label: "This Week", value: "This Week" },
  { label: "This Month", value: "This Month" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Highest Confidence", value: "confidence_high" },
  { label: "Lowest Confidence", value: "confidence_low" },
  { label: "Status (A–Z)", value: "status" },
];

export const HistoryFilters = ({
  statusFilter,
  onStatusChange,
  confidenceFilter,
  onConfidenceChange,
  dateFilter,
  onDateChange,
  savedOnly,
  onSavedToggle,
  sortBy,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
      {/* Left Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
        >
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st === "All" ? "All Statuses" : st}
            </option>
          ))}
        </select>

        {/* Confidence Dropdown */}
        <select
          value={confidenceFilter}
          onChange={(e) => onConfidenceChange(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
        >
          {CONFIDENCE_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => onDateChange(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
        >
          {DATE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Saved Only Toggle */}
        <button
          type="button"
          onClick={() => onSavedToggle(!savedOnly)}
          className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            savedOnly
              ? "bg-amber-50 border-amber-400 text-amber-900"
              : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
          <span>Saved Only</span>
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="h-9 px-2.5 text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Right Sort Controls */}
      <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
