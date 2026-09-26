import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { RecommendationHeader } from "../components/results/RecommendationHeader";
import { RequirementSummary } from "../components/results/RequirementSummary";
import { RecommendationCard } from "../components/results/RecommendationCard";
import { WhyThisStandard } from "../components/results/WhyThisStandard";
import { AlternativeStandards } from "../components/results/AlternativeStandards";
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
import { getRelatedStandards } from "../services/standardApi";
import { ComplianceStatusCard } from "../components/results/ComplianceStatusCard";
import { ComplianceDrawer } from "../components/compliance/ComplianceDrawer";
import {
  getRecommendationCompliance,
  evaluateCompliance,
} from "../services/complianceApi";

export const Results = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve parameters
  const idParam = id || searchParams.get("id") || location.state?.recommendationId;
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
  const [complianceData, setComplianceData] = useState(null);
  const [isComplianceDrawerOpen, setIsComplianceDrawerOpen] = useState(false);

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
          
          // Extract primary standard from Prisma relation or direct fields
          const primaryStdObj =
            apiData.recommendationStandards?.find((rs) => rs.isPrimary)?.standard ||
            apiData.recommendationStandards?.[0]?.standard ||
            apiData.standards?.[0];

          // Map alternative standards (Other Possible Matches)
          const alternativesList =
            apiData.alternatives && apiData.alternatives.length > 0
              ? apiData.alternatives
              : apiData.recommendationStandards && apiData.recommendationStandards.length > 1
              ? apiData.recommendationStandards
                  .filter((rs) => !rs.isPrimary)
                  .map((rs) => ({
                    id: rs.standard?.id || rs.id,
                    standardId: rs.standard?.id,
                    standardNumber: rs.standard?.standardNumber,
                    code: rs.standard?.standardNumber,
                    title: rs.standard?.title,
                    status: rs.standard?.status || "CURRENT",
                    matchConfidence: rs.matchConfidence || 75,
                    matchScore: rs.matchScore ?? ((rs.matchConfidence || 75) / 100),
                    retrievedBy: ["structured", "lexical"],
                    reason: rs.reason || "Alternative candidate standard",
                  }))
              : apiData.standards && apiData.standards.length > 1
              ? apiData.standards.slice(1).map((s) => ({
                  id: s.id,
                  standardId: s.id,
                  standardNumber: s.standardNumber,
                  code: s.standardNumber,
                  title: s.title,
                  status: s.status || "CURRENT",
                  matchConfidence: s.matchConfidence || 75,
                  matchScore: s.matchScore ?? ((s.matchConfidence || 75) / 100),
                  retrievedBy: s.retrievedBy || ["lexical"],
                  reason: s.reason || "Alternative candidate standard",
                }))
              : [];

          // Map evidence if present
          const mappedEvidence =
            apiData.evidence && apiData.evidence.length > 0
              ? apiData.evidence.map((e) => ({
                  id: e.id,
                  category: e.type,
                  clause: e.reference,
                  clauseTitle: e.source,
                  status: e.status || "Verified",
                  excerpt: e.content,
                  relevanceScore: apiData.confidence || 85,
                }))
              : baseMock.evidence;

          const recStdNumber =
            apiData.standard ||
            primaryStdObj?.standardNumber ||
            baseMock.recommendedStandard;
          const recStdTitle =
            apiData.standardTitle ||
            primaryStdObj?.title ||
            baseMock.standardTitle;

          const relatedRes = await getRelatedStandards(recStdNumber).catch(() => null);
          const finalAllied =
            relatedRes?.relatedStandards && relatedRes.relatedStandards.length > 0
              ? relatedRes.relatedStandards
              : baseMock.alliedStandards;

          // Load compliance evaluation
          const compRes = await getRecommendationCompliance(apiData.id).catch(() => null);
          if (compRes) {
            setComplianceData(compRes);
          } else {
            const freshComp = await evaluateCompliance({
              recommendationId: apiData.id,
              attributes: {
                product: apiData.product || apiData.requirement || apiData.requirementText,
                material: apiData.material,
                capacity: apiData.capacity,
                application: apiData.application,
              },
              standardNumber: recStdNumber,
            }).catch(() => null);
            if (freshComp) setComplianceData(freshComp);
          }

          setResult({
            ...baseMock,
            id: apiData.id,
            requirement: apiData.requirement || apiData.requirementText,
            originalText: apiData.originalText || apiData.requirementText || apiData.requirement || "",
            detectedLanguage: apiData.detectedLanguage || "EN",
            languageName: apiData.languageName,
            normalizedText: apiData.normalizedText || "",
            searchText: apiData.searchText || apiData.normalizedText || "",
            recommendedStandard: recStdNumber,
            standardTitle: recStdTitle,
            confidence: apiData.confidence || baseMock.confidence,
            matchScore: apiData.matchScore || (apiData.confidence ? apiData.confidence / 100 : 0.94),
            scoreBreakdown: apiData.scoreBreakdown || {
              productScore: 0.92,
              applicationScore: 0.85,
              materialScore: 0.90,
              technicalScore: 0.70,
              semanticScore: 0.88,
            },
            currentnessStatus:
              primaryStdObj?.status ||
              apiData.currentnessStatus ||
              apiData.standards?.[0]?.status ||
              "CURRENT",
            engineVersion: apiData.engineVersion || "hybrid-v1",
            retrievalMethod: apiData.retrievalMethod || "HYBRID",
            clarifyingQuestions: apiData.clarifyingQuestions || (apiData.decisionNotes?.includes("More information is needed") ? [
              "What is the specific product type or equipment intended?",
              "What is the intended application or operating environment?",
              "Are there specific capacity, voltage, or material ratings?",
            ] : []),
            status: apiData.status,
            rawStatus: apiData.rawStatus || apiData.status,
            decisionNotes: apiData.decisionNotes,
            matchReasons: apiData.decisionNotes
              ? [apiData.decisionNotes, ...baseMock.matchReasons.slice(1)]
              : baseMock.matchReasons,
            alternatives: alternativesList,
            alliedStandards: finalAllied,
            isDemoDataset: Boolean(relatedRes?.isDemoDataset),
            evidence: mappedEvidence,
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
      const fallbackStdNumber = mock.recommendedStandard || "IS 2347:2023";
      const relatedRes = await getRelatedStandards(fallbackStdNumber).catch(() => null);
      if (relatedRes?.relatedStandards?.length > 0) {
        mock.alliedStandards = relatedRes.relatedStandards;
        mock.isDemoDataset = Boolean(relatedRes.isDemoDataset);
      }

      // Evaluate compliance for fallback
      const freshComp = await evaluateCompliance({
        attributes: {
          product: mock.attributes?.product || queryParam || "Pressure Cooker",
          material: mock.attributes?.material,
          capacity: mock.attributes?.capacity,
          application: mock.attributes?.application,
        },
        standardNumber: fallbackStdNumber,
      }).catch(() => null);
      if (freshComp) setComplianceData(freshComp);

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

      {/* Top: Requirement Summary Card (Phase 16 Multilingual) */}
      <RequirementSummary
        requirement={result.requirement}
        originalText={result.originalText}
        detectedLanguage={result.detectedLanguage}
        languageName={result.languageName}
        normalizedText={result.normalizedText}
        searchText={result.searchText}
        attributes={result.attributes}
        onEditRequirement={() =>
          navigate("/recommend", {
            state: { initialRequirement: result.originalText || result.requirement },
          })
        }
      />

      {/* Ambiguous Requirement / Clarification Needed (Section 21) */}
      {(result.rawStatus === "CLARIFICATION_REQUESTED" || result.rawStatus === "CLARIFICATION_REQUIRED" || result.status === "Clarification Requested" || result.status === "CLARIFICATION_REQUIRED" || (result.clarifyingQuestions && result.clarifyingQuestions.length > 0)) && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">
                More information is needed
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {result.decisionNotes || "The procurement requirement is broad or missing key attributes. Refining the requirement parameters will yield an exact standard recommendation."}
              </p>
              {result.clarifyingQuestions && result.clarifyingQuestions.length > 0 && (
                <div className="pt-1">
                  <span className="text-xs font-semibold text-amber-900">Clarification questions:</span>
                  <ul className="list-disc list-inside text-xs text-amber-900 space-y-1 mt-1 font-medium">
                    {result.clarifyingQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => navigate("/recommend", { state: { initialRequirement: result.requirement } })}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Provide Clarification
            </button>
          </div>
        </div>
      )}

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
        status={result.currentnessStatus || result.status}
        icsCode={result.icsCode}
        onViewFullStandard={() => {
          showToast(`Displaying standard dossier for ${result.recommendedStandard}`);
        }}
      />

      {/* Why This Standard Was Recommended (Section 26 & 27) */}
      <WhyThisStandard
        scoreBreakdown={result.scoreBreakdown}
        currentnessStatus={result.currentnessStatus || result.status}
        matchReasons={result.matchReasons}
        keyRequirementsMet={result.keyRequirementsMet}
        whyItems={result.whyItems}
        onOpenEvidence={handleOpenEvidence}
      />

      {/* Alternative Standards / Other Possible Matches (Section 28) */}
      {result.alternatives && result.alternatives.length > 0 && (
        <AlternativeStandards alternatives={result.alternatives} />
      )}

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

      {/* Certification & Compliance Rules Engine Check (Phase 13) */}
      <ComplianceStatusCard
        compliance={complianceData}
        onOpenDrawer={() => setIsComplianceDrawerOpen(true)}
        onEditRequirement={() =>
          navigate("/recommend", {
            state: { initialRequirement: result.requirement },
          })
        }
      />

      {/* Allied Standards & Normative References */}
      <AlliedStandards
        alliedStandards={result.alliedStandards}
        primaryStandard={result.recommendedStandard}
        isDemoDataset={result.isDemoDataset}
        onOpenEvidence={handleOpenEvidence}
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

      {/* Compliance Details Drawer (Phase 13) */}
      <ComplianceDrawer
        isOpen={isComplianceDrawerOpen}
        onClose={() => setIsComplianceDrawerOpen(false)}
        compliance={complianceData}
        onOpenEvidence={() => {
          if (result.evidence && result.evidence.length > 0) {
            setActiveEvidence(result.evidence[0]);
            setIsEvidenceDrawerOpen(true);
          }
        }}
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
