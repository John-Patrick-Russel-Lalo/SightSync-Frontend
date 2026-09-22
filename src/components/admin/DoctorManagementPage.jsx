// import React, { useState, useEffect, useMemo } from "react";
// import { useAuth } from "../../context/AuthContext";
// import {
//   UserCheck,
//   Plus,
//   Edit,
//   Trash2,
//   Clock,
//   Award,
//   DollarSign,
//   Search,
//   X,
//   AlertCircle,
//   CheckCircle2,
//   Loader2,
// } from "lucide-react";

// export default function DoctorManagementPage() {
//   const { user } = useAuth();
  
//   const API_DOCTORS_URL = `${import.meta.env.VITE_API_URL}/doctors`;
//   const API_USERS_URL = `${import.meta.env.VITE_API_URL}/users`;

//   const [doctors, setDoctors] = useState([]);
//   const [candidateUsers, setCandidateUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingUsers, setLoadingUsers] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [formSuccess, setFormSuccess] = useState("");

//   // Form State
//   const [formData, setFormData] = useState({
//     userId: "",
//     specialty: "",
//     licenseNumber: "",
//     bio: "",
//     consultationFee: "",
//     slotDurationMinutes: 30,
//   });

//   useEffect(() => {
//     fetchDoctors();
//   }, []);

//   const fetchDoctors = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch(`${API_DOCTORS_URL}?limit=50&offset=0`, {
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Failed to fetch doctor profiles.");
//       const result = await res.json();
//       setDoctors(result.data || []);
//     } catch (err) {
//       setError(err.message || "An error occurred while loading doctors.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDoctorUsers = async () => {
//     try {
//       setLoadingUsers(true);
//       const res = await fetch(API_USERS_URL, {
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Failed to fetch user list.");
      
//       const rawUsers = await res.json();
//       const usersList = Array.isArray(rawUsers) ? rawUsers : rawUsers.data || [];

//       const existingUserIds = new Set(doctors.map((d) => String(d.user_id)));
      
//       // Filter clientside by role='doctor' and exclude those who already have profiles
//       const availableUsers = usersList.filter(
//         (u) => u.role === "doctor" && !existingUserIds.has(String(u.id))
//       );

//       setCandidateUsers(availableUsers);
//     } catch (err) {
//       console.error("Error loading candidate doctor users:", err);
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   const handleOpenModal = (doctor = null) => {
//     setFormError("");
//     setFormSuccess("");
//     setActiveTab("profile");

//     if (doctor) {
//       setSelectedDoctor(doctor);
//       setFormData({
//         userId: doctor.user_id,
//         specialty: doctor.specialty || "",
//         licenseNumber: doctor.license_number || "",
//         bio: doctor.bio || "",
//         consultationFee: doctor.consultation_fee || "",
//         slotDurationMinutes: doctor.slot_duration_minutes || 30,
//       });
//     } else {
//       setSelectedDoctor(null);
//       setFormData({
//         userId: "",
//         specialty: "",
//         licenseNumber: "",
//         bio: "",
//         consultationFee: "",
//         slotDurationMinutes: 30,
//       });
//       fetchDoctorUsers();
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedDoctor(null);
//     setFormError("");
//     setFormSuccess("");
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmitProfile = async (e) => {
//     e.preventDefault();
//     setFormError("");
//     setFormSuccess("");
//     setSubmitting(true);

//     try {
//       const isEditing = !!selectedDoctor;
//       const url = isEditing
//         ? `${API_DOCTORS_URL}/${selectedDoctor.user_id}`
//         : API_DOCTORS_URL;
//       const method = isEditing ? "PUT" : "POST";

//       const payload = {
//         userId: formData.userId,
//         specialty: formData.specialty,
//         licenseNumber: formData.licenseNumber,
//         bio: formData.bio,
//         consultationFee: formData.consultationFee
//           ? parseFloat(formData.consultationFee)
//           : null,
//         slotDurationMinutes: parseInt(formData.slotDurationMinutes, 10) || 30,
//       };

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to save doctor profile.");
//       }

//       setFormSuccess(
//         isEditing
//           ? "Doctor profile updated successfully!"
//           : "Doctor profile created successfully!"
//       );

//       fetchDoctors();
//       setTimeout(() => {
//         handleCloseModal();
//       }, 1200);
//     } catch (err) {
//       setFormError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDeleteDoctor = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this doctor profile?")) {
//       return;
//     }

//     try {
//       const res = await fetch(`${API_DOCTORS_URL}/${userId}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to delete doctor profile.");
//       }

//       setDoctors((prev) => prev.filter((doc) => doc.user_id !== userId));
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const filteredDoctors = useMemo(() => {
//     return doctors.filter(
//       (doc) =>
//         doc.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         doc.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [doctors, searchTerm]);

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-6">
//       {/* Page Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
//           <p className="text-sm text-gray-500">
//             Logged in as <strong className="text-gray-700">{user?.display_name || user?.email}</strong>
//           </p>
//         </div>
//         <button
//           onClick={() => handleOpenModal(null)}
//           className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#6b1d2f] text-white rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Add Doctor Profile</span>
//         </button>
//       </div>

//       {/* Filter and Search Bar */}
//       <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
//         <Search className="w-5 h-5 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search doctor by name, specialty, or license..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full bg-transparent text-sm focus:outline-none"
//         />
//       </div>

//       {/* Grid Content */}
//       {loading ? (
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="w-8 h-8 text-[#6b1d2f] animate-spin" />
//         </div>
//       ) : error ? (
//         <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-lg border border-red-200">
//           <AlertCircle className="w-5 h-5 shrink-0" />
//           <span>{error}</span>
//         </div>
//       ) : filteredDoctors.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
//           <UserCheck className="w-12 h-12 mx-auto text-gray-400 mb-2" />
//           <p className="text-gray-600 font-medium">No doctor profiles found</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredDoctors.map((doc) => (
//             <div
//               key={doc.profile_id}
//               className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
//             >
//               <div>
//                 <div className="flex items-start justify-between gap-3 mb-4">
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={
//                         doc.avatar_url ||
//                         `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                           doc.display_name || doc.username || "Doctor"
//                         )}&background=6b1d2f&color=fff`
//                       }
//                       alt={doc.display_name}
//                       className="w-12 h-12 rounded-full object-cover border border-gray-200"
//                     />
//                     <div>
//                       <h3 className="font-semibold text-gray-900">
//                         {doc.display_name || doc.username}
//                       </h3>
//                       <p className="text-xs text-gray-500">{doc.email}</p>
//                     </div>
//                   </div>
//                   <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-medium shrink-0">
//                     {doc.specialty || "General"}
//                   </span>
//                 </div>

//                 <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3 mb-4">
//                   <div className="flex items-center gap-2">
//                     <Award className="w-4 h-4 text-gray-400" />
//                     <span className="text-xs font-mono">
//                       Lic: {doc.license_number || "N/A"}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <DollarSign className="w-4 h-4 text-gray-400" />
//                     <span>
//                       Fee:{" "}
//                       <strong>
//                         {doc.consultation_fee
//                           ? `$${parseFloat(doc.consultation_fee).toFixed(2)}`
//                           : "Not Set"}
//                       </strong>
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Clock className="w-4 h-4 text-gray-400" />
//                     <span>
//                       Slot Duration:{" "}
//                       <strong>{doc.slot_duration_minutes} mins</strong>
//                     </span>
//                   </div>
//                   {doc.bio && (
//                     <p className="text-xs text-gray-500 italic line-clamp-2 mt-2">
//                       "{doc.bio}"
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
//                 <button
//                   onClick={() => handleOpenModal(doc)}
//                   className="p-2 text-gray-600 hover:text-[#6b1d2f] hover:bg-gray-100 rounded-lg transition-colors"
//                   title="Edit Profile"
//                 >
//                   <Edit className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={() => handleDeleteDoctor(doc.user_id)}
//                   className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                   title="Delete Profile"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal Dialog */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
//             {/* Header */}
//             <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 {selectedDoctor
//                   ? `Manage: ${selectedDoctor.display_name}`
//                   : "Create Doctor Profile"}
//               </h2>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Modal Tabs */}
//             {selectedDoctor && (
//               <div className="flex border-b border-gray-200 bg-white">
//                 <button
//                   onClick={() => setActiveTab("profile")}
//                   className={`flex-1 py-2.5 text-sm font-medium border-b-2 text-center transition-colors ${
//                     activeTab === "profile"
//                       ? "border-[#6b1d2f] text-[#6b1d2f]"
//                       : "border-transparent text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   Profile Details
//                 </button>
//                 <button
//                   onClick={() => setActiveTab("schedules")}
//                   className={`flex-1 py-2.5 text-sm font-medium border-b-2 text-center transition-colors ${
//                     activeTab === "schedules"
//                       ? "border-[#6b1d2f] text-[#6b1d2f]"
//                       : "border-transparent text-gray-500 hover:text-gray-700"
//                   }`}
//                 >
//                   Schedules
//                 </button>
//               </div>
//             )}

//             {/* Body */}
//             <div className="p-6 overflow-y-auto space-y-4 flex-1">
//               {formError && (
//                 <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
//                   <AlertCircle className="w-4 h-4 shrink-0" />
//                   <span>{formError}</span>
//                 </div>
//               )}

//               {formSuccess && (
//                 <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
//                   <CheckCircle2 className="w-4 h-4 shrink-0" />
//                   <span>{formSuccess}</span>
//                 </div>
//               )}

//               {activeTab === "profile" ? (
//                 <form id="doctor-form" onSubmit={handleSubmitProfile} className="space-y-4">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Doctor User Account <span className="text-red-500">*</span>
//                     </label>

//                     {selectedDoctor ? (
//                       <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
//                         <img
//                           src={
//                             selectedDoctor.avatar_url ||
//                             `https://ui-avatars.com/api/?name=${encodeURIComponent(
//                               selectedDoctor.display_name || "Doctor"
//                             )}&background=6b1d2f&color=fff`
//                           }
//                           alt={selectedDoctor.display_name}
//                           className="w-10 h-10 rounded-full border border-gray-200"
//                         />
//                         <div>
//                           <div className="text-sm font-semibold text-gray-800">
//                             {selectedDoctor.display_name} (@{selectedDoctor.username})
//                           </div>
//                           <div className="text-xs text-gray-500">{selectedDoctor.email}</div>
//                         </div>
//                       </div>
//                     ) : (
//                       <select
//                         name="userId"
//                         value={formData.userId}
//                         onChange={handleInputChange}
//                         required
//                         disabled={loadingUsers}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1d2f]"
//                       >
//                         <option value="">
//                           {loadingUsers ? "Loading users..." : "-- Select User --"}
//                         </option>
//                         {candidateUsers.map((u) => (
//                           <option key={u.id} value={u.id}>
//                             {u.display_name || u.username} ({u.email})
//                           </option>
//                         ))}
//                       </select>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Specialty <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="specialty"
//                         value={formData.specialty}
//                         onChange={handleInputChange}
//                         required
//                         placeholder="e.g. Cardiology"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1d2f]"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         License Number <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="licenseNumber"
//                         value={formData.licenseNumber}
//                         onChange={handleInputChange}
//                         required
//                         placeholder="e.g. LIC-99882"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1d2f]"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Consultation Fee ($)
//                       </label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         name="consultationFee"
//                         value={formData.consultationFee}
//                         onChange={handleInputChange}
//                         placeholder="e.g. 150.00"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1d2f]"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Slot Duration (Minutes)
//                       </label>
//                       <input
//                         type="number"
//                         name="slotDurationMinutes"
//                         value={formData.slotDurationMinutes}
//                         onChange={handleInputChange}
//                         placeholder="30"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1d2f]"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-xs font-medium text-gray-700 mb-1">
//                       Bio
//                     </label>
//                     <textarea
//                       name="bio"
//                       rows="3"
//                       value={formData.bio}
//                       onChange={handleInputChange}
//                       placeholder="Doctor summary..."
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1d2f]"
//                     />
//                   </div>
//                 </form>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
//                     Weekly working hours setup for <strong>{selectedDoctor?.display_name}</strong>.
//                   </div>

//                   <div className="space-y-2">
//                     {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
//                       <div
//                         key={day}
//                         className="flex items-center justify-between p-3 border border-gray-200 rounded-lg text-sm"
//                       >
//                         <span className="font-medium text-gray-700">{day}</span>
//                         <div className="flex items-center gap-2">
//                           <input
//                             type="time"
//                             defaultValue="09:00"
//                             className="px-2 py-1 border rounded text-xs focus:outline-none"
//                           />
//                           <span className="text-xs text-gray-400">to</span>
//                           <input
//                             type="time"
//                             defaultValue="17:00"
//                             className="px-2 py-1 border rounded text-xs focus:outline-none"
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
//               <button
//                 type="button"
//                 onClick={handleCloseModal}
//                 className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
//               >
//                 Cancel
//               </button>
//               {activeTab === "profile" && (
//                 <button
//                   type="submit"
//                   form="doctor-form"
//                   disabled={submitting}
//                   className="inline-flex items-center gap-2 px-4 py-2 bg-[#6b1d2f] text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
//                 >
//                   {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
//                   <span>{selectedDoctor ? "Save Changes" : "Create Profile"}</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  Clock,
  Award,
  DollarSign,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// Sub-component for managing doctor weekly working schedules
function DoctorScheduleTab({ userId, API_DOCTORS_URL }) {
  const DAYS = [
    { id: 0, name: "Sunday" },
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
    { id: 6, name: "Saturday" },
  ];

  const [schedules, setSchedules] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.id,
      dayName: day.name,
      startTime: "09:00",
      endTime: "17:00",
      isActive: day.id >= 1 && day.id <= 5, // Active Monday-Friday by default
    }))
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_DOCTORS_URL}/${userId}/schedules`, {
          credentials: "include",
        });
        const result = await res.json();

        if (res.ok && result.data && Array.isArray(result.data)) {
          setSchedules((prev) =>
            prev.map((day) => {
              const dbRecord = result.data.find(
                (s) => s.day_of_week === day.dayOfWeek
              );
              if (dbRecord) {
                return {
                  ...day,
                  startTime: dbRecord.start_time ? dbRecord.start_time.slice(0, 5) : "09:00",
                  endTime: dbRecord.end_time ? dbRecord.end_time.slice(0, 5) : "17:00",
                  isActive: Boolean(dbRecord.is_active),
                };
              }
              return { ...day, isActive: false };
            })
          );
        }
      } catch (err) {
        setStatusMsg({ type: "error", text: "Failed to load working schedule." });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchSchedules();
    }
  }, [userId, API_DOCTORS_URL]);

  const handleToggleActive = (index) => {
    setSchedules((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const handleTimeChange = (index, field, value) => {
    setSchedules((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveSchedules = async () => {
    try {
      setSaving(true);
      setStatusMsg({ type: "", text: "" });

      const payload = {
        schedules: schedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        })),
      };

      const res = await fetch(`${API_DOCTORS_URL}/${userId}/schedules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save working schedules.");
      }

      setStatusMsg({ type: "success", text: "Working schedules saved successfully!" });
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#8B1E42] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statusMsg.text && (
        <div
          className={`flex items-center gap-2 p-3.5 text-sm rounded-xl border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="space-y-2">
        {schedules.map((day, idx) => (
          <div
            key={day.dayOfWeek}
            className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${
              day.isActive
                ? "bg-[#FAF7F2] border-[#EBE3D8]"
                : "bg-[#F2EAE1]/60 border-[#EBE3D8] opacity-60"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={day.isActive}
                onChange={() => handleToggleActive(idx)}
                className="w-4 h-4 accent-[#8B1E42] rounded cursor-pointer"
              />
              <span className="font-medium text-sm text-stone-800 w-24">
                {day.dayName}
              </span>
            </div>

            {day.isActive ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) =>
                    handleTimeChange(idx, "startTime", e.target.value)
                  }
                  className="px-2.5 py-1.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                />
                <span className="text-xs text-stone-400">to</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) =>
                    handleTimeChange(idx, "endTime", e.target.value)
                  }
                  className="px-2.5 py-1.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                />
              </div>
            ) : (
              <span className="text-xs text-stone-400 italic pr-4">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSaveSchedules}
        disabled={saving}
        className="w-full mt-4 py-2.5 bg-[#8B1E42] text-white text-sm font-semibold rounded-xl hover:bg-[#731836] disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{saving ? "Saving Schedule..." : "Save Working Schedule"}</span>
      </button>
    </div>
  );
}

export default function DoctorManagementPage() {
  const { user } = useAuth();

  const API_DOCTORS_URL = `${import.meta.env.VITE_API_URL}/doctors`;
  const API_USERS_URL = `${import.meta.env.VITE_API_URL}/users`;

  const [doctors, setDoctors] = useState([]);
  const [candidateUsers, setCandidateUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    specialty: "",
    licenseNumber: "",
    bio: "",
    consultationFee: "",
    slotDurationMinutes: 30,
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_DOCTORS_URL}?limit=50&offset=0`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch doctor profiles.");
      const result = await res.json();
      setDoctors(result.data || []);
    } catch (err) {
      setError(err.message || "An error occurred while loading doctors.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(API_USERS_URL, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user list.");

      const rawUsers = await res.json();
      const usersList = Array.isArray(rawUsers) ? rawUsers : rawUsers.data || [];

      const existingUserIds = new Set(doctors.map((d) => String(d.user_id)));

      // Filter client-side by role='doctor' and exclude those who already have profiles
      const availableUsers = usersList.filter(
        (u) => u.role === "doctor" && !existingUserIds.has(String(u.id))
      );

      setCandidateUsers(availableUsers);
    } catch (err) {
      console.error("Error loading candidate doctor users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenModal = (doctor = null) => {
    setFormError("");
    setFormSuccess("");
    setActiveTab("profile");

    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData({
        userId: doctor.user_id,
        specialty: doctor.specialty || "",
        licenseNumber: doctor.license_number || "",
        bio: doctor.bio || "",
        consultationFee: doctor.consultation_fee || "",
        slotDurationMinutes: doctor.slot_duration_minutes || 30,
      });
    } else {
      setSelectedDoctor(null);
      setFormData({
        userId: "",
        specialty: "",
        licenseNumber: "",
        bio: "",
        consultationFee: "",
        slotDurationMinutes: 30,
      });
      fetchDoctorUsers();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setFormError("");
    setFormSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const isEditing = !!selectedDoctor;
      const url = isEditing
        ? `${API_DOCTORS_URL}/${selectedDoctor.user_id}`
        : API_DOCTORS_URL;
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        userId: formData.userId,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        bio: formData.bio,
        consultationFee: formData.consultationFee
          ? parseFloat(formData.consultationFee)
          : null,
        slotDurationMinutes: parseInt(formData.slotDurationMinutes, 10) || 30,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save doctor profile.");
      }

      setFormSuccess(
        isEditing
          ? "Doctor profile updated successfully!"
          : "Doctor profile created successfully!"
      );

      fetchDoctors();
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this doctor profile?")) {
      return;
    }

    try {
      const res = await fetch(`${API_DOCTORS_URL}/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete doctor profile.");
      }

      setDoctors((prev) => prev.filter((doc) => doc.user_id !== userId));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(
      (doc) =>
        doc.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [doctors, searchTerm]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Doctor Management</h1>
          <p className="text-sm text-stone-600">
            Logged in as <strong className="text-stone-800">{user?.display_name || user?.email}</strong>
          </p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#8B1E42] text-white rounded-xl hover:bg-[#731836] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Doctor Profile</span>
        </button>
      </div>

      {/* Doctor Profiles Section */}
      <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EBE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2]">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Doctor Profiles</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {filteredDoctors.length} record{filteredDoctors.length === 1 ? "" : "s"} loaded
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search doctor by name, specialty, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] w-full"
            />
          </div>
        </div>

        <div className="p-5">
          {/* Grid Content */}
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-6 h-6 text-[#8B1E42] animate-spin" />
              <span className="text-sm font-medium">Fetching doctor profiles...</span>
            </div>
          ) : error ? (
            <div className="p-10 text-center bg-rose-50/50 rounded-2xl">
              <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
              <p className="mt-2 font-semibold text-rose-800">Failed to load doctor profiles</p>
              <p className="text-xs text-stone-600 mt-1">{error}</p>
              <button
                onClick={fetchDoctors}
                className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
              >
                Retry
              </button>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-14 text-center text-stone-500">
              <UserCheck className="w-8 h-8 mx-auto text-stone-300" />
              <p className="mt-3 text-sm font-medium">No doctor profiles found.</p>
              <p className="text-xs text-stone-400 mt-1">Add a doctor profile to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.profile_id}
                  className="bg-[#FAF7F2] rounded-2xl border border-[#EBE3D8] shadow-sm hover:border-[#DCD0C0] transition p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            doc.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              doc.display_name || doc.username || "Doctor"
                            )}&background=8B1E42&color=fff`
                          }
                          alt={doc.display_name}
                          className="w-12 h-12 rounded-full object-cover border border-[#DCD0C0]"
                        />
                        <div>
                          <h3 className="font-bold text-stone-900">
                            {doc.display_name || doc.username}
                          </h3>
                          <p className="text-xs text-stone-500">{doc.email}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-[#E8DDD0] px-2.5 py-1 rounded-full shrink-0">
                        {doc.specialty || "General"}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-stone-600 border-t border-[#EBE3D8] pt-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-stone-400" />
                        <span className="text-xs font-mono">
                          Lic: {doc.license_number || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-stone-400" />
                        <span>
                          Fee:{" "}
                          <strong className="text-stone-800">
                            {doc.consultation_fee
                              ? `₱${parseFloat(doc.consultation_fee).toFixed(2)}`
                              : "Not Set"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-stone-400" />
                        <span className="text-stone-800">
                          Slot Duration:{" "}
                          <strong>{doc.slot_duration_minutes} mins</strong>
                        </span>
                      </div>
                      {doc.bio && (
                        <p className="text-xs text-stone-500 italic line-clamp-2 mt-2">
                          "{doc.bio}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-[#EBE3D8] pt-3">
                    <button
                      onClick={() => handleOpenModal(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition"
                      title="Edit Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doc.user_id)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 rounded-xl transition"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EBE3D8] bg-[#FAF7F2]">
              <h2 className="text-lg font-bold text-stone-900">
                {selectedDoctor
                  ? `Manage: ${selectedDoctor.display_name}`
                  : "Create Doctor Profile"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-stone-400 hover:text-stone-700 hover:bg-[#EBE3D8] p-1.5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            {selectedDoctor && (
              <div className="px-5 pt-4">
                <div className="bg-[#F2EAE1] p-1 rounded-xl border border-[#DCD0C0] flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold text-center transition ${
                      activeTab === "profile"
                        ? "bg-[#8B1E42] text-white shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                    }`}
                  >
                    Profile Details
                  </button>
                  <button
                    onClick={() => setActiveTab("schedules")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold text-center transition ${
                      activeTab === "schedules"
                        ? "bg-[#8B1E42] text-white shadow-sm"
                        : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                    }`}
                  >
                    Schedules
                  </button>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="flex items-center gap-2 p-3.5 text-sm text-rose-800 bg-rose-50 rounded-xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-center gap-2 p-3.5 text-sm text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {activeTab === "profile" ? (
                <form id="doctor-form" onSubmit={handleSubmitProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                      Doctor User Account <span className="text-rose-600">*</span>
                    </label>

                    {selectedDoctor ? (
                      <div className="flex items-center gap-3 p-3 bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl">
                        <img
                          src={
                            selectedDoctor.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              selectedDoctor.display_name || "Doctor"
                            )}&background=8B1E42&color=fff`
                          }
                          alt={selectedDoctor.display_name}
                          className="w-10 h-10 rounded-full border border-[#DCD0C0]"
                        />
                        <div>
                          <div className="text-sm font-semibold text-stone-900">
                            {selectedDoctor.display_name} (@{selectedDoctor.username})
                          </div>
                          <div className="text-xs text-stone-500">{selectedDoctor.email}</div>
                        </div>
                      </div>
                    ) : (
                      <select
                        name="userId"
                        value={formData.userId}
                        onChange={handleInputChange}
                        required
                        disabled={loadingUsers}
                        className="w-full px-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer"
                      >
                        <option value="">
                          {loadingUsers ? "Loading users..." : "-- Select User --"}
                        </option>
                        {candidateUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.display_name || u.username} ({u.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                        Specialty <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Cardiology"
                        className="w-full px-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                        License Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. LIC-99882"
                        className="w-full px-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                        Consultation Fee (₱)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        placeholder="e.g. 500.00"
                        className="w-full px-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                        Slot Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        name="slotDurationMinutes"
                        value={formData.slotDurationMinutes}
                        onChange={handleInputChange}
                        placeholder="30"
                        className="w-full px-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Doctor summary..."
                      className="w-full px-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]"
                    />
                  </div>
                </form>
              ) : (
                <DoctorScheduleTab
                  userId={selectedDoctor?.user_id}
                  API_DOCTORS_URL={API_DOCTORS_URL}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-[#EBE3D8] bg-[#FAF7F2]">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-[#E2D6C7] transition"
              >
                Cancel
              </button>
              {activeTab === "profile" && (
                <button
                  type="submit"
                  form="doctor-form"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E42] text-white text-sm font-semibold rounded-xl hover:bg-[#731836] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{selectedDoctor ? "Save Changes" : "Create Profile"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}