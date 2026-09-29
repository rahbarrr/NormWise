import React from "react";
import { ProgressIndicator } from "./ProgressIndicator";
import { AnalysisStage } from "./AnalysisStage";
import { ExtractedAttributes } from "./ExtractedAttributes";
import { Badge } from '../common/Badge';
import { BookOpen, Check, Layers, ShieldCheck } from "lucide-react";

export const AnalysisWorkflow = ({
  currentStage,
  isComplete,
  analysisData,
}) => {
  const getStageStatus = (stageNum) => {
    if (isComplete || currentStage > stageNum) return "completed";
    if (currentStage === stageNum) return "in_progress";
    return "pending";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-sans">
          Standards analysis in progress
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          This may take a few moments.
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator currentStage={currentStage} isComplete={isComplete} />

      {/* 5 Stages List */}
      <div className="space-y-3.5 pt-2">
        {/* Stage 1: Understand requirement */}
        <AnalysisStage
          stageNumber={1}
          label="Understand requirement"
          description="Identifying product, material, application and technical characteristics."
          status={getStageStatus(1)}
          customContent={
            getStageStatus(1) === "completed" ? (
              <ExtractedAttributes attributes={analysisData.attributes} />
            ) : null
          }
        />

        {/* Stage 2: Find relevant standards */}
        <AnalysisStage
          stageNumber={2}
          label="Find relevant standards"
          description="Searching the standards knowledge base for potentially applicable standards."
          status={getStageStatus(2)}
          customContent={
            getStageStatus(2) === "in_progress" ? (
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Searching standards knowledge base...</span>
              </div>
            ) : getStageStatus(2) === "completed" ? (
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">
                  Potential matches found:{" "}
                  <strong className="text-blue-900 font-mono">
                    {analysisData.potentialMatches}
                  </strong>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Demo dataset
                </span>
              </div>
            ) : null
          }
        />

        {/* Stage 3: Verify current status */}
        <AnalysisStage
          stageNumber={3}
          label="Verify current status"
          description="Checking edition, revision, amendment and status information."
          status={getStageStatus(3)}
          customContent={
            getStageStatus(3) === "in_progress" ? (
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Validating Gazette revision notices and active amendments...</span>
              </div>
            ) : getStageStatus(3) === "completed" ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Current Edition
                  </span>
                  <span className="font-mono font-bold text-blue-900">
                    {analysisData.currentEdition}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Status
                  </span>
                  <Badge
                    variant={analysisData.status === "Current" ? "current" : "review"}
                    dot
                    className="mt-0.5"
                  >
                    {analysisData.status}
                  </Badge>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Amendment Checked
                  </span>
                  <span className="font-medium text-slate-800">
                    {analysisData.amendmentChecked}
                  </span>
                </div>
              </div>
            ) : null
          }
        />

        {/* Stage 4: Check related requirements */}
        <AnalysisStage
          stageNumber={4}
          label="Check related requirements"
          description="Identifying allied standards, components and related requirements."
          status={getStageStatus(4)}
          customContent={
            getStageStatus(4) === "in_progress" ? (
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Mapping cross-referenced standards and materials...</span>
              </div>
            ) : getStageStatus(4) === "completed" ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">
                    Related standards:{" "}
                    <strong className="text-slate-900 font-mono">
                      {analysisData.relatedStandards} identified
                    </strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Cross-referenced
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisData.relatedStandardsList.map((st, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px] font-semibold"
                      title={typeof st === "object" ? st.title : st}
                    >
                      {typeof st === "object" ? st.code : st}
                    </span>
                  ))}
                </div>
              </div>
            ) : null
          }
        />

        {/* Stage 5: Prepare recommendation */}
        <AnalysisStage
          stageNumber={5}
          label="Prepare recommendation"
          description="Preparing an evidence-backed recommendation for review."
          status={getStageStatus(5)}
          customContent={
            getStageStatus(5) === "in_progress" ? (
              <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Synthesizing conformity evidence and GeM tender clause...</span>
              </div>
            ) : getStageStatus(5) === "completed" ? (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ready for procurement officer review</span>
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};
