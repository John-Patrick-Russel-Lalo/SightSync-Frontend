import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        Checking authentication...
      </div>
    );
  }

  // 1. If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If roles are defined, check if user has permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Render child routes
  return <Outlet />;
}