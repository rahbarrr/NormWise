import React from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { Badge } from '../common/Badge';
import { ExtractedAttributes } from "./ExtractedAttributes";
import { cn } from '../../utils';

export const AnalysisStage = ({
  stageNumber,
  label,
  description,
  status, // "completed" | "in_progress" | "pending"
  customContent,
}) => {
  const isDone = status === "completed";
  const isInProgress = status === "in_progress";
  const isPending = status === "pending";

  return (
    <div
      className={cn(
        "p-4 sm:p-5 rounded-xl border transition-all duration-200",
        isDone
          ? "bg-white border-slate-200/90 shadow-xs"
          : isInProgress
          ? "bg-blue-50/40 border-blue-300/80 shadow-xs ring-1 ring-blue-500/10"
          : "bg-slate-50/40 border-slate-200/60 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Status Indicator Icon */}
          <div className="mt-0.5 shrink-0">
            {isDone ? (
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : isInProgress ? (
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 text-xs font-mono">
                {stageNumber}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {label}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="shrink-0">
          {isDone ? (
            <Badge variant="current" dot className="text-xs font-medium">
              Complete
            </Badge>
          ) : isInProgress ? (
            <Badge variant="blue" className="text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse mr-1.5" />
              In progress
            </Badge>
          ) : (
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Circle className="w-2.5 h-2.5 text-slate-300 fill-slate-200" />
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Content (if in progress or completed) */}
      {(isDone || isInProgress) && customContent && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 pl-9">
          {customContent}
        </div>
      )}
    </div>
  );
};
