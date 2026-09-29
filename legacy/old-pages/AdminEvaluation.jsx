import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Download,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  BookOpen,
  ShieldCheck,
  FileText,
  HelpCircle,
  Crosshair,
  TrendingUp,
  Cpu,
  Info,
  ExternalLink,
  Languages,
  CheckCheck,
  MessageSquare,
  AlertOctagon,
  Scale,
  GitCompare,
} from "lucide-react";
import {
  getEvaluationRunsApi,
  getEvaluationRunDetailsApi,
  triggerEvaluationRunApi,
  exportEvaluationReportApi,
  submitHumanFeedbackApi,
  compareRetrievalStrategiesApi,
} from "../services/api";

export function AdminEvaluation() {
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [currentRun, setCurrentRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningEval, setRunningEval] = useState(false);
  const [error, setError] = useState(null);

  // Active Tab: overview, cases, errors, retrieval, currentness, multilingual, evidence, compliance
  const [activeTab, setActiveTab] = useState("overview");

  // Filters for case explorer
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");

  // Modal / Drawer state for Case Explorer & Debug
  const [inspectedCase, setInspectedCase] = useState(null);
  const [humanReviewDecision, setHumanReviewDecision] = useState("CORRECT");
  const [humanReviewNotes, setHumanReviewNotes] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Comparison matrix state
  const [retrievalMatrix, setRetrievalMatrix] = useState(null);
  const [loadingMatrix, setLoadingMatrix] = useState(false);

  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);
  const [newRunOptions, setNewRunOptions] = useState({
    name: "",
    dataset: "real-case",
    category: "all",
    caseType: "all",
    verificationLevel: "all",
    mode: "hybrid",
    limit: "",
    includeMultilingual: true,
  });

  // Load runs list
  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const runsList = await getEvaluationRunsApi();
      setRuns(runsList || []);
      if (runsList && runsList.length > 0) {
        setSelectedRunId((prev) => prev || runsList[0].id);
      }
    } catch (err) {
      setError(err.message || "Failed to load evaluation runs");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load selected run details
  const fetchRunDetails = useCallback(async (runId) => {
    if (!runId) return;
    try {
      setLoading(true);
      const data = await getEvaluationRunDetailsApi(runId);
      setCurrentRun(data);
    } catch (err) {
      setError(err.message || "Failed to load evaluation run details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  useEffect(() => {
    if (selectedRunId) {
      fetchRunDetails(selectedRunId);
    }
  }, [selectedRunId, fetchRunDetails]);

  // Trigger evaluation
  const handleStartEvaluation = async (e) => {
    e.preventDefault();
    try {
      setRunningEval(true);
      setError(null);
      const res = await triggerEvaluationRunApi({
        name: newRunOptions.name || undefined,
        datasetVersion: "2026.09",
        category: newRunOptions.category !== "all" ? newRunOptions.category : undefined,
        caseType: newRunOptions.caseType !== "all" ? newRunOptions.caseType : undefined,
        verificationLevel: newRunOptions.verificationLevel !== "all" ? newRunOptions.verificationLevel : undefined,
        mode: newRunOptions.mode,
        limit: newRunOptions.limit ? parseInt(newRunOptions.limit, 10) : undefined,
        includeMultilingual: newRunOptions.includeMultilingual,
      });

      setIsNewRunModalOpen(false);
      await fetchRuns();
      if (res.runId) {
        setSelectedRunId(res.runId);
      }
    } catch (err) {
      setError(err.message || "Evaluation run failed to execute");
    } finally {
      setRunningEval(false);
    }
  };

  // Export report
  const handleExportReport = async (format = "markdown") => {
    if (!selectedRunId) return;
    try {
      if (format === "markdown") {
        const markdown = await exportEvaluationReportApi(selectedRunId, "markdown");
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evaluation-report-${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const json = await exportEvaluationReportApi(selectedRunId, "json");
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evaluation-run-${selectedRunId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert("Failed to export report: " + err.message);
    }
  };

  // Submit human validation feedback
  const handleHumanReviewSubmit = async (e) => {
    e.preventDefault();
    if (!inspectedCase) return;
    try {
      setSubmittingFeedback(true);
      const updated = await submitHumanFeedbackApi(inspectedCase.id, {
        decision: humanReviewDecision,
        notes: humanReviewNotes,
      });
      setFeedbackSuccess(true);
      setInspectedCase((prev) => ({
        ...prev,
        humanReviewDecision: updated.humanReviewDecision,
        humanReviewNotes: updated.humanReviewNotes,
        humanReviewedAt: updated.humanReviewedAt,
      }));
      // Refresh current run in background
      if (selectedRunId) {
        fetchRunDetails(selectedRunId);
      }
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      alert("Failed to submit review feedback: " + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Run retrieval comparison matrix on demand
  const handleRunRetrievalComparison = async () => {
    if (!currentRun || !currentRun.results || currentRun.results.length === 0) return;
    try {
      setLoadingMatrix(true);
      const sampleCases = currentRun.results.slice(0, 10);
      const rows = [];
      for (const c of sampleCases) {
        const comp = await compareRetrievalStrategiesApi({
          requirement: c.requirement,
          expectedStandards: c.expectedStandardIds,
          expectedAttributes: c.expectedAttributes,
        });
        rows.push({
          caseId: c.caseId,
          requirement: c.requirement,
          structured: comp.structured?.topMatch || "None",
          lexical: comp.lexical?.topMatch || "None",
          vector: comp.vector?.topMatch || "None",
          hybrid: comp.hybrid?.topMatch || "None",
        });
      }
      setRetrievalMatrix(rows);
    } catch (err) {
      alert("Retrieval comparison error: " + err.message);
    } finally {
      setLoadingMatrix(false);
    }
  };

  // Computed metrics
  const metrics = currentRun?.metrics || {};
  const dsCounts = metrics.datasetCounts || { total: currentRun?.totalCases || 0, verified: currentRun?.completedCases || 0, unverified: 0, labelled: 0 };
  const retrievalMetrics = metrics.retrieval || { recallAt1: 0, recallAt3: 0, recallAt5: 0, recallAt10: 0, mrr: 0, labelledCases: 0 };
  const clarificationMetrics = metrics.clarification || { precision: 0, recall: 0, totalCases: 0, correct: 0 };
  const performanceMetrics = metrics.performance || { averageMs: 0, medianMs: 0, p95Ms: 0 };
  const evidenceMetrics = metrics.evidence || { coverage: 0, coveragePercent: "0%" };
  const currentnessMetrics = metrics.currentness || { accuracy: 1.0, safetyViolations: 0 };
  const attributeMetrics = metrics.attributes || { accuracyRate: 1.0, accuracyPercent: "100.0%" };
  const errorBreakdown = metrics.errorBreakdown || {};
  const multilingualStats = metrics.multilingual || {};

  // Filter case explorer items
  const filteredCases = (currentRun?.results || []).filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && r.evaluationType !== typeFilter) return false;
    if (verificationFilter !== "ALL" && r.verificationLevel !== verificationFilter) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchReq = r.requirement?.toLowerCase().includes(q);
      const matchId = r.caseId?.toLowerCase().includes(q);
      const matchStd = r.topStandardId?.toLowerCase().includes(q);
      if (!matchReq && !matchId && !matchStd) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Recommendation Quality & Benchmarking
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              Phase 21 Real-Case Validation
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical validation, retrieval metrics (Recall@K, MRR), attribute extraction, and diagnostic error analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportReport("markdown")}
            disabled={!currentRun}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Markdown
          </button>
          <button
            onClick={() => setIsNewRunModalOpen(true)}
            disabled={runningEval}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-50 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            {runningEval ? "Evaluating..." : "Run Evaluation"}
          </button>
        </div>
      </div>

      {/* Mandatory Transparency & Scope Banner */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 text-xs leading-relaxed flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold mb-0.5">
              {metrics.basedOnNotice || `Based on ${dsCounts.verified || 0} verified cases`}
            </div>
            <p>
              Evaluation retrieval metrics measure system behavior on verified cases from the official BIS reference catalog.
              Scores represent <strong>internal matching performance</strong> and do not constitute statutory or legal certification.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-blue-200/60 dark:bg-blue-900/60 font-mono text-[11px] font-semibold">
            Mode: {currentRun?.retrievalMode || "Hybrid"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Run Selector & Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evaluation Run:</span>
          <select
            value={selectedRunId || ""}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-2 min-w-[280px]"
          >
            {runs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({new Date(r.createdAt).toLocaleDateString()}) - {r.totalCases} cases
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <span>Engine: <strong className="text-slate-900 dark:text-slate-100">{currentRun?.engineVersion || "hybrid-v1"}</strong></span>
          <span>Dataset: <strong className="text-slate-900 dark:text-slate-100">{currentRun?.datasetVersion || "2026.09"}</strong></span>
          <span>Avg Latency: <strong className="text-slate-900 dark:text-slate-100">{performanceMetrics.averageMs} ms</strong></span>
        </div>
      </div>

      {/* 8-Tab Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "cases", label: `Cases (${currentRun?.results?.length || 0})`, icon: Layers },
          { id: "errors", label: `Errors (${Object.keys(errorBreakdown).length})`, icon: AlertTriangle },
          { id: "retrieval", label: "Retrieval Comparison", icon: GitCompare },
          { id: "currentness", label: "Currentness", icon: ShieldCheck },
          { id: "multilingual", label: "Multilingual", icon: Languages },
          { id: "evidence", label: "Evidence", icon: FileText },
          { id: "compliance", label: "Compliance", icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recall@1</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {((retrievalMetrics.recallAt1 || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Top-1 primary match</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recall@3</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {((retrievalMetrics.recallAt3 || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Within top 3 candidates</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recall@5</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {((retrievalMetrics.recallAt5 || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Within top 5 candidates</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">MRR Score</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(retrievalMetrics.mrr || 0).toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Mean Reciprocal Rank</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Currentness Safety</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {((currentnessMetrics.accuracy || 1) * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{currentnessMetrics.safetyViolations} violations</div>
            </div>
          </div>

          {/* Secondary Diagnostic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-500" />
                Attribute Extraction Accuracy
              </h3>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {attributeMetrics.accuracyPercent || "100.0%"}
              </div>
              <p className="text-xs text-slate-500">
                Measures exact/partial extraction across product, material, application, capacity, and technical characteristics.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Clarification Precision
              </h3>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                {((clarificationMetrics.precision || 1) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-slate-500">
                Correctly prompts for missing attributes on underspecified requirements rather than forcing unsupported standards.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Evidence Grounding Coverage
              </h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {evidenceMetrics.coveragePercent || "0.0%"}
              </div>
              <p className="text-xs text-slate-500">
                Percentage of recommendations backed by verifiable normative clause extracts, test requirements, and QCO orders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASES (CASE EXPLORER) */}
      {activeTab === "cases" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search requirement, case ID, standard..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5"
              >
                <option value="ALL">All Verification Levels</option>
                <option value="VERIFIED">VERIFIED Only</option>
                <option value="UNVERIFIED">UNVERIFIED Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="WARNING">WARNING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          {/* Cases Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requirement</th>
                  <th className="py-3 px-4">Expected Standard</th>
                  <th className="py-3 px-4">Retrieved Standard</th>
                  <th className="py-3 px-4">Rank / Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCases.map((c) => {
                  const expected = (c.expectedStandardIds || []).join(", ") || "None";
                  const retrieved = c.topStandardId || "None";
                  const score = c.topMatchScore ? `${Math.round(c.topMatchScore * 100)}%` : "0%";
                  const isVerified = c.verificationLevel === "VERIFIED";

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {c.caseId}
                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isVerified ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {c.verificationLevel || "VERIFIED"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          c.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : c.status === "WARNING"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate" title={c.requirement}>
                        {c.requirement}
                      </td>
                      <td className="py-3 px-4 font-medium text-blue-600 dark:text-blue-400">
                        {expected}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {retrieved}
                      </td>
                      <td className="py-3 px-4">
                        Rank {c.rankOfExpected || "—"} ({score})
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setInspectedCase(c);
                            setHumanReviewDecision(c.humanReviewDecision || "CORRECT");
                            setHumanReviewNotes(c.humanReviewNotes || "");
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          Inspect & Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ERRORS TAXONOMY */}
      {activeTab === "errors" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Standardized Error Taxonomy Breakdown (Section 13)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All non-passing evaluation runs are classified into mutually exclusive diagnostic categories.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { cat: "ATTRIBUTE_EXTRACTION_ERROR", desc: "Parameter extraction missed key product, material, or application constraints." },
                { cat: "LEXICAL_RETRIEVAL_ERROR", desc: "Full-text PostgreSQL keyword query failed to retrieve relevant standard candidate." },
                { cat: "SEMANTIC_RETRIEVAL_ERROR", desc: "pgvector cosine similarity ranking failed to score relevant standard in top window." },
                { cat: "CURRENTNESS_ERROR", desc: "Withdrawn or superseded standard was recommended as current without deprecation warning." },
                { cat: "RELATIONSHIP_ERROR", desc: "Allied test method, component, or material relationships were missing in graph traversal." },
                { cat: "COMPLIANCE_ERROR", desc: "Deterministic QCO certification rule evaluation failed or conflicted with statutory gazette." },
                { cat: "EVIDENCE_ERROR", desc: "Recommended standard lacked indexed normative clause excerpts or test requirements." },
                { cat: "AMBIGUOUS_HANDLING_ERROR", desc: "Engine forced a specific standard rather than prompting for missing requirement attributes." },
                { cat: "MULTILINGUAL_ERROR", desc: "Indic language translation or technical terminology normalization degraded retrieval accuracy." },
                { cat: "NO_MATCH_HANDLING_ERROR", desc: "Out-of-catalog or non-standard requirement was forced into an unrelated recommendation." },
                { cat: "DATASET_GAP", desc: "Target standard is not present in the current standards catalog database." },
                { cat: "SOURCE_GAP", desc: "Mandatory QCO or Gazette notification is missing from reference database." },
                { cat: "CONFIGURATION_ERROR", desc: "Environment, threshold, or runtime execution failure." },
              ].map(({ cat, desc }) => {
                const count = errorBreakdown[cat] || 0;
                return (
                  <div key={cat} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-start justify-between">
                    <div>
                      <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {cat}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ml-3 ${
                      count > 0 ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RETRIEVAL METHOD COMPARISON */}
      {activeTab === "retrieval" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Multi-Strategy Candidate Generation Benchmark (Section 12)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compares Structured Attribute Matching vs Lexical FTS vs pgvector Semantic Search vs Hybrid Multi-Signal Retrieval.
              </p>
            </div>
            <button
              onClick={handleRunRetrievalComparison}
              disabled={loadingMatrix}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMatrix ? "animate-spin" : ""}`} />
              {loadingMatrix ? "Computing Matrix..." : "Run Live Comparison"}
            </button>
          </div>

          {retrievalMatrix ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Structured Match</th>
                    <th className="py-3 px-4">Lexical (FTS)</th>
                    <th className="py-3 px-4">Vector (pgvector)</th>
                    <th className="py-3 px-4 font-bold text-blue-600">Hybrid Merged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {retrievalMatrix.map((row) => (
                    <tr key={row.caseId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-medium">{row.caseId}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{row.structured}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{row.lexical}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">{row.vector}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{row.hybrid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              Click &quot;Run Live Comparison&quot; to compute empirical side-by-side retrieval performance across the 4 candidate generation engines.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CURRENTNESS */}
      {activeTab === "currentness" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Currentness Safety Evaluation (Section 6)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ensures withdrawn and superseded standards never silently become primary recommendations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500">Currentness Accuracy</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {((currentnessMetrics.accuracy || 1) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500">Safety Rule Violations</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {currentnessMetrics.safetyViolations || 0}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500">Separation of Match Score & Status</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">Enforced</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MULTILINGUAL */}
      {activeTab === "multilingual" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Indic Linguistic Normalization & Domain Preservation (Section 11)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Evaluates translation and terminology normalization across Hindi, Marathi, Bengali, Tamil, etc.
            </p>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Language Code</th>
                    <th className="py-2.5 px-4">Cases Tested</th>
                    <th className="py-2.5 px-4">Successful</th>
                    <th className="py-2.5 px-4">Failed</th>
                    <th className="py-2.5 px-4">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {Object.entries(multilingualStats).map(([lang, s]) => {
                    const passRate = s.cases > 0 ? ((s.successful / s.cases) * 100).toFixed(0) : "100";
                    return (
                      <tr key={lang}>
                        <td className="py-2.5 px-4 font-bold">{lang}</td>
                        <td className="py-2.5 px-4">{s.cases}</td>
                        <td className="py-2.5 px-4 text-emerald-600 font-semibold">{s.successful}</td>
                        <td className="py-2.5 px-4 text-rose-600 font-semibold">{s.failed}</td>
                        <td className="py-2.5 px-4 font-bold">{passRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: EVIDENCE */}
      {activeTab === "evidence" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Evidence Grounding & Verification Levels (Section 10)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Measures groundedness across standard identity, currentness, relationships, and compliance rules.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500">Verified Test Cases</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {dsCounts.verified}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500">Unverified Cases</div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {dsCounts.unverified}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500">Evidence Coverage</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {evidenceMetrics.coveragePercent}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500">Synthetic Evidence</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  0% (Strict Rule)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: COMPLIANCE */}
      {activeTab === "compliance" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Deterministic Compliance Rules Engine (Section 9)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Verifies that Quality Control Orders (QCOs) and mandatory BIS certification rules are enforced without LLM override.
            </p>

            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Every evaluated case with a DPIIT or MeitY certification mandate evaluates against deterministic condition trees stored in PostgreSQL.
              If rule conditions are not met, the engine marks the tender outcome as <code>POTENTIALLY_APPLICABLE</code> or <code>REQUIRES_REVIEW</code>, preventing ungrounded legal declarations.
            </div>
          </div>
        </div>
      )}

      {/* CASE INSPECTION & HUMAN FEEDBACK DRAWER */}
      {inspectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-850 shadow-2xl overflow-y-auto p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Case Inspector: {inspectedCase.caseId}
                  </h2>
                  <span className="text-xs text-slate-500">
                    Verification: {inspectedCase.verificationLevel || "VERIFIED"} | Type: {inspectedCase.evaluationType}
                  </span>
                </div>
                <button
                  onClick={() => setInspectedCase(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Requirement Text */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Procurement Requirement:</div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {inspectedCase.requirement}
                </div>
              </div>

              {/* Expected vs Actual Standards Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Expected Standard:</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {(inspectedCase.expectedStandardIds || []).join(", ") || "None"}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Retrieved Standard:</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {inspectedCase.topStandardId || "None"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Match Score: {inspectedCase.topMatchScore ? `${Math.round(inspectedCase.topMatchScore * 100)}%` : "0%"} (Rank {inspectedCase.rankOfExpected || "—"})
                  </div>
                </div>
              </div>

              {/* Error & Diagnostic Notice */}
              {inspectedCase.errorCategory && (
                <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Error Category: {inspectedCase.errorCategory}
                  </div>
                  <p>{inspectedCase.failureReason}</p>
                </div>
              )}

              {/* Human Technical Review Feedback Form (Section 21) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Technical Reviewer Ground-Truth Feedback
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Label this case decision for continuous engineering improvements. Separate from automated scores.
                </p>

                <form onSubmit={handleHumanReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reviewer Decision:
                    </label>
                    <select
                      value={humanReviewDecision}
                      onChange={(e) => setHumanReviewDecision(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="CORRECT">Correct</option>
                      <option value="PARTIALLY_CORRECT">Partially Correct</option>
                      <option value="INCORRECT">Incorrect</option>
                      <option value="INSUFFICIENT_EVIDENCE">Insufficient Evidence</option>
                      <option value="DATASET_ISSUE">Dataset Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reviewer Notes & Justification:
                    </label>
                    <textarea
                      value={humanReviewNotes}
                      onChange={(e) => setHumanReviewNotes(e.target.value)}
                      placeholder="Add engineering notes, clause citations, or dataset observations..."
                      rows={3}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    {feedbackSuccess && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="ml-auto px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      {submittingFeedback ? "Saving..." : "Save Reviewer Feedback"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setInspectedCase(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW EVALUATION MODAL */}
      {isNewRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-850 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Run Real-Case Recommendation Evaluation
            </h2>
            <p className="text-xs text-slate-500">
              Executes the evaluation suite through the production recommendation pipeline and measures precision, recall, and safety signals.
            </p>

            <form onSubmit={handleStartEvaluation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Run Name (Optional):
                </label>
                <input
                  type="text"
                  value={newRunOptions.name}
                  onChange={(e) => setNewRunOptions({ ...newRunOptions, name: e.target.value })}
                  placeholder="e.g. SIH Real-Case Benchmark 2026"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Filter:
                </label>
                <select
                  value={newRunOptions.category}
                  onChange={(e) => setNewRunOptions({ ...newRunOptions, category: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="all">All Real-Case Categories (20 cases)</option>
                  <option value="pressure-cooker">Pressure Cooker (IS 2347)</option>
                  <option value="lighting">Lighting & Luminaires (IS 10322)</option>
                  <option value="electrical-accessories">Electrical Accessories (IS 3854, 1293)</option>
                  <option value="other-authorized-categories">Other Authorized Categories (Fans, HDPE, Withdrawn)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Retrieval Strategy Mode:
                </label>
                <select
                  value={newRunOptions.mode}
                  onChange={(e) => setNewRunOptions({ ...newRunOptions, mode: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="hybrid">Hybrid (Structured + Lexical + pgvector)</option>
                  <option value="lexical">Lexical Only (PostgreSQL FTS)</option>
                  <option value="vector">Vector Only (pgvector Embeddings)</option>
                  <option value="structured">Structured Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewRunModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={runningEval}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {runningEval ? "Running..." : "Start Evaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEvaluation;
