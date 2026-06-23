import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AppShell from "./layout/AppShell";
import GraphEditorView from "./views/GraphEditorView";
import DashboardView from "./views/DashboardView";
import AllCardsView from "./views/AllCardsView";
import TrashView from "./views/TrashView";
import SettingsView from "./views/SettingsView";

import SearchView from "./views/SearchView";

function RouterContent() {
  const location = useLocation();
  const isGraph = location.pathname === "/graph";

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/graph" element={<GraphEditorView />} />
        <Route path="/cards" element={<AllCardsView />} />
        <Route path="/search" element={<SearchView />} />
        <Route path="/trash" element={<TrashView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouterContent />
    </BrowserRouter>
  );
}
