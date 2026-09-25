import React, { useState, useMemo } from "react";
import { HistoryHeader } from "../components/history/HistoryHeader";
import { HistoryStats } from "../components/history/HistoryStats";
import { HistorySearch } from "../components/history/HistorySearch";
import { HistoryFilters } from "../components/history/HistoryFilters";
import { HistoryTable } from "../components/history/HistoryTable";
import { HistoryPagination } from "../components/history/HistoryPagination";
import { ArchiveDialog } from "../components/history/ArchiveDialog";
import { EmptyHistory, NoSearchResults } from "../components/history/EmptyHistory";
import { EvidenceDrawer } from "../components/evidence/EvidenceDrawer";
import { MOCK_HISTORY_RECORDS, getHistoryStatistics } from "../data/mockHistory";
import { MOCK_EVIDENCE_RECORDS } from "../data/mockEvidence";

export const History = () => {
  // Master records state
  const [records, setRecords] = useState(MOCK_HISTORY_RECORDS);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confidenceFilter, setConfidenceFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Dialog and Drawer state
  const [archiveTargetRecord, setArchiveTargetRecord] = useState(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Toggle saved/bookmark
  const handleToggleSave = (id) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r))
    );
  };

  // Archive handlers
  const handleRequestArchive = (record) => {
    setArchiveTargetRecord(record);
    setIsArchiveDialogOpen(true);
  };

  const handleConfirmArchive = (id) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, archived: true } : r))
    );
    showToast(`Recommendation ${id} has been archived.`);
  };

  // Export handlers
  const handleExportAll = () => {
    showToast("Record export will be connected to the backend.");
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setConfidenceFilter("All");
    setDateFilter("All");
    setSavedOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "All" ||
    confidenceFilter !== "All" ||
    dateFilter !== "All" ||
    savedOnly;

  // Filter & Search Logic
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => !r.archived) // exclude archived from main history
      .filter((r) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            r.requirement.toLowerCase().includes(q) ||
            r.standard.toLowerCase().includes(q) ||
            r.standardTitle.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            (r.reviewer && r.reviewer.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Status
        if (statusFilter !== "All" && r.status !== statusFilter) {
          return false;
        }

        // Confidence
        if (confidenceFilter === "High" && r.confidence < 90) return false;
        if (confidenceFilter === "Medium" && (r.confidence < 75 || r.confidence >= 90))
          return false;
        if (confidenceFilter === "Low" && r.confidence >= 75) return false;

        // Saved Only
        if (savedOnly && !r.saved) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return a.id.localeCompare(b.id);
        if (sortBy === "confidence_high") return b.confidence - a.confidence;
        if (sortBy === "confidence_low") return a.confidence - b.confidence;
        if (sortBy === "status") return a.status.localeCompare(b.status);
        return b.id.localeCompare(a.id); // newest by default
      });
  }, [records, searchQuery, statusFilter, confidenceFilter, dateFilter, savedOnly, sortBy]);

  // Paginated records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Dynamic statistics
  const stats = useMemo(() => getHistoryStatistics(records), [records]);

  // Open Evidence Drawer helper
  const handleOpenEvidenceDrawer = (evidenceId) => {
    const found =
      MOCK_EVIDENCE_RECORDS.find((rec) => rec.id === evidenceId) ||
      MOCK_EVIDENCE_RECORDS[0];
    setActiveEvidence(found);
    setIsEvidenceDrawerOpen(true);
  };

  const activeTotalRecords = records.filter((r) => !r.archived).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb and Actions */}
      <HistoryHeader onExportAll={handleExportAll} />

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
            Audit System
          </span>
        </div>
      )}

      {/* 2. Compact Statistics Cards */}
      <HistoryStats stats={stats} />

      {/* 3. Search Field */}
      <HistorySearch
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
      />

      {/* 4. Filters & Sorting Bar */}
      <HistoryFilters
        statusFilter={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        confidenceFilter={confidenceFilter}
        onConfidenceChange={(val) => {
          setConfidenceFilter(val);
          setCurrentPage(1);
        }}
        dateFilter={dateFilter}
        onDateChange={(val) => {
          setDateFilter(val);
          setCurrentPage(1);
        }}
        savedOnly={savedOnly}
        onSavedToggle={(val) => {
          setSavedOnly(val);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 5. Main Content: Table or Empty/NoResults State */}
      {activeTotalRecords === 0 ? (
        <EmptyHistory />
      ) : filteredRecords.length === 0 ? (
        <NoSearchResults onClearFilters={handleClearFilters} />
      ) : (
        <div className="space-y-3">
          <HistoryTable
            records={paginatedRecords}
            onToggleSave={handleToggleSave}
            onArchiveRequest={handleRequestArchive}
            onOpenEvidenceDrawer={handleOpenEvidenceDrawer}
          />

          {/* 6. Pagination */}
          <HistoryPagination
            currentPage={currentPage}
            totalItems={filteredRecords.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* 7. Subtle Audit Trust Notice */}
      <div className="pt-4 border-t border-slate-200/80 text-center">
        <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Audit information records actions performed within NormWise. In the production system, records should be persisted securely and access-controlled.
        </p>
      </div>

      {/* 8. Archive Confirmation Dialog */}
      <ArchiveDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirmArchive={handleConfirmArchive}
        record={archiveTargetRecord}
      />

      {/* 9. Reusable Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={() => setIsEvidenceDrawerOpen(false)}
        record={activeEvidence}
      />
    </div>
  );
};
