import React from "react";
import { cn } from "../../lib/utils";

export const ConfidenceBadge = ({
  confidence = 94,
  label = "Recommendation confidence",
  className,
}) => {
  const isHigh = confidence >= 90;
  const isModerate = confidence >= 80 && confidence < 90;

  return (
    <div
      className={cn(
        "inline-flex flex-col items-end sm:items-center text-right sm:text-center p-2.5 sm:p-3 rounded-xl border",
        isHigh
          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
          : isModerate
          ? "bg-amber-50/80 border-amber-200 text-amber-950"
          : "bg-slate-50 border-slate-200 text-slate-800",
        className
      )}
      title="Algorithm match score based on technical parameter alignment (Demonstration data)"
    >
      <div className="flex items-baseline gap-1">
        <span className="text-xl sm:text-2xl font-black font-mono tracking-tight">
          {confidence}%
        </span>
        <span className="text-xs font-bold uppercase tracking-wider">
          Match
        </span>
      </div>
      <span className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};
