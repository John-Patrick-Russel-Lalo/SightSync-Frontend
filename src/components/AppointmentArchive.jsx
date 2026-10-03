import { useState, useEffect, useMemo } from "react";
import {
  Archive,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
} from "lucide-react";

const API_URL = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "N/A";
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} • ${formattedTime}`;
}

function getStatusBadgeStyle(status) {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "no_show":
    case "no-show":
    case "noshow":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "declined":
    case "cancelled":
    case "canceled":
      return "bg-[#8B1E42]/10 text-[#8B1E42] border-[#8B1E42]/25";
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}

export default function AppointmentArchive({ scope = "my", users = null }) {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorNames, setDoctorNames] = useState({});
  const [reloadKey, setReloadKey] = useState(0);

  const endpoint =
    scope === "all"
      ? `${API_URL}/appointments/archive`
      : `${API_URL}/appointments/archive/my`;

  const nameMaps = useMemo(() => {
    const doctors = {};
    const patients = {};
    if (Array.isArray(users)) {
      users.forEach((u) => {
        const name = u.display_name || u.username || `User #${u.id}`;
        if (u.role === "doctor") doctors[u.id] = name;
        if (u.role === "patient") patients[u.id] = name;
      });
    }
    return { doctors, patients };
  }, [users]);

  useEffect(() => {
    let cancelled = false;

    fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error("Unauthorized access.");
          }
          throw new Error("Failed to load archived appointments.");
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setArchives(data.archives || []);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, reloadKey]);

  useEffect(() => {
    if (scope !== "my") return;

    let cancelled = false;
    fetch(`${API_URL}/doctors/available`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (cancelled) return;
        const map = {};
        (data.data || []).forEach((doc) => {
          map[doc.user_id] =
            doc.display_name || doc.username || `Doctor #${doc.user_id}`;
        });
        setDoctorNames(map);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [scope]);

  const reload = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const filteredArchives = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return archives.filter((a) => {
      const doctorName = doctorNames[a.doctor_id] || nameMaps.doctors[a.doctor_id] || `Doctor #${a.doctor_id}`;
      const patientName = nameMaps.patients[a.patient_id] || `Patient #${a.patient_id}`;
      const s = (a.status || "").toLowerCase();
      const matchesStatus =
        statusFilter === "all" || s === statusFilter.toLowerCase();
      const matchesSearch =
        String(a.id).includes(term) ||
        doctorName.toLowerCase().includes(term) ||
        patientName.toLowerCase().includes(term) ||
        (a.notes && a.notes.toLowerCase().includes(term)) ||
        formatDateTime(a.start_time || a.archived_at).toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [archives, searchTerm, statusFilter, doctorNames, nameMaps]);

  const isAllScope = scope === "all";

  return (
    <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-[#EBE3D8] bg-[#FAF7F2]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-[#8B1E42]/10 text-[#8B1E42] rounded-xl border border-[#8B1E42]/15 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {isAllScope ? "Appointment Archive" : "My Archived Appointments"}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isAllScope
                  ? "Declined and no-show appointment history for all patients."
                  : "Your declined and no-show appointment history."}
              </p>
            </div>
          </div>

          <button
            onClick={reload}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 bg-[#F2EAE1] border border-[#DCD0C0] hover:text-[#8B1E42] transition w-full sm:w-auto shrink-0"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by record, patient, doctor, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="declined">Declined</option>
              <option value="no_show">No-Show</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 sm:p-16 flex flex-col sm:flex-row items-center justify-center gap-3 text-stone-500 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42] shrink-0" />
            <span className="text-sm font-medium">Loading archived appointments...</span>
          </div>
        ) : error ? (
          <div className="p-8 sm:p-10 text-center bg-rose-50/50">
            <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
            <p className="mt-2 font-semibold text-rose-800">Failed to load data</p>
            <p className="text-xs text-stone-600 mt-1 break-words">{error}</p>
            <button
              onClick={reload}
              className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
            >
              Retry
            </button>
          </div>
        ) : filteredArchives.length === 0 ? (
          <div className="p-10 sm:p-16 text-center text-stone-500">
            <Archive className="w-8 h-8 mx-auto text-stone-300" />
            <p className="mt-3 text-sm font-medium">
              {searchTerm || statusFilter !== "all"
                ? "No archived appointments match your filters."
                : "No archived appointments yet."}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm text-stone-700">
            <thead className="bg-[#F2EAE1]/80 text-xs uppercase text-stone-500 tracking-wider border-b border-[#EBE3D8] font-semibold">
              <tr>
                <th className="px-4 sm:px-6 py-3.5">Record</th>
                <th className="px-4 sm:px-6 py-3.5">Date &amp; Time</th>
                {isAllScope && <th className="px-4 sm:px-6 py-3.5">Patient</th>}
                <th className="px-4 sm:px-6 py-3.5">Doctor</th>
                <th className="px-4 sm:px-6 py-3.5">Reason / Notes</th>
                <th className="px-4 sm:px-6 py-3.5">Status</th>
                <th className="px-4 sm:px-6 py-3.5">Archived On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3D8]">
              {filteredArchives.map((a) => {
                const doctorName = doctorNames[a.doctor_id] || nameMaps.doctors[a.doctor_id] || `Doctor #${a.doctor_id}`;
                const patientName = nameMaps.patients[a.patient_id] || `Patient #${a.patient_id}`;
                return (
                <tr key={a.id} className="hover:bg-[#F2EAE1]/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-mono text-xs font-semibold text-[#8B1E42] whitespace-nowrap">
                    #{a.id}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-stone-800 font-medium">
                      <Calendar className="w-4 h-4 text-[#8B1E42] shrink-0" />
                      {formatDateTime(a.start_time)}
                    </div>
                  </td>
                  {isAllScope && (
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#E8DDD0] flex items-center justify-center text-[#8B1E42] font-bold text-xs shrink-0">
                          {patientName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-stone-900">
                          {patientName}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F2EAE1] border border-[#DCD0C0] flex items-center justify-center text-[#8B1E42] text-xs shrink-0">
                        <Stethoscope className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-stone-900">
                        {doctorName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 max-w-[240px]">
                    <div className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span className="text-stone-600 italic truncate">
                        {a.notes ? `"${a.notes}"` : "No notes provided"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusBadgeStyle(
                        a.status
                      )}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          (a.status || "").toLowerCase() === "no_show" ||
                          (a.status || "").toLowerCase() === "no-show"
                            ? "bg-amber-600"
                            : "bg-[#8B1E42]"
                        }`}
                      />
                      {(a.status || "archived").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {formatDateTime(a.archived_at)}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}