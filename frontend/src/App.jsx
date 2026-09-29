/**
 * NormWise MVP Application Router
 *
 * Three primary user-facing flows:
 *   1. Requirement  (/recommend)    — Submit a procurement requirement
 *   2. Recommendation (/results)   — View recommendation results + evidence
 *   3. Review (/review)            — Technical reviewer decision
 *
 * Legacy/non-MVP pages are archived in legacy/old-pages/ and NOT imported here.
 */
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AppShell } from "./components/common/AppShell";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// ── Auth ──────────────────────────────────────────────────────────────────
import { Login } from "./pages/Login";
import { Landing } from "./pages/Landing";

// ── MVP Primary Pages ─────────────────────────────────────────────────────
import { Recommend } from "./pages/Requirement";     // Requirement entry
import { Results } from "./pages/Recommendation";   // Recommendation output
import { Evidence } from "./pages/Recommendation/Evidence"; // Evidence detail
import { Review } from "./pages/Review";           // Human review

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Landing />} />

            {/* Judge-facing MVP routes use the verified backend API directly. */}
            <Route
              path="/*"
              element={
                <AppShell>
                  <Routes>
                      {/* Default redirect to Requirement page */}
                      <Route path="/" element={<Landing />} />

                      {/* 1. Requirement */}
                      <Route
                        path="/recommend"
                        element={
                        <Recommend />
                        }
                      />

                      {/* 2. Recommendation */}
                      <Route path="/results" element={<Results />} />
                      <Route path="/results/:id" element={<Results />} />
                      <Route path="/evidence/:id" element={<Evidence />} />

                      {/* 3. Review */}
                      <Route
                        path="/review"
                        element={<ProtectedRoute allowedRoles={["TECHNICAL_REVIEWER", "ADMIN"]}><Review /></ProtectedRoute>}
                      />
                      <Route
                        path="/review/:id"
                        element={<ProtectedRoute allowedRoles={["TECHNICAL_REVIEWER", "ADMIN"]}><Review /></ProtectedRoute>}
                      />

                      {/* Catch-all */}
                      <Route path="*" element={<Navigate to="/recommend" replace />} />
                  </Routes>
                </AppShell>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
