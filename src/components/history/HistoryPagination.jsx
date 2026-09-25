import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";

export const HistoryPagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize) {
    return (
      <div className="flex items-center justify-between py-2 text-xs text-slate-500">
        <span>
          Showing {totalItems} recommendation{totalItems === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-t border-slate-200/80 text-xs">
      <span className="text-slate-500">
        Showing <strong className="text-slate-800">{startItem}–{endItem}</strong> of{" "}
        <strong className="text-slate-800">{totalItems}</strong> recommendations
      </span>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-xs h-8 px-2.5"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          <span>Previous</span>
        </Button>

        <span className="px-3 font-mono text-xs text-slate-600 font-medium">
          {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-xs h-8 px-2.5"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
