import React from "react";
import { useAuth } from "../context/AuthContext";

import PatientProfileForm from "./PatientProfileForm";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-slate-100">Application Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Log Out
          </button>
        </header>

        {/* User Banner */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-blue-400">
            Welcome back, {user?.username || user?.email || "User"}! 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Authenticated session active via HTTP-Only cookies.
          </p>
        </div>

        <PatientProfileForm />

        {/* User Metadata */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold text-slate-200 mb-3">User Profile Object</h3>
          <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sky-400 text-sm font-mono overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}