import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        Checking authentication...
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}