import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation, useParams } from "react-router-dom";
import { ReviewHeader } from "../components/review/ReviewHeader";
import { ReviewStatusBar } from "../components/review/ReviewStatusBar";
import { RecommendationReviewCard } from "../components/review/RecommendationReviewCard";
import { ReviewChecklist } from "../components/review/ReviewChecklist";
import { ReviewerNotes } from "../components/review/ReviewerNotes";
import { ClarificationPrompt } from "../components/review/ClarificationPrompt";
import { ClarificationDialog } from "../components/review/ClarificationDialog";
import { TechnicalReviewDialog } from "../components/review/TechnicalReviewDialog";
import { AcceptRecommendationDialog } from "../components/review/AcceptRecommendationDialog";
import { NotApplicableDialog } from "../components/review/NotApplicableDialog";
import { DecisionSummary } from "../components/review/DecisionSummary";
import { AuditTimeline } from "../components/review/AuditTimeline";
import { ReviewerCard } from "../components/review/ReviewerCard";
import { ReviewDecisionPanel } from "../components/review/ReviewDecisionPanel";
import { ReviewWarning } from "../components/review/ReviewWarning";
import { UnsavedChangesDialog } from "../components/review/UnsavedChangesDialog";
import { RelatedStandardsReview } from "../components/review/RelatedStandardsReview";
import { EvidenceDrawer } from "../components/evidence/EvidenceDrawer";

import {
  MOCK_REVIEW_DATA,
  MOCK_REVIEWER,
  MOCK_CHECKLIST,
  MOCK_INITIAL_AUDIT_EVENTS,
  MOCK_RELATED_STANDARDS_REVIEW,
} from "../data/mockReview";
import { MOCK_EVIDENCE_RECORDS } from "../data/mockEvidence";
import {
  getRecommendation,
  getReview,
  updateReview,
  acceptRecommendation,
  requestTechnicalReview,
  requestClarification,
  markNotApplicable,
  getAuditEvents,
} from "../services/api";

export const Review = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const idParam = id || searchParams.get("id") || "REC-2026-0842";
  const standardParam = searchParams.get("standard") || MOCK_REVIEW_DATA.standard;
  const initialActionParam = searchParams.get("action");

  // State
  const [reviewData, setReviewData] = useState({
    ...MOCK_REVIEW_DATA,
    id: idParam,
    standard: standardParam,
  });
  const [status, setStatus] = useState("Pending Review");
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [auditEvents, setAuditEvents] = useState(MOCK_INITIAL_AUDIT_EVENTS);
  const [decisionDetails, setDecisionDetails] = useState(null);

  // Loading & Async action states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState("");
  const [hasError, setHasError] = useState(false);

  // Dialog & Drawer Visibility
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isTechnicalReviewOpen, setIsTechnicalReviewOpen] = useState(false);
  const [isClarificationOpen, setIsClarificationOpen] = useState(false);
  const [isNotApplicableOpen, setIsNotApplicableOpen] = useState(false);
  const [isUnsavedOpen, setIsUnsavedOpen] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState(null);

  // Evidence Drawer state
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Fetch review from backend
  const loadReviewFromBackend = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const rec = await getRecommendation(idParam);
      if (rec) {
        setReviewData((prev) => ({
          ...prev,
          id: rec.id,
          requirement: rec.requirement || rec.requirementText || prev.requirement,
          standard: rec.standard || prev.standard,
          standardTitle: rec.standardTitle || prev.standardTitle,
          confidence: rec.confidence || prev.confidence,
        }));
        setStatus(rec.status || "Pending Review");

        if (rec.decisionNotes) {
          setReviewerNotes(rec.decisionNotes);
        }

        // Check if there are review records
        if (rec.review) {
          if (rec.review.notes) setReviewerNotes(rec.review.notes);
          if (rec.review.checklist && rec.review.checklist.length > 0) {
            setChecklist(
              rec.review.checklist.map((c) => ({
                id: c.itemKey || c.id,
                label: c.label,
                completed: Boolean(c.completed),
              }))
            );
          }
        }

        // Audit events from backend
        if (rec.auditEvents && rec.auditEvents.length > 0) {
          setAuditEvents(
            rec.auditEvents.map((e) => ({
              id: e.id,
              action: e.action,
              actor: e.actor || "System User",
              time: e.timestamp,
              details: e.details,
            }))
          );
        }
      }
    } catch (err) {
      console.warn("Using local review data fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [idParam]);

  useEffect(() => {
    loadReviewFromBackend();
  }, [loadReviewFromBackend]);

  // Trigger action if passed in query param
  useEffect(() => {
    if (initialActionParam === "accept") {
      setIsAcceptOpen(true);
    } else if (initialActionParam === "request_review") {
      setIsTechnicalReviewOpen(true);
    }
  }, [initialActionParam]);

  // Open Evidence Drawer helper
  const handleOpenEvidence = (evidenceIdOrRecord) => {
    if (typeof evidenceIdOrRecord === "string") {
      const found =
        MOCK_EVIDENCE_RECORDS.find((rec) => rec.id === evidenceIdOrRecord) ||
        MOCK_EVIDENCE_RECORDS[0];
      setActiveEvidence(found);
    } else if (evidenceIdOrRecord) {
      setActiveEvidence(evidenceIdOrRecord);
    } else {
      setActiveEvidence(MOCK_EVIDENCE_RECORDS[0]);
    }
    setIsEvidenceDrawerOpen(true);
  };

  // Checklist toggles
  const handleToggleChecklist = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleCheckAll = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, completed: true })));
    setHasUnsavedChanges(true);
  };

  const handleResetChecklist = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, completed: false })));
    setHasUnsavedChanges(true);
  };

  // Helper to format demo timestamp
  const getDemoTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")} (Recorded)`;
  };

  // Save Notes handler with API persistence
  const handleSaveNotes = async (notesText) => {
    setReviewerNotes(notesText);
    setHasUnsavedChanges(false);
    setIsSaving(true);
    setSavingLabel("Saving review...");

    try {
      await updateReview(idParam, {
        notes: notesText,
        checklist: checklist.map((c) => ({
          itemKey: c.id,
          label: c.label,
          completed: c.completed,
        })),
      });
      showToast("Review notes saved to PostgreSQL database.");
    } catch (err) {
      console.warn("Review update API failed, kept local:", err.message);
      showToast("Review notes saved locally.");
    } finally {
      setIsSaving(false);
      setSavingLabel("");
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Reviewer note added",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Notes updated: "${notesText.slice(0, 80)}${
        notesText.length > 80 ? "..." : ""
      }"`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  // Accept Recommendation handler
  const handleConfirmAccept = async () => {
    setIsAcceptOpen(false);
    setStatus("Accepted");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Accepted",
      date: getDemoTime(),
    });
    setIsSaving(true);
    setSavingLabel("Recording decision...");

    try {
      await acceptRecommendation(idParam, {
        notes: reviewerNotes || "Accepted by technical reviewer.",
      });
      showToast("Recommendation accepted and recorded in PostgreSQL audit trail.");
    } catch (err) {
      console.warn("Accept API failed:", err.message);
      showToast("Recommendation accepted (local session).");
    } finally {
      setIsSaving(false);
      setSavingLabel("");
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Recommendation accepted",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Formal procurement acceptance recorded for ${reviewData.standard}.`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  // Technical Review handler
  const handleSubmitTechnicalReview = async ({ reason }) => {
    setIsTechnicalReviewOpen(false);
    setStatus("Under Technical Review");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Under Technical Review",
      reason,
      date: getDemoTime(),
    });
    setIsSaving(true);
    setSavingLabel("Recording decision...");

    try {
      await requestTechnicalReview(idParam, { reason });
      showToast("Technical review request recorded in PostgreSQL audit trail.");
    } catch (err) {
      console.warn("Technical review API failed:", err.message);
      showToast("Technical review request recorded (local session).");
    } finally {
      setIsSaving(false);
      setSavingLabel("");
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Technical review requested",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Referred to technical committee. Rationale: "${reason}"`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  // Clarification handler
  const handleSubmitClarification = async ({ category, question }) => {
    setIsClarificationOpen(false);
    setStatus("Clarification Requested");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Clarification Requested",
      category,
      question,
      date: getDemoTime(),
    });
    setIsSaving(true);
    setSavingLabel("Recording decision...");

    try {
      await requestClarification(idParam, { category, question });
      showToast("Clarification requested and recorded in PostgreSQL audit trail.");
    } catch (err) {
      console.warn("Clarification API failed:", err.message);
      showToast("Clarification requested (local session).");
    } finally {
      setIsSaving(false);
      setSavingLabel("");
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Clarification requested",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Requested [${category}]: "${question}"`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  // Not Applicable handler
  const handleSubmitNotApplicable = async ({ reason, explanation }) => {
    setIsNotApplicableOpen(false);
    setStatus("Not Applicable");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Not Applicable",
      reason,
      explanation,
      date: getDemoTime(),
    });
    setIsSaving(true);
    setSavingLabel("Recording decision...");

    try {
      await markNotApplicable(idParam, { reason, explanation });
      showToast("Determination recorded in PostgreSQL audit trail.");
    } catch (err) {
      console.warn("Not applicable API failed:", err.message);
      showToast("Determination recorded (local session).");
    } finally {
      setIsSaving(false);
      setSavingLabel("");
    }

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Marked not applicable",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Non-applicable determination: ${reason} — ${explanation}`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  // Navigation guard
  const handleProtectedNavigate = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigationPath(path);
      setIsUnsavedOpen(true);
    } else {
      navigate(path);
    }
  };

  const handleDiscardAndLeave = () => {
    setHasUnsavedChanges(false);
    setIsUnsavedOpen(false);
    if (pendingNavigationPath) {
      navigate(pendingNavigationPath);
    }
  };

  const isCompletedChecklist = checklist.every((item) => item.completed);

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 animate-spin">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">Loading review...</h3>
        <p className="text-xs text-slate-500">Retrieving recommendation verification dossier and checklist</p>
      </div>
    );
  }

  // Error State
  if (hasError) {
    return (
      <div className="py-8">
        <div className="max-w-xl mx-auto rounded-2xl border border-red-200 bg-red-50/50 p-10 text-center shadow-xs space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Unable to load review.</h3>
            <p className="text-xs text-slate-500 mt-1">Please verify your server and database connection.</p>
          </div>
          <button
            onClick={loadReviewFromBackend}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 pb-16">
      {/* Saving / Recording Overlay */}
      {isSaving && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3 border border-slate-200">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-slate-800">{savingLabel || "Saving..."}</span>
          </div>
        </div>
      )}

      {/* 1. Header with Breadcrumb, Status, and Meta */}
      <ReviewHeader
        reviewData={reviewData}
        status={status}
        onBack={() => handleProtectedNavigate("/results")}
      />

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
            PostgreSQL DB
          </span>
        </div>
      )}

      {/* 2. Sticky / Top Status Bar */}
      <ReviewStatusBar
        status={status}
        confidence={reviewData.confidence}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* 3. Decision Summary Banner (Shows once decided) */}
      <DecisionSummary
        status={status}
        decisionDetails={decisionDetails}
        onReset={() => {
          setStatus("Pending Review");
          setDecisionDetails(null);
          showToast("Status returned to Pending Review");
        }}
      />

      {/* 4. Recommendation Review Card */}
      <RecommendationReviewCard
        reviewData={reviewData}
        onOpenEvidence={handleOpenEvidence}
      />

      {/* 5. Warning / Attention Box */}
      <ReviewWarning
        warning="This standard is subject to the Domestic Pressure Cooker (Quality Control) Order. Verification of mandatory Scheme-I ISI marking is required for public procurement tenders."
      />

      {/* 6. Main 2-Column Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Checklist & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Verification Checklist */}
          <ReviewChecklist
            checklist={checklist}
            onToggleItem={handleToggleChecklist}
            onCheckAll={handleCheckAll}
            onReset={handleResetChecklist}
          />

          {/* Reviewer Notes & Decision Rationale */}
          <ReviewerNotes
            initialNotes={reviewerNotes}
            onSaveNotes={handleSaveNotes}
          />

          {/* Related Standards Quick Review */}
          <RelatedStandardsReview
            relatedStandards={MOCK_RELATED_STANDARDS_REVIEW}
            onOpenEvidence={handleOpenEvidence}
          />

          {/* Clarification Trigger Section */}
          <ClarificationPrompt
            onRequestClarification={() => setIsClarificationOpen(true)}
          />
        </div>

        {/* Right Column: Reviewer Info, Decision Controls, Audit Log */}
        <div className="space-y-6">
          {/* Reviewer Meta Card */}
          <ReviewerCard reviewer={MOCK_REVIEWER} />

          {/* Decision Panel */}
          <ReviewDecisionPanel
            status={status}
            isChecklistComplete={isCompletedChecklist}
            onAccept={() => setIsAcceptOpen(true)}
            onRequestTechnicalReview={() => setIsTechnicalReviewOpen(true)}
            onRequestClarification={() => setIsClarificationOpen(true)}
            onMarkNotApplicable={() => setIsNotApplicableOpen(true)}
          />

          {/* Audit History Timeline */}
          <AuditTimeline events={auditEvents} />
        </div>
      </div>

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        record={activeEvidence}
      />

      {/* Modals & Dialogs */}
      <AcceptRecommendationDialog
        isOpen={isAcceptOpen}
        onClose={() => setIsAcceptOpen(false)}
        onConfirm={handleConfirmAccept}
        standard={reviewData.standard}
        title={reviewData.standardTitle}
      />

      <TechnicalReviewDialog
        isOpen={isTechnicalReviewOpen}
        onClose={() => setIsTechnicalReviewOpen(false)}
        onSubmit={handleSubmitTechnicalReview}
        standard={reviewData.standard}
      />

      <ClarificationDialog
        isOpen={isClarificationOpen}
        onClose={() => setIsClarificationOpen(false)}
        onSubmit={handleSubmitClarification}
      />

      <NotApplicableDialog
        isOpen={isNotApplicableOpen}
        onClose={() => setIsNotApplicableOpen(false)}
        onSubmit={handleSubmitNotApplicable}
        standard={reviewData.standard}
      />

      <UnsavedChangesDialog
        isOpen={isUnsavedOpen}
        onClose={() => setIsUnsavedOpen(false)}
        onDiscard={handleDiscardAndLeave}
      />
    </div>
  );
};
