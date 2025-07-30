// routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  // User login नहीं है
  if (!user) return <Navigate to="/login" />;

  // Role-based access control (अगर allowedRoles पास किया गया है)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/no-permission" />;
  }

  return children;
}
