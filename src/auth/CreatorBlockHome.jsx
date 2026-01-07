import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function CreatorBlockHome({ children }) {
  const { role } = useAuth();

  // If creator tries to access home/feed → redirect to dashboard
  if (role === "creator") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
