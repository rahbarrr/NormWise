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
} from "lucide-react";
import {
  getEvaluationRunsApi,
  getEvaluationRunDetailsApi,
  triggerEvaluationRunApi,
  exportEvaluationReportApi,
} from "../services/api";

export function AdminEvaluation() {
  const [runs, setRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [currentRun, setCurrentRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningEval, setRunningEval] = useState(false);
  const [error, setError] = useState(null);

  // Filters for case explorer
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");

  // Modal / Drawer state for Case Explorer & Debug
  const [inspectedCase, setInspectedCase] = useState(null);
  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);
  const [newRunOptions, setNewRunOptions] = useState({
    name: "",
    dataset: "all",
    limit: "",
    includeMultilingual: false,
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
  const handleExportReport = async (format = "json") => {
    if (!selectedRunId) return;
    try {
      if (format === "markdown") {
        const markdown = await exportEvaluationReportApi(selectedRunId, "markdown");
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evaluation-report-${new Date().toISOString().slice(0, 10)}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const json = await exportEvaluationReportApi(selectedRunId, "json");
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `evaluation-run-${selectedRunId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      alert("Failed to export report: " + err.message);
    }
  };

  const metrics = currentRun?.metrics || {};
  const retrievalMetrics = metrics.retrieval || { recallAt1: 0, recallAt3: 0, recallAt5: 0, recallAt10: 0, mrr: 0, labelledCases: 0 };
  const clarificationMetrics = metrics.clarification || { precision: 0, recall: 0, totalCases: 0, correct: 0 };
  const performanceMetrics = metrics.performance || { averageMs: 0, medianMs: 0, p95Ms: 0 };
  const evidenceMetrics = metrics.evidence || { coverage: 0, coveragePercent: "0%" };
  const thresholdAnalysis = metrics.thresholdAnalysis || [];
  const scoreDistribution = metrics.scoreDistribution || {};
  const errorBreakdown = metrics.errorBreakdown || {};
  const multilingualStats = metrics.multilingual || {};

  // Filter case explorer items
  const filteredCases = (currentRun?.results || []).filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && r.evaluationType !== typeFilter) return false;
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
              Phase 17
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical evaluation, retrieval metrics (Recall@K, MRR), and error diagnostics for NormWise hybrid engine.
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

      {/* Mandatory Limitations & Engineering Transparency Banner (Section 29 & 31) */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold mb-0.5">Evaluation Data Scope & Transparency Notice</div>
          <p>
            Evaluation retrieval metrics measure system behavior on the available labelled dataset and standards catalog.
            Scores reflect <strong>engineering benchmark coverage</strong> on verified test samples and do not constitute legal compliance guarantees.
            {currentRun && currentRun.totalCases < 100 && (
              <span className="ml-1 inline-block font-medium underline">
                (Note: Current suite evaluates a controlled benchmark set of {currentRun.totalCases} cases).
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Evaluation Runs Selector & High-Level Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Run Selector Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Evaluation Run
            </div>
            <select
              value={selectedRunId || ""}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-2"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({new Date(r.createdAt).toLocaleDateString()}) - {r.totalCases} cases
                </option>
              ))}
            </select>
          </div>

          {currentRun && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Engine Version:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{currentRun.engineVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>Catalog Dataset:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{currentRun.datasetVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="text-emerald-600 font-semibold">{currentRun.completedCases} / {currentRun.totalCases}</span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Retrieval Metrics (Recall@1 & MRR) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top-1 Retrieval</span>
            <Crosshair className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {(retrievalMetrics.recallAt1 * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">Recall@1</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            MRR: <strong className="text-slate-700 dark:text-slate-200">{retrievalMetrics.mrr.toFixed(3)}</strong> across {retrievalMetrics.labelledCases} labelled standards
          </div>
        </div>

        {/* Multi-tier Recall (Recall@3, 5, 10) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate Coverage</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {(retrievalMetrics.recallAt5 * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">Recall@5</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex justify-between">
            <span>R@3: <strong>{(retrievalMetrics.recallAt3 * 100).toFixed(1)}%</strong></span>
            <span>R@10: <strong>{(retrievalMetrics.recallAt10 * 100).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Evidence & Clarification */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evidence & Guardrails</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {evidenceMetrics.coveragePercent}
            </span>
            <span className="text-xs text-slate-500">Evidence Coverage</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Clarification Precision: <strong className="text-slate-700 dark:text-slate-200">{(clarificationMetrics.precision * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Tabs & Deep-Dive Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threshold Sensitivity Analysis (Section 18) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-500" />
            Threshold Sensitivity Analysis
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Simulated state outcomes across recommendation confidence thresholds.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-2.5">Threshold</th>
                  <th className="py-2 px-2.5">Recommended</th>
                  <th className="py-2 px-2.5">Clarified</th>
                  <th className="py-2 px-2.5">No-Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {thresholdAnalysis.map((t) => (
                  <tr key={t.threshold} className={t.threshold === 0.70 ? "bg-blue-50/50 dark:bg-blue-900/20 font-semibold" : ""}>
                    <td className="py-2 px-2.5 font-mono">{t.threshold.toFixed(2)} {t.threshold === 0.70 ? "(Default)" : ""}</td>
                    <td className="py-2 px-2.5 text-emerald-600 font-medium">{t.recommended}</td>
                    <td className="py-2 px-2.5 text-amber-600">{t.clarified}</td>
                    <td className="py-2 px-2.5 text-slate-500">{t.noMatch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Score Distribution & Performance Benchmarks (Section 19 & 21) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Match Score Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Count of retrieved top candidates across score brackets.
          </p>

          <div className="space-y-2">
            {Object.entries(scoreDistribution).map(([bucket, count]) => {
              const total = currentRun?.totalCases || 1;
              const pct = ((count / total) * 100).toFixed(0);
              return (
                <div key={bucket} className="text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1 font-mono">
                    <span>{bucket}</span>
                    <span>{count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between text-slate-500">
            <span>Avg Latency: <strong className="text-slate-800 dark:text-slate-200">{performanceMetrics.averageMs}ms</strong></span>
            <span>Median: <strong className="text-slate-800 dark:text-slate-200">{performanceMetrics.medianMs}ms</strong></span>
            <span>p95: <strong className="text-slate-800 dark:text-slate-200">{performanceMetrics.p95Ms}ms</strong></span>
          </div>
        </div>

        {/* Error Category Breakdown (Section 13) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Error Diagnostics Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Root cause classification for non-optimal test cases.
          </p>

          {Object.keys(errorBreakdown).length === 0 ? (
            <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Zero errors recorded in active evaluation run.</span>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {Object.entries(errorBreakdown).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-mono text-slate-700 dark:text-slate-300">{category}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Multilingual mini-breakdown */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Indic Languages Evaluated:</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(multilingualStats).map(([lang, s]) => (
                <span key={lang} className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {lang}: {s.cases} cases
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Explorer (Section 16 & 17) */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Evaluation Case Explorer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any case to inspect candidate retrieval breakdown, structured scoring, and debug traces.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requirement or standard..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-48 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="WARNING">Warnings</option>
              <option value="FAILED">Failed Only</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Types</option>
              <option value="STANDARD_RETRIEVAL">Standard Retrieval</option>
              <option value="CLARIFICATION">Clarification</option>
              <option value="CURRENTNESS">Currentness</option>
              <option value="RELATED_STANDARD">Related Standard</option>
              <option value="MULTILINGUAL">Multilingual</option>
              <option value="NO_MATCH">No Match</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Requirement</th>
                <th className="py-2.5 px-3">Expected</th>
                <th className="py-2.5 px-3">Top Retrieved</th>
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3 text-center">Score</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCases.map((c) => {
                const expectedStr = (c.expectedStandardIds || []).join(", ") || (c.clarificationExpected ? "CLARIFICATION" : "N/A");
                return (
                  <tr
                    key={c.id}
                    onClick={() => setInspectedCase(c)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {c.caseId}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {c.evaluationType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300" title={c.requirement}>
                      {c.requirement}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {expectedStr}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {c.topStandardId || (c.clarificationActual ? "CLARIFICATION_REQUIRED" : "None")}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {c.rankOfExpected ? (
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${c.rankOfExpected === 1 ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-amber-700 bg-amber-50"}`}>
                          #{c.rankOfExpected}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">
                      {c.topMatchScore ? c.topMatchScore.toFixed(2) : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : c.status === "WARNING"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 hover:text-slate-600">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Explorer Detail Modal / Drawer (Section 16 & 17) */}
      {inspectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Case Explorer & Retrieval Debug
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {inspectedCase.caseId} — {inspectedCase.evaluationType}
                </h3>
              </div>
              <button
                onClick={() => setInspectedCase(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Requirement Text */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Original Requirement ({inspectedCase.language?.toUpperCase() || "EN"})
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                "{inspectedCase.requirement}"
              </p>
            </div>

            {/* Expected vs Actual Standards */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-500 block mb-1">Expected Standard(s):</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  {(inspectedCase.expectedStandardIds || []).join(", ") || "None"}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-500 block mb-1">Retrieved Top Candidate:</span>
                <span className="font-mono text-blue-700 dark:text-blue-400 font-bold">
                  {inspectedCase.topStandardId || (inspectedCase.clarificationActual ? "CLARIFICATION_REQUIRED" : "None")}
                </span>
                <span className="ml-2 text-slate-500">
                  (Score: {inspectedCase.topMatchScore ? inspectedCase.topMatchScore.toFixed(2) : "0"})
                </span>
              </div>
            </div>

            {/* Retrieval Debug View (Section 17) */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Retrieval Method Trace (Retrieved Candidates)
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 px-3">Standard Identifier</th>
                      <th className="py-2 px-3 text-center">Structured</th>
                      <th className="py-2 px-3 text-center">Lexical FTS</th>
                      <th className="py-2 px-3 text-center">Semantic Vector</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(inspectedCase.retrievedStandardIds || []).slice(0, 5).map((stdNum, idx) => {
                      const methods = inspectedCase.retrievalMethod || [];
                      return (
                        <tr key={stdNum} className={idx === 0 ? "bg-blue-50/30 dark:bg-blue-900/10 font-medium" : ""}>
                          <td className="py-2 px-3 font-mono">{stdNum}</td>
                          <td className="py-2 px-3 text-center">
                            {methods.includes("structured") ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {methods.includes("lexical") ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {methods.includes("vector") ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">-</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Failure Reason / Error Category if not successful */}
            {inspectedCase.failureReason && (
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 text-xs">
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Diagnostic Explanation ({inspectedCase.errorCategory || "OTHER"})
                </div>
                <p className="leading-relaxed">{inspectedCase.failureReason}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedCase(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                Close Explorer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Evaluation Modal */}
      {isNewRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form
            onSubmit={handleStartEvaluation}
            className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Run New Recommendation Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Executes the evaluation suite through the production hybrid recommendation engine.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Run Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Sprint 17 Benchmark"
                value={newRunOptions.name}
                onChange={(e) => setNewRunOptions({ ...newRunOptions, name: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Case Limit
              </label>
              <input
                type="number"
                placeholder="e.g. 20 (leave blank for all)"
                value={newRunOptions.limit}
                onChange={(e) => setNewRunOptions({ ...newRunOptions, limit: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="incMultilingual"
                checked={newRunOptions.includeMultilingual}
                onChange={(e) => setNewRunOptions({ ...newRunOptions, includeMultilingual: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="incMultilingual" className="text-xs text-slate-700 dark:text-slate-300">
                Include extended Indian-language test suite
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewRunModalOpen(false)}
                className="px-3 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={runningEval}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                {runningEval ? "Starting..." : "Start Run"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminEvaluation;
