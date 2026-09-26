import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
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

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/results" element={<Results />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/review" element={<Review />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<RecordDetail />} />
          <Route path="/standards/:id" element={<StandardDetail />} />
          <Route path="/knowledge" element={<KnowledgeGraph />} />
          <Route path="/admin/data" element={<AdminData />} />
          <Route path="/admin/terminology" element={<AdminTerminology />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          {/* Catch all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
