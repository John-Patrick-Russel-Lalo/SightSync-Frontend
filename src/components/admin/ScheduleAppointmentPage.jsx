import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Adjust path if necessary

const API_APPOINTMENTS_BASE = "http://localhost:3500/appointments";
const API_USERS_URL = "http://localhost:3500/users";

export default function ScheduleAppointmentPage() {
  const { user } = useAuth(); // Logged in user context

  // Data lists
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Form states
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null); // Selected patient object
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");

  // Patient Search and Filter States
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientProviderFilter, setPatientProviderFilter] = useState("all");
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  // Appointment List Search, Filter & Calendar States
  const [apptSearchTerm, setApptSearchTerm] = useState("");
  const [apptStatusFilter, setApptStatusFilter] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // UI / Async States
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Auto-set patient if logged-in user is a patient
  useEffect(() => {
    if (user && user.role === "patient") {
      setSelectedPatient(user);
    }
  }, [user]);

  // Utility fetch function including credentials
  const fetchWithCredentials = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  };

  // Helper function to format date and time into easy human-readable text
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;

    const formattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const formattedTime = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (formattedTime === "12:00 AM" && !dateStr.includes("T") && !dateStr.includes(":")) {
      return formattedDate;
    }

    return `${formattedDate} • ${formattedTime}`;
  };

  // Helper function to return proper status badge color styles
  const getStatusBadgeStyle = (status) => {
    const s = (status || "scheduled").toLowerCase();
    switch (s) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
      case "canceled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "scheduled":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // 1. Fetch Doctors and Patients lists on mount
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const res = await fetchWithCredentials(API_USERS_URL);
        if (res.ok) {
          const data = await res.json();
          const doctorsList = data.filter((u) => u.role === "doctor");
          setDoctors(doctorsList);

          if (user?.role === "admin") {
            const patientsList = data.filter((u) => u.role === "patient");
            setPatients(patientsList);
          }
        }
      } catch (err) {
        console.error("Failed to load doctors or patients:", err);
      }
    };

    fetchUsersData();
    if (user?.role === "admin" || user?.role === "doctor") {
      fetchExistingAppointments();
    }
  }, [user]);

  // 2. Fetch Available Slots whenever Doctor or Date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setError(null);
      setSelectedSlot("");

      try {
        const res = await fetchWithCredentials(
          `${API_APPOINTMENTS_BASE}/${selectedDoctorId}/${selectedDate}`
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch available slots.");
        }

        const data = await res.json();
        setAvailableSlots(data.availableSlots || []);
      } catch (err) {
        setError(err.message);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  // 3. Fetch all appointments
  const fetchExistingAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await fetchWithCredentials(API_APPOINTMENTS_BASE);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const getPatientDisplayName = (p) =>
    p?.display_name || p?.username || p?.email || `Patient ID: ${p?.id}`;

   // Local YYYY-MM-DD Helper
const getLocalDateString = (dateObj) => {
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const filteredPatients = patients.filter((p) => {
    const term = patientSearchTerm.toLowerCase();
    const nameMatch = getPatientDisplayName(p).toLowerCase().includes(term);
    const emailMatch = p.email ? p.email.toLowerCase().includes(term) : false;
    const usernameMatch = p.username ? p.username.toLowerCase().includes(term) : false;
    const idMatch = p.id ? String(p.id).includes(term) : false;

    const matchesSearch = nameMatch || emailMatch || usernameMatch || idMatch;
    const matchesProvider =
      patientProviderFilter === "all"
        ? true
        : (p.provider || "local").toLowerCase() === patientProviderFilter.toLowerCase();

    return matchesSearch && matchesProvider;
  });

  // Filter and Sort Appointments based on search, status filter, and selected calendar date
  const processedAppointments = useMemo(() => {
    const now = new Date().getTime();

    return appointments
      .filter((apt) => {
        const term = apptSearchTerm.toLowerCase();
        const rawDate = apt.start_time || apt.date;
        const readableTimeStr = formatDateTime(rawDate).toLowerCase();

        const matchesSearch =
          String(apt.id).includes(term) ||
          String(apt.doctor_id).includes(term) ||
          String(apt.patient_id).includes(term) ||
          readableTimeStr.includes(term) ||
          (apt.notes && apt.notes.toLowerCase().includes(term));

        const matchesStatus =
          apptStatusFilter === "all"
            ? true
            : (apt.status || "").toLowerCase() === apptStatusFilter.toLowerCase();

        // Calendar date filter matching
        let matchesCalendarDate = true;
        if (selectedCalendarDate && rawDate) {
  const aptDateISO = getLocalDateString(rawDate);
  matchesCalendarDate = aptDateISO === selectedCalendarDate;
}

        return matchesSearch && matchesStatus && matchesCalendarDate;
      })
      .sort((a, b) => {
        const timeA = new Date(a.start_time || a.date).getTime();
        const timeB = new Date(b.start_time || b.date).getTime();

        const diffA = isNaN(timeA) ? Infinity : Math.abs(timeA - now);
        const diffB = isNaN(timeB) ? Infinity : Math.abs(timeB - now);

        return diffA - diffB;
      });
  }, [appointments, apptSearchTerm, apptStatusFilter, selectedCalendarDate]);


   
  // Generate calendar grid dates for current month view
  const calendarGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();

    const grid = [];

    // Prepend padding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      grid.push({ date: prevDate, isCurrentMonth: false });
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const currDate = new Date(year, month, day);
      grid.push({ date: currDate, isCurrentMonth: true });
    }

    // Append padding days for next month to complete row grid (multiples of 7)
    const remainingSlots = 7 - (grid.length % 7);
    if (remainingSlots < 7) {
      for (let day = 1; day <= remainingSlots; day++) {
        const nextDate = new Date(year, month + 1, day);
        grid.push({ date: nextDate, isCurrentMonth: false });
      }
    }

    return grid;
  }, [calendarMonth]);



  // Set of dates that have at least one appointment for quick indicator lookup
const appointmentDatesSet = useMemo(() => {
  const set = new Set();
  appointments.forEach((apt) => {
    const rawDate = apt.start_time || apt.date;
    if (rawDate) {
      const dateISO = getLocalDateString(rawDate);
      set.add(dateISO);
    }
  });
  return set;
}, [appointments]);

  // Handle Appointment Booking Form Submission
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const isPatientRole = user?.role === "patient";
    const patientIdToUse = isPatientRole ? user?.id : selectedPatient?.id;

    if (!selectedDoctorId) return setError("Please select a doctor.");
    if (!selectedDate) return setError("Please select a date.");
    if (!selectedSlot) return setError("Please select an available time slot.");
    if (!isPatientRole && !patientIdToUse) {
      return setError("Please search and select a patient.");
    }

    setLoadingSubmit(true);

    try {
      const endpoint = isPatientRole
        ? `${API_APPOINTMENTS_BASE}/patient`
        : API_APPOINTMENTS_BASE;

      const payload = isPatientRole
        ? {
            doctorId: selectedDoctorId,
            date: selectedDate,
            slot: selectedSlot,
            notes,
          }
        : {
            doctorId: selectedDoctorId,
            patientId: patientIdToUse,
            date: selectedDate,
            slot: selectedSlot,
            notes,
          };

      const res = await fetchWithCredentials(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment.");
      }

      setSuccessMessage("Appointment booked successfully!");
      setNotes("");
      setSelectedSlot("");

      const updatedSlotsRes = await fetchWithCredentials(
        `${API_APPOINTMENTS_BASE}/${selectedDoctorId}/${selectedDate}`
      );
      if (updatedSlotsRes.ok) {
        const updatedSlotsData = await updatedSlotsRes.json();
        setAvailableSlots(updatedSlotsData.availableSlots || []);
      }

      if (user?.role === "admin" || user?.role === "doctor") {
        fetchExistingAppointments();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleUpdateStatus = async (aptId, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'scheduled' ? 'approve' : 'decline'} this appointment?`)) return;

    try {
      const res = await fetchWithCredentials(`${API_APPOINTMENTS_BASE}/${aptId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update appointment status.");
      }

      setSuccessMessage(`Appointment successfully ${newStatus === 'scheduled' ? 'approved' : 'declined'}.`);
      fetchExistingAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Schedule Appointment</h2>
          <p className="text-sm text-stone-600">
            Select a doctor, pick an available time slot, and confirm your booking.
          </p>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <form
          onSubmit={handleBookAppointment}
          className="lg:col-span-2 bg-[#F8F3EC] border border-[#DCD0C0] p-6 rounded-2xl shadow-sm space-y-6"
        >
          <h3 className="text-lg font-bold text-stone-900 border-b border-[#EBE3D8] pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#8B1E42]" /> New Appointment Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Select Doctor */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Doctor
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.display_name || doc.username || `Doctor ID: ${doc.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Date */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Date
              </label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                />
              </div>
            </div>
          </div>

          {/* Select Patient Section */}
          {user?.role === "admin" && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Select Patient
              </label>

              {selectedPatient ? (
                <div className="flex items-center justify-between p-3 bg-[#EAE0D5] border border-[#DCD0C0] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B1E42] text-white flex items-center justify-center font-bold text-xs">
                      {getPatientDisplayName(selectedPatient).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        {getPatientDisplayName(selectedPatient)}
                      </p>
                      <p className="text-xs text-stone-600">
                        ID: #{selectedPatient.id} {selectedPatient.email ? `• ${selectedPatient.email}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setIsPatientDropdownOpen(true);
                    }}
                    className="p-1 text-stone-500 hover:text-stone-800 hover:bg-[#DCD0C0]/50 rounded-lg transition"
                    title="Change Patient"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search patient by name, email, or ID..."
                        value={patientSearchTerm}
                        onFocus={() => setIsPatientDropdownOpen(true)}
                        onChange={(e) => {
                          setPatientSearchTerm(e.target.value);
                          setIsPatientDropdownOpen(true);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                      />
                    </div>

                    <div className="relative shrink-0">
                      <div className="flex items-center gap-1.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-2.5 py-2 text-xs font-medium text-stone-700">
                        <Filter className="w-3.5 h-3.5 text-stone-500" />
                        <select
                          value={patientProviderFilter}
                          onChange={(e) => setPatientProviderFilter(e.target.value)}
                          className="bg-transparent focus:outline-none cursor-pointer pr-1"
                        >
                          <option value="all">All Providers</option>
                          <option value="local">Local</option>
                          <option value="facebook">Facebook</option>
                          <option value="github">GitHub</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {isPatientDropdownOpen && (
                    <div className="absolute z-20 w-full bg-[#F8F3EC] border border-[#DCD0C0] rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-[#EBE3D8]">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((pat) => (
                          <div
                            key={pat.id}
                            onClick={() => {
                              setSelectedPatient(pat);
                              setIsPatientDropdownOpen(false);
                            }}
                            className="p-3 hover:bg-[#F2EAE1] cursor-pointer transition flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-[#8B1E42]" />
                              <div>
                                <p className="text-xs font-bold text-stone-900">
                                  {getPatientDisplayName(pat)}
                                </p>
                                <p className="text-[11px] text-stone-500">
                                  ID: #{pat.id} {pat.email ? `• ${pat.email}` : ""}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#E8DDD0] text-stone-700">
                              {pat.provider || "Local"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-stone-500 text-center">
                          No matching patients found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Time Slot Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Available Time Slots
            </label>

            {!selectedDoctorId ? (
              <p className="text-xs text-stone-500 italic">
                Please select a doctor and date to view available time slots.
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center gap-2 text-xs text-stone-500 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B1E42]" />
                Checking available slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                No slots available on this date. Doctor may be off duty or fully booked.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-[#8B1E42] text-white border-[#8B1E42] shadow-sm"
                          : "bg-[#F2EAE1] text-stone-800 border-[#DCD0C0] hover:bg-[#EAE0D5]"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Notes / Symptoms (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for visit or any medical notes..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loadingSubmit || !selectedSlot}
            className="w-full py-3 bg-[#8B1E42] text-white font-semibold rounded-xl hover:bg-[#731836] disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2"
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Booking Appointment...
              </>
            ) : (
              "Confirm & Book Appointment"
            )}
          </button>
        </form>

        {/* Existing Appointments Sidebar (For Doctor / Admin Overview) */}
        {(user?.role === "admin" || user?.role === "doctor") && (
          <div className="bg-[#F8F3EC] border border-[#DCD0C0] p-6 rounded-2xl shadow-sm space-y-6 h-fit">
            <div className="pb-3 border-b border-[#EBE3D8]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-stone-900">Appointments List</h3>
                <button
                  onClick={fetchExistingAppointments}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-[#EBE3D8] transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {processedAppointments.length} record{processedAppointments.length === 1 ? "" : "s"} (filtered)
              </p>
            </div>

            {/* Custom Interactive Calendar */}
            <div className="bg-[#F2EAE1] border border-[#DCD0C0] p-4 rounded-xl space-y-3">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">
                  {calendarMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                      )
                    }
                    className="p-1 text-stone-600 hover:bg-[#E2D6C7] rounded-lg transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                      )
                    }
                    className="p-1 text-stone-600 hover:bg-[#E2D6C7] rounded-lg transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-stone-500">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarGrid.map((item, idx) => {
                  const isoDate = getLocalDateString(item.date);
                const todayISO = getLocalDateString(new Date());
                  const isToday = isoDate === todayISO;
                  const isSelected = selectedCalendarDate === isoDate;
                  const hasAppointments = appointmentDatesSet.has(isoDate);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedCalendarDate(isSelected ? null : isoDate);
                      }}
                      className={`h-8 w-full rounded-lg flex flex-col items-center justify-center relative transition ${
                        !item.isCurrentMonth
                          ? "text-stone-300"
                          : isSelected
                          ? "bg-[#8B1E42] text-white font-bold"
                          : isToday
                          ? "bg-[#DCD0C0] text-stone-900 font-bold"
                          : "text-stone-800 hover:bg-[#E5DAD0]"
                      }`}
                    >
                      <span>{item.date.getDate()}</span>
                      {hasAppointments && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                            isSelected ? "bg-white" : "bg-[#8B1E42]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Filter Reset Chip */}
              {selectedCalendarDate && (
                <div className="flex items-center justify-between pt-2 border-t border-[#DCD0C0] text-xs">
                  <span className="text-stone-600">
                    Filtered by: <strong>{selectedCalendarDate}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-[#8B1E42] hover:underline font-medium text-[11px]"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* Appointment Search Bar & Filter Controls */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={apptSearchTerm}
                  onChange={(e) => setApptSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-stone-500 text-[11px] font-medium">Status Filter:</span>
                <div className="relative">
                  <select
                    value={apptStatusFilter}
                    onChange={(e) => setApptStatusFilter(e.target.value)}
                    className="bg-[#F2EAE1] border border-[#DCD0C0] text-stone-700 px-2.5 py-1 rounded-lg text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {loadingAppointments ? (
              <div className="flex items-center justify-center gap-2 text-xs text-stone-500 py-8">
                <Loader2 className="w-4 h-4 animate-spin text-[#8B1E42]" />
                Loading appointments...
              </div>
            ) : processedAppointments.length === 0 ? (
              <p className="text-xs text-stone-500 py-6 text-center">
                No matching appointments found.
              </p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {processedAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                      <span>Appt #{apt.id}</span>
                      <span
                        className={`capitalize px-2 py-0.5 rounded border text-[11px] font-semibold ${getStatusBadgeStyle(
                          apt.status
                        )}`}
                      >
                        {apt.status || "Scheduled"}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1">
                      <p>
                        <strong>Doctor ID:</strong> {apt.doctor_id} |{" "}
                        <strong>Patient ID:</strong> {apt.patient_id}
                      </p>

                      <p className="flex items-center gap-1.5 text-stone-900 font-semibold pt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#8B1E42] shrink-0" />
                        <span>{formatDateTime(apt.start_time || apt.date)}</span>
                      </p>

                      {apt.notes && (
                        <p className="italic text-stone-500 truncate pt-0.5">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>
                    {user?.role === "admin" && apt.status === "pending" && (
                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E3D8CC] mt-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'declined')}
                          className="px-3 py-1 text-[11px] font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(apt.id, 'scheduled')}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-[#8B1E42] hover:bg-[#731836] rounded-lg shadow-sm transition"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}