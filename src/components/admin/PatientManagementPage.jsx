import React, { useState, useEffect, useMemo } from "react";
import { User, X, Loader2, Edit3, AlertCircle, Search, Filter, Calendar, Clock } from "lucide-react";

const API_PATIENTS_URL = "http://localhost:3500/patients";
const API_APPOINTMENTS_URL = "http://localhost:3500/appointments";

export default function PatientManagementPage({ users: initialUsers, fetchWithCredentials }) {
  const [usersList, setUsersList] = useState(initialUsers);
  const [patientProfilesMap, setPatientProfilesMap] = useState({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Sync usersList and fetch missing profiles from the Patients API
  useEffect(() => {
    setUsersList(initialUsers);

    const loadAllPatientProfiles = async () => {
      const patientUsers = (initialUsers || []).filter((u) => u.role === "patient");
      if (patientUsers.length === 0) return;

      setLoadingProfiles(true);
      try {
        const fetchPromises = patientUsers.map(async (user) => {
          try {
            const res = await fetchWithCredentials(`${API_PATIENTS_URL}/${user.id}`);
            if (!res.ok) return null;
            const data = await res.json().catch(() => ({}));
            const profile = data.data || data;
            return { id: user.id, profile };
          } catch {
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const profilesMap = {};
        results.forEach((item) => {
          if (item && item.profile) {
            profilesMap[item.id] = item.profile;
          }
        });

        setPatientProfilesMap(profilesMap);
      } catch (err) {
        console.error("Failed to fetch patient details from API:", err);
      } finally {
        setLoadingProfiles(false);
      }
    };

    loadAllPatientProfiles();
  }, [initialUsers, fetchWithCredentials]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Appointment History State
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const [modalError, setModalError] = useState(null);
  const [tableError, setTableError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Helper to resolve status (defaults to "pending" if patient profile is missing)
  const getPatientStatus = (patient) => {
    if (patient.has_profile === false || patient.profile_completed === false || patient.hasProfile === false) {
      return "pending";
    }
    return (patient.status || "active").toLowerCase();
  };

  // Filter patients based on search term and status dropdown
  const filteredPatients = useMemo(() => {
    return usersList
      .filter((u) => u.role === "patient")
      .filter((patient) => {
        const computedStatus = getPatientStatus(patient);
        const profile = patientProfilesMap[patient.id] || {};
        const phoneNumber = profile.phone_number || patient.phone_number || "";

        // Status filter match
        const matchesStatus =
          statusFilter === "all" || computedStatus === statusFilter.toLowerCase();

        // Search query filter (matches id, display_name, username, phone_number, or email)
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !query ||
          (patient.id && String(patient.id).toLowerCase().includes(query)) ||
          (patient.display_name && patient.display_name.toLowerCase().includes(query)) ||
          (patient.username && patient.username.toLowerCase().includes(query)) ||
          (phoneNumber && phoneNumber.toLowerCase().includes(query)) ||
          (patient.email && patient.email.toLowerCase().includes(query));

        return matchesStatus && matchesSearch;
      });
  }, [usersList, patientProfilesMap, searchTerm, statusFilter]);

  // Helper to extract error message from raw backend JSON response
  const getBackendErrorMessage = (data) => {
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return "An unexpected backend error occurred.";
  };

  // 1. GET /patients/:patientId & GET /appointments?patientId=:patientId
  const fetchPatientProfile = async (patientId) => {
    try {
      setSelectedPatientId(patientId);
      setLoadingDetails(true);
      setLoadingAppointments(true);
      setModalError(null);
      setIsEditing(false);
      setAppointments([]);

      // Fetch Profile Data
      const res = await fetchWithCredentials(`${API_PATIENTS_URL}/${patientId}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getBackendErrorMessage(data));
      }

      const profile = data.data || data;
      setPatientDetails(profile);

      // Keep map synchronized
      setPatientProfilesMap((prev) => ({ ...prev, [patientId]: profile }));

      // Populate form state using camelCase field names matching backend model
      setEditFormData({
        id: patientId,
        dateOfBirth: profile.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
        gender: profile.gender || "",
        phoneNumber: profile.phone_number || "",
        bloodType: profile.blood_type || "",
        emergencyContactName: profile.emergency_contact_name || "",
        emergencyContactPhone: profile.emergency_contact_phone || "",
        insuranceProvider: profile.insurance_provider || "",
        insurancePolicyNumber: profile.insurance_policy_number || "",
      });

      // Fetch Patient Appointment History
      try {
        const apptRes = await fetchWithCredentials(`${API_APPOINTMENTS_URL}?patientId=${patientId}`);
        if (apptRes.ok) {
          const apptData = await apptRes.json().catch(() => ({}));
          const apptList = Array.isArray(apptData) ? apptData : apptData.data || [];
          setAppointments(apptList);
        }
      } catch (apptErr) {
        console.error("Failed to fetch appointment history:", apptErr);
      } finally {
        setLoadingAppointments(false);
      }

    } catch (err) {
      setModalError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 2. PATCH /patients/ (Update Profile)
  const handleUpdatePatientProfile = async (e) => {
    e.preventDefault();
    setModalError(null);

    try {
      setUpdating(true);

      const res = await fetchWithCredentials(API_PATIENTS_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getBackendErrorMessage(data));
      }

      const updatedProfile = {
        ...patientDetails,
        date_of_birth: editFormData.dateOfBirth,
        gender: editFormData.gender,
        phone_number: editFormData.phoneNumber,
        blood_type: editFormData.bloodType,
        emergency_contact_name: editFormData.emergencyContactName,
        emergency_contact_phone: editFormData.emergencyContactPhone,
        insurance_provider: editFormData.insuranceProvider,
        insurance_policy_number: editFormData.insurancePolicyNumber,
      };

      setPatientDetails(updatedProfile);

      // Sync the updated profile in state map
      setPatientProfilesMap((prev) => ({
        ...prev,
        [selectedPatientId]: updatedProfile,
      }));

      // Update users list status if completing a pending profile
      setUsersList((prevUsers) =>
        prevUsers.map((u) => (u.id === selectedPatientId ? { ...u, has_profile: true, status: "active" } : u))
      );

      setIsEditing(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // 3. PATCH /patients/status (Update Patient Status)
  const handleStatusChange = async (patientId, newStatus) => {
    setTableError(null);
    setUpdatingStatusId(patientId);

    try {
      const res = await fetchWithCredentials(`${API_PATIENTS_URL}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patientId,
          status: newStatus,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(getBackendErrorMessage(data));
      }

      // Sync updated status in local state table
      setUsersList((prevUsers) =>
        prevUsers.map((u) => (u.id === patientId ? { ...u, status: newStatus } : u))
      );

      // Sync status inside open detail modal if viewing same patient
      if (patientDetails && patientDetails.user_id === patientId) {
        setPatientDetails((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setTableError(err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "active":
        return "text-[#10B981] bg-emerald-50 border-emerald-200";
      case "pending":
        return "text-[#F59E0B] bg-amber-100 border-amber-300 font-semibold";
      case "suspended":
        return "text-[#EF4444] bg-rose-50 border-rose-200";
      default:
        return "text-stone-700 bg-stone-100 border-stone-300";
    }
  };

  const getAppointmentStatusStyle = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "scheduled":
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-stone-100 text-stone-700 border-stone-300";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-bold text-stone-900">Patient Management</h2>
        <p className="text-sm text-stone-600">View and edit profiles or update status for registered patients.</p>
      </div>

      {tableError && (
        <div className="p-3.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{tableError}</span>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8F3EC] border border-[#DCD0C0] p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by ID, name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-[#DCD0C0] rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8B1E42]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-stone-500 shrink-0" />
          <span className="text-xs font-semibold text-stone-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#DCD0C0] rounded-xl text-xs text-stone-800 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8B1E42]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Profile</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-700">
          <thead className="text-xs uppercase text-stone-500 border-b border-[#EBE3D8]">
            <tr>
              <th className="py-3">Patient ID</th>
              <th className="py-3">Patient Name</th>
              <th className="py-3">Phone Number</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE3D8]">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => {
                const currentStatus = getPatientStatus(p);
                const profile = patientProfilesMap[p.id];
                const phoneNumber = profile?.phone_number || p.phone_number || "N/A";

                return (
                  <tr key={p.id}>
                    <td className="py-3.5 font-mono text-xs text-stone-600">{p.id}</td>
                    <td className="py-3.5 font-bold text-stone-900">{p.display_name || p.username}</td>
                    <td className="py-3.5 text-stone-600">
                      {loadingProfiles && !profile ? (
                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <Loader2 className="w-3 h-3 animate-spin text-[#8B1E42]" />
                          Loading...
                        </div>
                      ) : (
                        phoneNumber
                      )}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={currentStatus}
                          disabled={updatingStatusId === p.id}
                          onChange={(e) => handleStatusChange(p.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#8B1E42] ${getStatusBadgeStyle(
                            currentStatus
                          )}`}
                        >
                          <option value="pending">Pending Profile</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        {updatingStatusId === p.id && (
                          <Loader2 className="w-3 h-3 animate-spin text-[#8B1E42]" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => fetchPatientProfile(p.id)}
                        className="text-[#8B1E42] font-semibold text-xs hover:underline bg-[#E2D6C7]/50 px-3 py-1.5 rounded-lg border border-[#DCD0C0] transition"
                      >
                        {currentStatus === "pending" ? "Create Profile" : "View Profile"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-stone-500">
                  No patient accounts match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPatientId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#EBE3D8] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#8B1E42] text-white rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg">
                  {isEditing ? "Edit Patient Profile" : "Patient Profile Details"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatientId(null)}
                className="p-1 text-stone-500 hover:text-stone-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {modalError && (
                <div className="p-3.5 bg-rose-100/80 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
                  <div>
                    <span className="font-bold">Error: </span>
                    {modalError}
                  </div>
                </div>
              )}

              {loadingDetails ? (
                <div className="p-12 flex items-center justify-center gap-3 text-stone-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
                  <span>Loading patient details...</span>
                </div>
              ) : patientDetails ? (
                isEditing ? (
                  <form id="edit-patient-form" onSubmit={handleUpdatePatientProfile} className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editFormData.phoneNumber || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Blood Type</label>
                        <input
                          type="text"
                          value={editFormData.bloodType || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, bloodType: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={editFormData.dateOfBirth || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Gender</label>
                        <input
                          type="text"
                          value={editFormData.gender || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={editFormData.emergencyContactName || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Emergency Contact Phone</label>
                        <input
                          type="text"
                          value={editFormData.emergencyContactPhone || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Insurance Provider</label>
                        <input
                          type="text"
                          value={editFormData.insuranceProvider || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, insuranceProvider: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">Insurance Policy Number</label>
                        <input
                          type="text"
                          value={editFormData.insurancePolicyNumber || ""}
                          onChange={(e) => setEditFormData({ ...editFormData, insurancePolicyNumber: e.target.value })}
                          className="w-full p-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-xs focus:ring-1 focus:ring-[#8B1E42] focus:outline-none"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-[#F2EAE1] p-4 rounded-xl border border-[#E3D8CC]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#8B1E42] text-white flex items-center justify-center font-bold text-lg">
                          {(patientDetails.display_name || patientDetails.username || "P").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-base">
                            {patientDetails.display_name || patientDetails.username}
                          </h4>
                          <p className="text-xs text-stone-500">{patientDetails.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl space-y-1">
                        <span className="text-stone-500 font-medium">Date of Birth</span>
                        <p className="font-semibold text-stone-800">
                          {patientDetails.date_of_birth
                            ? new Date(patientDetails.date_of_birth).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl space-y-1">
                        <span className="text-stone-500 font-medium">Gender</span>
                        <p className="font-semibold text-stone-800">{patientDetails.gender || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl space-y-1">
                        <span className="text-stone-500 font-medium">Blood Type</span>
                        <p className="font-semibold text-stone-800">{patientDetails.blood_type || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl space-y-1">
                        <span className="text-stone-500 font-medium">Phone Number</span>
                        <p className="font-semibold text-stone-800">{patientDetails.phone_number || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl space-y-1">
                        <span className="text-stone-500 font-medium">Emergency Contact</span>
                        <p className="font-semibold text-stone-800">
                          {patientDetails.emergency_contact_name || "N/A"}{" "}
                          {patientDetails.emergency_contact_phone && `(${patientDetails.emergency_contact_phone})`}
                        </p>
                      </div>
                      <div className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl space-y-1">
                        <span className="text-stone-500 font-medium">Insurance Info</span>
                        <p className="font-semibold text-stone-800">
                          {patientDetails.insurance_provider || "N/A"}{" "}
                          {patientDetails.insurance_policy_number && `- Policy #${patientDetails.insurance_policy_number}`}
                        </p>
                      </div>
                    </div>

                    {/* Appointment History Section */}
                    <div className="pt-2 border-t border-[#E3D8CC]">
                      <h5 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#8B1E42]" /> Appointment History
                      </h5>
                      {loadingAppointments ? (
                        <div className="p-4 flex items-center justify-center gap-2 text-stone-500 text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-[#8B1E42]" />
                          <span>Fetching appointments...</span>
                        </div>
                      ) : appointments.length > 0 ? (
                        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                          {appointments.map((appt) => (
                            <div
                              key={appt.id || appt.appointment_id}
                              className="p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl flex items-center justify-between text-xs gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 font-medium text-stone-800">
                                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span>
                                    {appt.appointment_date
                                      ? new Date(appt.appointment_date).toLocaleString([], {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        })
                                      : "Date unavailable"}
                                  </span>
                                </div>
                                {(appt.doctor_name || appt.service_name || appt.reason) && (
                                  <p className="text-stone-500">
                                    {appt.doctor_name && `Dr. ${appt.doctor_name}`}
                                    {appt.service_name && ` • ${appt.service_name}`}
                                    {appt.reason && ` (${appt.reason})`}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getAppointmentStatusStyle(
                                  appt.status
                                )}`}
                              >
                                {appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : "Scheduled"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-500 p-3 bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl text-center">
                          No appointment history found for this patient.
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : null}
            </div>

            {!loadingDetails && patientDetails && (
              <div className="p-4 border-t border-[#EBE3D8] bg-[#FAF7F2] flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setModalError(null);
                      }}
                      className="px-4 py-2 bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="edit-patient-form"
                      disabled={updating}
                      className="px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] flex items-center gap-2 transition"
                    >
                      {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Profile
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setModalError(null);
                    }}
                    className="flex items-center gap-1.5 bg-[#8B1E42] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#731836] transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}