import React from "react";
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  FileCheck2,
  FileText,
  ExternalLink,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { OUTCOME_CONFIG } from "../results/ComplianceStatusCard";

export const ComplianceDrawer = ({
  isOpen,
  onClose,
  compliance,
  onOpenEvidence,
}) => {
  if (!isOpen || !compliance) return null;

  const outcome = compliance.outcome || "UNKNOWN";
  const config = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.UNKNOWN;
  const Icon = config.icon;
  const matchedRules = compliance.matchedRules || [];
  const primaryRule = matchedRules[0];
  const matchedConditions = compliance.matchedConditions || [];
  const missingAttrs = compliance.missingAttributes || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <Icon className={cn("w-5 h-5", config.iconColor)} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Regulatory Rules Engine
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  Certification & QCO Details
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
            {/* 1. Outcome Banner */}
            <div
              className={cn(
                "p-4 rounded-xl border flex items-start gap-3",
                config.borderClass
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    Evaluation Outcome
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full border",
                      config.badgeBg
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {compliance.explanation}
                </p>
              </div>
            </div>

            {/* Demo Data Disclaimer */}
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Demo Regulatory Dataset:</span>{" "}
                These results represent deterministic rules configured in the
                NormWise demonstration environment. They do not constitute an
                official legal opinion or statutory compliance warranty.
              </div>
            </div>

            {/* 2. Matched Conditions */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Condition Evaluation Trace
              </h3>
              {matchedConditions.length > 0 ? (
                <div className="space-y-2">
                  {matchedConditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-slate-600 mb-1">
                        <span className="font-semibold text-slate-900">
                          {cond.field}
                        </span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 text-[10px]">
                          {cond.operator}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5 font-sans">
                        <div>
                          <span className="text-slate-400">Rule Value: </span>
                          <span className="font-mono text-slate-800 font-medium">
                            "{cond.expectedValue}"
                          </span>
                        </div>
                        {cond.actualValue && (
                          <div>
                            <span className="text-slate-400">Actual Value: </span>
                            <span className="font-mono text-emerald-700 font-medium">
                              "{cond.actualValue}"
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No conditions directly matched the specified requirements.
                </p>
              )}
            </div>

            {/* Missing Attributes if applicable */}
            {missingAttrs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                  Missing Attributes for Rule Verification
                </h3>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p>
                    The following product attributes were not provided in the
                    procurement requirement and could not be evaluated:
                  </p>
                  <ul className="list-disc list-inside font-mono text-[11px] text-amber-800">
                    {missingAttrs.map((attr) => (
                      <li key={attr}>{attr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Matched Rule Information */}
            {primaryRule && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Regulatory Rule Information
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">
                      Rule Name
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {primaryRule.name}
                    </span>
                  </div>

                  {primaryRule.description && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        Scope & Description
                      </span>
                      <p className="text-slate-700 leading-relaxed mt-0.5">
                        {primaryRule.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        Authority
                      </span>
                      <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {primaryRule.authority || "Regulatory Authority"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        Source Reference
                      </span>
                      <span className="font-medium text-slate-800 truncate block mt-0.5" title={primaryRule.sourceReference}>
                        {primaryRule.sourceReference || "Gazette / QCO Schedule"}
                      </span>
                    </div>
                  </div>

                  {/* Effective Dates */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        Effective From
                      </span>
                      <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {primaryRule.effectiveFrom
                          ? new Date(primaryRule.effectiveFrom).toLocaleDateString()
                          : "In effect"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">
                        Valid Until
                      </span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {primaryRule.effectiveTo
                          ? new Date(primaryRule.effectiveTo).toLocaleDateString()
                          : "Ongoing / Current"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Evidence Linkage */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Supporting Evidence
              </h3>
              {compliance.evidenceId ? (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-emerald-950 block">
                        Authoritative Evidence Linked
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Viewable in the Evidence Matrix
                      </span>
                    </div>
                  </div>
                  {onOpenEvidence && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEvidence();
                      }}
                      className="px-2.5 py-1 bg-white text-emerald-700 border border-emerald-300 rounded font-semibold text-[11px] hover:bg-emerald-50 transition-colors"
                    >
                      Open Evidence →
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Relationship and rule source citation not available in demo dataset.
                  </span>
                </div>
              )}
            </div>

            {/* 5. Human Review Notice */}
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>Human Procurement Officer Verification Required</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Statutory certification mandates under Section 16 of the BIS Act,
                2016 require administrative and legal verification. NormWise
                flags potential applicability as decision-support intelligence.
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
