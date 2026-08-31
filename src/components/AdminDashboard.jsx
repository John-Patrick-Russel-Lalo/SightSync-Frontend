import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  ShieldCheck,
  Activity,
  AlertCircle,
  Search,
  UserCheck,
  UserX,
  LogOut,
  Bell,
  Settings,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Sample user management state (Replace with real API data)
  const [users, setUsers] = useState([
    { id: 1, name: "Alex Johnson", email: "alex@example.com", role: "admin", status: "Active" },
    { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "editor", status: "Active" },
    { id: 3, name: "Michael Brown", email: "michael@example.com", role: "user", status: "Inactive" },
    { id: 4, name: "Emily Davis", email: "emily@example.com", role: "user", status: "Active" },
  ]);

  const handleRoleChange = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u
      )
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-none">Admin Portal</h1>
            <span className="text-xs text-slate-400">Control Panel</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name || "Admin User"}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">{user?.role || "admin"}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<Users className="w-5 h-5 text-indigo-400" />}
            trend="+12% from last month"
          />
          <StatCard
            title="Active Sessions"
            value="42"
            icon={<Activity className="w-5 h-5 text-emerald-400" />}
            trend="Normal load"
          />
          <StatCard
            title="Admins"
            value={users.filter((u) => u.role === "admin").length}
            icon={<ShieldCheck className="w-5 h-5 text-amber-400" />}
            trend="Strict access"
          />
          <StatCard
            title="System Alerts"
            value="0"
            icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
            trend="All services operational"
          />
        </div>

        {/* User Management Section */}
        <section className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">User Management</h2>
              <p className="text-sm text-slate-400">
                Manage accounts, role assignments, and account statuses.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="user">User</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            u.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-700/40 text-slate-400 border border-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === "Active" ? "bg-emerald-400" : "bg-slate-500"
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`p-1.5 rounded-md hover:bg-slate-700 transition ${
                            u.status === "Active"
                              ? "text-rose-400 hover:text-rose-300"
                              : "text-emerald-400 hover:text-emerald-300"
                          }`}
                          title={u.status === "Active" ? "Deactivate User" : "Activate User"}
                        >
                          {u.status === "Active" ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

// Reusable Stat Card Subcomponent
function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-500">{trend}</div>
    </div>
  );
}