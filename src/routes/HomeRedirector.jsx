// src/pages/HomeRedirector.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function HomeRedirector() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();

  if (role === "admin") {
    return <Navigate to="/dashboard" replace />;
  } else if (role === "crm") {
    return <Navigate to="/dashboard" replace />;
  } else if (role === "ss") {
    return <Navigate to="/ss-page" replace />;
  } else {
    return <div className="p-4 text-red-600"> (Unauthorized User)</div>;
  }
}
