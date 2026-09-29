import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Network, ExternalLink, ArrowRight, ShieldCheck, AlertTriangle, XCircle, Info, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

// Subtle, professional badge styling according to NormWise design guidelines
const RELATIONSHIP_BADGE_STYLES = {
  NORMATIVE_REFERENCE: "bg-blue-50 text-blue-800 border-blue-200/80",
  "NORMATIVE REFERENCE": "bg-blue-50 text-blue-800 border-blue-200/80",
  TEST_METHOD: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  "TEST METHOD": "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  SAFETY: "bg-amber-50 text-amber-900 border-amber-200/80",
  COMPONENT: "bg-slate-100 text-slate-800 border-slate-200",
  INSTALLATION: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
  EQUIVALENT: "bg-cyan-50 text-cyan-800 border-cyan-200/80",
  MATERIAL: "bg-teal-50 text-teal-800 border-teal-200/80",
  TERMINOLOGY: "bg-slate-50 text-slate-700 border-slate-200",
  MANDATORY_UNDER: "bg-rose-50 text-rose-800 border-rose-200/80",
  APPLIES_TO: "bg-blue-50 text-blue-800 border-blue-200/80",
  SUPERSEDED_BY: "bg-amber-50 text-amber-900 border-amber-300",
  OTHER: "bg-slate-50 text-slate-700 border-slate-200",
};

export const AlliedStandards = ({
  alliedStandards = [],
  primaryStandard = "IS 2347:2023",
  onOpenEvidence,
  isLoading = false,
  isDemoDataset = false,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "CURRENT":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Status: CURRENT</span>
          </span>
        );
      case "SUPERSEDED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Status: SUPERSEDED</span>
          </span>
        );
      case "WITHDRAWN":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Status: WITHDRAWN</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <span>Status: {status || "ACTIVE"}</span>
          </span>
        );
    }
  };

  const formatRelLabel = (relType) => {
    if (!relType) return "NORMATIVE REFERENCE";
    return relType.replace(/_/g, " ").toUpperCase();
  };

  return (
    <Card className="border-slate-200/90 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-700" />
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                Allied & Related Standards
              </CardTitle>
              {isDemoDataset && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold border border-slate-300">
                  Demo relationship data
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Other standards connected to this recommendation across materials, testing methods, components, and safety rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/knowledge?standard=${encodeURIComponent(primaryStandard)}`)}
              className="text-xs h-7.5 text-blue-700 hover:text-blue-900 font-medium"
            >
              <Network className="w-3.5 h-3.5 mr-1" />
              <span>Explore Knowledge Graph</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-5 space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center text-xs text-slate-500 animate-pulse space-y-2">
            <Network className="w-6 h-6 text-slate-400 mx-auto animate-spin" />
            <p>Loading related standards…</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!alliedStandards || alliedStandards.length === 0) && (
          <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-slate-200/80 p-5 space-y-2">
            <Info className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              No related standards are available for this standard.
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              This catalog record currently does not have cross-referenced allied standards indexed in the repository.
            </p>
          </div>
        )}

        {/* Grid of Standard Relationship Cards */}
        {!isLoading && alliedStandards && alliedStandards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {alliedStandards.map((std, idx) => {
              const stdNumber = std.code || std.standard?.standardNumber || std.standardNumber || "IS XXXX";
              const title = std.title || std.standard?.title || "Standard Specification";
              const rawRelType = std.relationshipType || std.relationship || std.relation || "NORMATIVE_REFERENCE";
              const status = std.status || std.standard?.status || "CURRENT";
              const notes = std.notes || "";
              const hasEvidence = Boolean(std.evidenceAvailable || std.evidenceId || std.evidence);

              return (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {/* Header: Standard Number & Relationship Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/standards/${encodeURIComponent(stdNumber)}`}
                        className="font-mono font-bold text-xs text-blue-900 hover:text-blue-700 hover:underline flex items-center gap-1"
                        title="View standard details"
                      >
                        <span>{stdNumber}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </Link>

                      <span
                        className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded border ${
                          RELATIONSHIP_BADGE_STYLES[rawRelType] ||
                          RELATIONSHIP_BADGE_STYLES.OTHER
                        }`}
                      >
                        {formatRelLabel(rawRelType)}
                      </span>
                    </div>

                    {/* Standard Title */}
                    <p className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                      {title}
                    </p>

                    {/* Connection Description */}
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Connected to recommended standard ({primaryStandard}).
                    </p>

                    {/* Superseded Warning Banner if applicable */}
                    {status === "SUPERSEDED" && (
                      <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-800 font-medium">
                        ⚠ Superseded — review current applicable version
                      </div>
                    )}
                  </div>

                  {/* Footer: Status Badge & Evidence Link */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div>{getStatusBadge(status)}</div>

                    {hasEvidence ? (
                      <button
                        type="button"
                        onClick={() => onOpenEvidence && onOpenEvidence(std)}
                        className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
                      >
                        <span>View evidence</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </button>
                    ) : (
                      <Link
                        to={`/standards/${encodeURIComponent(stdNumber)}`}
                        className="text-[11px] font-medium text-slate-400 hover:text-slate-700"
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Informational Guidance Notice */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
          <span>Allied standards are surfaced for comprehensive technical compliance and materials validation.</span>
          <span className="font-mono text-[10px]">Deterministic traversal: depth 1</span>
        </div>
      </CardContent>
    </Card>
  );
};
