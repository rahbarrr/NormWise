import React from "react";
import { Check, FileCheck2 } from "lucide-react";
import { cn } from "../../lib/utils";

export const ChecklistItem = ({
  item,
  onToggle,
  onViewEvidence,
}) => {
  return (
    <div
      className={cn(
        "p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5",
        item.completed
          ? "bg-emerald-50/30 border-emerald-200/90"
          : "bg-white border-slate-200/90 hover:border-slate-300"
      )}
    >
      {/* Interactive Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={item.completed}
        onClick={() => onToggle(item.id)}
        className={cn(
          "w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1",
          item.completed
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "border-slate-300 bg-white hover:border-slate-400"
        )}
      >
        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Item Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <label
            onClick={() => onToggle(item.id)}
            className={cn(
              "text-xs sm:text-sm font-bold cursor-pointer select-none",
              item.completed ? "text-emerald-950" : "text-slate-900"
            )}
          >
            {item.label}
          </label>

          {item.evidenceId && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewEvidence(item.evidenceId);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0"
            >
              <FileCheck2 className="w-3 h-3 text-blue-600" />
              <span>View Evidence ({item.evidenceId})</span>
            </button>
          )}
        </div>

        {item.description && (
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Phase 13: Compliance Decision Selection */}
        {item.id === "compliance_verified" && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">
              Reviewer Finding:
            </span>
            {[
              { val: "Verified", color: "hover:bg-emerald-50 text-emerald-800 border-emerald-300" },
              { val: "Requires clarification", color: "hover:bg-amber-50 text-amber-800 border-amber-300" },
              { val: "Unable to verify", color: "hover:bg-slate-100 text-slate-700 border-slate-300" },
              { val: "Not applicable", color: "hover:bg-blue-50 text-blue-800 border-blue-300" },
            ].map((dec) => {
              const isSelected = item.complianceDecision === dec.val;
              return (
                <button
                  key={dec.val}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.completed) onToggle(item.id);
                    item.complianceDecision = dec.val;
                  }}
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer",
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : cn("bg-white", dec.color)
                  )}
                >
                  {dec.val}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
