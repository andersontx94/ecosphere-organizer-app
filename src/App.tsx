import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Layout */
import DashboardLayout from "./components/layout/DashboardLayout";

/* Pages */
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import NewClient from "./pages/NewClient";

import Enterprises from "./pages/Enterprises";
import NewEnterprise from "./pages/NewEnterprise";

import Processes from "./pages/Processes";
import NewProcess from "./pages/NewProcess";
import ProcessDetail from "./pages/ProcessDetail";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tudo que usa Sidebar/Layout */}
        <Route element={<DashboardLayout />}>
          {/* DASHBOARD */}
          <Route index element={<Dashboard />} />

          {/* CLIENTES */}
          <Route path="clientes" element={<Clients />} />
          <Route path="clientes/novo" element={<NewClient />} />
          <Route path="clientes/:id" element={<ClientDetail />} />

          {/* EMPRESAS */}
          <Route path="empresas" element={<Enterprises />} />
          <Route path="empresas/nova" element={<NewEnterprise />} />

          {/* PROCESSOS */}
          <Route path="processos" element={<Processes />} />
          <Route path="processos/novo" element={<NewProcess />} />
          <Route path="processos/:id" element={<ProcessDetail />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
