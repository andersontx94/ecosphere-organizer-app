import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RequireGuest() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-6 text-gray-500">
        Carregando autenticação...
      </div>
    );
  }

  if (user) {
    const from =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ||
      "/";
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
