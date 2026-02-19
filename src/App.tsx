import { BrowserRouter, Routes, Route } from "react-router-dom";

/* Layout */
import DashboardLayout from "./components/layout/DashboardLayout";
import RequireAuth from "./components/auth/RequireAuth";
import RequireGuest from "./components/auth/RequireGuest";
import RequireOrganization from "./components/auth/RequireOrganization";

/* Pages */
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import NewClient from "./pages/NewClient";

import Enterprises from "./pages/Enterprises";
import NewEnterprise from "./pages/NewEnterprise";
import EnterpriseDetail from "./pages/EnterpriseDetail";

import Services from "./pages/Services";
import NewService from "./pages/NewService";
import ServiceDetail from "./pages/ServiceDetail";

import Processes from "./pages/Processes";
import NewProcess from "./pages/NewProcess";
import ProcessDetail from "./pages/ProcessDetail";
import ProcessTypes from "./pages/ProcessTypes";
import Proposals from "./pages/Proposals";
import ProposalForm from "./pages/ProposalForm";

import Financial from "./pages/Financial";
import Documents from "./pages/Documents";
import Tasks from "./pages/Tasks";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OnboardingOrganization from "./pages/OnboardingOrganization";
import SelectOrganization from "./pages/SelectOrganization";
import AuthCallback from "./pages/AuthCallback";

import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route element={<RequireGuest />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="esqueci-senha" element={<ForgotPassword />} />
        </Route>
        <Route path="redefinir-senha" element={<ResetPassword />} />
        <Route path="auth/callback" element={<AuthCallback />} />

        {/* Tudo que usa Sidebar/Layout */}
        <Route element={<RequireAuth />}>
          <Route path="onboarding/organizacao" element={<OnboardingOrganization />} />
          <Route path="selecionar-organizacao" element={<SelectOrganization />} />

          <Route element={<DashboardLayout />}>
            <Route element={<RequireOrganization />}>
              {/* DASHBOARD */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* CLIENTES */}
              <Route path="clientes" element={<Clients />} />
              <Route path="clientes/novo" element={<NewClient />} />
              <Route path="clientes/:id" element={<ClientDetail />} />

              {/* EMPRESAS */}
              <Route path="empresas" element={<Enterprises />} />
              <Route path="empresas/nova" element={<NewEnterprise />} />
              <Route path="empresas/:id" element={<EnterpriseDetail />} />

              {/* SERVICOS */}
              <Route path="servicos" element={<Services />} />
              <Route path="servicos/novo" element={<NewService />} />
              <Route path="servicos/:id" element={<ServiceDetail />} />

              {/* PROCESSOS */}
              <Route path="processos" element={<Processes />} />
              <Route path="processos/novo" element={<NewProcess />} />
              <Route path="processos/tipos" element={<ProcessTypes />} />
              <Route path="processos/:id" element={<ProcessDetail />} />

              {/* PROPOSTAS */}
              <Route path="propostas" element={<Proposals />} />
              <Route path="propostas/nova" element={<ProposalForm />} />
              <Route path="propostas/:id" element={<ProposalForm />} />

              {/* FINANCEIRO */}
              <Route path="financeiro" element={<Financial />} />

              {/* DOCUMENTOS */}
              <Route path="documentos" element={<Documents />} />

              {/* TAREFAS */}
              <Route path="tarefas" element={<Tasks />} />
            </Route>
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
