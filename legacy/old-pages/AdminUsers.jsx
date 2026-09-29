/**
 * NormWise User Management (Phase 18)
 * Admin interface to manage accounts, activate/deactivate users, and reassign roles.
 */
import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Key,
  Calendar,
  Clock,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { listUsersApi, updateUserRoleApi, updateUserStatusApi } from "../services/api";

const ROLES = [
  "PROCUREMENT_OFFICER",
  "TECHNICAL_REVIEWER",
  "AUDITOR",
  "ADMIN",
];

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // "ROLE" or "STATUS"
    user: null,
    newValue: null,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsersApi();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load system users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerRoleChange = (user, newRole) => {
    if (user.role === newRole) return;
    setConfirmModal({
      isOpen: true,
      type: "ROLE",
      user,
      newValue: newRole,
    });
  };

  const triggerStatusToggle = (user) => {
    const nextStatus = !user.isActive;
    setConfirmModal({
      isOpen: true,
      type: "STATUS",
      user,
      newValue: nextStatus,
    });
  };

  const executeConfirmedAction = async () => {
    const { type, user, newValue } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, user: null, newValue: null });

    try {
      if (type === "ROLE") {
        await updateUserRoleApi(user.id, newValue);
        setActionSuccess(`Role for ${user.name} changed to ${newValue}`);
      } else if (type === "STATUS") {
        await updateUserStatusApi(user.id, newValue);
        setActionSuccess(
          `User ${user.name} ${newValue ? "activated" : "deactivated"} successfully.`
        );
      }
      setTimeout(() => setActionSuccess(""), 4000);
      await fetchUsers();
    } catch (err) {
      setError(err.message || "Operation failed.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

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
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-700" />
            User Management & Access Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Administer institutional user accounts, role-based permissions, and active login access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="blue" className="px-3 py-1 text-xs">
            {users.length} Registered Accounts
          </Badge>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading user records…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => triggerRoleChange(u, e.target.value)}
                          className="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <UserX className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.lastLoginAt ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(u.lastLoginAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Never</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="xs"
                        variant={u.isActive ? "outline" : "primary"}
                        onClick={() => triggerStatusToggle(u)}
                        className="gap-1"
                      >
                        {u.isActive ? (
                          <>
                            <UserX className="w-3 h-3 text-rose-600" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-600" /> Activate
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Confirm {confirmModal.type === "ROLE" ? "Role Change" : "Account Status Change"}
                </h3>
                <p className="text-xs text-slate-500">Security confirmation required</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.type === "ROLE" ? (
                <>
                  Are you sure you want to change the role for{" "}
                  <strong className="text-slate-900">{confirmModal.user?.name}</strong> to{" "}
                  <strong className="text-blue-700">{confirmModal.newValue}</strong>? Their permissions will be immediately updated.
                </>
              ) : (
                <>
                  Are you sure you want to{" "}
                  <strong className="text-slate-900">
                    {confirmModal.newValue ? "activate" : "deactivate"}
                  </strong>{" "}
                  the account for{" "}
                  <strong className="text-slate-900">{confirmModal.user?.name}</strong>?{" "}
                  {!confirmModal.newValue && "They will be immediately barred from signing in."}
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfirmModal({ isOpen: false, type: null, user: null, newValue: null })
                }
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={executeConfirmedAction}>
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
