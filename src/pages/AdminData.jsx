import React, { useState, useEffect } from "react";
import {
  fetchDatasetOverview,
  fetchImportJobs,
  fetchImportReport,
  importDatasetFile,
  validateDatasetFile,
} from "../services/adminDataApi";
import {
  Database,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  RefreshCw,
  FileText,
  ShieldCheck,
  AlertCircle,
  Layers,
} from "lucide-react";

export function AdminData() {
  const [overview, setOverview] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // File Upload State
  const [file, setFile] = useState(null);
  const [sourceName, setSourceName] = useState("Controlled Indian Standards Dataset");
  const [datasetVersion, setDatasetVersion] = useState("2026.09");
  const [isDryRun, setIsDryRun] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Report Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewData, jobsData] = await Promise.all([
        fetchDatasetOverview(),
        fetchImportJobs(),
      ]);
      setOverview(overviewData.data || overviewData);
      setJobs(jobsData.data || jobsData);
    } catch (err) {
      setError(err.message || "Failed to load dataset administrative metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleValidateOnly = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadResult(null);
      const res = await validateDatasetFile(file);
      setUploadResult({
        type: "validate",
        ...res,
      });
    } catch (err) {
      setUploadResult({
        type: "error",
        message: err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImportOrDryRun = async () => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadResult(null);
      const res = await importDatasetFile(file, {
        sourceName,
        datasetVersion,
        dryRun: isDryRun,
        isDemo,
      });
      setUploadResult({
        type: isDryRun ? "dryRun" : "import",
        ...res,
      });
      if (!isDryRun) {
        // Refresh overview and job list
        loadData();
      }
    } catch (err) {
      setUploadResult({
        type: "error",
        message: err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleViewReport = async (jobId) => {
    try {
      setLoadingReport(true);
      const data = await fetchImportReport(jobId);
      setSelectedReport(data.data || data);
    } catch (err) {
      alert("Failed to load detailed report: " + err.message);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary-700" />
              Standards Dataset Administration
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Admin & Ingestion Foundation
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Audit, validate, and ingest legally authorized standards metadata and allied catalog records into PostgreSQL.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Dataset Overview Metric Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Catalog Standards
              </span>
              <Layers className="w-4 h-4 text-primary-600" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mt-2">
              {overview.totalStandards || 0}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Demo Records: {overview.provenance?.demoRecords || 0}</span>
              <span>Source Data: {overview.provenance?.sourceRecords || 0}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Current Active Standards
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">
              {overview.statusBreakdown?.CURRENT || 0}
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-medium">
              Verified compliant for primary specification citation
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Superseded / Withdrawn
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700 mt-2">
              {(overview.statusBreakdown?.SUPERSEDED || 0) + (overview.statusBreakdown?.WITHDRAWN || 0)}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Superseded: {overview.statusBreakdown?.SUPERSEDED || 0}</span>
              <span>Withdrawn: {overview.statusBreakdown?.WITHDRAWN || 0}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Latest Dataset Release
              </span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2 truncate">
              {overview.latestImport?.datasetVersion || "2026.09"}
            </div>
            <div className="mt-2 text-xs text-gray-500 truncate">
              Source: {overview.latestImport?.sourceName || "Controlled Ingestion"}
            </div>
          </div>
        </div>
      )}

      {/* Dataset Ingestion Tool Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary-700" />
            Import Standards Dataset
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">
            Upload CSV, JSON, or XLSX dataset files. Ensure data contains only legally authorized metadata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Select Standards Dataset File (CSV, JSON, XLSX — Max 25 MB)
              </label>
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer border border-gray-200 rounded-lg p-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Source Provenance Name
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Dataset Version Tag
                </label>
                <input
                  type="text"
                  value={datasetVersion}
                  onChange={(e) => setDatasetVersion(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                Dry Run (Preview changes without modifying PostgreSQL)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                Mark as Demonstration Records (isDemo = true)
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleValidateOnly}
                disabled={!file || uploading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4 inline mr-1.5" />
                Validate Format Only
              </button>

              <button
                type="button"
                onClick={handleImportOrDryRun}
                disabled={!file || uploading}
                className={`px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-sm transition disabled:opacity-50 ${
                  isDryRun
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-primary-700 hover:bg-primary-800"
                }`}
              >
                {uploading ? (
                  <RefreshCw className="w-4 h-4 inline animate-spin mr-1.5" />
                ) : isDryRun ? (
                  <Eye className="w-4 h-4 inline mr-1.5" />
                ) : (
                  <UploadCloud className="w-4 h-4 inline mr-1.5" />
                )}
                {isDryRun ? "Execute Dry Run" : "Import Into PostgreSQL"}
              </button>
            </div>
          </div>

          {/* Upload Result / Dry Run Panel */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[180px] flex flex-col justify-center">
            {!uploadResult ? (
              <div className="text-center text-gray-400 py-6">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Select a file and click Validate or Execute Dry Run to preview results.</p>
              </div>
            ) : uploadResult.type === "error" ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <p className="font-semibold">Processing Error:</p>
                <p className="mt-1">{uploadResult.message}</p>
              </div>
            ) : uploadResult.type === "validate" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      uploadResult.data?.isValid
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {uploadResult.data?.isValid ? "VALID FORMAT" : "FORMAT NOTICES"}
                  </span>
                  <span className="text-xs text-gray-500">
                    File: {uploadResult.data?.filename} ({uploadResult.data?.detectedType})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Total Rows</div>
                    <div className="text-lg font-bold text-gray-800">{uploadResult.data?.totalRows}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Valid Rows</div>
                    <div className="text-lg font-bold text-emerald-600">{uploadResult.data?.validRows}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Invalid Rows</div>
                    <div className="text-lg font-bold text-red-600">{uploadResult.data?.invalidRows}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded ${
                      uploadResult.data?.isDryRun
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {uploadResult.data?.isDryRun ? "DRY RUN COMPLETE (NO DB CHANGES)" : "IMPORT SUCCESSFUL"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Completed in {uploadResult.data?.durationMs}ms
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Read</div>
                    <div className="text-base font-bold text-gray-800">{uploadResult.data?.totalRead}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">
                      {uploadResult.data?.isDryRun ? "Would Create" : "Created"}
                    </div>
                    <div className="text-base font-bold text-emerald-600">{uploadResult.data?.created}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">
                      {uploadResult.data?.isDryRun ? "Would Update" : "Updated"}
                    </div>
                    <div className="text-base font-bold text-blue-600">{uploadResult.data?.updated}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <div className="text-xs text-gray-500">Failed / Skip</div>
                    <div className="text-base font-bold text-red-600">
                      {(uploadResult.data?.failed || 0) + (uploadResult.data?.skipped || 0)}
                    </div>
                  </div>
                </div>

                {uploadResult.data?.conflicts?.length > 0 && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ {uploadResult.data.conflicts.length} conflict(s) detected and marked for technical review.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Import History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              Import History & Audit Log
            </h3>
            <p className="text-xs text-gray-500">Auditable log of dataset imports and updates.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Source Name</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Version</th>
                <th className="px-6 py-3 text-center">Read / Created / Updated</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No import jobs recorded yet.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                      {new Date(j.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {j.sourceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-mono">
                        {j.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700">
                      {j.datasetVersion || "2026.09"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                      <span className="font-semibold text-gray-900">{j.recordsRead}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-emerald-600 font-semibold">{j.recordsCreated}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-blue-600 font-semibold">{j.recordsUpdated}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          j.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : j.status === "COMPLETED_WITH_ERRORS"
                            ? "bg-amber-100 text-amber-800"
                            : j.status === "PROCESSING"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <button
                        onClick={() => handleViewReport(j.id)}
                        className="text-primary-700 hover:text-primary-900 font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Data Quality & Ingestion Report
                </h3>
                <p className="text-xs text-gray-500">
                  Job ID: {selectedReport.id} • Source: {selectedReport.sourceName}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="text-xs text-gray-500">Records Read</div>
                <div className="text-lg font-bold text-gray-800">{selectedReport.recordsRead}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-xs text-emerald-700">Created</div>
                <div className="text-lg font-bold text-emerald-800">{selectedReport.recordsCreated}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-blue-700">Updated</div>
                <div className="text-lg font-bold text-blue-800">{selectedReport.recordsUpdated}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-xs text-red-700">Failed / Skipped</div>
                <div className="text-lg font-bold text-red-800">
                  {selectedReport.recordsFailed + selectedReport.recordsSkipped}
                </div>
              </div>
            </div>

            {selectedReport.importedRecords && selectedReport.importedRecords.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sample Staging Records ({selectedReport.importedRecords.length})
                </h4>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y text-xs">
                  {selectedReport.importedRecords.map((r) => (
                    <div key={r.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <span className="font-semibold text-gray-900 font-mono">{r.rawIdentifier}</span>
                        <p className="text-gray-600 truncate max-w-md">{r.rawTitle}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.validationStatus === "VALID"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.validationStatus === "CONFLICT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.validationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminData;
