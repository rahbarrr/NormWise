import React from "react";
import { Check } from "lucide-react";
import { cn } from '../../utils';

const STAGES = [
  { id: 1, label: "UNDERSTAND" },
  { id: 2, label: "FIND" },
  { id: 3, label: "VERIFY" },
  { id: 4, label: "RELATED" },
  { id: 5, label: "RECOMMEND" },
];

export const ProgressIndicator = ({ currentStage = 1, isComplete = false }) => {
  return (
    <div className="w-full py-2">
      {/* Desktop Horizontal Progress */}
      <div className="hidden sm:flex items-center justify-between w-full">
        {STAGES.map((s, idx) => {
          const isDone = isComplete || currentStage > s.id;
          const isCurrent = !isComplete && currentStage === s.id;
          const isPending = !isComplete && currentStage < s.id;

          return (
            <React.Fragment key={s.id}>
              {/* Stage Node */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 font-mono",
                    isDone
                      ? "bg-emerald-600 text-white shadow-xs"
                      : isCurrent
                      ? "bg-blue-700 text-white ring-4 ring-blue-100 shadow-xs"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  )}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.id}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-wider uppercase transition-colors",
                    isDone
                      ? "text-emerald-700"
                      : isCurrent
                      ? "text-blue-900"
                      : "text-slate-400"
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* Connecting Bar */}
              {idx < STAGES.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-slate-200 relative overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      isComplete || currentStage > s.id
                        ? "w-full bg-emerald-600"
                        : currentStage === s.id
                        ? "w-1/2 bg-blue-700"
                        : "w-0 bg-transparent"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile Compact Progress Bar */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 font-sans">
            Stage {Math.min(currentStage, 5)} of 5:{" "}
            <span className="text-blue-700">{STAGES[Math.min(currentStage - 1, 4)].label}</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {isComplete ? "100%" : `${Math.round(((currentStage - 0.5) / 5) * 100)}%`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              isComplete ? "w-full bg-emerald-600" : "bg-blue-700"
            )}
            style={{
              width: isComplete ? "100%" : `${((currentStage - 0.5) / 5) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
