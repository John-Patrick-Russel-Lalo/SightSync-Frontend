import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Stethoscope,
  Loader2,
  AlertCircle,
  Check,
  Hourglass,
  FileText,
} from "lucide-react";
import MonthCalendar from "./MonthCalendar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3500";

function formatDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatAppointment(app) {
  const startDate = app.start_time ? new Date(app.start_time) : null;
  const formattedTime = startDate
    ? startDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

  return {
    id: app.id,
    doctorId: app.doctor_id,
    time: formattedTime,
    type: app.notes || "General Consultation",
    status: app.status || "pending",
    rawDate: startDate ? formatDateString(startDate) : "",
    startTime: app.start_time,
    endTime: app.end_time,
    notes: app.notes,
  };
}

async function fetchMyAppointments() {
  const response = await fetch(`${API_URL}/appointments/my`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Unauthorized access. Please log in as a patient.");
    }
    throw new Error("Failed to load your appointments.");
  }

  const data = await response.json();
  return (data.appointments || []).map(formatAppointment);
}

async function fetchDoctorNames() {
  const response = await fetch(`${API_URL}/users`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) return {};

  const data = await response.json();
  const doctors = Array.isArray(data) ? data.filter((u) => u.role === "doctor") : [];
  const map = {};
  doctors.forEach((doc) => {
    map[doc.id] = doc.display_name || doc.username || `Doctor #${doc.id}`;
  });
  return map;
}

function getStatusStyle(status) {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "scheduled":
      return {
        badge: "bg-[#52795A]/10 text-[#52795A] border border-[#52795A]/25",
        dot: "bg-[#52795A]",
        label: "Approved",
      };
    case "pending":
      return {
        badge: "bg-[#C08A3E]/10 text-[#C08A3E] border border-[#C08A3E]/25",
        dot: "bg-[#C08A3E]",
        label: "Pending",
      };
    case "completed":
      return {
        badge: "bg-[#52795A]/10 text-[#52795A] border border-[#52795A]/25",
        dot: "bg-[#52795A]",
        label: "Completed",
      };
    case "declined":
    case "cancelled":
    case "canceled":
      return {
        badge: "bg-[#8B1E42]/10 text-[#8B1E42] border border-[#8B1E42]/25",
        dot: "bg-[#8B1E42]",
        label: "Declined",
      };
    default:
      return {
        badge: "bg-[#DCCFBF]/40 text-[#8B7562] border border-[#DCCFBF]",
        dot: "bg-[#8B7562]",
        label: s || "Scheduled",
      };
  }
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctorNames, setDoctorNames] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchMyAppointments()
      .then((list) => {
        if (cancelled) return;
        setAppointments(list);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetchDoctorNames()
      .then((map) => {
        if (!cancelled) setDoctorNames(map);
      })
      .catch((err) => {
        console.error("Failed to fetch doctor names:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDateStr = formatDateString(selectedDate);
  const todaysAppointments = appointments.filter(
    (app) => !app.rawDate || app.rawDate === selectedDateStr
  );

  const scheduledDays = appointments
    .filter((app) => {
      if (!app.rawDate) return false;
      const appDate = new Date(app.rawDate + "T00:00:00");
      return (
        appDate.getMonth() === selectedDate.getMonth() &&
        appDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .map((app) => new Date(app.rawDate + "T00:00:00").getDate());

  const pendingCount = appointments.filter(
    (app) => (app.status || "").toLowerCase() === "pending"
  ).length;
  const approvedCount = appointments.filter(
    (app) => (app.status || "").toLowerCase() === "scheduled"
  ).length;

  const filteredAppointments = todaysAppointments.filter((app) => {
    const status = (app.status || "").toLowerCase();
    if (activeFilter === "pending") return status === "pending";
    if (activeFilter === "approved") return status === "scheduled";
    return true;
  });

  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Appointments Section */}
      <section className="w-full lg:flex-1 bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl overflow-hidden shadow-sm">
        {/* Header Controls */}
        <div className="p-7 border-b border-[#DCCFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#3D2E28]">
              My Appointments for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h2>
            <p className="text-sm text-[#8B7562] mt-0.5">
              Review your pending and approved appointments.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 p-7 pb-0">
          <div className="bg-[#C08A3E]/10 border border-[#C08A3E]/25 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-[#C08A3E]">
                  Pending
                </div>
                <div className="text-3xl font-bold text-[#3D2E28] mt-1">{pendingCount}</div>
              </div>
              <div className="bg-[#C08A3E]/15 text-[#C08A3E] p-2.5 rounded-xl">
                <Hourglass className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="bg-[#52795A]/10 border border-[#52795A]/25 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-[#52795A]">
                  Approved
                </div>
                <div className="text-3xl font-bold text-[#3D2E28] mt-1">{approvedCount}</div>
              </div>
              <div className="bg-[#52795A]/15 text-[#52795A] p-2.5 rounded-xl">
                <Check className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="p-7 pb-0 flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeFilter === f.id
                  ? "bg-[#8B1E42] text-white shadow-sm"
                  : "bg-[#EDE3D8] text-[#8B7562] hover:text-[#3D2E28] border border-[#DCCFBF]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Appointments list */}
        <div className="p-7">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-[#8B7562] gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading appointments...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12 text-[#8B1E42] gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-3">
              {filteredAppointments.map((app) => {
                const style = getStatusStyle(app.status);
                return (
                  <div
                    key={app.id}
                    className="bg-[#EDE3D8]/60 border border-[#DCCFBF] rounded-2xl p-4 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#3D2E28]">Appointment #{app.id}</span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${style.badge}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#5B4B41]">
                        <Stethoscope className="w-4 h-4 text-[#8B1E42] shrink-0" />
                        <span className="font-medium truncate">
                          {doctorNames[app.doctorId] || `Doctor #${app.doctorId}`}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#5B4B41]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#8B1E42] shrink-0" />
                          {new Date(app.rawDate + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-[#8B1E42] font-semibold">
                          <Clock className="w-4 h-4 shrink-0" />
                          {app.time}
                        </span>
                      </div>
                      {app.notes && (
                        <div className="flex items-start gap-2 text-xs text-[#8B7562] pt-0.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="italic truncate">"{app.notes}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-12 text-[#8B7562]">
              No appointments found for this date.
            </div>
          )}
        </div>
      </section>

      {/* Calendar Box Section */}
      <div className="w-full lg:w-auto flex justify-start">
        <MonthCalendar
          scheduledDays={scheduledDays}
          selected={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>
    </div>
  );
}