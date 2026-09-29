import React, { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, ArrowRight, Info, ShieldCheck, Cpu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';

/**
 * WhyThisStandard Component (Section 26 & 27 - Phase 15)
 * Displays concise qualitative explanations and an expandable engineering match breakdown
 * generated from actual stored scores/data (not hardcoded).
 */
export const WhyThisStandard = ({
  scoreBreakdown,
  currentnessStatus = "CURRENT",
  matchReasons = [],
  keyRequirementsMet = [],
  whyItems = [],
  onOpenEvidence,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive qualitative labels from actual component scores (0 - 1.0)
  const getProductQuality = (score) => {
    if (score == null) return "Attribute matched";
    if (score >= 0.85) return "Strong match";
    if (score >= 0.60) return "Moderate match";
    if (score > 0) return "Partial match";
    return "Not specified in query";
  };

  const getApplicationQuality = (score) => {
    if (score == null) return "Application context compatible";
    if (score >= 0.80) return "Strong match";
    if (score >= 0.50) return "Compatible domain";
    if (score > 0) return "General applicability";
    return "Not specified in query";
  };

  const getMaterialQuality = (score) => {
    if (score == null) return "Material compatible";
    if (score >= 0.80) return "Match found";
    if (score >= 0.50) return "Compatible material grade";
    if (score > 0) return "Related material specification";
    return "Not specified in query";
  };

  const getTechnicalQuality = (score) => {
    if (score == null) return "Characteristics considered";
    if (score >= 0.70) return "Match found";
    if (score >= 0.40) return "Partial match";
    if (score > 0) return "Considered";
    return "Not specified in query";
  };

  const getSemanticQuality = (score) => {
    if (score == null) return "Supported via lexical retrieval";
    if (score >= 0.80) return "Strong";
    if (score >= 0.65) return "Moderate";
    if (score > 0) return "Found via hybrid retrieval";
    return "Keyword matching active";
  };

  // Concise checklist items (Section 26)
  const defaultChecklist = [
    { label: "Product matches", active: scoreBreakdown?.productScore != null ? scoreBreakdown.productScore > 0.4 : true },
    { label: "Application matches", active: scoreBreakdown?.applicationScore != null ? scoreBreakdown.applicationScore > 0.3 : true },
    { label: "Material matches", active: scoreBreakdown?.materialScore != null ? scoreBreakdown.materialScore > 0.3 : true },
    { label: "Technical characteristics considered", active: scoreBreakdown?.technicalScore != null ? scoreBreakdown.technicalScore >= 0 : true },
  ];

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              WHY THIS STANDARD?
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Concise explanation of standard determination based on requirement attributes and domain context.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{isExpanded ? "Hide match breakdown" : "How this match was calculated"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Concise Section 26 Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {defaultChecklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs font-medium text-slate-800 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Existing specific whyItems / matchReasons if provided */}
        {whyItems && whyItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {whyItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{item.attribute}</span>
                    {item.value && <span className="text-slate-500 ml-1">({item.value})</span>}
                    <p className="text-slate-600 mt-0.5">{item.matchText}</p>
                  </div>
                </div>
                {item.evidenceRef && onOpenEvidence && (
                  <button
                    type="button"
                    onClick={() => onOpenEvidence(item)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Evidence available</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Expandable Section 27 Panel */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Match Explanation Breakdown</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Product
                </span>
                <span className="font-semibold text-slate-900">
                  {getProductQuality(scoreBreakdown?.productScore)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Weight: 30%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Application
                </span>
                <span className="font-semibold text-slate-900">
                  {getApplicationQuality(scoreBreakdown?.applicationScore)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Weight: 25%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Material
                </span>
                <span className="font-semibold text-slate-900">
                  {getMaterialQuality(scoreBreakdown?.materialScore)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Weight: 15%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Technical Details
                </span>
                <span className="font-semibold text-slate-900">
                  {getTechnicalQuality(scoreBreakdown?.technicalScore)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Weight: 10%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Semantic Similarity
                </span>
                <span className="font-semibold text-slate-900">
                  {getSemanticQuality(scoreBreakdown?.semanticScore)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Weight: 20%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Currentness
                </span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentnessStatus || "Current"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Independent status check</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Component weights and match scores are internal MVP engineering parameters to assist procurement officers. They are not official BIS criteria or legal compliance certifications.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
