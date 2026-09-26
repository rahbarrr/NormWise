/**
 * NormWise Protected Route Guard (Phase 18)
 * Checks authentication status and enforces role / permission boundaries.
 */
import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";

export function ProtectedRoute({ children, allowedRoles, requiredPermission }) {
  const { user, loading, authenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying security credentials…</p>
      </div>
    );
  }

  // Not authenticated: redirect to login and remember intended destination
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || "").toUpperCase();
    const authorized = allowedRoles.some((r) => r.toUpperCase() === userRole);

    if (!authorized) {
      return (
        <div className="max-w-xl mx-auto my-12 p-6 bg-white border border-rose-200 rounded-xl shadow-sm text-center">
          <div className="w-12 h-12 mx-auto bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Your role (<span className="font-semibold text-rose-700">{user.role}</span>) does not have authorization to view this section. This administrative zone requires one of:{" "}
            <span className="font-mono text-slate-800 font-semibold">{allowedRoles.join(", ")}</span>.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  }

  // Check granular permission authorization
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white border border-amber-200 rounded-xl shadow-sm text-center">
        <div className="w-12 h-12 mx-auto bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Insufficient Permissions</h2>
        <p className="text-xs text-slate-600 mb-4">
          Action requires permission: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-amber-800">{requiredPermission}</code>.
        </p>
        <Link to="/">
          <Button variant="outline" size="sm">Back to Safety</Button>
        </Link>
      </div>
    );
  }

  return children;
}
