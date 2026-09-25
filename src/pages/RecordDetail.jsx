import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  Download,
  Printer,
  Bookmark,
  ExternalLink,
  BookOpen,
  FileCheck2,
  UserCheck,
  History as HistoryIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { RecordOverview } from "../components/history/RecordOverview";
import { RecordAuditTrail } from "../components/history/RecordAuditTrail";
import { EvidenceList } from "../components/evidence/EvidenceList";
import { EvidenceDrawer } from "../components/evidence/EvidenceDrawer";
import { DecisionSummary } from "../components/review/DecisionSummary";
import { ReviewChecklist } from "../components/review/ReviewChecklist";
import { getHistoryItemById } from "../data/mockHistory";
import { MOCK_EVIDENCE_RECORDS } from "../data/mockEvidence";
import { MOCK_CHECKLIST } from "../data/mockReview";
import { getRecommendation, toggleSaveRecommendation } from "../services/api";

export const RecordDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(() => getHistoryItemById(id));
  const [isLoading, setIsLoading] = useState(true);

  // Tabs state
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Saved toggle
  const [isSaved, setIsSaved] = useState(record?.saved || false);

  // Evidence Drawer state
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  // Review Checklist for Review tab
  const [checklist, setChecklist] = useState(
    MOCK_CHECKLIST.map((item) => ({ ...item, completed: true }))
  );

  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getRecommendation(id)
      .then((data) => {
        if (isMounted && data) {
          setRecord(data);
          setIsSaved(Boolean(data.saved));
        }
      })
      .catch((err) => {
        console.warn("Using fallback record for detail view:", err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleOpenEvidence = (recordOrId) => {
    if (typeof recordOrId === "string") {
      const found =
        MOCK_EVIDENCE_RECORDS.find((rec) => rec.id === recordOrId) ||
        MOCK_EVIDENCE_RECORDS[0];
      setActiveEvidence(found);
    } else if (recordOrId) {
      setActiveEvidence(recordOrId);
    } else {
      setActiveEvidence(MOCK_EVIDENCE_RECORDS[0]);
    }
    setIsEvidenceDrawerOpen(true);
  };

  const handleToggleChecklist = (checkId) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === checkId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleExport = () => {
    showToast("Record export will be connected to the backend.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb and Action Buttons */}
      <div className="space-y-3 pb-3 border-b border-slate-200/80">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/" className="hover:text-blue-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/history" className="hover:text-blue-700 transition-colors">
            History
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-slate-900 font-semibold">{record.id}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate("/history")}
              className="text-xs h-9 font-medium text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>Back to History</span>
            </Button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Recommendation Record
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                  {record.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Created on {record.createdAt} • Evaluated by {record.reviewer}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setIsSaved(!isSaved);
                showToast(isSaved ? "Record removed from saved." : "Record bookmarked as saved.");
              }}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                isSaved
                  ? "bg-amber-50 border-amber-400 text-amber-900"
                  : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
              }`}
              title="Bookmark / Save record"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
            </button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 font-medium text-slate-700"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              <span>Print View</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleExport}
              className="text-xs h-9 font-semibold shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>Export Record</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between gap-3 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
            System Notice
          </span>
        </div>
      )}

      {/* 2. Top Summary Badge Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Recommendation ID
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
              {record.id}
            </span>
          </div>

          <div className="border-l border-slate-200 pl-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Created Date
            </span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {record.createdAt}
            </span>
          </div>

          <div className="border-l border-slate-200 pl-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Review Decision
            </span>
            <div className="mt-1">
              <Badge
                variant={
                  record.status === "Accepted"
                    ? "verified"
                    : record.status === "Not Applicable"
                    ? "withdrawn"
                    : "warning"
                }
                dot
              >
                {record.status}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/results?standard=${encodeURIComponent(record.standard)}`)}
            className="text-xs h-8 text-blue-700 border-blue-200 hover:bg-blue-50"
          >
            <span>Open in Results</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "overview"
              ? "border-blue-700 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("evidence")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "evidence"
              ? "border-blue-700 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Evidence ({MOCK_EVIDENCE_RECORDS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("review")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "review"
              ? "border-blue-700 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Review</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === "audit"
              ? "border-blue-700 text-blue-900"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <HistoryIcon className="w-4 h-4" />
          <span>Audit Trail ({record.auditEvents?.length || 0})</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      <div className="pt-2">
        {activeTab === "overview" && (
          <RecordOverview
            record={record}
            onOpenEvidence={handleOpenEvidence}
          />
        )}

        {activeTab === "evidence" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 block font-semibold">
                  Evidence Citations for {record.standard}
                </strong>
                <span>Inspect verifiable clauses, normative references, and statutory gazette orders.</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate(`/evidence?standard=${encodeURIComponent(record.standard)}`)}
                className="text-xs shrink-0"
              >
                <span>Full Evidence Page</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <EvidenceList
              records={MOCK_EVIDENCE_RECORDS}
              onViewDetails={handleOpenEvidence}
            />
          </div>
        )}

        {activeTab === "review" && (
          <div className="space-y-6">
            <DecisionSummary
              decision={record.status}
              reviewer={record.reviewer}
              date={record.createdAt}
              notes={record.decisionNotes}
              onResetDecision={() => navigate(`/review?standard=${encodeURIComponent(record.standard)}`)}
            />

            <ReviewChecklist
              checklist={checklist}
              onToggleItem={handleToggleChecklist}
              onViewEvidence={handleOpenEvidence}
              onCheckAll={() => setChecklist((prev) => prev.map((i) => ({ ...i, completed: true })))}
              onResetAll={() => setChecklist((prev) => prev.map((i) => ({ ...i, completed: false })))}
            />
          </div>
        )}

        {activeTab === "audit" && (
          <RecordAuditTrail
            auditEvents={record.auditEvents || []}
            standard={record.standard}
          />
        )}
      </div>

      {/* Subtle Trust Notice */}
      <div className="pt-4 border-t border-slate-200/80 text-center">
        <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Audit information records actions performed within NormWise. In the production system, records should be persisted securely and access-controlled.
        </p>
      </div>

      {/* Reusable Evidence Drawer from Phase 5 */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        record={activeEvidence}
      />
    </div>
  );
};
