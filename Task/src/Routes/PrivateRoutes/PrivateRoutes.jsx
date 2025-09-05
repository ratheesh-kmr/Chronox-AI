import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ allowedRoles, children }) => {
  const token = sessionStorage.getItem("token");
  const UserRole = sessionStorage.getItem("role")?.trim().toLowerCase(); 

  if (!token) return <Navigate to="/login" replace />;

  if (!UserRole || !allowedRoles.includes(UserRole)) {
    return <Navigate to="/NotAuthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
