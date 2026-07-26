import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface ProtectedRouteProps {
  requiredRole?: Role;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
