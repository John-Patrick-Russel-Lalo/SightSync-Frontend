import React, { useState, useEffect } from "react";
import { Search, User, FileText, Eye, Pill } from "lucide-react";
import Pagination from "../Pagination";
import { usePagination } from "../../utils/usePagination";

const API_BASE = `${import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500"}`;

const inputClass =
  "w-full px-3.5 py-2 text-sm text-stone-900 bg-[#F8F3EC] border border-[#DCCFBF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]";

export default function DoctorPatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("examination");
  const [formData, setFormData] = useState({
    case_history: "",
    chief_complaint: "",
    objective_findings: "",
    pupillary_distance: "",
    unaided_visual_acuity: "",
    best_corrected_visual_acuity: "",
    prescription_rx: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : data.users || [];
      const patientList = list.filter((u) => u.role === "patient");
      setPatients(patientList);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientProfile = async (patient) => {
    try {
      setSelectedPatient(patient);
      setMessage(null);
      const res = await fetch(`${API_BASE}/patients/${patient.id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      const profile = data.data || data;
      setFormData({
        case_history: profile.case_history || "",
        chief_complaint: profile.chief_complaint || "",
        objective_findings: profile.objective_findings || "",
        pupillary_distance: profile.pupillary_distance || "",
        unaided_visual_acuity: profile.unaided_visual_acuity || "",
        best_corrected_visual_acuity: profile.best_corrected_visual_acuity || "",
        prescription_rx: profile.prescription_rx || profile.rx || "",
      });
    } catch (err) {
      console.error("Failed to fetch patient profile:", err);
    }
  };

  const saveRecord = async () => {
    if (!selectedPatient) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/patients`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedPatient.id, ...formData }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Medical record saved successfully." });
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: errData.message || "Failed to save record." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save record." });
    } finally {
      setSaving(false);
    }
  };

  const filtered = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const name = (p.display_name || p.username || "").toLowerCase();
    const email = (p.email || "").toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const patientPagination = usePagination(filtered, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#3D2E28]">Patient Records</h2>
        <p className="text-sm text-[#8B7562]">View and record eye examination, prescription, and medical records.</p>
      </div>

      {!selectedPatient ? (
        <section className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DCCFBF] flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#3D2E28]">Patients</h3>
              <p className="text-xs text-[#8B7562] mt-0.5">{filtered.length} patient{filtered.length === 1 ? "" : "s"}</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7562]" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  patientPagination.reset();
                }}
                className="pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCCFBF] rounded-xl text-sm text-[#3D2E28] placeholder-[#8B7562] w-full focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F2EAE1]/80 text-xs uppercase text-[#8B7562] tracking-wider border-b border-[#DCCFBF]">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5">Patient</th>
                  <th className="px-4 sm:px-6 py-3.5">Email</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCCFBF]">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-[#8B7562]">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-[#8B7562]">
                      <User className="w-8 h-8 mx-auto text-[#8B7562]/50" />
                      <p className="mt-2">No patients found</p>
                    </td>
                  </tr>
                ) : (
                  patientPagination.pageItems.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F2EAE1]/40 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#8B1E42]/10 text-[#8B1E42] flex items-center justify-center font-bold">
                            {(p.display_name || p.username || "P").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#3D2E28]">{p.display_name || p.username}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-[#5B4B41]">{p.email}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <button
                          onClick={() => fetchPatientProfile(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition"
                        >
                          <FileText className="w-3.5 h-3.5" /> View/Record
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={patientPagination.page}
            pageCount={patientPagination.pageCount}
            total={patientPagination.total}
            startIndex={patientPagination.startIndex}
            endIndex={patientPagination.endIndex}
            onPageChange={patientPagination.setPage}
            itemLabel="patients"
          />
        </section>
      ) : (
        <section className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DCCFBF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8B1E42] text-white flex items-center justify-center font-bold">
                {(selectedPatient.display_name || selectedPatient.username || "P").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[#3D2E28]">{selectedPatient.display_name || selectedPatient.username}</h3>
                <p className="text-xs text-[#8B7562]">{selectedPatient.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5B4B41] bg-[#F2EAE1] border border-[#DCCFBF] hover:bg-[#EDE3D8]"
            >
              Back to Patients
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("examination")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === "examination"
                    ? "bg-[#8B1E42] text-white"
                    : "bg-[#F2EAE1] text-[#5B4B41] border border-[#DCCFBF] hover:bg-[#EDE3D8]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Eye Examination Records
              </button>
              <button
                onClick={() => setActiveTab("prescription")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === "prescription"
                    ? "bg-[#8B1E42] text-white"
                    : "bg-[#F2EAE1] text-[#5B4B41] border border-[#DCCFBF] hover:bg-[#EDE3D8]"
                }`}
              >
                <Pill className="w-3.5 h-3.5" /> Prescription Management
              </button>
            </div>

            {activeTab === "examination" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5B4B41] mb-1.5">Case History</label>
                  <textarea value={formData.case_history} onChange={(e) => setFormData({ ...formData, case_history: e.target.value })} className={inputClass} rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B4B41] mb-1.5">Chief Complaint</label>
                  <textarea value={formData.chief_complaint} onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })} className={inputClass} rows={3} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5B4B41] mb-1.5">Objective Findings</label>
                  <textarea value={formData.objective_findings} onChange={(e) => setFormData({ ...formData, objective_findings: e.target.value })} className={inputClass} rows={3} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B4B41] mb-1.5">Pupillary Distance (PD)</label>
                  <input value={formData.pupillary_distance} onChange={(e) => setFormData({ ...formData, pupillary_distance: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5B4B41] mb-1.5">Unaided Visual Acuity</label>
                  <input value={formData.unaided_visual_acuity} onChange={(e) => setFormData({ ...formData, unaided_visual_acuity: e.target.value })} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#5B4B41] mb-1.5">Best Corrected Visual Acuity</label>
                  <input value={formData.best_corrected_visual_acuity} onChange={(e) => setFormData({ ...formData, best_corrected_visual_acuity: e.target.value })} className={inputClass} />
                </div>
              </div>
            )}

            {activeTab === "prescription" && (
              <div>
                <label className="block text-xs font-semibold text-[#5B4B41] mb-1.5">Prescription (Rx)</label>
                <textarea value={formData.prescription_rx} onChange={(e) => setFormData({ ...formData, prescription_rx: e.target.value })} className={inputClass} rows={8} placeholder="e.g., OD: -2.00 -0.50 x 180 / OS: -1.75 -0.25 x 170" />
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-xl text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={saveRecord}
                disabled={saving}
                className="px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-sm font-semibold hover:bg-[#731836] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Medical Record"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
