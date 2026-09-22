import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Unauthorized from "./components/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRedirect from "./components/HomeRedirect";

const LandingPage = lazy(() => import("./components/landing/LandingPage"));

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EDE3D8] flex items-center justify-center text-stone-500 text-sm font-medium">
          Loading…
        </div>
      }
    >
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <HomeRedirect /> : <AuthPage />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Role Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["patient", "doctor", "admin"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["doctor", "admin"]} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}