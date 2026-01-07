import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRoute({ role: requiredRole, children }) {
  const { role } = useAuth();
  if (role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}
