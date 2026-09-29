import React from "react";
import { useNavigate } from "react-router-dom";
import { History, SearchX, Plus, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";

export const EmptyHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="py-12 sm:py-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-200/80 shadow-xs">
        <History className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          No recommendation history yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Your completed standards recommendations, compliance evaluations, and sign-offs will appear here.
        </p>
      </div>

      <div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => navigate("/recommend")}
          className="text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Create Recommendation</span>
        </Button>
      </div>
    </div>
  );
};

export const NoSearchResults = ({ onClearFilters }) => {
  return (
    <div className="py-10 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-3">
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
        <SearchX className="w-5 h-5" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          No matching recommendations
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Try changing your search terms, clearing status filters, or resetting date criteria.
        </p>
      </div>

      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onClearFilters}
          className="text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>Clear Filters</span>
        </Button>
      </div>
    </div>
  );
};
