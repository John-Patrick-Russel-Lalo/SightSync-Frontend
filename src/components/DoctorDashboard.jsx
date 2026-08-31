import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  UserCheck,
  Clock,
  Calendar,
  AlertCircle,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  LogOut,
  Bell,
  Stethoscope,
  PlusCircle,
} from "lucide-react";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Sample medical appointments state (Replace with real API data)
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "John Doe",
      age: 45,
      gender: "Male",
      time: "09:00 AM",
      type: "General Checkup",
      status: "Completed",
    },
    {
      id: 2,
      patientName: "Jane Smith",
      age: 32,
      gender: "Female",
      time: "10:30 AM",
      type: "Follow-up",
      status: "In Consultation",
    },
    {
      id: 3,
      patientName: "Robert Johnson",
      age: 58,
      gender: "Male",
      time: "01:15 PM",
      type: "Cardiology Consult",
      status: "Waiting",
    },
    {
      id: 4,
      patientName: "Maria Garcia",
      age: 27,
      gender: "Female",
      time: "03:00 PM",
      type: "Lab Results Review",
      status: "Waiting",
    },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
  };

  const filteredAppointments = appointments.filter(
    (app) =>
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600/20 text-teal-400 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-none">Doctor Portal</h1>
            <span className="text-xs text-slate-400">Clinical Management</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <Bell className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium">{user?.name || "Dr. Alex Smith"}</div>
              <div className="text-xs text-teal-400 font-medium uppercase tracking-wider">
                {user?.role || "doctor"}
              </div>
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
        {/* Clinical Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Today"
            value={appointments.length}
            icon={<Calendar className="w-5 h-5 text-teal-400" />}
            subtitle="Scheduled visits"
          />
          <StatCard
            title="In Consultation"
            value={appointments.filter((a) => a.status === "In Consultation").length}
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            subtitle="Active patient"
          />
          <StatCard
            title="Completed"
            value={appointments.filter((a) => a.status === "Completed").length}
            icon={<UserCheck className="w-5 h-5 text-emerald-400" />}
            subtitle="Visits finished"
          />
          <StatCard
            title="Pending Reports"
            value="3"
            icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
            subtitle="Requires review"
          />
        </div>

        {/* Appointments & Patient Management Table */}
        <section className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden">
          {/* Header Controls */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Today's Appointments</h2>
              <p className="text-sm text-slate-400">
                Track patient queue, visit status, and medical history access.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 w-full sm:w-64"
                />
              </div>
              <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition">
                <PlusCircle className="w-4 h-4" />
                New Record
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Patient Details</th>
                  <th className="px-6 py-3">Reason for Visit</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-mono text-xs text-teal-400 whitespace-nowrap">
                        {app.time}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{app.patientName}</div>
                        <div className="text-xs text-slate-500">
                          {app.age} yrs • {app.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{app.type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            app.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : app.status === "In Consultation"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-700/40 text-slate-400 border border-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              app.status === "Completed"
                                ? "bg-emerald-400"
                                : app.status === "In Consultation"
                                ? "bg-amber-400"
                                : "bg-slate-500"
                            }`}
                          />
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status !== "Completed" && (
                            <button
                              onClick={() => handleStatusChange(app.id, "Completed")}
                              className="p-1.5 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 transition"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            title="View Medical Chart"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      No appointments matching "{searchTerm}"
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
function StatCard({ title, value, icon, subtitle }) {
  return (
    <div className="bg-slate-800/50 border border-slate-800 p-5 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}