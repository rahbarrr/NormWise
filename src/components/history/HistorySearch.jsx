import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "../ui/Input";

export const HistorySearch = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search recommendations by requirement, IS standard, title, ID, or reviewer..."
        className="pl-9 pr-9 h-10 text-xs sm:text-sm bg-white border-slate-300 focus:border-blue-600 rounded-lg shadow-2xs"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
