import React from "react";
import { Sparkles, Check } from "lucide-react";
import { EXAMPLE_REQUIREMENTS_PHASE2 } from '../../utils/mock/mockRequirements';
import { cn } from '../../utils';

export const ExampleRequirement = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Try an example
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EXAMPLE_REQUIREMENTS_PHASE2.map((ex) => {
          const isSelected = selectedId === ex.id;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelect(ex)}
              className={cn(
                "text-left p-3 rounded-xl border transition-all duration-150 relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 flex flex-col justify-between",
                isSelected
                  ? "bg-blue-50/70 border-blue-600 shadow-xs ring-1 ring-blue-600/20"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div>
                    <span
                      className={cn(
                        "text-xs font-bold leading-tight font-sans block",
                        isSelected ? "text-blue-900" : "text-slate-900 group-hover:text-blue-700"
                      )}
                    >
                      {ex.title}
                    </span>
                    {ex.badge && (
                      <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 mt-0.5 rounded bg-slate-100 text-slate-700">
                        {ex.badge}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                  "{ex.text}"
                </p>
              </div>

              <span
                className={cn(
                  "text-[10px] font-semibold mt-2.5 inline-block uppercase tracking-wider",
                  isSelected ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"
                )}
              >
                {isSelected ? "Active Example" : "Use Example →"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
