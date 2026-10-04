import { useState, useEffect } from "react";
import {
  Calendar,
  CalendarPlus,
  Clock,
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { parseWallClock, toLocalDateString } from "../../utils/dateTime";

const API_URL = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

export default function BookAppointment() {
  const [doctorList, setDoctorList] = useState([]);
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/doctors/available`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load the list of available doctors.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setDoctorList(data.data || []);
      })
      .catch((err) => {
        if (!cancelled) setBookingMessage({ type: "error", text: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bookingDateStr = toLocalDateString(bookingDate);

  useEffect(() => {
    if (!bookingDoctorId) {
      setAvailableSlots([]);
      return;
    }

    let cancelled = false;

    fetch(`${API_URL}/appointments/${bookingDoctorId}/${bookingDateStr}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAvailableSlots(data.availableSlots || []);
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingDoctorId, bookingDateStr]);

  async function handleRequestAppointment(e) {
    e.preventDefault();
    setBookingMessage(null);

    if (!bookingDoctorId) {
      setBookingMessage({ type: "error", text: "Please select a doctor first." });
      return;
    }
    if (!selectedSlot) {
      setBookingMessage({ type: "error", text: "Please choose an available time slot." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/appointments/patient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          doctorId: Number(bookingDoctorId),
          date: bookingDateStr,
          slot: selectedSlot,
          notes: notes || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit your appointment request.");
      }

      setBookingMessage({
        type: "success",
        text: data.message || "Appointment request submitted successfully.",
      });
      setNotes("");
      setSelectedSlot("");

      const slotsRes = await fetch(
        `${API_URL}/appointments/${bookingDoctorId}/${bookingDateStr}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setAvailableSlots(slotsData.availableSlots || []);
      }
    } catch (err) {
      setBookingMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="w-full bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl overflow-hidden shadow-sm">
      <div className="p-4 sm:p-6 lg:p-7 border-b border-[#DCCFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-[#3D2E28]">Request Appointment</h2>
          <p className="text-sm text-[#8B7562] mt-0.5">
            Pick an available doctor and choose a time slot to submit your appointment request.
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-7">
        {bookingMessage && (
          <div
            className={`flex items-center gap-2 text-sm rounded-2xl px-4 py-3 mb-5 border ${
              bookingMessage.type === "success"
                ? "bg-[#52795A]/10 text-[#52795A] border-[#52795A]/25"
                : "bg-[#8B1E42]/10 text-[#8B1E42] border-[#8B1E42]/25"
            }`}
          >
            {bookingMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="break-words">{bookingMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleRequestAppointment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#8B7562] uppercase tracking-wider mb-2">
              Doctor
            </label>
            <div className="relative">
              <Stethoscope className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7562]" />
              <select
                value={bookingDoctorId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  if (nextId === bookingDoctorId) return;
                  setBookingDoctorId(nextId);
                  setAvailableSlots([]);
                  setSelectedSlot("");
                  setLoadingSlots(Boolean(nextId));
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl text-sm text-[#3D2E28] focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer"
                required
              >
                <option value="">Select Doctor</option>
                {doctorList.map((doc) => (
                  <option key={doc.user_id} value={doc.user_id}>
                    {doc.display_name || doc.username} — {doc.specialty || "General"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B7562] uppercase tracking-wider mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7562]" />
              <input
                type="date"
                value={bookingDateStr}
                min={toLocalDateString(new Date())}
                onChange={(e) => {
                  setBookingDate(parseWallClock(e.target.value) ?? new Date());
                  if (bookingDoctorId) setLoadingSlots(true);
                  setSelectedSlot("");
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl text-sm text-[#3D2E28] focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B7562] uppercase tracking-wider mb-2">
              Time Slot
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7562]" />
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                disabled={!bookingDoctorId || loadingSlots || availableSlots.length === 0}
                className="w-full pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl text-sm text-[#3D2E28] focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                required
              >
                <option value="">
                  {!bookingDoctorId
                    ? "Select a doctor first"
                    : loadingSlots
                    ? "Checking availability..."
                    : availableSlots.length === 0
                    ? "No available slots"
                    : "Select a time slot"}
                </option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B7562] uppercase tracking-wider mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7562]" />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for visit..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl text-sm text-[#3D2E28] placeholder-[#B8A694] focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
              />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B1E42] text-white text-sm font-semibold hover:bg-[#731836] disabled:opacity-50 transition shadow-sm w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4" />
                  Request Appointment
                </>
              )}
            </button>
          </div>
        </form>

        {doctorList.length > 0 && (
          <div className="mt-6 pt-5 border-t border-[#DCCFBF] overflow-x-auto">
            <div className="text-xs font-semibold text-[#8B7562] uppercase tracking-wider mb-3">
              Current available doctors
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {doctorList.map((doc) => (
                <button
                  key={doc.user_id}
                  type="button"
                  onClick={() => {
                    const nextId = String(doc.user_id);
                    if (nextId === bookingDoctorId) return;
                    setBookingDoctorId(nextId);
                    setAvailableSlots([]);
                    setSelectedSlot("");
                    setLoadingSlots(true);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                    bookingDoctorId === String(doc.user_id)
                      ? "bg-[#8B1E42]/10 border-[#8B1E42]/40"
                      : "bg-[#EDE3D8]/60 border-[#DCCFBF] hover:border-[#8B1E42]/40"
                  }`}
                >
                  <span className="w-10 h-10 rounded-full bg-[#8B1E42] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {(doc.display_name || doc.username || "D").charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-sm text-[#3D2E28] truncate">
                      {doc.display_name || doc.username}
                    </span>
                    <span className="block text-xs text-[#8B7562] truncate">
                      {doc.specialty || "General"} — Fee:{" "}
                      {doc.consultation_fee
                        ? `₱${parseFloat(doc.consultation_fee).toFixed(2)}`
                        : "Not Set"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}