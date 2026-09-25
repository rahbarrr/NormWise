import React, { useState, useMemo, useEffect, useCallback } from "react";
import { HistoryHeader } from "../components/history/HistoryHeader";
import { HistoryStats } from "../components/history/HistoryStats";
import { HistorySearch } from "../components/history/HistorySearch";
import { HistoryFilters } from "../components/history/HistoryFilters";
import { HistoryTable } from "../components/history/HistoryTable";
import { HistoryPagination } from "../components/history/HistoryPagination";
import { ArchiveDialog } from "../components/history/ArchiveDialog";
import { EmptyHistory, NoSearchResults } from "../components/history/EmptyHistory";
import { EvidenceDrawer } from "../components/evidence/EvidenceDrawer";
import { getHistoryStatistics } from "../data/mockHistory";
import { MOCK_EVIDENCE_RECORDS } from "../data/mockEvidence";
import {
  getRecommendations,
  toggleSaveRecommendation,
  archiveRecommendation,
} from "../services/api";

export const History = () => {
  // Master records and API state
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

  // Fetch recommendations from PostgreSQL API
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getRecommendations();
      setRecords(data?.items || []);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setLoadError("Unable to load recommendation history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Toggle saved/bookmark with API persistence
  const handleToggleSave = async (id) => {
    // Optimistic UI update
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r))
    );
    try {
      await toggleSaveRecommendation(id);
    } catch (err) {
      console.warn("Save API failed, state kept local:", err.message);
    }
  };

  // Archive handlers with API persistence
  const handleRequestArchive = (record) => {
    setArchiveTargetRecord(record);
    setIsArchiveDialogOpen(true);
  };

  const handleConfirmArchive = async (id) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, archived: true } : r))
    );
    try {
      await archiveRecommendation(id);
    } catch (err) {
      console.warn("Archive API failed, state kept local:", err.message);
    }
    showToast(`Recommendation ${id} has been archived.`);
  };

  // Export handlers
  const handleExportAll = () => {
    showToast("Audit records exported to compliance CSV.");
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
            r.requirement?.toLowerCase().includes(q) ||
            r.standard?.toLowerCase().includes(q) ||
            r.standardTitle?.toLowerCase().includes(q) ||
            r.id?.toLowerCase().includes(q) ||
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
            PostgreSQL DB
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 animate-spin">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Loading recommendations...</h3>
            <p className="text-xs text-slate-500 mt-1">Retrieving procurement history from PostgreSQL database</p>
          </div>
        </div>
      ) : loadError ? (
        /* Error State */
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-10 text-center shadow-xs space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{loadError}</h3>
            <p className="text-xs text-slate-500 mt-1">Please verify your server and database connection.</p>
          </div>
          <button
            onClick={fetchRecords}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* 7. Subtle Audit Trust Notice */}
      <div className="pt-4 border-t border-slate-200/80 text-center">
        <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Audit information records actions performed within NormWise. In the production system, records are persisted securely in PostgreSQL with full relational integrity.
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
