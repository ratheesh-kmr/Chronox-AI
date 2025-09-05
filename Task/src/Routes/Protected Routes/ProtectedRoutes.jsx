import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("userData")); 
  const role = user?.role;

  if (!token || !user) return <Navigate to="/login" replace />;

  const path = window.location.pathname;

  if (path === "/dashboard" && !["ADMIN", "PROJECT_LEAD", "SUPER_ADMIN"].includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  if (path === "/teams" && !["TEAM_LEAD", "ADMIN", "PROJECT_LEAD", "SUPER_ADMIN"].includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  if (path === "/users" && !["ADMIN", "PROJECT_LEAD", "SUPER_ADMIN"].includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  if (path === "/task-progress" && role !== "EMPLOYEE") {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
