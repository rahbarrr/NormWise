/**
 * NormWise Authentication Page (Phase 18)
 * Clean, secure government procurement portal login experience.
 */
import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  FileText,
  UserCheck,
  Scale,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";

export function Login() {
  const { login, authenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  // If already authenticated, redirect to dashboard or intended destination
  if (!authLoading && authenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || "Invalid email or password.");
      }
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("NormWise2026!");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Emblem / Branding */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-900 to-indigo-700 shadow-md shadow-blue-900/20 text-white mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          NormWise
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
          Indian Standards Intelligence Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80 sm:px-10">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your official procurement credentials to access standards intelligence
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@normwise.local"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credential Selectors */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Development Test Accounts (Password: NormWise2026!)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("officer@normwise.local")}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Officer
                </div>
                <div className="text-[10px] text-slate-400 truncate">officer@normwise.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("reviewer@normwise.local")}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Reviewer
                </div>
                <div className="text-[10px] text-slate-400 truncate">reviewer@normwise.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("auditor@normwise.local")}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  Auditor
                </div>
                <div className="text-[10px] text-slate-400 truncate">auditor@normwise.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@normwise.local")}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  Admin
                </div>
                <div className="text-[10px] text-slate-400 truncate">admin@normwise.local</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          Strict HTTP-only session cookies • Defense in depth • Zero plaintext storage
        </div>
      </div>
    </div>
  );
}
export default Login;
