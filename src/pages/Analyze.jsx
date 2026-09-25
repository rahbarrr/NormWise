import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  FileSearch,
  BookOpen,
  Scale,
  ArrowRight,
  Database,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { RECENT_RECOMMENDATIONS } from "../data/mockData";

const ANALYSIS_STAGES = [
  {
    id: 1,
    title: "Parsing Technical Attributes & Materials",
    description: "Extracting product taxonomy, nominal capacities, pressure/electrical ratings, and metallurgy.",
    icon: FileSearch,
  },
  {
    id: 2,
    title: "Scanning BIS National Catalogue & Committees",
    description: "Matching with Division Councils (MED, ETD, CED, MTD) and active Harmonized System (HS) codes.",
    icon: BookOpen,
  },
  {
    id: 3,
    title: "Verifying Quality Control Orders (QCO Mandate)",
    description: "Checking Ministry of Commerce (DPIIT) & line ministry Gazette statutory enforcement orders.",
    icon: Scale,
  },
  {
    id: 4,
    title: "Synthesizing Conformity Assessment & Test Clauses",
    description: "Drafting verified procurement specification clauses and mandatory NABL lab parameters.",
    icon: ShieldCheck,
  },
];

export const Analyze = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get("q") || "Stainless steel pressure cooker, 5 litre";
  const fileName = searchParams.get("file");

  const [currentStage, setCurrentStage] = useState(1);
  const [completed, setCompleted] = useState(false);

  // Determine matched demo standard based on query keywords
  let matchedStandardCode = "IS 2347:2023";
  if (query.toLowerCase().includes("led") || query.toLowerCase().includes("street") || query.toLowerCase().includes("light")) {
    matchedStandardCode = "IS 10322 Part 5 / Section 3";
  } else if (query.toLowerCase().includes("switch") || query.toLowerCase().includes("socket") || query.toLowerCase().includes("electrical")) {
    matchedStandardCode = "IS 3854:1988";
  }

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStage(2), 700);
    const timer2 = setTimeout(() => setCurrentStage(3), 1500);
    const timer3 = setTimeout(() => setCurrentStage(4), 2300);
    const timer4 = setTimeout(() => {
      setCurrentStage(5);
      setCompleted(true);
    }, 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handleProceedToResults = () => {
    navigate(`/results?standard=${encodeURIComponent(matchedStandardCode)}&q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-700 animate-ping"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Procurement Intelligence Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Analyzing Requirement Conformity
          </h2>
        </div>

        <Badge variant={completed ? "current" : "blue"} dot>
          {completed ? "Analysis Complete (100%)" : `Processing Stage ${Math.min(currentStage, 4)} of 4`}
        </Badge>
      </div>

      {/* Target Requirement Brief */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
          Requirement Under Analysis:
        </span>
        <p className="text-sm font-medium text-slate-800 leading-relaxed font-sans">
          "{query}"
        </p>
        {fileName && (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium mt-2 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Attached Document: {fileName}
          </span>
        )}
      </div>

      {/* Progressive Audit Pipeline */}
      <div className="space-y-3">
        {ANALYSIS_STAGES.map((stage) => {
          const Icon = stage.icon;
          const isDone = currentStage > stage.id || completed;
          const isRunning = currentStage === stage.id && !completed;
          const isPending = currentStage < stage.id && !completed;

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 ${
                isDone
                  ? "bg-white border-slate-200 text-slate-900 shadow-xs"
                  : isRunning
                  ? "bg-blue-50/50 border-blue-300 text-slate-900 shadow-xs"
                  : "bg-slate-50/50 border-slate-200/60 text-slate-400 opacity-60"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : isRunning ? (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-300 animate-spin">
                    <Icon className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                    <span className="text-xs font-bold font-mono">{stage.id}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                    {stage.title}
                  </h4>
                  {isDone && (
                    <span className="text-xs font-semibold text-emerald-700 font-mono">
                      Verified ✓
                    </span>
                  )}
                  {isRunning && (
                    <span className="text-xs font-semibold text-blue-700 animate-pulse font-mono">
                      Running...
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {completed && (
        <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">
                Standards Conformity Verdict Ready
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Identified primary standard <strong className="font-mono">{matchedStandardCode}</strong> with mandatory statutory compliance criteria and proof clauses.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleProceedToResults}
            className="w-full sm:w-auto font-semibold bg-blue-700 hover:bg-blue-800 shrink-0"
          >
            <span>View Recommendation Results</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
