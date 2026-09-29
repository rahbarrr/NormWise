import React from "react";
import { CheckCircle2, Circle, Clock, Check } from "lucide-react";
import { cn } from '../../utils';

export const ReviewStatusBar = ({ currentStatus = "Pending Review" }) => {
  const isDecisionRecorded =
    currentStatus === "Accepted" ||
    currentStatus === "Under Technical Review" ||
    currentStatus === "Clarification Requested" ||
    currentStatus === "Not Applicable";

  const steps = [
    {
      id: "created",
      label: "Recommendation Created",
      subtext: "System matched IS 2347:2023",
      state: "completed", // ✓
    },
    {
      id: "evidence",
      label: "Evidence Reviewed",
      subtext: "6 source citations verified",
      state: "completed", // ✓
    },
    {
      id: "review",
      label: "Human Review",
      subtext: isDecisionRecorded ? "Completed by reviewer" : "Evaluation in progress",
      state: isDecisionRecorded ? "completed" : "current", // ✓ or ●
    },
    {
      id: "decision",
      label: "Decision Recorded",
      subtext: isDecisionRecorded ? currentStatus : "Awaiting reviewer sign-off",
      state: isDecisionRecorded ? "current" : "pending", // ● or ○
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Decision Governance Workflow
        </span>
        <span className="text-xs text-slate-500">
          Stage:{" "}
          <strong className="text-slate-800 font-semibold">
            {isDecisionRecorded ? "Decision Recorded" : "Human Review"}
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
        {steps.map((step, index) => {
          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                step.state === "completed" && "bg-emerald-50/40 border-emerald-200/80",
                step.state === "current" && "bg-blue-50/50 border-blue-300 ring-1 ring-blue-200",
                step.state === "pending" && "bg-slate-50/70 border-slate-200"
              )}
            >
              {/* State Indicator */}
              <div className="shrink-0 mt-0.5">
                {step.state === "completed" && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                {step.state === "current" && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  </div>
                )}
                {step.state === "pending" && (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    0{index + 1}
                  </span>
                  <p
                    className={cn(
                      "text-xs font-bold leading-tight truncate",
                      step.state === "completed" && "text-emerald-950",
                      step.state === "current" && "text-blue-950",
                      step.state === "pending" && "text-slate-500"
                    )}
                  >
                    {step.label}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate leading-tight">
                  {step.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
