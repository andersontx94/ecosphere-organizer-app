import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Processes from "./pages/Processes";
import ProcessDetail from "./pages/ProcessDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Layout */}
        <Route element={<DashboardLayout />}>

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/processos" element={<Processes />} />
          <Route path="/processos/:id" element={<ProcessDetail />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
