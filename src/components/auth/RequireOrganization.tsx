import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function RequireOrganization() {
  const { organizations, activeOrganizationId, loading } = useOrganization();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Carregando organização...
      </div>
    );
  }

  if (organizations.length === 0) {
    return <Navigate to="/onboarding/organizacao" replace state={{ from: location }} />;
  }

  if (!activeOrganizationId) {
    return <Navigate to="/selecionar-organizacao" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
