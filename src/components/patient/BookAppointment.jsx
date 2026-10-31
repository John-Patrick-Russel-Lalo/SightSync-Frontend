import { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  CalendarPlus,
  ChevronDown,
  Clock,
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  X,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  QrCode,
} from "lucide-react";
import { formatWallClockDate, parseWallClock, toLocalDateString } from "../../utils/dateTime";
import { useNotifications } from "../../context/NotificationContext";
import { cachedFetch } from "../../utils/apiCache";

const API_URL = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PAYMENT_PROOF_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// GCash details shown to the patient before they upload their half-payment proof.
// Update these values to match the clinic's receiving account.
const GCASH = {
  number: "09977261911",
  accountName: "MA*C LE***R M.",
  // Temporary placeholder. Drop the clinic's real GCash QR PNG in
  // public/gcash-qr.png (or point this at another file) when it is ready.
  qrImage: "/gcash-qr.png",
};

function formatPeso(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : null;
}

// Appointments can only be booked from today up to this far ahead, so the
// schedule stays close to the clinic's real operating horizon.
const BOOKING_MIN_DATE = toLocalDateString(new Date());

const BOOKING_MAX_DATE = (() => {
  const max = new Date();
  max.setMonth(max.getMonth() + 2);
  return toLocalDateString(max);
})();

export default function BookAppointment() {
  const { doctorStatuses } = useNotifications();
  const [doctorList, setDoctorList] = useState([]);
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [copiedGcash, setCopiedGcash] = useState(false);
  const [gcashOpen, setGcashOpen] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const fileInputRef = useRef(null);
  const [myAppointments, setMyAppointments] = useState([]);

  // The patient's own requests. A pending request does not take the slot away
  // from everybody else, so the slot stays selectable; it is only marked so the
  // patient cannot send the very same request twice.
  useEffect(() => {
    let cancelled = false;

    cachedFetch(`${API_URL}/appointments/my`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : { appointments: [] }))
      .then((data) => {
        if (!cancelled) setMyAppointments(data.appointments || []);
      })
      .catch(() => {
        if (!cancelled) setMyAppointments([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    cachedFetch(`${API_URL}/doctors/available`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load the list of available doctors.");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = data.data || [];
        setDoctorList(list);
        if (list.length > 0) {
          setBookingDoctorId(String(list[0].user_id));
          setLoadingSlots(true);
        }
      })
      .catch((err) => {
        if (!cancelled) setBookingMessage({ type: "error", text: err.message });
      })
      .finally(() => {
        if (!cancelled) setLoadingDoctors(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bookingDateStr = toLocalDateString(bookingDate);

  useEffect(() => {
    if (!bookingDoctorId) return;

    let cancelled = false;

    cachedFetch(`${API_URL}/appointments/${bookingDoctorId}/${bookingDateStr}`, {
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

  const selectedDoctor = doctorList.find(
    (doc) => String(doc.user_id) === String(bookingDoctorId)
  );
  const consultationFee = selectedDoctor?.consultation_fee;
  const halfPaymentAmount = formatPeso(Number(consultationFee) / 2);

  // Without a doctor selected there is nothing to offer, so the slots of a
  // previously selected doctor are never shown.
  const visibleSlots = bookingDoctorId ? availableSlots : [];

  // Slots this patient already has a pending request for on the chosen date.
  const requestedSlots = useMemo(() => {
    const slots = new Set();

    for (const appointment of myAppointments) {
      if ((appointment.status || "").toLowerCase() !== "pending") continue;
      if (String(appointment.doctor_id) !== String(bookingDoctorId)) continue;

      const start = parseWallClock(appointment.start_time);
      if (!start || toLocalDateString(start) !== bookingDateStr) continue;

      slots.add(
        `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
      );
    }

    return slots;
  }, [myAppointments, bookingDoctorId, bookingDateStr]);

  // Live presence pushed over the websocket: "available" | "in_consultation".
  const presenceOf = (doc) => doctorStatuses[String(doc.user_id)];

  // Release the previous preview object URL so the blob is not leaked.
  useEffect(() => {
    return () => {
      if (paymentProofPreview) URL.revokeObjectURL(paymentProofPreview);
    };
  }, [paymentProofPreview]);

  function handlePaymentProofChange(e) {
    const file = e.target.files?.[0];
    setBookingMessage(null);

    if (!file) {
      setPaymentProof(null);
      setPaymentProofPreview("");
      return;
    }

    if (!ACCEPTED_PAYMENT_PROOF_TYPES.includes(file.type)) {
      setPaymentProof(null);
      setPaymentProofPreview("");
      setBookingMessage({
        type: "error",
        text: "Payment proof must be a JPG, PNG, or WEBP image.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_PAYMENT_PROOF_BYTES) {
      setPaymentProof(null);
      setPaymentProofPreview("");
      setBookingMessage({
        type: "error",
        text: "Payment proof must be 5MB or smaller.",
      });
      e.target.value = "";
      return;
    }

    setPaymentProof(file);
    setPaymentProofPreview(URL.createObjectURL(file));
  }

  function clearPaymentProof() {
    setPaymentProof(null);
    setPaymentProofPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function copyGcashNumber() {
    try {
      await navigator.clipboard.writeText(GCASH.number.replace(/\s+/g, ""));
      setCopiedGcash(true);
      setTimeout(() => setCopiedGcash(false), 2000);
    } catch {
      // Clipboard access may be blocked; the number is still visible on screen.
    }
  }

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
    if (!paymentProof) {
      setBookingMessage({
        type: "error",
        text: "Please upload a photo or screenshot of your half-payment.",
      });
      return;
    }
    if (bookingDateStr > BOOKING_MAX_DATE) {
      setBookingMessage({
        type: "error",
        text: `Appointments can only be booked up to ${formatWallClockDate(BOOKING_MAX_DATE)}.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      // multipart/form-data is required for the payment proof image, so the
      // Content-Type header is intentionally left to the browser.
      const formData = new FormData();
      formData.append("doctorId", String(Number(bookingDoctorId)));
      formData.append("date", bookingDateStr);
      formData.append("slot", selectedSlot);
      if (notes) formData.append("notes", notes);
      formData.append("paymentProof", paymentProof);

      const response = await cachedFetch(`${API_URL}/appointments/patient`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit your appointment request.");
      }

      setBookingMessage({
        type: "success",
        text:
          data.message ||
          "Appointment request submitted. Your half-payment proof is now awaiting admin review.",
      });
      setNotes("");
      setSelectedSlot("");
      setPaymentProof(null);
      setPaymentProofPreview("");

      const slotsRes = await cachedFetch(
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

      // Refresh the patient's own requests so the slot they just asked for is
      // marked as requested instead of being offered again.
      const myRes = await cachedFetch(`${API_URL}/appointments/my`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (myRes.ok) {
        const myData = await myRes.json();
        setMyAppointments(myData.appointments || []);
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
            Pick an available doctor, choose a time slot, and attach your half-payment
            receipt. An admin reviews the payment before approving your request.
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
            {loadingDoctors ? (
              <div className="flex items-center gap-2 w-full px-3.5 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl text-sm text-[#8B7562]">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Loading doctor...
              </div>
            ) : selectedDoctor ? (
              <div className="flex items-center gap-2.5 w-full px-3 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl">
                <Stethoscope className="w-4 h-4 text-[#8B1E42] shrink-0" />
                <span className="min-w-0">
                  <span className="block font-semibold text-sm text-[#3D2E28] truncate">
                    {selectedDoctor.display_name || selectedDoctor.username}
                  </span>
                  <span className="block text-[11px] text-[#8B7562] truncate">
                    {selectedDoctor.specialty || "General"}
                    {presenceOf(selectedDoctor) === "available" && " • Available now"}
                    {presenceOf(selectedDoctor) === "in_consultation" && " • In consultation"}
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full px-3.5 py-2.5 bg-[#8B1E42]/10 border border-[#8B1E42]/25 rounded-xl text-sm text-[#8B1E42]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                No doctor is currently accepting appointments.
              </div>
            )}
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
                min={BOOKING_MIN_DATE}
                max={BOOKING_MAX_DATE}
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
                disabled={!bookingDoctorId || loadingSlots || visibleSlots.length === 0}
                className="w-full pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl text-sm text-[#3D2E28] focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                required
              >
                <option value="">
                  {!bookingDoctorId
                    ? "Select a doctor first"
                    : loadingSlots
                    ? "Checking availability..."
                    : visibleSlots.length === 0
                    ? "No available slots"
                    : "Select a time slot"}
                </option>
                {visibleSlots.map((slot) => {
                  const isRequested = requestedSlots.has(slot);
                  return (
                    <option key={slot} value={slot} disabled={isRequested}>
                      {slot}
                      {isRequested ? " — already requested" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            {requestedSlots.size > 0 && (
              <p className="text-[11px] text-[#8B7562] mt-1.5">
                Slots you already requested are marked. They stay open until an
                admin approves the request.
              </p>
            )}
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

          <div className="md:col-span-2 lg:col-span-4">
            <div className="rounded-2xl border border-[#8B1E42]/20 bg-gradient-to-br from-[#8B1E42]/[0.07] to-[#C08A3E]/[0.05] overflow-hidden">
              <button
                type="button"
                onClick={() => setGcashOpen((open) => !open)}
                aria-expanded={gcashOpen}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer hover:bg-[#8B1E42]/[0.04] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[#8B1E42] text-white flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#3D2E28]">
                      How to Pay via GCash
                    </h3>
                    <p className="text-xs text-[#8B7562]">
                      Pay the half-payment to secure your appointment slot.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {halfPaymentAmount && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B1E42]/10 border border-[#8B1E42]/25 text-[#8B1E42] text-xs font-bold">
                      Amount due: {halfPaymentAmount}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 border border-[#DCCFBF] text-[#3D2E28] text-xs font-semibold">
                    {gcashOpen ? "Hide" : "View"}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        gcashOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </div>
              </button>

              {gcashOpen && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-[#8B1E42]/15">
                  <div className="flex flex-col lg:flex-row gap-5 pt-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                        <div className="flex-1 rounded-xl bg-white/70 border border-[#DCCFBF] px-4 py-3">
                          <p className="text-[11px] uppercase tracking-wider text-[#8B7562] font-semibold">
                            GCash Number
                          </p>
                          <p className="text-lg font-bold text-[#3D2E28] tracking-wide">
                            {GCASH.number}
                          </p>
                        </div>
                        <div className="flex-1 rounded-xl bg-white/70 border border-[#DCCFBF] px-4 py-3">
                          <p className="text-[11px] uppercase tracking-wider text-[#8B7562] font-semibold">
                            Account Name
                          </p>
                          <p className="text-sm font-semibold text-[#3D2E28] mt-1">
                            {GCASH.accountName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={copyGcashNumber}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#8B1E42] text-white text-sm font-semibold hover:bg-[#731836] transition shrink-0 cursor-pointer"
                        >
                          {copiedGcash ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy number
                            </>
                          )}
                        </button>
                      </div>

                      <ol className="space-y-1.5 text-xs text-[#5E4C44]">
                        <li>
                          1. Scan the QR code with the GCash app, or tap{" "}
                          <span className="font-semibold">Scan QR</span> and point
                          your camera at it.
                        </li>
                        <li>
                          2. Alternatively, tap <span className="font-semibold">Send Money</span> then{" "}
                          <span className="font-semibold">Express Send</span> and enter
                          the GCash number above.
                        </li>
                        <li>
                          3. Send the exact amount due
                          {halfPaymentAmount ? ` (${halfPaymentAmount})` : ""}.
                        </li>
                        <li>4. Confirm the account name and complete the transfer.</li>
                        <li>5. Take a screenshot of the confirmation receipt.</li>
                        <li>6. Upload the screenshot in the field below.</li>
                      </ol>
                    </div>

                    <div className="w-full lg:w-56 shrink-0">
                      <div className="rounded-2xl bg-white border border-[#DCCFBF] p-3 shadow-sm">
                        <img
                          src={GCASH.qrImage}
                          alt="GCash QR code for the half-payment"
                          className="w-full aspect-square object-contain rounded-xl"
                        />
                        <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#8B7562] mt-2.5">
                          <QrCode className="w-3.5 h-3.5 shrink-0" />
                          Scan to pay via GCash
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-[#8B7562] uppercase tracking-wider mb-2">
              Half-Payment Proof{" "}
              <span className="text-[#8B1E42] normal-case tracking-normal">(required)</span>
            </label>

            {paymentProof && paymentProofPreview ? (
              <div className="flex items-center gap-3 p-3 bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl">
                <img
                  src={paymentProofPreview}
                  alt="Payment proof preview"
                  className="w-14 h-14 object-cover rounded-lg border border-[#DCCFBF] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#3D2E28] truncate">
                    {paymentProof.name}
                  </p>
                  <p className="text-xs text-[#8B7562]">
                    {(paymentProof.size / 1024).toFixed(0)} KB
                    {halfPaymentAmount ? ` — ${halfPaymentAmount} half-payment` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearPaymentProof}
                  className="p-1.5 text-[#8B7562] hover:text-[#8B1E42] hover:bg-[#DCCFBF]/50 rounded-lg transition shrink-0"
                  title="Remove payment proof"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#EDE3D8]/60 border border-dashed border-[#DCCFBF] rounded-xl cursor-pointer hover:border-[#8B1E42]/50 transition">
                <span className="flex items-center gap-2.5 text-sm text-[#8B7562]">
                  <Upload className="w-4 h-4 text-[#8B1E42] shrink-0" />
                  <span className="font-medium text-[#3D2E28]">
                    {halfPaymentAmount
                      ? `Upload your ${halfPaymentAmount} payment receipt`
                      : "Upload your payment receipt"}
                  </span>
                </span>
                <span className="text-xs text-[#8B7562]">JPG, PNG or WEBP · max 5MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePaymentProofChange}
                  className="hidden"
                />
              </label>
            )}

            <p className="flex items-start gap-1.5 text-xs text-[#8B7562] mt-2">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#52795A]" />
              <span>
                An admin reviews your payment proof before approving the appointment.
              </span>
            </p>
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex items-center justify-end gap-3">
            <span className="text-xs text-[#8B7562]">
              {halfPaymentAmount
                ? `Half of ${formatPeso(consultationFee)} = ${halfPaymentAmount}`
                : "Select a doctor to see the amount due."}
            </span>
            <button
              type="submit"
              disabled={submitting || !paymentProof}
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
      </div>
    </section>
  );
}