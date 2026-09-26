/**
 * NormWise Auth Context & Provider (Phase 18)
 * Centralizes user authentication, session lifecycle, and permission checks.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginApi,
  logoutApi,
  getMeApi,
  changePasswordApi,
  getCsrfTokenApi,
} from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load authenticated user on mount via HTTP-only cookie
  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      // Ensure companion CSRF cookie is initialized
      await getCsrfTokenApi().catch(() => null);

      const me = await getMeApi();
      if (me && me.user) {
        setUser({
          ...me.user,
          permissions: me.permissions || [],
        });
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      setUser(null);
      // Not logged in or expired session is a normal unauthenticated state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  /**
   * Login user with email & password
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi({ email, password });
      setUser({
        ...data.user,
        permissions: data.permissions || [],
      });
      return { success: true, user: data.user };
    } catch (err) {
      const msg = err.message || "Invalid email or password.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and invalidate server session
   */
  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async ({ currentPassword, newPassword, revokeOtherSessions = false }) => {
    const res = await changePasswordApi({
      currentPassword,
      newPassword,
      revokeOtherSessions,
    });
    return res;
  };

  /**
   * Permission & Role Helpers
   */
  const hasPermission = (perm) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return Array.isArray(user.permissions) && user.permissions.includes(perm);
  };

  const isRole = (role) => {
    if (!user) return false;
    const allowed = Array.isArray(role) ? role : [role];
    return allowed.some((r) => r.toUpperCase() === (user.role || "").toUpperCase());
  };

  const value = {
    user,
    loading,
    authenticated: !!user,
    error,
    login,
    logout,
    refreshSession,
    getCurrentUser: () => user,
    changePassword,
    hasPermission,
    isRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
