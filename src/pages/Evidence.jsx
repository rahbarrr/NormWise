import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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

export const Evidence = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const standardParam = searchParams.get("standard") || "IS 2347:2023";

  // State
  const [evidenceRecords, setEvidenceRecords] = useState(MOCK_EVIDENCE_RECORDS);
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
        activeFilter === "All" || rec.type.toLowerCase() === activeFilter.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rec.id.toLowerCase().includes(q) ||
        rec.standard.toLowerCase().includes(q) ||
        rec.type.toLowerCase().includes(q) ||
        rec.supports.toLowerCase().includes(q) ||
        rec.reference.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "type") return a.type.localeCompare(b.type);
      if (sortBy === "standard") return a.standard.localeCompare(b.standard);
      if (sortBy === "recent") return b.id.localeCompare(a.id);
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

  if (evidenceRecords.length === 0) {
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
        standardCode={standardParam}
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
        standard={standardParam}
        title="Pressure cookers — Specification"
        confidence={94}
        status="Current"
      />

      {/* 3. Evidence Summary Metrics */}
      <EvidenceSummary count={evidenceRecords.length} />

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
      {filteredRecords.length > 0 ? (
        <EvidenceList
          records={filteredRecords}
          onViewDetails={handleOpenDetail}
        />
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
          No evidence records matched your search or filter. Try selecting "All" or clearing the search query.
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
