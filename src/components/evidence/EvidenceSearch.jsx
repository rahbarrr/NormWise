import React from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "../ui/Input";

export const EvidenceSearch = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search evidence by ID, clause, standard, or type..."
          className="pl-9 text-xs sm:text-sm h-10"
        />
      </div>

      {/* Sorting Dropdown */}
      <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
        <label htmlFor="evidence-sort-select" className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort by:</span>
        </label>
        <select
          id="evidence-sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="h-10 px-3 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
        >
          <option value="relevance">Relevance</option>
          <option value="type">Evidence Type</option>
          <option value="standard">Standard</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>
    </div>
  );
};
