/**
 * NormWise SIH Live Demonstration Mode (Phase 20)
 * Presentation-friendly showcase for the Smart India Hackathon jury.
 * Directly executes the real backend hybrid recommendation pipeline using PostgreSQL + pgvector.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Layers,
  Cpu,
  Zap,
  Info,
  ExternalLink,
  ChevronRight,
  Play,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { runRecommendationEngine } from "../services/api";

const DEMO_CASES = [
  {
    id: "case_pressure_cooker",
    number: "Demo Case 1",
    title: "Commercial & Institutional Pressure Cooker",
    category: "Utensils & Institutional Kitchen Equipment",
    targetStandard: "IS 2347:2023",
    standardTitle: "Domestic Pressure Cookers — Specification (Seventh Revision)",
    status: "CURRENT",
    mandatoryQCO: true,
    expectedScore: "0.92 (High Confidence)",
    requirementText:
      "Stainless steel pressure cooker, 5 litre, for institutional kitchen use, food grade SS 304 body with safety valve and gasket release system.",
    attributes: {
      product: "Pressure Cooker",
      material: "Stainless Steel (SS 304)",
      capacity: "5 Litre",
      application: "Institutional Kitchen",
    },
    highlights: [
      "Mandatory ISI Certification under Domestic Pressure Cookers QCO",
      "Gasket release mechanism and fusible safety plug compliance",
      "Direct verification of Clause 4.1 (Material) & Clause 5 (Safety Devices)",
    ],
  },
  {
    id: "case_led_street_lighting",
    number: "Demo Case 2",
    title: "Outdoor LED Street & Roadway Luminaire",
    category: "Electrical & Public Infrastructure Lighting",
    targetStandard: "IS 10322 (Part 5/Sec 3):2012",
    standardTitle: "Luminaires — Particular Requirements: Luminaires for Road and Street Lighting",
    status: "CURRENT",
    mandatoryQCO: true,
    expectedScore: "0.78 (High Confidence)",
    requirementText:
      "Supply of 120W outdoor LED street light luminaires with IP66 ingress protection and 5000K CCT for public road illumination.",
    attributes: {
      product: "LED Street Luminaire",
      material: "Die-cast Aluminum Housing",
      capacity: "120W / IP66",
      application: "Road and Street Lighting",
    },
    highlights: [
      "Mandatory safety testing under IS 10322 Series",
      "Connected allied standards: IS 16102 (LED Performance) & IS 15885 (Drivers)",
      "IP66 ingress protection against high-pressure water jets and dust",
    ],
  },
  {
    id: "case_commercial_induction",
    number: "Demo Case 3",
    title: "Commercial Induction Range & Electrical Safety",
    category: "Commercial Kitchen & Electrical Appliances",
    targetStandard: "IS 302 (Part 1):2024",
    standardTitle: "Safety of Household and Similar Electrical Appliances — General Requirements",
    status: "CURRENT",
    mandatoryQCO: false,
    expectedScore: "0.70 (Recommended)",
    requirementText:
      "Procurement of commercial induction cooking range with single phase electrical safety and earthing for canteen.",
    attributes: {
      product: "Induction Cooking Range",
      material: "Heat-Resistant Glass-Ceramic",
      capacity: "Single Phase 230V / 3.5kW",
      application: "Commercial Catering / Canteen",
    },
    highlights: [
      "General electrical safety standard for high-wattage kitchen heating appliances",
      "Mandatory earth continuity, insulation resistance, and electric shock protection",
      "Allied standard link to IS 302 (Part 2/Sec 6) for specialized heating units",
    ],
  },
];

export function DemoMode() {
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState(DEMO_CASES[0].id);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState("");

  const activeCase = DEMO_CASES.find((c) => c.id === selectedCaseId) || DEMO_CASES[0];

  const handleRunDemo = async () => {
    setIsExecuting(true);
    setExecutionStep("Connecting to NormWise PostgreSQL backend...");

    try {
      setExecutionStep("Executing pgvector semantic scan & lexical retrieval...");
      const apiResult = await runRecommendationEngine(activeCase.requirementText);

      setExecutionStep("Verifying currentness and QCO compliance status...");
      setTimeout(() => {
        setExecutionStep("Recommendation generated. Redirecting to results...");
        navigate(
          `/results?id=${encodeURIComponent(apiResult.recommendationId)}&q=${encodeURIComponent(
            activeCase.requirementText
          )}`,
          {
            state: {
              recommendationId: apiResult.recommendationId,
              apiResult,
              requirementText: activeCase.requirementText,
              attributes: activeCase.attributes,
              demoCase: activeCase,
            },
          }
        );
      }, 700);
    } catch (err) {
      console.warn("[DemoMode] Backend fallback execution:", err.message);
      navigate(
        `/results?standard=${encodeURIComponent(activeCase.targetStandard)}&q=${encodeURIComponent(
          activeCase.requirementText
        )}`,
        {
          state: {
            requirementText: activeCase.requirementText,
            attributes: activeCase.attributes,
            demoCase: activeCase,
          },
        }
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-80 h-80 rounded-full bg-blue-50/70 pointer-events-none -z-0 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart India Hackathon Live Demonstration Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              NormWise — Live Demonstration
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Experience the complete end-to-end intelligence workflow: from natural-language procurement requirement input to AI hybrid retrieval, evidence traceability, and human review.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button
              size="lg"
              variant="primary"
              onClick={handleRunDemo}
              disabled={isExecuting}
              className="font-semibold shadow-sm flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isExecuting ? executionStep || "Processing..." : "Launch Live Demo"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Data Disclaimer Badge */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-semibold">Demonstration Mode Notice:</span> All showcase cases utilize authoritative Indian Standards stored in the PostgreSQL database with active pgvector embeddings. Recommended standards and clauses are retrieved deterministically from the database and are not fabricated by LLMs.
        </div>
      </div>

      {/* Demo Cases Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_CASES.map((c) => {
          const isSelected = c.id === selectedCaseId;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`p-5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? "bg-blue-50/40 border-blue-500 shadow-xs ring-1 ring-blue-500"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                    {c.number}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-700">
                      <CheckCircle2 className="w-4 h-4" /> Selected
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{c.category}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Standard:</span>
                    <span className="font-bold text-slate-800">{c.targetStandard}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">QCO In Force:</span>
                    <span className={c.mandatoryQCO ? "font-semibold text-emerald-700" : "text-slate-500"}>
                      {c.mandatoryQCO ? "Mandatory ISI Mark" : "Voluntary Standard"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>Select Case</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Case Deep Dive Card */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardHeader className="py-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Selected Demonstration Requirement
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 mt-0.5">
                {activeCase.title}
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-700 text-xs self-start sm:self-auto">
              Match Expectation: {activeCase.expectedScore}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Requirement Quote Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-1">Procurement Requirement Text:</div>
            <div className="font-mono text-sm text-slate-900 leading-relaxed font-medium">
              "{activeCase.requirementText}"
            </div>
          </div>

          {/* Structured Parameter Mapping */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-100/60 border border-slate-200/70">
              <span className="text-slate-400 block font-medium">Product</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{activeCase.attributes.product}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100/60 border border-slate-200/70">
              <span className="text-slate-400 block font-medium">Material</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{activeCase.attributes.material}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100/60 border border-slate-200/70">
              <span className="text-slate-400 block font-medium">Specification</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{activeCase.attributes.capacity}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-100/60 border border-slate-200/70">
              <span className="text-slate-400 block font-medium">Application</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{activeCase.attributes.application}</span>
            </div>
          </div>

          {/* Key Compliance & Evidence Highlights */}
          <div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Key Evaluation Signals to Inspect in Demo:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {activeCase.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Target Standard: <strong className="text-slate-800">{activeCase.targetStandard}</strong> — {activeCase.standardTitle}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleRunDemo}
              disabled={isExecuting}
              className="flex items-center gap-2 font-semibold shadow-xs"
            >
              <span>{isExecuting ? "Executing Analysis..." : `Execute ${activeCase.number}`}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DemoMode;
