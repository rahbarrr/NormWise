import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";
import { cn } from '../../utils';

export const OUTCOME_CONFIG = {
  POTENTIALLY_APPLICABLE: {
    label: "Potentially Applicable",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    borderClass: "border-amber-200 bg-amber-50/20",
    summary: "Based on the current demo rule dataset, an active regulatory rule potentially applies to this product.",
  },
  REQUIRES_REVIEW: {
    label: "Requires Review",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    borderClass: "border-amber-300 bg-amber-50/30",
    summary: "Ambiguous rule criteria, missing source, or multiple conflicting rules require technical review.",
  },
  INSUFFICIENT_EVIDENCE: {
    label: "Insufficient Evidence",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    icon: HelpCircle,
    iconColor: "text-slate-500",
    borderClass: "border-slate-200 bg-slate-50/50",
    summary: "Key product attributes are missing. Unable to evaluate compliance rules without full context.",
  },
  NOT_IDENTIFIED: {
    label: "Not Identified",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Info,
    iconColor: "text-slate-500",
    borderClass: "border-slate-200 bg-white",
    summary: "No specific mandatory certification or QCO rule was identified in the current demo dataset.",
  },
  UNKNOWN: {
    label: "Unknown Status",
    badgeBg: "bg-slate-100 text-slate-600 border-slate-300",
    icon: HelpCircle,
    iconColor: "text-slate-400",
    borderClass: "border-slate-200 bg-slate-50/30",
    summary: "Compliance status could not be determined from the available records.",
  },
};

export const ComplianceStatusCard = ({
  compliance,
  onOpenDrawer,
  onEditRequirement,
}) => {
  if (!compliance) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Clock className="w-4 h-4 animate-spin text-blue-600" />
          <span>Evaluating certification and regulatory compliance rules…</span>
        </div>
      </div>
    );
  }

  const outcome = compliance.outcome || "UNKNOWN";
  const config = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.UNKNOWN;
  const Icon = config.icon;
  const matchedRules = compliance.matchedRules || [];
  const primaryRule = matchedRules[0];
  const missingAttrs = compliance.missingAttributes || [];

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all shadow-xs",
        config.borderClass
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
            <Icon className={cn("w-4 h-4", config.iconColor)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Certification & Compliance Check
              </h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Rule Engine
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">
              Regulatory Scheme Evaluation
            </p>
          </div>
        </div>

        {/* Outcome Badge */}
        <div
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs flex items-center gap-1.5",
            config.badgeBg
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          {config.label}
        </div>
      </div>

      {/* Explanation Text */}
      <p className="text-xs text-slate-700 leading-relaxed mb-3">
        {compliance.explanation || config.summary}
      </p>

      {/* Missing attributes alert */}
      {missingAttrs.length > 0 && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-amber-200/80 text-xs">
          <span className="font-semibold text-amber-900 block mb-1">
            Missing Product Attributes for Rule Evaluation:
          </span>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {missingAttrs.map((attr) => (
              <span
                key={attr}
                className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[11px] font-mono"
              >
                {attr}
              </span>
            ))}
          </div>
          {onEditRequirement && (
            <button
              type="button"
              onClick={onEditRequirement}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              Edit requirement specification
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Matched Rule Summary if available */}
      {primaryRule && (
        <div className="mb-3 p-3 bg-white/80 rounded-lg border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-slate-500">Evaluated Rule:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px]">
              {primaryRule.name}
            </span>
          </div>
          {primaryRule.authority && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Authority:</span>
              <span className="text-slate-700">{primaryRule.authority}</span>
            </div>
          )}
          {primaryRule.sourceReference && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Source:</span>
              <span className="text-slate-700 truncate max-w-[220px]" title={primaryRule.sourceReference}>
                {primaryRule.sourceReference}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mandatory Demo Data Notice */}
      <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[11px] text-amber-800 leading-normal flex items-start gap-2 mb-3">
        <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Demo Regulatory Data:</span> Verify
          against current authoritative Gazette notifications and official BIS
          schedules prior to procurement contract execution.
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
        <span className="text-[11px] text-slate-500">
          Human verification required
        </span>
        <button
          type="button"
          onClick={onOpenDrawer}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          View compliance details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
