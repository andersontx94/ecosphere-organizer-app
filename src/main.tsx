import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { Toaster } from "@/components/ui/toaster";
import { runSupabaseHealthCheck } from "@/lib/supabaseHealth";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

if (import.meta.env.DEV) {
  runSupabaseHealthCheck();
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <App />
          <Toaster />
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
