/**
 * NormWise Security Configuration Check (Phase 18, Section 48)
 * Verifies production hardening, CORS policies, rate limits, session security, and defense-in-depth settings.
 */
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Lock,
  Database,
  Key,
  Cookie,
  Server,
  FileCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { getSecurityCheckApi } from "../services/api";

export function SecurityCheck() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSecurityCheckApi();
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load security verification report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheck();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> WARNING
          </span>
        );
      case "FAIL":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> FAIL
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-700" />
            Security Configuration Check
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated verification of environment hardening, session cookies, rate limiters, and defensive controls
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCheck} disabled={loading} className="gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Run Check
        </Button>
      </div>

      {/* Security Disclaimer Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">Security configuration check:</span> This report evaluates current runtime parameters, cookie flags, and database connectivity. Passing all checks verifies baseline conformance but is not an absolute warranty against zero-day vulnerabilities or external infrastructure breaches.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !report ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Evaluating security baseline controls…
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Environment
                </div>
                <div className="font-mono text-sm font-bold text-slate-900 uppercase">
                  {report.environment}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Passed Controls
                </div>
                <div className="text-lg font-bold text-emerald-600">
                  {report.summary?.pass || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Warnings
                </div>
                <div className="text-lg font-bold text-amber-600">
                  {report.summary?.warning || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
                  Failures
                </div>
                <div className="text-lg font-bold text-rose-600">
                  {report.summary?.fail || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Verification Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Defense-in-Depth Verification Items</CardTitle>
              <CardDescription>
                Audited parameters matching Phase 18 security specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4">Verification Check</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Observed Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.checks?.map((check, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {check.name}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(check.status)}</td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed font-mono text-[11px]">
                        {check.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

export default SecurityCheck;
