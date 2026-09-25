import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { RecommendationHeader } from "../components/results/RecommendationHeader";
import { RequirementSummary } from "../components/results/RequirementSummary";
import { RecommendationCard } from "../components/results/RecommendationCard";
import { WhyThisStandard } from "../components/results/WhyThisStandard";
import { CurrentStatusCard } from "../components/results/CurrentStatusCard";
import { CertificationCard } from "../components/results/CertificationCard";
import { AlliedStandards } from "../components/results/AlliedStandards";
import { EvidenceSection } from "../components/results/EvidenceSection";
import { EvidenceDrawer } from "../components/results/EvidenceDrawer";
import { RecommendationSummary } from "../components/results/RecommendationSummary";
import { ProcurementClauseModal } from "../components/results/ProcurementClauseModal";
import { AcceptDialog } from "../components/results/AcceptDialog";
import { ReviewDialog } from "../components/results/ReviewDialog";
import { LowConfidenceState } from "../components/results/LowConfidenceState";
import { NoResultState, ErrorState } from "../components/results/NoResultState";
import { ResultActionBar } from "../components/results/ResultActionBar";
import { getMockResultForQuery } from "../data/mockResults";

export const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve requirement and attributes
  const queryParam = searchParams.get("q") || location.state?.requirementText;
  const passedAttributes = location.state?.attributes;

  // Resolve standard data
  const initialResult = getMockResultForQuery(queryParam || "", passedAttributes);

  // Component state
  const [result, setResult] = useState(initialResult);
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [isClauseModalOpen, setIsClauseModalOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Interaction feedback states
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  // Local audit log array for demonstration
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
    }
  }, [queryParam]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Open evidence drawer
  const handleOpenEvidence = (item) => {
    setActiveEvidence(item);
    setIsEvidenceDrawerOpen(true);
  };

  // Save result
  const handleSaveResult = () => {
    setIsSaved(true);
    const event = {
      action: "result_saved",
      timestamp: new Date().toISOString(),
      standard: result?.recommendedStandard,
    };
    setAuditLog((prev) => [...prev, event]);
    showToast("Result saved to your procurement library.");
  };

  // Accept recommendation
  const handleConfirmAccept = () => {
    setIsAcceptDialogOpen(false);
    setResult((prev) => ({
      ...prev,
      status: "Accepted",
    }));
    const event = {
      action: "recommendation_accepted",
      timestamp: new Date().toISOString(),
      standard: result?.recommendedStandard,
    };
    setAuditLog((prev) => [...prev, event]);
    showToast("Recommendation accepted and recorded in audit history.");
  };

  // Request review
  const handleSubmitReview = (reason) => {
    setIsReviewDialogOpen(false);
    setResult((prev) => ({
      ...prev,
      status: "Under Review",
      reviewRequired: true,
    }));
    const event = {
      action: "review_requested",
      timestamp: new Date().toISOString(),
      standard: result?.recommendedStandard,
      reason,
    };
    setAuditLog((prev) => [...prev, event]);
    showToast("Review requested. Forwarded to compliance officer queue.");
  };

  // Fallback states
  if (hasError) {
    return (
      <div className="py-8">
        <ErrorState
          onRetry={() => setHasError(false)}
          onBack={() => navigate("/recommend")}
        />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="py-8">
        <NoResultState
          onEditRequirement={() => navigate("/recommend")}
          onTryAgain={() => navigate("/recommend")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <RecommendationHeader
        onSaveResult={handleSaveResult}
        isSaved={isSaved}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-150"
        >
          <span>{toastMessage}</span>
          <span className="text-[11px] text-slate-400 font-mono">Recorded</span>
        </div>
      )}

      {/* Top: Requirement Summary Card */}
      <RequirementSummary
        requirement={result.requirement}
        attributes={result.attributes}
      />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Main Recommendation & Evidence Hierarchy */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Primary Recommendation Card */}
          <RecommendationCard result={result} />

          {/* Low Confidence Clarification State (if applicable) */}
          {result.lowConfidenceData && (
            <LowConfidenceState
              lowConfidenceData={result.lowConfidenceData}
              onClarify={() => navigate(`/recommend?q=${encodeURIComponent(result.requirement)}`)}
            />
          )}

          {/* 2. Why This Standard? */}
          <WhyThisStandard
            whyItems={result.whyThisStandard}
            onOpenEvidence={handleOpenEvidence}
          />

          {/* 3. Current Standard Status */}
          <CurrentStatusCard currentness={result.currentness} />

          {/* 4. Certification / Compliance */}
          <CertificationCard
            certification={result.certification}
            onOpenEvidence={handleOpenEvidence}
          />

          {/* 5. Related / Allied Standards */}
          <AlliedStandards
            alliedStandards={result.alliedStandards}
            onViewAll={() => navigate("/evidence")}
          />

          {/* 6. Evidence & Traceability Cards */}
          <EvidenceSection
            evidenceItems={result.evidenceItems}
            onOpenEvidence={handleOpenEvidence}
          />

          {/* Bottom Action Bar */}
          <ResultActionBar
            onEditRequirement={() => navigate(`/recommend?q=${encodeURIComponent(result.requirement)}`)}
            onSaveResult={handleSaveResult}
            onAcceptRecommendation={() => setIsAcceptDialogOpen(true)}
            onRequestReview={() => setIsReviewDialogOpen(true)}
            onGenerateClause={() => setIsClauseModalOpen(true)}
            isSaved={isSaved}
            isAccepted={result.status === "Accepted"}
          />
        </div>

        {/* RIGHT COLUMN: Compact Overview Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <RecommendationSummary result={result} />

          {/* Quick Guidance Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Procurement Next Steps
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600">
              <li>Review the matched standard and edition timeline.</li>
              <li>Verify the certification scheme (ISI mark or CRS) against applicable line ministry orders.</li>
              <li>Generate the procurement specification clause for your tender draft.</li>
              <li>Accept the recommendation to lock it into the departmental audit history.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Trust Notice */}
      <div className="pt-4 border-t border-slate-200/80 text-center">
        <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Recommendation results should be reviewed against the applicable source documents before being used in procurement specifications.
        </p>
      </div>

      {/* Modals and Drawers */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        evidence={activeEvidence}
      />

      <ProcurementClauseModal
        isOpen={isClauseModalOpen}
        onClose={() => setIsClauseModalOpen(false)}
        initialClause={result.procurementClause?.text}
      />

      <AcceptDialog
        isOpen={isAcceptDialogOpen}
        onClose={() => setIsAcceptDialogOpen(false)}
        onConfirm={handleConfirmAccept}
      />

      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
};
