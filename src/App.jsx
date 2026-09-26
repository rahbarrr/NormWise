/**
 * NormWise Main Application Routing (Phase 18)
 * Integrates AuthProvider, ProtectedRoute guards, Role-based route access, and login flow.
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";

import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Recommend } from "./pages/Recommend";
import { Analyze } from "./pages/Analyze";
import { Results } from "./pages/Results";
import { Evidence } from "./pages/Evidence";
import { Review } from "./pages/Review";
import { History } from "./pages/History";
import { RecordDetail } from "./pages/RecordDetail";
import { Documents } from "./pages/Documents";
import { Saved } from "./pages/Saved";
import { Settings } from "./pages/Settings";
import { Help } from "./pages/Help";
import { StandardDetail } from "./pages/StandardDetail";
import { KnowledgeGraph } from "./pages/KnowledgeGraph";
import { AdminData } from "./pages/AdminData";
import { AdminTerminology } from "./pages/AdminTerminology";
import { AdminEvaluation } from "./pages/AdminEvaluation";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminMonitoring } from "./pages/AdminMonitoring";
import { SecurityCheck } from "./pages/SecurityCheck";
import { DemoMode } from "./pages/DemoMode";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes wrapped in AppShell */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                      path="/recommend"
                      element={
                        <ProtectedRoute allowedRoles={["PROCUREMENT_OFFICER", "TECHNICAL_REVIEWER", "ADMIN"]}>
                          <Recommend />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/documents"
                      element={
                        <ProtectedRoute allowedRoles={["PROCUREMENT_OFFICER", "TECHNICAL_REVIEWER", "ADMIN"]}>
                          <Documents />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/demo" element={<DemoMode />} />
                    <Route path="/analyze" element={<Analyze />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/results/:id" element={<Results />} />
                    <Route path="/evidence" element={<Evidence />} />
                    <Route path="/evidence/:id" element={<Evidence />} />
                    <Route
                      path="/review"
                      element={
                        <ProtectedRoute allowedRoles={["TECHNICAL_REVIEWER", "ADMIN"]}>
                          <Review />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/review/:id"
                      element={
                        <ProtectedRoute allowedRoles={["TECHNICAL_REVIEWER", "ADMIN"]}>
                          <Review />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/history" element={<History />} />
                    <Route path="/history/:id" element={<RecordDetail />} />
                    <Route path="/standards/:id" element={<StandardDetail />} />
                    <Route path="/knowledge" element={<KnowledgeGraph />} />
                    
                    {/* Administrative & Access-Controlled Routes */}
                    <Route
                      path="/admin/data"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <AdminData />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/terminology"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <AdminTerminology />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/evaluation"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "AUDITOR"]}>
                          <AdminEvaluation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <AdminUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/security"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN", "AUDITOR"]}>
                          <SecurityCheck />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/monitoring"
                      element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                          <AdminMonitoring />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/saved" element={<Saved />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />

                    {/* Catch all redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
