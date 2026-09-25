import React from "react";
import { cn } from "../../lib/utils";

const FILTER_TYPES = [
  "All",
  "Scope",
  "Requirement",
  "Material",
  "Certification",
  "Currentness",
  "Related Standard",
];

export const EvidenceFilters = ({ activeFilter = "All", onSelectFilter }) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {FILTER_TYPES.map((type) => {
        const isActive = activeFilter === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelectFilter(type)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border cursor-pointer select-none",
              isActive
                ? "bg-blue-700 text-white border-blue-800 shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
};
