import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function AuthRedirect({ children }) {
  const { isAuthed, role } = useAuth();

  // If logged in, redirect based on role
  if (isAuthed) {
    if (role === "creator") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
