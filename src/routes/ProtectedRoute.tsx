import { Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  // auth fake por enquanto
  const isAuthenticated = true;

  return isAuthenticated ? <Outlet /> : null;
}
