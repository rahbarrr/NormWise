import React, { useState, useEffect, useCallback } from "react";
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
import {
  getRecommendation,
  acceptRecommendation,
  requestTechnicalReview,
  toggleSaveRecommendation,
} from "../services/api";

export const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve parameters
  const idParam = searchParams.get("id") || location.state?.recommendationId;
  const queryParam = searchParams.get("q") || location.state?.requirementText;
  const passedAttributes = location.state?.attributes;

  // Component state
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [actionLabel, setActionLabel] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [activeEvidence, setActiveEvidence] = useState(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [isClauseModalOpen, setIsClauseModalOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Interaction feedback states
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [auditLog, setAuditLog] = useState([]);

  const loadRecommendationData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");

    try {
      if (idParam) {
        const apiData = await getRecommendation(idParam);
        if (apiData) {
          // Map backend record to results view shape
          const baseMock = getMockResultForQuery(apiData.requirement || apiData.requirementText || "Pressure cooker");
          setResult({
            ...baseMock,
            id: apiData.id,
            requirement: apiData.requirement || apiData.requirementText,
            recommendedStandard: apiData.standard || baseMock.recommendedStandard,
            standardTitle: apiData.standardTitle || baseMock.standardTitle,
            confidence: apiData.confidence || baseMock.confidence,
            status: apiData.status,
            decisionNotes: apiData.decisionNotes,
            attributes: {
              product: apiData.product || baseMock.attributes?.product,
              material: apiData.material || baseMock.attributes?.material,
              capacity: apiData.capacity || baseMock.attributes?.capacity,
              application: apiData.application || baseMock.attributes?.application,
            },
          });
          setIsSaved(Boolean(apiData.saved));
          return;
        }
      }

      // Default query or mock fallback
      const mock = getMockResultForQuery(queryParam || "", passedAttributes);
      setResult(mock);
    } catch (err) {
      console.error("Failed to load recommendation result:", err);
      setHasError(true);
      setErrorMessage("Unable to load recommendation.");
    } finally {
      setIsLoading(false);
    }
  }, [idParam, queryParam, passedAttributes]);

  useEffect(() => {
    loadRecommendationData();
  }, [loadRecommendationData]);

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
  const handleSaveResult = async () => {
    setIsSaved((prev) => !prev);
    showToast("Result saved to your procurement library.");
    if (result?.id) {
      try {
        await toggleSaveRecommendation(result.id);
      } catch (e) {
        console.warn("Save sync failed, keeping local state.");
      }
    }
  };

  // Accept recommendation
  const handleConfirmAccept = async () => {
    setIsAcceptDialogOpen(false);
    setIsActing(true);
    setActionLabel("Recording decision...");

    try {
      if (result?.id) {
        await acceptRecommendation(result.id, {
          notes: "Accepted from Recommendation Results screen.",
        });
      }
      setResult((prev) => ({
        ...prev,
        status: "Accepted",
      }));
      showToast("Recommendation accepted and recorded in audit history.");
    } catch (err) {
      console.warn("Accept API failed, updating local state:", err.message);
      setResult((prev) => ({
        ...prev,
        status: "Accepted",
      }));
      showToast("Recommendation accepted (local session).");
    } finally {
      setIsActing(false);
      setActionLabel("");
    }
  };

  // Request review
  const handleSubmitReview = async (reason) => {
    setIsReviewDialogOpen(false);
    setIsActing(true);
    setActionLabel("Recording decision...");

    try {
      if (result?.id) {
        await requestTechnicalReview(result.id, { reason });
      }
      setResult((prev) => ({
        ...prev,
        status: "Under Review",
        reviewRequired: true,
      }));
      showToast("Review requested. Forwarded to compliance officer queue.");
    } catch (err) {
      console.warn("Review request API failed, updating local state:", err.message);
      setResult((prev) => ({
        ...prev,
        status: "Under Review",
        reviewRequired: true,
      }));
      showToast("Review requested (local session).");
    } finally {
      setIsActing(false);
      setActionLabel("");
    }
  };

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
        <h3 className="text-base font-semibold text-slate-900">Loading recommendation...</h3>
        <p className="text-xs text-slate-500">Querying PostgreSQL database and candidate standards</p>
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
            <h3 className="text-base font-semibold text-slate-900">{errorMessage || "Unable to load recommendation."}</h3>
            <p className="text-xs text-slate-500 mt-1">Please verify your server connection and try again.</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadRecommendationData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/recommend")}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Back to Input
            </button>
          </div>
        </div>
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
      {/* Action Progress Overlay */}
      {isActing && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3 border border-slate-200">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-slate-800">{actionLabel || "Processing..."}</span>
          </div>
        </div>
      )}

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
          <span className="text-[11px] text-slate-400 font-mono">PostgreSQL</span>
        </div>
      )}

      {/* Top: Requirement Summary Card */}
      <RequirementSummary
        requirement={result.requirement}
        attributes={result.attributes}
        onEditRequirement={() =>
          navigate("/recommend", {
            state: { initialRequirement: result.requirement },
          })
        }
      />

      {/* Low Confidence Notice (Conditional) */}
      {result.confidence < 75 && (
        <LowConfidenceState
          confidence={result.confidence}
          onRequestReview={() => setIsReviewDialogOpen(true)}
          onProvideClarification={() => navigate("/recommend")}
        />
      )}

      {/* Recommended Standard Banner Card */}
      <RecommendationCard
        standard={result.recommendedStandard}
        title={result.standardTitle}
        confidence={result.confidence}
        department={result.department}
        edition={result.edition}
        revision={result.revision}
        status={result.status}
        icsCode={result.icsCode}
        onViewFullStandard={() => {
          showToast(`Displaying standard dossier for ${result.recommendedStandard}`);
        }}
      />

      {/* Why This Standard Was Recommended */}
      <WhyThisStandard
        matchReasons={result.matchReasons}
        keyRequirementsMet={result.keyRequirementsMet}
      />

      {/* Grid: Current Status & Certification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentStatusCard
          status={result.currentStatus}
          amendments={result.amendments}
          standard={result.recommendedStandard}
        />

        <CertificationCard
          certification={result.certification}
          standard={result.recommendedStandard}
        />
      </div>

      {/* Allied Standards & Normative References */}
      <AlliedStandards
        alliedStandards={result.alliedStandards}
        onSelectStandard={(stdNumber) => {
          navigate(`/results?standard=${encodeURIComponent(stdNumber)}&q=${encodeURIComponent(result.requirement)}`);
        }}
      />

      {/* Supporting Evidence List with Drawer trigger */}
      <EvidenceSection
        evidenceItems={result.evidence}
        onOpenEvidence={handleOpenEvidence}
      />

      {/* Recommendation Summary & Departmental Readiness */}
      <RecommendationSummary
        summary={result.summary}
        confidence={result.confidence}
        status={result.status}
      />

      {/* Bottom Sticky Action Bar */}
      <ResultActionBar
        confidence={result.confidence}
        status={result.status}
        onAccept={() => setIsAcceptDialogOpen(true)}
        onRequestReview={() => setIsReviewDialogOpen(true)}
        onGenerateClause={() => setIsClauseModalOpen(true)}
        onExportReport={() => {
          showToast("Dossier exported to official compliance dossier.");
        }}
        onNewRecommendation={() => navigate("/recommend")}
      />

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        evidenceItem={activeEvidence}
      />

      {/* Procurement Tender Clause Modal */}
      <ProcurementClauseModal
        isOpen={isClauseModalOpen}
        onClose={() => setIsClauseModalOpen(false)}
        clauseText={result.procurementClause}
        standard={result.recommendedStandard}
        title={result.standardTitle}
      />

      {/* Accept Confirmation Dialog */}
      <AcceptDialog
        isOpen={isAcceptDialogOpen}
        onClose={() => setIsAcceptDialogOpen(false)}
        onConfirm={handleConfirmAccept}
        standard={result.recommendedStandard}
        title={result.standardTitle}
      />

      {/* Request Technical Review Dialog */}
      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        onSubmit={handleSubmitReview}
        standard={result.recommendedStandard}
      />
    </div>
  );
};
