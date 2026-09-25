import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Bookmark,
  Share2,
  Printer,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Download,
  Info,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { DETAILED_STANDARDS_CATALOG, RECENT_RECOMMENDATIONS } from "../data/mockData";

export const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const standardParam = searchParams.get("standard") || "IS 2347:2023";
  const queryParam = searchParams.get("q") || "Stainless steel pressure cooker, 5 litre";

  // Look up detailed standard or fallback to first
  const standard =
    DETAILED_STANDARDS_CATALOG[standardParam] ||
    DETAILED_STANDARDS_CATALOG["IS 2347:2023"];

  const [copiedClause, setCopiedClause] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleCopyClause = () => {
    if (standard?.tenderClauseDraft) {
      navigator.clipboard?.writeText(standard.tenderClauseDraft);
      setCopiedClause(true);
      setTimeout(() => setCopiedClause(false), 2000);
    }
  };

  const handleSaveRecommendation = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-slate-600 hover:text-slate-900 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back</span>
          </Button>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">
            Evaluation ID: <span className="font-mono text-slate-700">NW-REC-2026-9042</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? "primary" : "secondary"}
            size="sm"
            onClick={handleSaveRecommendation}
            className="text-xs"
          >
            <Bookmark className={`w-3.5 h-3.5 mr-1 ${isSaved ? "fill-white" : ""}`} />
            <span>{isSaved ? "Saved in Library" : "Save Recommendation"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="text-xs hidden sm:inline-flex"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Target Requirement Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
        <span className="font-semibold uppercase tracking-wider text-slate-500 block mb-1">
          Procurement Requirement Evaluated:
        </span>
        <p className="text-sm font-medium text-slate-800">"{queryParam}"</p>
      </div>

      {/* Primary Recommended Standard Hero */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
              Primary Recommended Standard
            </span>
            <Badge
              variant={standard.status === "Current" ? "current" : "review"}
              dot
            >
              {standard.status} Standard
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Applicability Score:</span>
            <span className="text-base font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {standard.applicabilityScore}% Match
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            {standard.code}
          </h2>
          <p className="text-base text-slate-700 font-medium mt-1">
            {standard.title}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            <span>Edition: <strong>{standard.edition}</strong></span>
            <span>•</span>
            <span>Technical Committee: <strong>{standard.technicalCommittee}</strong></span>
            <span>•</span>
            <span>ICS Code: <strong className="font-mono">{standard.icsCode}</strong></span>
          </div>
        </div>
      </div>

      {/* Section 1: Why It Applies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-700" />
            <span>Why This Standard Applies to Your Procurement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {standard.whyItApplies.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Section 2: Statutory Certification & Quality Control Order (QCO) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Statutory Certification & Quality Control Order (QCO)</span>
            </CardTitle>
            <Badge
              variant={standard.mandatoryQCO.isMandatory ? "current" : "slate"}
            >
              {standard.mandatoryQCO.isMandatory ? "ISI Mark Mandatory" : "Voluntary BIS"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Statutory QCO Order:</span>
              <span className="font-semibold text-slate-900 text-sm">
                {standard.mandatoryQCO.orderName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Enforcing Ministry:</span>
              <span className="font-semibold text-slate-900 text-sm">
                {standard.mandatoryQCO.ministry}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Gazette of India Reference:</span>
              <span className="font-mono font-medium text-slate-800">
                {standard.mandatoryQCO.gazetteRef}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Exemption Rule:</span>
              <span className="font-medium text-slate-800">
                {standard.mandatoryQCO.exemptionRule}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
            <strong>Procurement Directive:</strong> Under the Bureau of Indian Standards Act 2016 and General Financial Rules (GFR), procuring non-ISI marked goods for items covered under active QCOs constitutes a technical procurement violation.
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Key Mandatory Clauses & Verification Proofs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-700" />
              <span>Key Conformity & Testing Clauses</span>
            </CardTitle>
            <Link
              to="/evidence"
              className="text-xs text-blue-700 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Full Evidence Matrix <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {standard.mandatoryClauses.map((c, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {c.clause}
                    </span>
                    <span className="font-semibold text-sm text-slate-900">
                      {c.title}
                    </span>
                  </div>
                  <Badge
                    variant={
                      c.criticality.includes("Critical")
                        ? "warning"
                        : c.criticality === "Statutory"
                        ? "current"
                        : "slate"
                    }
                  >
                    {c.criticality}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-1">
                  {c.detail}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Related Indian Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <span>Harmonized & Cross-Referenced Standards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {standard.relatedStandards.map((rel, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-900">
                    {rel.code}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.2 bg-white rounded border border-slate-200">
                    {rel.relation}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {rel.title}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Tender-Ready Procurement Clause (GeM / CPPP Format) */}
      <Card className="border-blue-300 ring-1 ring-blue-100">
        <CardHeader className="bg-slate-50/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-blue-950 flex items-center gap-2">
                <span>GeM & Tender-Ready Technical Specification Clause</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Vetted legal text for insertion into NIT Schedule of Requirements / ATC
              </p>
            </div>
            <Button
              variant={copiedClause ? "success" : "primary"}
              size="sm"
              onClick={handleCopyClause}
              className="text-xs shrink-0 font-medium"
            >
              {copiedClause ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Tender Clause</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto select-all">
            {standard.tenderClauseDraft}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Formatted for GeM Additional Terms & Conditions (ATC) Clause</span>
            <span>Version: NormWise v2026.3</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
