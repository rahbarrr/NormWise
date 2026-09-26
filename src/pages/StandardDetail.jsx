import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Network,
  ArrowLeft,
  ExternalLink,
  Layers,
  FileText,
  Filter,
  Info,
  Calendar,
  Building2,
  Box,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getStandard, getRelatedStandards } from "../services/standardApi";

const RELATIONSHIP_FILTERS = [
  { id: "ALL", label: "All" },
  { id: "NORMATIVE_REFERENCE", label: "Normative Reference" },
  { id: "TEST_METHOD", label: "Test Method" },
  { id: "SAFETY", label: "Safety" },
  { id: "COMPONENT", label: "Component" },
  { id: "INSTALLATION", label: "Installation" },
  { id: "EQUIVALENT", label: "Equivalent" },
  { id: "MATERIAL", label: "Material" },
  { id: "OTHER", label: "Other" },
];

const RELATIONSHIP_BADGE_STYLES = {
  NORMATIVE_REFERENCE: "bg-blue-50 text-blue-800 border-blue-200/80",
  TEST_METHOD: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  SAFETY: "bg-amber-50 text-amber-900 border-amber-200/80",
  COMPONENT: "bg-slate-100 text-slate-800 border-slate-200",
  INSTALLATION: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
  EQUIVALENT: "bg-cyan-50 text-cyan-800 border-cyan-200/80",
  MATERIAL: "bg-teal-50 text-teal-800 border-teal-200/80",
  SUPERSEDED_BY: "bg-amber-50 text-amber-900 border-amber-300",
  OTHER: "bg-slate-50 text-slate-700 border-slate-200",
};

export const StandardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [standard, setStandard] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoDataset, setIsDemoDataset] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [stdData, relData] = await Promise.all([
          getStandard(id),
          getRelatedStandards(id),
        ]);

        if (isMounted) {
          setStandard(stdData);
          setRelationships(relData?.relatedStandards || []);
          setIsDemoDataset(Boolean(relData?.isDemoDataset || stdData?.isDemoData));
        }
      } catch (err) {
        console.error("Failed to load standard details:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Compute relationship type counts for summary
  const relationshipSummary = React.useMemo(() => {
    const summary = {};
    for (const rel of relationships) {
      const type = rel.relationshipType || "OTHER";
      summary[type] = (summary[type] || 0) + 1;
    }
    return summary;
  }, [relationships]);

  // Filtered list of relationships
  const filteredRelationships = React.useMemo(() => {
    if (activeFilter === "ALL") return relationships;
    return relationships.filter((r) => r.relationshipType === activeFilter);
  }, [relationships, activeFilter]);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "CURRENT":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>CURRENT & ACTIVE</span>
          </span>
        );
      case "SUPERSEDED":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>SUPERSEDED</span>
          </span>
        );
      case "WITHDRAWN":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-900 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>WITHDRAWN</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <span>{status || "ACTIVE"}</span>
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3 max-w-xl mx-auto">
        <Network className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-600">Loading standard profile and knowledge relationships…</p>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <Info className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Standard not found</h3>
        <p className="text-xs text-slate-500">The requested standard "{id}" could not be located in the catalog.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Go Back</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Navigation & Back */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous view</span>
        </button>

        <div className="flex items-center gap-2">
          {isDemoDataset && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              Demo Dataset — verify against authoritative BIS source
            </span>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate(`/knowledge?standard=${encodeURIComponent(standard.standardNumber)}`)}
            className="text-xs font-semibold"
          >
            <Network className="w-3.5 h-3.5 mr-1" />
            <span>View Knowledge Graph</span>
          </Button>
        </div>
      </div>

      {/* 1. Header Card */}
      <Card className="border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-sm font-bold tracking-wider text-blue-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
              {standard.standardNumber}
            </span>

            <div>{getStatusBadge(standard.status)}</div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {standard.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 border-t border-slate-700/60 font-mono">
            {standard.edition && <span>Edition: {standard.edition}</span>}
            {standard.revision && <span>• Revision: {standard.revision}</span>}
            <span>• Amendments: {standard.amendments?.length || 0} active</span>
          </div>
        </div>

        {/* Revision & Amendment Notice Bar */}
        {standard.amendments && standard.amendments.length > 0 && (
          <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Active Amendments: {standard.amendments.map((a) => `${a.amendmentNumber} (${a.date ? new Date(a.date).toLocaleDateString("en-GB") : "Recent"})`).join(", ")}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Authoritative BIS Index</span>
          </div>
        )}
      </Card>

      {/* Main Grid: Overview + Relationship Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Overview & Related Standards List (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Overview */}
          <Card className="border-slate-200/90 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Scope & Technical Description</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                {standard.description || standard.scope || "Specification details for Indian Standard compliance."}
              </p>

              {standard.applicableProducts && standard.applicableProducts.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Applicable Procurement Products
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {standard.applicableProducts.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {standard.materials && standard.materials.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Designated Materials / Alloys
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {standard.materials.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[11px] font-medium border border-teal-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Related Standards Filter Bar & List */}
          <Card className="border-slate-200/90 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <span>Connected Standards ({filteredRelationships.length})</span>
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standards cross-referenced across materials, testing procedures, component parts, and safety mandates.
                  </p>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {RELATIONSHIP_FILTERS.map((f) => {
                  const count =
                    f.id === "ALL"
                      ? relationships.length
                      : relationships.filter((r) => r.relationshipType === f.id).length;

                  if (count === 0 && f.id !== "ALL") return null;

                  const isActive = activeFilter === f.id;

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          isActive ? "bg-slate-800 text-slate-300" : "bg-white text-slate-500 border border-slate-200"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="pt-4 divide-y divide-slate-100">
              {filteredRelationships.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">No standards found for selected relationship filter.</p>
                  <p>Try selecting "All" to inspect all connected standards.</p>
                </div>
              ) : (
                filteredRelationships.map((rel, idx) => {
                  const relStd = rel.standard || {};
                  const stdNum = relStd.standardNumber || "IS XXXX";
                  const relTitle = relStd.title || "Standard Specification";
                  const relType = rel.relationshipType || "NORMATIVE_REFERENCE";
                  const status = relStd.status || "CURRENT";

                  return (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/standards/${encodeURIComponent(stdNum)}`}
                            className="font-mono font-bold text-xs text-blue-900 hover:text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <span>{stdNum}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                          </Link>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              RELATIONSHIP_BADGE_STYLES[relType] || RELATIONSHIP_BADGE_STYLES.OTHER
                            }`}
                          >
                            {relType.replace(/_/g, " ")}
                          </span>

                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {rel.direction === "INCOMING" ? "← Referenced By" : "→ Outgoing"}
                          </span>
                        </div>

                        <div>{getStatusBadge(status)}</div>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {relTitle}
                      </p>

                      {rel.notes && (
                        <p className="text-[11px] text-slate-500 italic">
                          {rel.notes}
                        </p>
                      )}

                      {/* Evidence Link if Available */}
                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        {rel.evidence ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Evidence available: {rel.evidence.reference}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">
                            Relationship source not available in demo dataset
                          </span>
                        )}

                        <Link
                          to={`/standards/${encodeURIComponent(stdNum)}`}
                          className="font-semibold text-blue-700 hover:text-blue-900"
                        >
                          View Standard Profile →
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Relationship Summary & Graph Quick Links (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section 2: Relationship Summary Card */}
          <Card className="border-slate-200/90 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Relationship Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-3 pb-4 space-y-3 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="text-slate-700 font-medium">Connected Standards:</span>
                <span className="font-mono text-base font-bold text-blue-900">{relationships.length}</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Breakdown by Type
                </span>
                {Object.entries(relationshipSummary).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none"
                  >
                    <span className="text-slate-600 font-medium">{type.replace(/_/g, " ")}:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Graph Promo Card */}
          <Card className="border-slate-200/90 shadow-2xs bg-gradient-to-br from-slate-50 to-blue-50/30">
            <CardContent className="p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Network className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">Interactive Knowledge Graph</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Traverse up to 3 relationship levels to inspect raw material alloys, test methods, and parent specifications.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate(`/knowledge?standard=${encodeURIComponent(standard.standardNumber)}`)}
                className="w-full text-xs font-semibold justify-center shadow-xs"
              >
                <span>Launch Graph Visualizer</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Section 5: Audit & Source Disclaimer */}
          <Card className="border-slate-200/90 shadow-2xs bg-slate-50/50">
            <CardContent className="p-4 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Data Integrity & Audit Notice</span>
              </div>
              <p className="leading-relaxed">
                Relationships displayed here are structured in PostgreSQL relational tables for the NormWise demonstration catalog. Always verify critical procurement citations against the official Bureau of Indian Standards catalog prior to publication.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
