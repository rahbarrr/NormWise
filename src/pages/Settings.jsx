/**
 * NormWise Settings & Security Profile (Phase 18)
 * Section 37: Profile, role, password change, and session invalidation.
 */
import React, { useState } from "react";
import {
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Database,
  Building,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Settings = () => {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Please enter current and new passwords.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });
      setPasswordSuccess(
        revokeOtherSessions
          ? "Password changed successfully! Other device sessions have been invalidated."
          : "Password changed successfully!"
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message || "Failed to update password. Verify current password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "ADMIN":
        return "purple";
      case "TECHNICAL_REVIEWER":
        return "blue";
      case "PROCUREMENT_OFFICER":
        return "current";
      case "AUDITOR":
        return "amber";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account Settings & Security
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your procurement officer profile, role privileges, and session security
        </p>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-700" />
              Institutional Identity
            </CardTitle>
            <Badge variant={getRoleBadgeVariant(user?.role)} dot>
              {user?.role || "GUEST"}
            </Badge>
          </div>
          <CardDescription>
            Official user identity registered in the institutional access directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px] font-semibold">
                Full Name
              </span>
              <span className="font-semibold text-slate-800 text-sm">{user?.name || "Official"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px] font-semibold">
                Official Email
              </span>
              <span className="font-mono text-slate-800 text-sm">{user?.email}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px] font-semibold">
                Account Status
              </span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active & Verified
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px] font-semibold">
                Assigned Role
              </span>
              <span className="font-semibold text-blue-800">{user?.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-700" />
            Password & Credential Security
          </CardTitle>
          <CardDescription>
            Update your authentication password (minimum 8 characters required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  New Password (min 8 chars)
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="revokeSessions"
                checked={revokeOtherSessions}
                onChange={(e) => setRevokeOtherSessions(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="revokeSessions" className="text-xs text-slate-600">
                Invalidate all other active device sessions
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Updating Password…
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-700" />
            Session Termination
          </CardTitle>
          <CardDescription>
            Terminate current session or invalidate all tokens across your devices
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-600">
              Signing out terminates the secure HTTP-only cookie associated with this browser.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 shrink-0 text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Current Session
          </Button>
        </CardContent>
      </Card>

      {/* Admin Quick Link */}
      {user?.role === "ADMIN" && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-blue-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-700" />
              Administrative Controls
            </CardTitle>
            <CardDescription className="text-xs">
              Direct access to system user administration and security configuration checks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/users")}
              className="bg-white"
            >
              Manage Users & Roles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/security")}
              className="bg-white"
            >
              Run Security Check
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Settings;
