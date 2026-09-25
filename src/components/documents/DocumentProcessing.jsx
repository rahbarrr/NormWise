import React, { useEffect, useState } from "react";
import { Check, Loader2, Sparkles, FastForward } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

const PROCESSING_STEPS = [
  {
    id: 1,
    title: "Document received",
    description: "Verifying document structure, page count and digital signatures.",
  },
  {
    id: 2,
    title: "Extracting text",
    description: "Parsing specification clauses, schedule of quantities and technical footnotes.",
  },
  {
    id: 3,
    title: "Identifying product information",
    description: "Detecting equipment classifications, material grades and capacity dimensions.",
  },
  {
    id: 4,
    title: "Identifying technical requirements",
    description: "Correlating test method thresholds, safety valves and operating parameters.",
  },
  {
    id: 5,
    title: "Preparing requirement summary",
    description: "Synthesizing extracted parameters for human review and Indian Standards matching.",
  },
];

export const DocumentProcessing = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 5) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 800);
          return 5;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <Card className="border-slate-200/90 shadow-xs overflow-hidden">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Processing your document
              </CardTitle>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
              NormWise is extracting procurement requirements from the uploaded document.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onComplete}
            className="text-xs self-start sm:self-auto text-slate-500 hover:text-slate-800"
          >
            <FastForward className="w-3.5 h-3.5 mr-1" />
            <span>Skip to Extracted Requirements</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>

        {/* Step Items */}
        <div className="space-y-3 pt-2">
          {PROCESSING_STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isPending = step.id > currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200",
                  isCompleted && "bg-emerald-50/30 border-emerald-200/80",
                  isCurrent && "bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/10",
                  isPending && "bg-slate-50/50 border-slate-200 opacity-60"
                )}
              >
                {/* Step Icon Indicator */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    </div>
                  )}
                </div>

                {/* Step Text Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      0{step.id}
                    </span>
                    <h5
                      className={cn(
                        "text-xs sm:text-sm font-bold leading-tight",
                        isCompleted && "text-emerald-950",
                        isCurrent && "text-blue-950",
                        isPending && "text-slate-500"
                      )}
                    >
                      {step.title}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
