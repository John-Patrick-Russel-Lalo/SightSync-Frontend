import React, { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import {
  Users,
  ShieldCheck,
  Search,
  UserX,
  LogOut,
  Bell,
  Settings,
  Loader2,
  Stethoscope,
  User,
  Globe,
  Share2,
  Calendar,
  Package,
  Clock,
  LayoutDashboard,
  Plus,
  AlertTriangle,
  X,
  Phone,
  Heart,
  FileText,
  Edit3
} from "lucide-react";
import PatientManagementPage from "./admin/PatientManagementPage";
import ScheduleAppointmentPage from "./admin/ScheduleAppointmentPage";
import DoctorManagementPage from "./admin/DoctorManagementPage";

// Express server mount point
const API_USERS_URL = "http://localhost:3500/users";
const API_PATIENTS_URL = "http://localhost:3500/patients";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Role Change Confirmation Modal
  // Structure: { isOpen: boolean, userId: string/number, userDisplayName: string, currentRole: string, newRole: string }
  const [roleChangeModal, setRoleChangeModal] = useState({
    isOpen: false,
    userId: null,
    userDisplayName: "",
    currentRole: "",
    newRole: "",
  });

  // Navigation tab state: 'users' | 'patients' | 'inventory' | 'schedules' | 'doctor-schedules'
  const [activeTab, setActiveTab] = useState("users");

  // Unified fetch utility that automatically includes cookie credentials
  const fetchWithCredentials = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include", // Sends session/HTTP-only cookies automatically
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  };

  // 1. GET /users - Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithCredentials(API_USERS_URL);

      if (res.status === 401 || res.status === 403) {
        throw new Error("Unauthorized: You must be an administrator.");
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await res.json();

      const normalizedData = (Array.isArray(data) ? data : []).map((u) => ({
        ...u,
        status: u.status || "Active",
      }));

      setUsers(normalizedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Trigger modal when select dropdown changes
  const initiateRoleChange = (u, newRole) => {
    const currentRole = u.role || "patient";
    if (newRole === currentRole) return;

    setRoleChangeModal({
      isOpen: true,
      userId: u.id,
      userDisplayName: getUserDisplayName(u),
      currentRole,
      newRole,
    });
  };

  // Confirm role update and perform API request
  const confirmRoleChange = async () => {
    const { userId, newRole } = roleChangeModal;

    try {
      const res = await fetchWithCredentials(`${API_USERS_URL}/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(`Role Update Failed: ${err.message}`);
    } finally {
      closeRoleModal();
    }
  };

  const closeRoleModal = () => {
    setRoleChangeModal({
      isOpen: false,
      userId: null,
      userDisplayName: "",
      currentRole: "",
      newRole: "",
    });
  };

  const getUserDisplayName = (u) => u.display_name || u.username || "Unknown User";

  const renderProviderBadge = (provider) => {
    switch (provider) {
      case "facebook":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60 font-medium">
            <Share2 className="w-3 h-3" /> Facebook
          </span>
        );
      case "github":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-700 bg-stone-200/60 px-2.5 py-1 rounded-full border border-stone-300/60 font-medium">
            <Share2 className="w-3 h-3" /> GitHub
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-100/50 px-2.5 py-1 rounded-full border border-amber-200/60 font-medium">
            <Globe className="w-3 h-3 text-amber-700" /> Local
          </span>
        );
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = getUserDisplayName(u).toLowerCase().includes(term);
    const emailMatch = u.email ? u.email.toLowerCase().includes(term) : false;
    const usernameMatch = u.username ? u.username.toLowerCase().includes(term) : false;
    const matchesSearch = nameMatch || emailMatch || usernameMatch;

    const matchesRole =
      roleFilter === "all" ? true : (u.role || "patient").toLowerCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  const navItems = [
    { id: "users", label: "User Directory", icon: LayoutDashboard },
    { id: "patients", label: "Patient Management", icon: User },
    { id: "doctors", label: "Doctor Management", icon: User },
    { id: "inventory", label: "Inventory Management", icon: Package },
    { id: "schedules", label: "Schedule Management", icon: Calendar },
    { id: "doctor-schedules", label: "Doctor Schedules", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#EDE3D8] text-stone-800 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#EDE3D8] border-r border-[#DCD0C0] flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#8B1E42] text-white p-2.5 rounded-xl shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-stone-900 leading-tight">Admin Portal</h1>
              <span className="text-xs font-medium text-stone-500">System & Users</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "bg-[#8B1E42] text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900 hover:bg-[#E2D6C7]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#DCD0C0] bg-[#E8DDD0]/50 flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <div className="text-sm font-semibold text-stone-900 truncate">
              {user?.display_name || user?.name || user?.username || "Admin User"}
            </div>
            <div className="text-xs text-[#8B1E42] font-semibold uppercase tracking-wider truncate">
              {user?.role || "admin"}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-rose-700 hover:text-rose-800 hover:bg-rose-100/60 rounded-xl transition shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="border-b border-[#DCD0C0] bg-[#EDE3D8]/90 backdrop-blur sticky top-0 z-10 px-8 py-4 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-[#E2D6C7] transition">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-[#E2D6C7] transition">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === "users" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900">System Dashboard</h2>
                  <p className="text-sm text-stone-600">
                    Overview of all active database user accounts, roles, and privileges.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <StatCard
                  title="Total Accounts"
                  value={users.length}
                  icon={<Users className="w-5 h-5 text-[#8B1E42]" />}
                  trend="Live Database Count"
                />
                <StatCard
                  title="Patients"
                  value={users.filter((u) => u.role === "patient").length}
                  icon={<User className="w-5 h-5 text-emerald-700" />}
                  trend="Registered Patients"
                />
                <StatCard
                  title="Doctors"
                  value={users.filter((u) => u.role === "doctor").length}
                  icon={<Stethoscope className="w-5 h-5 text-cyan-700" />}
                  trend="Verified Staff"
                />
                <StatCard
                  title="Admins"
                  value={users.filter((u) => u.role === "admin").length}
                  icon={<ShieldCheck className="w-5 h-5 text-amber-700" />}
                  trend="System Administrators"
                />
              </div>

              <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#EBE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF7F2]">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">User Directory</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Manage accounts, role assignments, and account statuses.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-auto">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search by name, username, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] w-full sm:w-72 transition"
                      />
                    </div>
                    {/* Role Filter Dropdown */}
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full sm:w-auto bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium"
                      >
                        <option value="all">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-16 flex items-center justify-center gap-3 text-stone-500">
                      <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
                      <span className="text-sm font-medium">Fetching user records...</span>
                    </div>
                  ) : error ? (
                    <div className="p-10 text-center bg-rose-50/50">
                      <p className="font-semibold text-rose-800">Failed to load data</p>
                      <p className="text-xs text-stone-600 mt-1">{error}</p>
                      <button
                        onClick={fetchUsers}
                        className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm text-stone-700">
                      <thead className="bg-[#F2EAE1]/80 text-xs uppercase text-stone-500 tracking-wider border-b border-[#EBE3D8] font-semibold">
                        <tr>
                          <th className="px-6 py-3.5">User</th>
                          <th className="px-6 py-3.5">Provider</th>
                          <th className="px-6 py-3.5">Role</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBE3D8]">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-[#F2EAE1]/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {u.avatar_url ? (
                                    <img
                                      src={u.avatar_url}
                                      alt={getUserDisplayName(u)}
                                      className="w-10 h-10 rounded-full object-cover border border-[#DCD0C0]"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#E8DDD0] flex items-center justify-center font-bold text-[#8B1E42] border border-[#DCD0C0]">
                                      {getUserDisplayName(u).charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-stone-900">
                                      {getUserDisplayName(u)}
                                    </div>
                                    <div className="text-xs text-stone-500">
                                      {u.email || `@${u.username}`}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                {renderProviderBadge(u.provider)}
                              </td>

                              <td className="px-6 py-4">
                                <select
                                  value={u.role || "patient"}
                                  onChange={(e) => initiateRoleChange(u, e.target.value)}
                                  className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] capitalize font-medium cursor-pointer"
                                >
                                  <option value="patient">Patient</option>
                                  <option value="doctor">Doctor</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                    u.status === "Active"
                                      ? "bg-emerald-100/70 text-emerald-800 border border-emerald-200"
                                      : "bg-stone-200/70 text-stone-600 border border-stone-300"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      u.status === "Active" ? "bg-emerald-600" : "bg-stone-500"
                                    }`}
                                  />
                                  {u.status || "Active"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-10 text-center text-stone-500">
                              No users found matching your criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "patients" && (
            <PatientManagementPage
              users={users}
              fetchWithCredentials={fetchWithCredentials}
            />
          )}

          {activeTab === "schedules" && <ScheduleAppointmentPage />}
          {activeTab === "doctors" && <DoctorManagementPage users={users} />}

          {activeTab === "inventory" && <InventoryManagementPage />}
          {activeTab === "doctor-schedules" && <DoctorSchedulePage users={users} />}
        </main>
      </div>

      {/* Custom Confirmation Modal */}
      {roleChangeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
            <button
              onClick={closeRoleModal}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-[#EBE3D8] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 border border-amber-200 text-amber-800 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Confirm Role Change</h3>
                <p className="text-xs text-stone-500">System privilege adjustment</p>
              </div>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">
              Are you sure you want to change the role for{" "}
              <strong className="text-stone-900 font-semibold">{roleChangeModal.userDisplayName}</strong> from{" "}
              <span className="capitalize px-2 py-0.5 rounded bg-[#E8DDD0] text-stone-800 font-medium text-xs">
                {roleChangeModal.currentRole}
              </span>{" "}
              to{" "}
              <span className="capitalize px-2 py-0.5 rounded bg-[#8B1E42] text-white font-medium text-xs">
                {roleChangeModal.newRole}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EBE3D8]">
              <button
                type="button"
                onClick={closeRoleModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-[#E2D6C7] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRoleChange}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] shadow-sm transition"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-[#F8F3EC] border border-[#DCD0C0] p-5 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</span>
        <div className="p-2.5 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC]">{icon}</div>
      </div>
      <div className="text-3xl font-extrabold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 font-medium">{trend}</div>
    </div>
  );
}

function InventoryManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Inventory Management</h2>
          <p className="text-sm text-stone-600">Track medication stock levels, supplies, and replenishment schedules.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#8B1E42] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#731836] transition shadow-sm">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-6 shadow-sm">
        <p className="text-stone-600 text-sm">Inventory stock data module loaded and connected.</p>
      </div>
    </div>
  );
}


function DoctorSchedulePage({ users }) {
  const doctors = users.filter((u) => u.role === "doctor");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Doctor Schedules</h2>
          <p className="text-sm text-stone-600">Manage duty shifts and consultation availability for medical staff.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.length > 0 ? (
          doctors.map((doc) => (
            <div key={doc.id} className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-bold border border-cyan-200">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{doc.display_name || doc.username}</h3>
                  <span className="text-xs text-stone-500">{doc.email || "No email available"}</span>
                </div>
              </div>

              <div className="bg-[#F2EAE1] p-3 rounded-xl space-y-2 border border-[#E3D8CC] text-xs">
                <div className="flex justify-between text-stone-700">
                  <span className="font-medium">Shift Hours:</span>
                  <span>08:00 AM - 04:00 PM</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span className="font-medium">Duty Days:</span>
                  <span>Mon - Fri</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-6 text-center text-stone-500">
            No active doctor accounts assigned in system.
          </div>
        )}
      </div>
    </div>
  );
}