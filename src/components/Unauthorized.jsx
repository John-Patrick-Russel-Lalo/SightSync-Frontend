import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-xl backdrop-blur">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">403 - Access Denied</h1>
          <p className="text-sm text-slate-400">
            You don't have permission to access this page. Please contact your system administrator if you believe this is a mistake.
          </p>
        </div>

        {/* Context Details */}
        {user && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex justify-between items-center">
            <span>Logged in as: <strong className="text-slate-200">{user.email || user.name}</strong></span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 uppercase tracking-wider font-mono">
              {user.role || "user"}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-indigo-600/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-slate-400 hover:text-rose-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out and switch account
          </button>
        </div>
      </div>
    </div>
  );
}