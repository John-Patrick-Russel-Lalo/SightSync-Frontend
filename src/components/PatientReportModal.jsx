import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  AlertCircle,
  FileText,
  Printer,
  User,
  Mail,
  Phone,
  Droplet,
  Shield,
  ShieldAlert,
  Calendar,
  Clock,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { formatWallClockDate, formatWallClockDateTime } from "../utils/dateTime";

const API_URL = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

const defaultFetch = (url, options) => fetch(url, { ...options, credentials: "include" });

const STATUS_LABELS = {
  pending: "Pending",
  scheduled: "Scheduled",
  in_consultation: "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
  no_show: "No Show",
};

const statusLabel = (status) => STATUS_LABELS[status] || status || "Unknown";

// True while the weekly generation window of a stored summary is still open.
// Called from handlers/effects only — never during render, which must stay pure.
const isLockActive = (until) => Boolean(until) && Date.now() < new Date(until).getTime();

const STATUS_BADGE_STYLES = {
  completed: "bg-[#52795A]/10 text-[#52795A] border-[#52795A]/25",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  in_consultation: "bg-[#C08A3E]/10 text-[#C08A3E] border-[#C08A3E]/25",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  declined: "bg-rose-100 text-rose-800 border-rose-200",
  no_show: "bg-rose-100 text-rose-800 border-rose-200",
};

function StatusBadge({ status }) {
  const style = STATUS_BADGE_STYLES[status] || "bg-stone-100 text-stone-700 border-stone-300";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${style}`}>
      {statusLabel(status)}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl space-y-1">
      <span className="text-stone-500 font-medium text-[11px] flex items-center gap-1">
        {icon}
        {label}
      </span>
      <p className="font-semibold text-stone-800 text-sm">{value || "N/A"}</p>
    </div>
  );
}

export default function PatientReportModal({ patientId, patientName = "Patient", onClose, fetchFn }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryError, setSummaryError] = useState(null);
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState(null);
  const [summaryLockedUntil, setSummaryLockedUntil] = useState(null);
  // One generated overview per patient per week: set whenever the server hands
  // back a lock window, so the Generate button stays disabled until it passes.
  const [summaryLocked, setSummaryLocked] = useState(false);

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      setLoading(true);
      setError(null);
      setSummaryText("");
      setSummaryError(null);
      setSummaryGeneratedAt(null);
      setSummaryLockedUntil(null);
      setSummaryLocked(false);

      try {
        const res = await (fetchFn || defaultFetch)(`${API_URL}/patients/${patientId}/report`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || data.message || "Failed to load the patient report.");
        }

        if (active) {
          setReport(data.data || data);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    // The stored weekly overview is optional: if it is missing or expired the
    // report still renders and the Generate button simply stays available.
    const loadStoredSummary = async () => {
      try {
        const res = await (fetchFn || defaultFetch)(
          `${API_URL}/patients/${patientId}/report/summary`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const data = await res.json().catch(() => ({}));

        if (active && res.ok && data.summary) {
          setSummaryText(data.summary);
          setSummaryGeneratedAt(data.generatedAt);
          setSummaryLockedUntil(data.nextAvailableAt);
          setSummaryLocked(isLockActive(data.nextAvailableAt));
        }
      } catch {
        /* no stored summary yet — leave the Generate button usable */
      }
    };

    loadReport();
    loadStoredSummary();

    return () => {
      active = false;
    };
  }, [patientId, fetchFn]);

  const patient = report?.patient || {};
  const summary = report?.summary || {};
  const appointments = report?.appointments || [];
  const notes = report?.notes || [];

  async function handleGenerateSummary() {
    if (summaryLoading) return;
    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const res = await (fetchFn || defaultFetch)(
        `${API_URL}/patients/${patientId}/report/summary`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || data.message || "Could not generate the overview summary.");
      }
      if (!data.summary) {
        throw new Error("The AI service returned an empty summary.");
      }

      setSummaryText(data.summary);
      setSummaryGeneratedAt(data.generatedAt);
      setSummaryLockedUntil(data.nextAvailableAt);
      setSummaryLocked(isLockActive(data.nextAvailableAt));
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0 print:items-start">
      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:border-0 print:rounded-none print:shadow-none">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EBE3D8] bg-[#FAF7F2] flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8B1E42] text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg">Patient Report</h3>
              <span className="text-xs text-stone-500">
                Full clinical summary for Patient #{patientId}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg transition"
              aria-label="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto print:overflow-visible print:p-8">
          {loading ? (
            <div className="p-10 flex items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
              <span>Loading patient report...</span>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <span className="font-bold">Report unavailable: </span>
                {error}
              </div>
            </div>
          ) : !report ? (
            <div className="p-6 text-center text-stone-500 text-sm">No report data to display.</div>
          ) : (
            <div className="space-y-6">
              {/* Report letterhead */}
              <div className="border-b-2 border-[#8B1E42] pb-4 flex items-start justify-between gap-4 print:flex">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[#8B1E42] font-bold">
                    SightSync Optometry Clinic
                  </div>
                  <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Patient Clinical Report</h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Generated {report.generatedAt ? formatWallClockDateTime(report.generatedAt) : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-stone-900">
                    {patient.display_name || patient.username || patientName}
                  </div>
                  <div className="text-xs text-stone-500">Patient ID: {patient.user_id || patientId}</div>
                </div>
              </div>

              {/* AI overview */}
              <section className="bg-gradient-to-br from-[#8B1E42]/[0.07] to-[#8B1E42]/[0.02] border border-[#E3D8CC] rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8B1E42]" /> AI Clinical Overview
                  </h4>
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading || summaryLocked}
                    title={
                      summaryLocked
                        ? "Only one AI overview can be generated per patient per week"
                        : undefined
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {summaryLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating…
                      </>
                    ) : summaryLocked ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        1 / week used
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        {summaryText ? "Regenerate" : "Generate Overview"}
                      </>
                    )}
                  </button>
                </div>

                {summaryError && (
                  <div className="flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 mb-3 bg-rose-50 border border-rose-200 text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span className="break-words">{summaryError}</span>
                  </div>
                )}

                {summaryLoading ? (
                  <div className="flex items-center gap-2 text-xs text-stone-500 py-1">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B1E42]" />
                    Reading the clinical record…
                  </div>
                ) : summaryText ? (
                  <>
                    <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap break-words">
                      {summaryText}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-2">
                      AI-generated overview — verify details against the full report below.
                      {summaryGeneratedAt && (
                        <>
                          {" "}Generated {formatWallClockDateTime(summaryGeneratedAt)}
                          {summaryLockedUntil && (
                            <> • next refresh available {formatWallClockDateTime(summaryLockedUntil)}</>
                          )}
                          .
                        </>
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-xs italic text-stone-500">
                    Generate a quick plain-language overview of this patient's visit history,
                    payments, and clinical notes. Limited to one generated overview per patient
                    per week — the stored copy stays readable until it expires.
                  </p>
                )}
              </section>

              {/* Personal information */}
              <section>
                <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#8B1E42]" /> Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <InfoRow icon={<User className="w-3 h-3 text-[#8B1E42]" />} label="Full Name" value={patient.display_name || patient.username} />
                  <InfoRow icon={<Mail className="w-3 h-3 text-[#8B1E42]" />} label="Email" value={patient.email} />
                  <InfoRow icon={<Phone className="w-3 h-3 text-[#8B1E42]" />} label="Phone Number" value={patient.phone_number} />
                  <InfoRow icon={<Calendar className="w-3 h-3 text-[#8B1E42]" />} label="Date of Birth" value={patient.date_of_birth ? formatWallClockDate(patient.date_of_birth) : null} />
                  <InfoRow icon={<User className="w-3 h-3 text-[#8B1E42]" />} label="Gender" value={patient.gender} />
                  <InfoRow icon={<Droplet className="w-3 h-3 text-[#8B1E42]" />} label="Blood Type" value={patient.blood_type} />
                  <InfoRow icon={<Shield className="w-3 h-3 text-[#52795A]" />} label="Insurance" value={patient.insurance_provider} />
                  <InfoRow icon={<ShieldAlert className="w-3 h-3 text-[#C08A3E]" />} label="Emergency Contact" value={`${patient.emergency_contact_name || ""}${patient.emergency_contact_phone ? ` (${patient.emergency_contact_phone})` : ""}`} />
                </div>
              </section>

              {/* Summary */}
              <section>
                <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#8B1E42]" /> Clinical Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-[#8B1E42]">{summary.totalAppointments ?? 0}</div>
                    <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">Total Visits</div>
                  </div>
                  <div className="p-3 bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-emerald-700">{summary.completedAppointments ?? 0}</div>
                    <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">Completed</div>
                  </div>
                  <div className="p-3 bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-stone-700">{summary.consultationNotes ?? 0}</div>
                    <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">Notes</div>
                  </div>
                  <div className="p-3 bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-[#C08A3E]">
                      {Number(summary.totalPaid || 0).toLocaleString("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">Total Paid</div>
                  </div>
                </div>
              </section>

              {/* Consultation notes */}
              <section>
                <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8B1E42]" /> Consultation Notes
                </h4>
                {notes.length > 0 ? (
                  <div className="space-y-2.5">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3.5 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-[#8B1E42]" />
                            {note.doctor_name || "Doctor"}
                          </span>
                          <span className="text-[11px] text-stone-500">{formatWallClockDateTime(note.created_at)}</span>
                        </div>
                        <p className="text-xs text-stone-700 whitespace-pre-wrap break-words">{note.note}</p>
                        {note.appointment_id && (
                          <div className="text-[11px] text-stone-400 mt-1.5">Appointment #{note.appointment_id}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-stone-500 p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl">
                    No consultation notes recorded for this patient.
                  </p>
                )}
              </section>

              {/* Appointment history */}
              <section>
                <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8B1E42]" /> Appointment History
                </h4>
                {appointments.length > 0 ? (
                  <div className="space-y-2.5">
                    {appointments.map((appt) => (
                      <div
                        key={`${appt.source}-${appt.id}`}
                        className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl flex items-center justify-between text-xs gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-medium text-stone-800">
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{formatWallClockDateTime(appt.start_time)}</span>
                            {appt.source === "archived" && (
                              <span className="text-[10px] uppercase tracking-wide text-stone-400 font-semibold">Archived</span>
                            )}
                          </div>
                          {appt.doctor_name && (
                            <p className="text-stone-500">
                              {appt.doctor_name && `Dr. ${appt.doctor_name}`}
                              {appt.status === "in_consultation" && " • Consulted"}
                            </p>
                          )}
                          {appt.notes && <p className="text-stone-500 italic">"{appt.notes}"</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          {appt.payment_amount && Number(appt.payment_amount) > 0 && (
                            <span className="text-[11px] text-stone-500 font-medium">
                              ₱{(Number(appt.payment_amount) || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          <StatusBadge status={appt.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-stone-500 p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl">
                    No appointment history found for this patient.
                  </p>
                )}
              </section>

              {/* Footer */}
              <div className="pt-4 border-t border-[#E3D8CC] flex items-center justify-between text-[11px] text-stone-500 print:flex">
                <span>End of report • SightSync Optometry Clinic</span>
                <span>Patient ID: {patient.user_id || patientId}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}