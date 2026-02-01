import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Páginas - Processos
import Processes from "./pages/Processes";
import ProcessDetail from "./pages/ProcessDetail";
import NewProcess from "./pages/NewProcess";

// Páginas - Clientes
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirecionamento inicial */}
          <Route path="/" element={<Navigate to="/processos" replace />} />

          {/* Layout principal */}
          <Route element={<DashboardLayout />}>
            {/* PROCESSOS */}
            <Route path="/processos" element={<Processes />} />
            <Route path="/processos/novo" element={<NewProcess />} />
            <Route path="/processos/:id" element={<ProcessDetail />} />

            {/* CLIENTES */}
            <Route path="/clientes" element={<Clients />} />
            <Route path="/clientes/novo" element={<NewClient />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/processos" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}