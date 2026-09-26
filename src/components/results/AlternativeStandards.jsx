import React from "react";
import { Link } from "react-router-dom";
import { Layers, ShieldCheck, AlertTriangle, XCircle, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";

/**
 * Alternative Standards (Other Possible Matches)
 * Section 28 - Phase 15 Hybrid Retrieval Engine
 *
 * Shows non-primary candidates from the candidate pool.
 * Does NOT use winner/loser language.
 * Always prompts: "Review evidence before selecting."
 */
export const AlternativeStandards = ({ alternatives = [] }) => {
  if (!alternatives || alternatives.length === 0) return null;

  const renderStatusBadge = (status) => {
    const s = (status || "CURRENT").toUpperCase();
    if (s === "CURRENT") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Status: CURRENT</span>
        </span>
      );
    }
    if (s === "SUPERSEDED") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Status: SUPERSEDED</span>
        </span>
      );
    }
    if (s === "WITHDRAWN") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Status: WITHDRAWN</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
        <span>Status: {status || "ACTIVE"}</span>
      </span>
    );
  };

  return (
    <Card className="border-slate-200/90 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                OTHER POSSIBLE MATCHES
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-mono text-slate-600 border-slate-300">
                {alternatives.length} {alternatives.length === 1 ? "candidate" : "candidates"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Alternative standards identified by hybrid retrieval. Review evidence before selecting.
            </p>
          </div>
          <span className="text-[11px] font-medium text-slate-500 italic">
            Review evidence before selecting.
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {alternatives.map((alt, idx) => {
          const scorePercent = alt.matchScore != null
            ? Math.round(alt.matchScore * 100)
            : alt.matchConfidence || 75;
          const stdNum = alt.standardNumber || alt.code;

          return (
            <div
              key={alt.id || alt.standardId || idx}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {stdNum}
                  </span>
                  {renderStatusBadge(alt.status)}
                  {alt.retrievedBy && alt.retrievedBy.length > 0 && (
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      via {alt.retrievedBy.join(" + ")}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">
                  {alt.title}
                </p>

                {alt.reason && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {alt.reason}
                  </p>
                )}
              </div>

              {/* Match Score & Action */}
              <div className="flex items-center gap-4 shrink-0 sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {scorePercent}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Match score
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Engineering match
                  </span>
                </div>

                <Link
                  to={`/standards/${encodeURIComponent(stdNum)}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50/50 inline-flex items-center gap-1 transition-colors"
                >
                  <span>View Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
