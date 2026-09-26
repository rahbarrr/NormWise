/**
 * NormWise Admin System Monitoring & Operational Telemetry (Phase 19)
 * Real-time monitoring of service statuses, database, pgvector, storage,
 * operational metrics, response latencies, and recent error events.
 */

import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getSystemHealthApi } from "../services/api";

export function AdminMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getSystemHealthApi();
      setData(res);
    } catch (err) {
      console.error("[AdminMonitoring] Failed to fetch telemetry:", err);
      setError(err.message || "Failed to load operational health data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh telemetry every 30 seconds
    const interval = setInterval(() => fetchHealth(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds = 0) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const getStatusBadge = (status) => {
    if (status === "AVAILABLE" || status === "ok" || status === "ready") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          AVAILABLE
        </span>
      );
    }
    if (status === "NOT_CONFIGURED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          NOT CONFIGURED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        UNAVAILABLE
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                System Telemetry & Monitoring
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Real-time operational health, pgvector readiness, response latencies, and service metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchHealth(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 border-slate-300"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>Refresh Diagnostics</span>
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Failed to Load Telemetry</div>
            <div className="text-sm text-rose-700 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Primary Service Status Grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-500" />
          Subsystem Availability
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* API Server */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Core API</div>
                <div className="text-base font-bold text-slate-900 mt-1">NormWise REST API</div>
                <div className="text-xs text-slate-500 mt-0.5">Node.js + Express</div>
              </div>
              <div>{getStatusBadge(data?.services?.api || (loading ? "loading" : "AVAILABLE"))}</div>
            </CardContent>
          </Card>

          {/* PostgreSQL */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Relational DB</div>
                <div className="text-base font-bold text-slate-900 mt-1">PostgreSQL Database</div>
                <div className="text-xs text-slate-500 mt-0.5">Prisma ORM Managed</div>
              </div>
              <div>{getStatusBadge(data?.services?.database || (loading ? "loading" : "AVAILABLE"))}</div>
            </CardContent>
          </Card>

          {/* pgvector */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vector Search</div>
                <div className="text-base font-bold text-slate-900 mt-1">pgvector Extension</div>
                <div className="text-xs text-slate-500 mt-0.5">HNSW Cosine Index</div>
              </div>
              <div>{getStatusBadge(data?.services?.pgvector || (loading ? "loading" : "AVAILABLE"))}</div>
            </CardContent>
          </Card>

          {/* Storage */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Document Store</div>
                <div className="text-base font-bold text-slate-900 mt-1">Private File Storage</div>
                <div className="text-xs text-slate-500 mt-0.5">Isolated upload volume</div>
              </div>
              <div>{getStatusBadge(data?.services?.storage || (loading ? "loading" : "AVAILABLE"))}</div>
            </CardContent>
          </Card>

          {/* OCR Engine */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">OCR Pipeline</div>
                <div className="text-base font-bold text-slate-900 mt-1">Tesseract OCR</div>
                <div className="text-xs text-slate-500 mt-0.5">Scanned text extraction</div>
              </div>
              <div>{getStatusBadge(data?.services?.ocr || "AVAILABLE")}</div>
            </CardContent>
          </Card>

          {/* LLM Provider */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">LLM Provider</div>
                <div className="text-base font-bold text-slate-900 mt-1">Language Model</div>
                <div className="text-xs text-slate-500 mt-0.5">Grounding & Attribute Extraction</div>
              </div>
              <div>{getStatusBadge(data?.services?.llmProvider || "NOT_CONFIGURED")}</div>
            </CardContent>
          </Card>

          {/* Embedding Provider */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Embedding Engine</div>
                <div className="text-base font-bold text-slate-900 mt-1">Vector Embeddings</div>
                <div className="text-xs text-slate-500 mt-0.5">Semantic dense representations</div>
              </div>
              <div>{getStatusBadge(data?.services?.embeddingProvider || "NOT_CONFIGURED")}</div>
            </CardContent>
          </Card>

          {/* Translation Provider */}
          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Multilingual</div>
                <div className="text-base font-bold text-slate-900 mt-1">Indic Translation</div>
                <div className="text-xs text-slate-500 mt-0.5">Bhashini / Terminology</div>
              </div>
              <div>{getStatusBadge(data?.services?.translationProvider || "NOT_CONFIGURED")}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operational Telemetry Metrics */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500" />
          Throughput & Latency Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 shadow-xs bg-linear-to-b from-white to-slate-50/50">
            <CardContent className="p-5">
              <div className="text-xs font-medium text-slate-500">Total HTTP Requests</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {data?.metrics?.requests?.total ?? 0}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <span>Avg latency:</span>
                <span className="font-semibold text-blue-700">{data?.metrics?.requests?.avgResponseTimeMs ?? 0}ms</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-linear-to-b from-white to-slate-50/50">
            <CardContent className="p-5">
              <div className="text-xs font-medium text-slate-500">HTTP Error Count</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {data?.metrics?.requests?.errors ?? 0}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                <span>Database query failures: </span>
                <span className="font-semibold text-emerald-700">{data?.metrics?.requests?.dbQueryFailures ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-linear-to-b from-white to-slate-50/50">
            <CardContent className="p-5">
              <div className="text-xs font-medium text-slate-500">Recommendation Engine</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {data?.metrics?.recommendations?.totalProcessed ?? 0}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <span>Avg processing:</span>
                <span className="font-semibold text-blue-700">
                  {data?.metrics?.recommendations?.avgProcessingTimeMs ?? 0}ms
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs bg-linear-to-b from-white to-slate-50/50">
            <CardContent className="p-5">
              <div className="text-xs font-medium text-slate-500">Documents Processed</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {data?.metrics?.documents?.totalProcessed ?? 0}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <span>Processing failures:</span>
                <span className="font-semibold text-slate-700">
                  {data?.metrics?.documents?.failures ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Runtime Environment & Host Info */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="py-4 border-b border-slate-100">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            Runtime Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-400 font-medium">Application</div>
              <div className="font-semibold text-slate-800 mt-1">{data?.system?.name || "NormWise"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Version</div>
              <div className="font-semibold text-slate-800 mt-1">{data?.system?.version || "1.0.0-mvp"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Environment</div>
              <div className="font-semibold text-slate-800 mt-1 uppercase">{data?.system?.environment || "development"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Process Uptime</div>
              <div className="font-semibold text-slate-800 mt-1">{formatUptime(data?.system?.uptimeSeconds)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Node.js Engine</div>
              <div className="font-semibold text-slate-800 mt-1">{data?.system?.nodeVersion || process.version || "v20"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Memory (RSS / Heap)</div>
              <div className="font-semibold text-slate-800 mt-1">
                {data?.system?.memoryMb?.rss ?? 0} MB / {data?.system?.memoryMb?.heapUsed ?? 0} MB
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors Log Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Recent Server Errors
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Circular buffer of the last 20 client and server errors with sanitized request IDs.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">
            {data?.recentErrors?.length || 0} recorded
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {(!data?.recentErrors || data.recentErrors.length === 0) ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              No recent errors recorded. All systems operating nominally.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Method & Route</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sanitized Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentErrors.map((err, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                      {new Date(err.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      {err.requestId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                      <span className="font-semibold text-blue-700 mr-1.5">{err.method}</span>
                      {err.route}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200">
                        {err.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {err.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminMonitoring;
