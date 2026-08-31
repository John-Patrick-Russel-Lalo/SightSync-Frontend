

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        // 1. Perform login and retrieve user object
        const user = await login(email, password);

        // 2. Route based on user role (falls back to user object or decoded role)
        const role = user?.role;

        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (role === "doctor") {
          navigate("/doctor/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        await register({ firstName, lastName, email, password });
        setIsLogin(true);
        setError("Account created successfully! Please sign in.");
      }
    } catch (err) {
      setError(err?.message || "An error occurred during authentication.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-100 mb-1">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          {isLogin ? "Sign in to access your dashboard" : "Get started with your new account"}
        </p>

        {error && (
          <div
            className={`p-3 rounded-md text-sm border mb-4 ${
              error.includes("successfully")
                ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
                : "bg-red-950/50 text-red-400 border-red-800"
            }`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50"
          >
            {submitting ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <span className="relative bg-slate-800 px-3 text-xs text-slate-400 font-medium uppercase">
            Or continue with
          </span>
        </div>

        {/* OAuth Endpoints */}
        <div className="space-y-2">
          <a
            href={`${API_BASE}/github`}
            className="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-950 text-white font-medium py-2 rounded-lg text-sm border border-slate-700 transition-colors"
          >
            GitHub
          </a>
          <a
            href={`${API_BASE}/google`}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            Google
          </a>
          <a
            href={`${API_BASE}/facebook`}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            Facebook
          </a>
        </div>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-blue-400 hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-400 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}