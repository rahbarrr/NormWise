import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check, ShieldCheck } from "lucide-react";
import { cn } from "../../lib/utils";

export const AnalysisDetails = ({ currentStage = 1, isComplete = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { label: "Requirement parsed", stageReq: 1 },
    { label: "Product attributes extracted", stageReq: 1 },
    { label: "Candidate standards searched", stageReq: 2 },
    { label: "Currentness checked", stageReq: 3 },
    { label: "Related standards identified", stageReq: 4 },
    { label: "Evidence preparation", stageReq: 5 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus:outline-none"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Analysis details
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>{isOpen ? "Hide details" : "Show details"}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2.5 animate-in fade-in duration-150">
          <p className="text-[11px] text-slate-500 mb-2">
            Standards verification checkpoints for institutional audit trail:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {items.map((item, idx) => {
              const done = isComplete || currentStage > item.stageReq;
              const inProgress = !isComplete && currentStage === item.stageReq;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80"
                >
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  {done ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] font-mono">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Verified
                    </span>
                  ) : inProgress ? (
                    <span className="text-blue-700 font-medium text-[11px] font-mono animate-pulse">
                      In progress...
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px] font-mono">
                      Queued
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
