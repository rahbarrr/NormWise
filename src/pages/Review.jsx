import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
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

export const Review = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const standardParam = searchParams.get("standard") || MOCK_REVIEW_DATA.standard;
  const initialActionParam = searchParams.get("action");

  // State
  const [reviewData, setReviewData] = useState({
    ...MOCK_REVIEW_DATA,
    standard: standardParam,
  });
  const [status, setStatus] = useState("Pending Review");
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [auditEvents, setAuditEvents] = useState(MOCK_INITIAL_AUDIT_EVENTS);
  const [decisionDetails, setDecisionDetails] = useState(null);

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
      .padStart(2, "0")} (Demo timestamp)`;
  };

  // Save Notes handler
  const handleSaveNotes = (notesText) => {
    setReviewerNotes(notesText);
    setHasUnsavedChanges(false);

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
    showToast("Review notes saved");
  };

  // Accept Recommendation handler
  const handleConfirmAccept = () => {
    setStatus("Accepted");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Accepted",
      date: getDemoTime(),
    });

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Recommendation accepted",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Formal procurement acceptance recorded for ${reviewData.standard}.`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast("Recommendation accepted and recorded.");
  };

  // Technical Review handler
  const handleSubmitTechnicalReview = ({ reason }) => {
    setStatus("Under Technical Review");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Under Technical Review",
      reason,
      date: getDemoTime(),
    });

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Technical review requested",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Referred to technical committee. Rationale: "${reason}"`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast("Technical review request recorded");
  };

  // Clarification handler
  const handleSubmitClarification = ({ category, question }) => {
    setStatus("Clarification Requested");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Clarification Requested",
      category,
      question,
      date: getDemoTime(),
    });

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Clarification requested",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Information requested [${category}]: "${question}"`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast("Clarification request recorded");
  };

  // Mark Not Applicable handler
  const handleSubmitNotApplicable = ({ reason, explanation }) => {
    setStatus("Not Applicable");
    setHasUnsavedChanges(false);
    setDecisionDetails({
      decision: "Not Applicable",
      reason,
      explanation,
      date: getDemoTime(),
    });

    const newEvent = {
      id: `evt-${Date.now()}`,
      action: "Marked not applicable",
      actor: MOCK_REVIEWER.name,
      time: getDemoTime(),
      details: `Non-applicable determination (${reason}): "${explanation}"`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
    showToast("Decision recorded: Standard marked not applicable.");
  };

  // Navigation guard
  const handleGuardedNavigate = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigationPath(path);
      setIsUnsavedOpen(true);
    } else {
      navigate(path);
    }
  };

  const completedChecklistCount = checklist.filter((i) => i.completed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb, ID, and Status */}
      <ReviewHeader
        recommendationId={reviewData.recommendationId}
        status={status}
        onBack={() => handleGuardedNavigate("/results")}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between gap-3 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
            Recorded
          </span>
        </div>
      )}

      {/* 2. Review Status Bar (Workflow Governance) */}
      <ReviewStatusBar currentStatus={status} />

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Main Recommendation, Checklist, Notes, Actions, Audit */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recommendation Summary Card */}
          <RecommendationReviewCard
            standard={reviewData.standard}
            title={reviewData.title}
            confidence={reviewData.confidence}
            status={reviewData.status}
            edition={reviewData.edition}
            amendment={reviewData.amendment}
            application={reviewData.application}
            onViewEvidence={() => handleOpenEvidence("EV-001")}
          />

          {/* Decision Summary Card (visible once a decision is recorded) */}
          {status !== "Pending Review" && (
            <DecisionSummary
              decision={status}
              reviewer={MOCK_REVIEWER.name}
              date={decisionDetails?.date || "Demo Timestamp"}
              notes={reviewerNotes}
              details={decisionDetails}
              onResetDecision={() => setStatus("Pending Review")}
            />
          )}

          {/* Low Confidence State Banner */}
          {reviewData.confidence < 75 && (
            <ReviewWarning
              type="low-confidence"
              onViewEvidence={() => handleOpenEvidence("EV-001")}
              onRequestClarification={() => setIsClarificationOpen(true)}
            />
          )}

          {/* Review Checklist Section */}
          <ReviewChecklist
            checklist={checklist}
            onToggleItem={handleToggleChecklist}
            onViewEvidence={handleOpenEvidence}
            onCheckAll={handleCheckAll}
            onResetAll={handleResetChecklist}
          />

          {/* Reviewer Notes Section */}
          <ReviewerNotes
            notes={reviewerNotes}
            onSaveNotes={handleSaveNotes}
          />

          {/* Need Clarification Section */}
          <ClarificationPrompt
            onRequestClarification={() => setIsClarificationOpen(true)}
          />

          {/* Related Standards Review Section */}
          <RelatedStandardsReview
            relatedStandards={MOCK_RELATED_STANDARDS_REVIEW}
            onViewEvidence={handleOpenEvidence}
          />

          {/* Audit Trail Vertical Timeline */}
          <AuditTimeline events={auditEvents} />

          {/* Subtle Bottom Trust Notice */}
          <div className="pt-4 border-t border-slate-200/80 text-center">
            <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
              NormWise supports the reviewer. It does not replace the reviewer. All review determinations and technical sign-offs must be verified against authorized BIS gazette notifications prior to tender release.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Review Decision Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <ReviewDecisionPanel
            status={status}
            checklistCompleted={completedChecklistCount}
            checklistTotal={checklist.length}
            evidenceCount={MOCK_EVIDENCE_RECORDS.length}
            confidence={reviewData.confidence}
            onAccept={() => setIsAcceptOpen(true)}
            onRequestTechnicalReview={() => setIsTechnicalReviewOpen(true)}
            onRequestClarification={() => setIsClarificationOpen(true)}
            onMarkNotApplicable={() => setIsNotApplicableOpen(true)}
          />

          {/* Reviewer Officer Information Card */}
          <ReviewerCard
            name={MOCK_REVIEWER.name}
            role={MOCK_REVIEWER.role}
            organization={MOCK_REVIEWER.organization}
            status={MOCK_REVIEWER.status}
          />

          {/* Procurement Officer Guidance */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Governance Guidance
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-slate-600">
              <li>
                <strong>Scope verification:</strong> Ensure pressure cooker capacity and pressure thresholds match the tender lot.
              </li>
              <li>
                <strong>Dual approvals:</strong> Check whether local municipal bylaws require PESO or factory inspector approvals alongside ISI mark.
              </li>
              <li>
                <strong>Auditable sign-off:</strong> Accepted recommendations lock the specification into the permanent digital dossier.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <AcceptRecommendationDialog
        isOpen={isAcceptOpen}
        onClose={() => setIsAcceptOpen(false)}
        onConfirmAccept={handleConfirmAccept}
        standard={reviewData.standard}
        confidence={reviewData.confidence}
        checklistCompleted={completedChecklistCount}
        checklistTotal={checklist.length}
        evidenceReviewed={MOCK_EVIDENCE_RECORDS.length}
        evidenceTotal={MOCK_EVIDENCE_RECORDS.length}
      />

      <TechnicalReviewDialog
        isOpen={isTechnicalReviewOpen}
        onClose={() => setIsTechnicalReviewOpen(false)}
        onSubmitTechnicalReview={handleSubmitTechnicalReview}
      />

      <ClarificationDialog
        isOpen={isClarificationOpen}
        onClose={() => setIsClarificationOpen(false)}
        onSubmitClarification={handleSubmitClarification}
      />

      <NotApplicableDialog
        isOpen={isNotApplicableOpen}
        onClose={() => setIsNotApplicableOpen(false)}
        onSubmitNotApplicable={handleSubmitNotApplicable}
      />

      <UnsavedChangesDialog
        isOpen={isUnsavedOpen}
        onStay={() => {
          setIsUnsavedOpen(false);
          setPendingNavigationPath(null);
        }}
        onLeave={() => {
          setIsUnsavedOpen(false);
          setHasUnsavedChanges(false);
          if (pendingNavigationPath) {
            navigate(pendingNavigationPath);
          }
        }}
      />

      {/* Reused Evidence Drawer from Phase 5 */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        record={activeEvidence}
      />
    </div>
  );
};
