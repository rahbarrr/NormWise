import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { AnalysisHeader } from "../components/analysis/AnalysisHeader";
import { AnalysisWorkflow } from "../components/analysis/AnalysisWorkflow";
import { AnalysisDetails } from "../components/analysis/AnalysisDetails";
import { AnalysisSidebar } from "../components/analysis/AnalysisSidebar";
import { CancelAnalysisDialog } from "../components/analysis/CancelAnalysisDialog";
import { AnalysisComplete } from "../components/analysis/AnalysisComplete";
import { AnalysisError } from "../components/analysis/AnalysisError";
import { Button } from "../components/ui/Button";
import { FileQuestion, ArrowRight } from "lucide-react";
import { getAnalysisDataForQuery } from "../data/mockAnalysis";
import { getRecommendation, runRecommendationEngine } from "../services/api";

export const Analyze = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve submitted requirement from URL query or location state
  const queryParam = searchParams.get("q") || location.state?.requirementText;
  const passedAttributes = location.state?.attributes;
  const recIdFromParam = searchParams.get("id") || location.state?.recommendationId;

  // Real backend record state
  const [resolvedRecord, setResolvedRecord] = useState(location.state?.apiResult || null);
  const [activeRecId, setActiveRecId] = useState(recIdFromParam);

  // Fallback preset data
  const fallbackAnalysisData = useMemo(
    () => getAnalysisDataForQuery(queryParam || "", passedAttributes),
    [queryParam, passedAttributes]
  );

  // Workflow states
  const [currentStage, setCurrentStage] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 1. Fetch real recommendation if ID exists but full result not in state
  useEffect(() => {
    let isMounted = true;
    if (activeRecId && !resolvedRecord) {
      getRecommendation(activeRecId)
        .then((data) => {
          if (isMounted && data) {
            setResolvedRecord(data);
          }
        })
        .catch((err) => {
          console.warn("Backend fetch in Analyze deferred to fallback:", err.message);
        });
    } else if (!activeRecId && queryParam && !resolvedRecord) {
      // Trigger background recommendation generation if directly navigated with ?q=
      runRecommendationEngine(queryParam)
        .then((res) => {
          if (isMounted && res) {
            setResolvedRecord(res);
            if (res.recommendationId) setActiveRecId(res.recommendationId);
          }
        })
        .catch((err) => {
          console.warn("Engine execution in Analyze deferred to fallback:", err.message);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [activeRecId, queryParam, resolvedRecord]);

  // 2. Automated progression through the 5 stages
  useEffect(() => {
    if (!queryParam) return;

    // Stage 1: 300ms
    const t1 = setTimeout(() => {
      setCurrentStage(2);
    }, 300);

    // Stage 2: 600ms
    const t2 = setTimeout(() => {
      setCurrentStage(3);
    }, 600);

    // Stage 3: 900ms
    const t3 = setTimeout(() => {
      setCurrentStage(4);
    }, 900);

    // Stage 4: 1200ms
    const t4 = setTimeout(() => {
      setCurrentStage(5);
    }, 1200);

    // Stage 5: 1500ms -> completion
    const t5 = setTimeout(() => {
      setIsComplete(true);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [queryParam]);

  // 3. Compute active analysis data with real backend binding
  const analysisData = useMemo(() => {
    if (!resolvedRecord) return fallbackAnalysisData;

    const primaryStd =
      resolvedRecord.primaryRecommendation?.standardNumber ||
      resolvedRecord.topCandidate?.standardNumber ||
      resolvedRecord.recommendationStandards?.find((rs) => rs.isPrimary)?.standard?.standardNumber ||
      resolvedRecord.recommendationStandards?.[0]?.standard?.standardNumber ||
      resolvedRecord.standard ||
      fallbackAnalysisData.recommendedStandard;

    const stdStatus =
      resolvedRecord.topCandidate?.status ||
      resolvedRecord.recommendationStandards?.[0]?.standard?.status ||
      resolvedRecord.status ||
      "Current";

    const extractedAttrs =
      resolvedRecord.requirement ||
      passedAttributes || {
        product: resolvedRecord.product || fallbackAnalysisData.attributes?.product,
        material: resolvedRecord.material || fallbackAnalysisData.attributes?.material,
        capacity: resolvedRecord.capacity || fallbackAnalysisData.attributes?.capacity,
        application: resolvedRecord.application || fallbackAnalysisData.attributes?.application,
      };

    const matchesCount =
      resolvedRecord.candidatesCount ||
      resolvedRecord.standards?.length ||
      resolvedRecord.recommendationStandards?.length ||
      fallbackAnalysisData.potentialMatches;

    const alliedCount =
      resolvedRecord.alliedStandards?.length ||
      fallbackAnalysisData.relatedStandards;

    const alliedList =
      resolvedRecord.alliedStandards?.map((a) =>
        typeof a === "string"
          ? { code: a, title: "Allied Standard" }
          : { code: a.code || a.standardNumber, title: a.title }
      ) || fallbackAnalysisData.relatedStandardsList;

    return {
      requirement: queryParam || resolvedRecord.requirementText || fallbackAnalysisData.requirement,
      attributes: extractedAttrs,
      potentialMatches: matchesCount,
      relatedStandards: alliedCount,
      relatedStandardsList: alliedList,
      recommendedStandard: primaryStd,
      currentEdition: primaryStd,
      status: stdStatus,
      amendmentChecked: "Yes",
    };
  }, [resolvedRecord, queryParam, passedAttributes, fallbackAnalysisData]);

  // Handle Cancel Analysis
  const handleConfirmCancel = () => {
    setIsCancelDialogOpen(false);
    navigate("/recommend");
  };

  // Handle View Results
  const handleViewResults = () => {
    const finalRecId = activeRecId || resolvedRecord?.id || resolvedRecord?.recommendationId;
    const std = analysisData.recommendedStandard;
    const q = analysisData.requirement;
    const targetUrl = finalRecId
      ? `/results?id=${encodeURIComponent(finalRecId)}&standard=${encodeURIComponent(std)}&q=${encodeURIComponent(q)}`
      : `/results?standard=${encodeURIComponent(std)}&q=${encodeURIComponent(q)}`;

    navigate(targetUrl, {
      state: {
        recommendationId: finalRecId,
        requirementText: q,
        attributes: analysisData.attributes,
        recommendedStandard: std,
        apiResult: resolvedRecord,
      },
    });
  };

  // Handle Retry
  const handleRetry = () => {
    setHasError(false);
    setIsComplete(false);
    setCurrentStage(1);
  };

  // 1. Missing Requirement State
  if (!queryParam) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            No requirement found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Please start a new recommendation before beginning analysis.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/recommend")}
            className="shadow-xs font-medium"
          >
            <span>Start New Recommendation</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (hasError) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <AnalysisError
          onRetry={handleRetry}
          onBack={() => navigate("/recommend")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header section with breadcrumbs and requirement brief */}
      <AnalysisHeader requirement={analysisData.requirement} />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: Main Processing Card / Completion Screen */}
        <div className="lg:col-span-8 space-y-5">
          {isComplete ? (
            <AnalysisComplete
              recommendedStandard={analysisData.recommendedStandard}
              onViewResults={handleViewResults}
              onBackToRequirement={() => navigate("/recommend")}
            />
          ) : (
            <AnalysisWorkflow
              currentStage={currentStage}
              isComplete={isComplete}
              analysisData={analysisData}
            />
          )}

          {/* Expandable Technical Activity Details */}
          <AnalysisDetails
            currentStage={currentStage}
            isComplete={isComplete}
          />
        </div>

        {/* RIGHT COLUMN: Sidebar Summary & Cancel */}
        <div className="lg:col-span-4 space-y-6">
          <AnalysisSidebar
            attributes={analysisData.attributes}
            potentialMatches={analysisData.potentialMatches}
            relatedStandards={analysisData.relatedStandards}
            isComplete={isComplete}
            onCancelClick={() => setIsCancelDialogOpen(true)}
          />
        </div>
      </div>

      {/* Trust Notice at bottom */}
      <div className="pt-4 border-t border-slate-200/80 text-center">
        <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Recommendation results should be reviewed against the applicable source documents before being used in procurement specifications.
        </p>
      </div>

      {/* Cancel Confirmation Dialog */}
      <CancelAnalysisDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};
