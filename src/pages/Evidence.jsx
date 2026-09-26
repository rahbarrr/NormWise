import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { EvidenceHeader } from "../components/evidence/EvidenceHeader";
import { RecommendationContext } from "../components/evidence/RecommendationContext";
import { EvidenceSummary } from "../components/evidence/EvidenceSummary";
import { TraceabilityMap } from "../components/evidence/TraceabilityMap";
import { EvidenceFilters } from "../components/evidence/EvidenceFilters";
import { EvidenceSearch } from "../components/evidence/EvidenceSearch";
import { EvidenceList } from "../components/evidence/EvidenceList";
import { EvidenceDrawer } from "../components/evidence/EvidenceDrawer";
import { RelatedEvidence } from "../components/evidence/RelatedEvidence";
import { CertificationEvidence } from "../components/evidence/CertificationEvidence";
import { CurrentnessEvidence } from "../components/evidence/CurrentnessEvidence";
import { AuditInformation } from "../components/evidence/AuditInformation";
import {
  EvidenceEmptyState,
  EvidenceErrorState,
  EvidenceWarning,
} from "../components/evidence/EvidenceEmptyState";
import { MOCK_EVIDENCE_RECORDS } from "../data/mockEvidence";
import { getEvidence, getRecommendation } from "../services/api";

export const Evidence = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // id param can be a recommendation UUID or a standard code
  const recIdParam = id || searchParams.get("id");
  const standardParam = searchParams.get("standard") || "IS 2347:2023";

  // State
  const [evidenceRecords, setEvidenceRecords] = useState(MOCK_EVIDENCE_RECORDS);
  const [standardCode, setStandardCode] = useState(standardParam);
  const [standardTitle, setStandardTitle] = useState("Pressure cookers — Specification");
  const [confidence, setConfidence] = useState(94);
  const [isLiveData, setIsLiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [activeRecord, setActiveRecord] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Fetch live evidence if we have a recommendation ID
  useEffect(() => {
    let isMounted = true;
    if (!recIdParam) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.allSettled([
      getEvidence(recIdParam),
      getRecommendation(recIdParam),
    ]).then(([evResult, recResult]) => {
      if (!isMounted) return;

      // Load evidence
      if (
        evResult.status === "fulfilled" &&
        Array.isArray(evResult.value) &&
        evResult.value.length > 0
      ) {
        const mapped = evResult.value.map((e) => ({
          id: e.id,
          type: e.type || "SCOPE",
          standard: e.standard?.standardNumber || standardCode,
          reference: e.reference || "—",
          supports: e.source || "Standard requirement",
          content: e.content || "",
          source: e.source || "BIS Catalog",
          status: e.status || "Verified",
          excerpt: e.content,
          category: e.type,
          clause: e.reference,
          clauseTitle: e.source,
          relevanceScore: 90,
        }));
        setEvidenceRecords(mapped);
        setIsLiveData(true);
      }

      // Load standard info from the recommendation
      if (recResult.status === "fulfilled" && recResult.value) {
        const rec = recResult.value;
        const primaryRs =
          rec.recommendationStandards?.find((rs) => rs.isPrimary) ||
          rec.recommendationStandards?.[0];
        const std = primaryRs?.standard;
        if (std?.standardNumber) setStandardCode(std.standardNumber);
        if (std?.title) setStandardTitle(std.title);
        if (rec.confidence) setConfidence(rec.confidence);
      }
    }).catch(() => {
      // Keep mock data on error
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, [recIdParam]);

  const handleDownloadReport = () => {
    showToast("Evidence report generation will be connected to the backend.");
  };

  const handleOpenDetail = (record) => {
    setActiveRecord(record);
    setIsDrawerOpen(true);
  };

  // Filter and search logic
  const filteredRecords = evidenceRecords
    .filter((rec) => {
      const matchesFilter =
        activeFilter === "All" ||
        (rec.type || rec.category || "").toLowerCase() === activeFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (rec.id || "").toLowerCase().includes(q) ||
        (rec.standard || "").toLowerCase().includes(q) ||
        (rec.type || rec.category || "").toLowerCase().includes(q) ||
        (rec.supports || rec.source || "").toLowerCase().includes(q) ||
        (rec.reference || rec.clause || "").toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "type") return (a.type || "").localeCompare(b.type || "");
      if (sortBy === "standard") return (a.standard || "").localeCompare(b.standard || "");
      if (sortBy === "recent") return (b.id || "").localeCompare(a.id || "");
      return 0; // relevance
    });

  if (hasError) {
    return (
      <div className="py-8">
        <EvidenceErrorState
          onRetry={() => setHasError(false)}
          onBack={() => navigate("/results")}
        />
      </div>
    );
  }

  if (!isLoading && evidenceRecords.length === 0) {
    return (
      <div className="py-8">
        <EvidenceEmptyState onBack={() => navigate("/results")} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. Header with breadcrumbs and actions */}
      <EvidenceHeader
        onDownloadReport={handleDownloadReport}
        standardCode={standardCode}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between gap-3 shadow-2xl border border-slate-750 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0">
            Backend Notice
          </span>
        </div>
      )}

      {/* 2. Recommendation Context Banner */}
      <RecommendationContext
        standard={standardCode}
        title={standardTitle}
        confidence={confidence}
        status="Current"
        isLiveData={isLiveData}
      />

      {/* 3. Evidence Summary Metrics */}
      <EvidenceSummary count={evidenceRecords.length} isLiveData={isLiveData} />

      {/* 4. Recommendation Traceability Lineage Map */}
      <TraceabilityMap />

      {/* Warning State for demonstration readiness */}
      <EvidenceWarning message="Recommendation details are supported by curated demonstration evidence. Always verify source citations prior to procurement tender publication." />

      {/* 5. Filters & Search Section */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <EvidenceFilters
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />
        </div>

        <EvidenceSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* 6. Supporting Evidence List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <span className="text-sm animate-pulse">Loading evidence records…</span>
        </div>
      ) : filteredRecords.length > 0 ? (
        <EvidenceList
          records={filteredRecords}
          onViewDetails={handleOpenDetail}
        />
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
          No evidence records matched your search or filter. Try selecting &ldquo;All&rdquo; or clearing the search query.
        </div>
      )}

      {/* 7. Dedicated Evidence Sub-Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Related Standards Evidence */}
        <RelatedEvidence onOpenDetail={handleOpenDetail} />

        {/* Certification Evidence */}
        <CertificationEvidence onOpenDetail={handleOpenDetail} />
      </div>

      {/* 8. Currentness & Version Evidence */}
      <CurrentnessEvidence />

      {/* 9. Audit & Traceability Metadata Information */}
      <AuditInformation />

      {/* 10. Subtle Bottom Trust Notice */}
      <div className="pt-4 border-t border-slate-200/80 text-center">
        <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
          NormWise evidence is intended to support review and traceability. Always verify the latest applicable authorized source before using information in procurement specifications.
        </p>
      </div>

      {/* 11. Evidence Detail Drawer */}
      <EvidenceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        record={activeRecord}
      />
    </div>
  );
};
