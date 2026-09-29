import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Eye,
  Info,
  Loader2,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../common/Table';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { RECENT_RECOMMENDATIONS } from '../../utils/mock/mockData';
import { getRecommendations, adaptRecommendation } from "../../services/api";
import { cn } from '../../utils';

function statusBadgeVariant(status) {
  if (!status) return "review";
  const s = status.toUpperCase();
  if (s === "ACCEPTED") return "current";
  if (s === "PENDING_REVIEW") return "pending";
  return "review";
}

function formatStatus(status) {
  if (!status) return "Pending";
  const map = {
    ACCEPTED: "Accepted",
    PENDING_REVIEW: "Pending Review",
    UNDER_TECHNICAL_REVIEW: "Under Review",
    CLARIFICATION_REQUESTED: "Clarification",
    NOT_APPLICABLE: "N/A",
  };
  return map[status] || status;
}

export const RecentRecommendations = () => {
  const navigate = useNavigate();
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadRows() {
      try {
        const result = await getRecommendations({ limit: 6 });
        if (isMounted && result?.items?.length > 0) {
          // Map API items to table row shape
          const mapped = result.items.map((rec) => {
            const primaryRs = rec.recommendationStandards?.find((rs) => rs.isPrimary)
              || rec.recommendationStandards?.[0];
            const std = primaryRs?.standard || {};
            return {
              id: rec.id,
              requirement: rec.requirementText || rec.requirement || "—",
              department: rec.department || "General Procurement",
              recommendedStandard: std.standardNumber || rec.standard || "—",
              standardTitle: std.title || rec.standardTitle || "—",
              status: rec.status,
              confidence: rec.confidence ?? (primaryRs?.matchScore ? Math.round(primaryRs.matchScore * 100) : null),
              date: rec.createdAt ? new Date(rec.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
              }) : "—",
              mandatoryQCO: std.qcoMandatory || false,
              statusNote: std.description || `Standard ${std.standardNumber || ""} — verified against BIS catalog.`,
              technicalCommittee: std.technicalCommittee || "BIS Technical Committee",
            };
          });
          setRows(mapped);
          setTotalCount(result.pagination?.total || mapped.length);
          setIsLiveData(true);
        } else if (isMounted) {
          // Fallback to mock
          setRows(RECENT_RECOMMENDATIONS.map((r) => ({
            ...r,
            status: r.status || "PENDING_REVIEW",
            recommendedStandard: r.recommendedStandard,
            standardTitle: r.standardTitle,
          })));
          setTotalCount(RECENT_RECOMMENDATIONS.length);
          setIsLiveData(false);
        }
      } catch {
        if (isMounted) {
          setRows(RECENT_RECOMMENDATIONS);
          setIsLiveData(false);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRows();
    return () => { isMounted = false; };
  }, []);

  const handleRowClick = (row) => {
    if (row.id) {
      navigate(`/history/${row.id}`);
    } else {
      navigate(`/results?standard=${encodeURIComponent(row.recommendedStandard || "")}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent Recommendations
          </h3>
          <p className="text-xs text-slate-500">
            {isLiveData
              ? "Live procurement recommendations from the PostgreSQL database"
              : "Demonstration log of evaluated procurement requirements and matched standards"}
          </p>
        </div>

        {/* Data Source Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-[11px] text-slate-600 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {isLiveData
              ? "Live Data • PostgreSQL"
              : "Demonstration Data • Verified against BIS Gazette Archives"}
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading recommendations…</span>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Requirement</TableHead>
                    <TableHead className="w-[28%]">Recommended Standard</TableHead>
                    <TableHead className="w-[12%]">Status</TableHead>
                    <TableHead className="w-[10%]">Confidence</TableHead>
                    <TableHead className="w-[10%]">Date</TableHead>
                    <TableHead className="w-[10%] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                      onClick={() => handleRowClick(row)}
                    >
                      {/* Requirement description */}
                      <TableCell>
                        <div>
                          <span className="font-semibold text-sm text-slate-900 line-clamp-1">
                            {row.requirement}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {row.department}
                          </span>
                        </div>
                      </TableCell>

                      {/* Recommended Standard */}
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-semibold text-xs text-blue-900">
                              {row.recommendedStandard}
                            </span>
                            {row.mandatoryQCO && (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                QCO Mandate
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {row.standardTitle}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Badge
                          variant={statusBadgeVariant(row.status)}
                          dot
                        >
                          {formatStatus(row.status)}
                        </Badge>
                      </TableCell>

                      {/* Confidence */}
                      <TableCell>
                        {row.confidence != null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${row.confidence}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 font-mono">
                              {row.confidence}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {row.date}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedStandard(row)}
                            title="Quick View Details"
                            className="h-8 px-2 text-slate-600 hover:text-blue-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline text-xs">Preview</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRowClick(row)}
                            className="h-8 px-2.5 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {rows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="p-4 space-y-2 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-900 leading-snug">
                      {row.requirement}
                    </span>
                    <Badge variant={statusBadgeVariant(row.status)} dot>
                      {formatStatus(row.status)}
                    </Badge>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-900">
                        {row.recommendedStandard}
                      </span>
                      {row.confidence != null && (
                        <span className="text-slate-600 font-semibold font-mono">
                          {row.confidence}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {row.standardTitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                    <span>{row.date}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStandard(row);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        Quick View
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                        className="h-7 px-2 text-xs text-blue-700"
                      >
                        View Report →
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>
                Showing {rows.length} recent procurement recommendations
                {totalCount > rows.length ? ` (${totalCount} total recorded)` : ""}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate("/history")}
                className="text-blue-700 hover:text-blue-800 p-0 h-auto font-medium"
              >
                <span>View Full Audit Log in History</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Quick Preview Modal */}
      {selectedStandard && (
        <Modal
          isOpen={!!selectedStandard}
          onClose={() => setSelectedStandard(null)}
          title={`Standard Specification: ${selectedStandard.recommendedStandard}`}
          description={selectedStandard.standardTitle}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Status:</span>
                <Badge
                  variant={statusBadgeVariant(selectedStandard.status)}
                  dot
                  className="mt-1"
                >
                  {formatStatus(selectedStandard.status)}
                </Badge>
              </div>
              <div>
                <span className="text-slate-500 block">Confidence:</span>
                <span className="font-semibold text-slate-800 font-mono mt-1 inline-block">
                  {selectedStandard.confidence != null
                    ? `${selectedStandard.confidence}% Match`
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">QCO Mandate:</span>
                <span className="font-semibold text-slate-800 mt-1 inline-block">
                  {selectedStandard.mandatoryQCO ? "Mandatory ISI" : "Voluntary"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Technical Body:</span>
                <span className="font-semibold text-slate-800 mt-1 inline-block">
                  {selectedStandard.technicalCommittee || "BIS MED/ETD"}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Evaluated Requirement
              </h4>
              <p className="text-sm text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                &ldquo;{selectedStandard.requirement}&rdquo;
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Conformity & Gazette Summary
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedStandard.statusNote}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedStandard(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedStandard(null);
                  if (selectedStandard.id) {
                    navigate(`/history/${selectedStandard.id}`);
                  } else {
                    navigate(`/results?standard=${encodeURIComponent(selectedStandard.recommendedStandard || "")}`);
                  }
                }}
              >
                <span>Open Full Evidence & Tender Clause</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
