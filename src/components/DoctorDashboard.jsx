
// import React, { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   Search,
//   FileText,
//   LogOut,
//   Bell,
//   Stethoscope,
//   ChevronLeft,
//   ChevronRight,
//   Activity,
//   Check,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";

// export default function DoctorDashboard() {
//   const { user, logout } = useAuth();
//   const [searchTerm, setSearchTerm] = useState("");
  
//   // Doctor Status
//   const [doctorStatus, setDoctorStatus] = useState("Available");

//   // State Management
//   const [appointments, setAppointments] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Helper function to format JS Date into YYYY-MM-DD string
//   const formatDateString = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   // 1. Fetch appointments using GET /appointments/:doctorId
//   // Fetch appointments using GET /appointments/:doctorId
//   const fetchDoctorAppointments = useCallback(async () => {
//     const doctorId = user?.doctorId || user?.id;

//     if (!doctorId) {
//       setLoading(false);
//       setError("Doctor ID not found. Please log in again.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(`http://localhost:3500/appointments/${doctorId}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       });

//       if (!response.ok) {
//         if (response.status === 401 || response.status === 403) {
//           throw new Error("Unauthorized access. Please log in as a doctor.");
//         }
//         if (response.status === 404) {
//           throw new Error("No appointment records found for this doctor.");
//         }
//         throw new Error("Failed to load doctor appointments.");
//       }

//       const data = await response.json();
      
//       // Access the array from data.appointments based on your JSON structure
//       const rawAppointments = data.appointments || [];

//       // Map backend payload properties to the frontend dashboard format
//       const formatted = rawAppointments.map((app) => {
//         const startDate = app.start_time ? new Date(app.start_time) : null;
        
//         // Format start_time into readable 12-hour local time format (e.g., "08:00 AM")
//         const formattedTime = startDate 
//           ? startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
//           : "N/A";

//         return {
//           id: app.id,
//           patientName: app.patient_id ? `Patient #${app.patient_id}` : "Unknown Patient",
//           patientId: app.patient_id,
//           time: formattedTime,
//           type: app.notes || "General Consultation",
//           status: app.status || "scheduled",
//           rawDate: startDate ? formatDateString(startDate) : "",
//           startTime: app.start_time,
//           endTime: app.end_time,
//         };
//       });

//       setAppointments(formatted);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchDoctorAppointments();
//   }, [fetchDoctorAppointments]);

//   // 2. Filter appointments matching selected calendar date
//   const selectedDateStr = formatDateString(selectedDate);
//   const todaysAppointments = appointments.filter((app) => {
//     if (!app.rawDate) return true; // Fallback if backend doesn't supply date field
//     return app.rawDate === selectedDateStr;
//   });

//   // Calculate days in the current month that have appointments for calendar dot indicators
//   const scheduledDays = appointments
//     .filter((app) => {
//       if (!app.rawDate) return false;
//       const appDate = new Date(app.rawDate);
//       return (
//         appDate.getMonth() === selectedDate.getMonth() &&
//         appDate.getFullYear() === selectedDate.getFullYear()
//       );
//     })
//     .map((app) => new Date(app.rawDate).getDate());

//   // Search Filter
//   const filteredAppointments = todaysAppointments.filter(
//     (app) =>
//       app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.type.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // 3. Update status on Doctor Profile via PUT /doctors/:userId
//   const handleDoctorStatusToggle = async (newStatus) => {
//     setDoctorStatus(newStatus);
    
//     const doctorUserId = user?.id;
//     if (!doctorUserId) return;

//     try {
//       await fetch(`http://localhost:3500/doctors/${doctorUserId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ isAvailable: newStatus === "Available" }),
//       });
//     } catch (err) {
//       console.error("Failed to update status on doctor profile:", err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#EDE3D8] text-[#3D2E28] flex flex-col">
//       {/* Top Navigation */}
//       <header className="border-b border-[#DCCFBF] bg-[#F8F3EC]/90 backdrop-blur sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="bg-[#8B1E42]/10 text-[#8B1E42] p-2.5 rounded-2xl">
//             <Stethoscope className="w-7 h-7" />
//           </div>
//           <div>
//             <h1 className="font-bold text-xl leading-none text-[#3D2E28]">
//               Doctor Portal
//             </h1>
//             <span className="text-xs text-[#8B7562]">Clinical Management</span>
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           <button className="p-2.5 text-[#8B7562] hover:text-[#3D2E28] rounded-full hover:bg-[#EDE3D8] transition">
//             <Bell className="w-5 h-5" />
//           </button>
          
//           <div className="h-6 w-px bg-[#DCCFBF]" />
          
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <div className="text-base font-semibold text-[#3D2E28]">
//                 {user?.name || user?.email || "Doctor"}
//               </div>
//               <div className="text-xs text-[#8B1E42] font-medium uppercase tracking-wider">
//                 {user?.role || "doctor"}
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="p-2.5 text-[#8B1E42] hover:text-[#A32B54] hover:bg-[#8B1E42]/10 rounded-full transition"
//               title="Logout"
//             >
//               <LogOut className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content Area */}
//       <main className="flex-1 p-8 max-w-[1500px] w-full mx-auto">
//         <div className="flex flex-col lg:flex-row gap-8 items-start">
          
//           {/* Appointments Table Section */}
//           <section className="w-full lg:flex-1 bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl overflow-hidden order-2 lg:order-1 shadow-sm">
//             {/* Header Controls */}
//             <div className="p-7 border-b border-[#DCCFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-xl font-bold text-[#3D2E28]">
//                   Appointments for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                 </h2>
//                 <p className="text-sm text-[#8B7562] mt-0.5">
//                   Track patient queue, visit status, and medical history access.
//                 </p>
//               </div>

//               {/* Search Bar & Availability Toggle */}
//               <div className="flex items-center gap-3">
//                 <div className="relative w-full sm:w-auto">
//                   <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7562]" />
//                   <input
//                     type="text"
//                     placeholder="Search patient or reason..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-full text-sm text-[#3D2E28] placeholder-[#8B7562] focus:outline-none focus:border-[#8B1E42] w-full sm:w-64"
//                   />
//                 </div>

//                 {/* Status Toggle Buttons */}
//                 <div className="bg-[#EDE3D8] p-1 rounded-full border border-[#DCCFBF] flex items-center gap-1 shrink-0">
//                   <button
//                     onClick={() => handleDoctorStatusToggle("Available")}
//                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
//                       doctorStatus === "Available"
//                         ? "bg-[#52795A] text-white shadow-sm"
//                         : "text-[#8B7562] hover:text-[#3D2E28]"
//                     }`}
//                   >
//                     <Check className="w-3.5 h-3.5" />
//                     Available
//                   </button>
//                   <button
//                     onClick={() => handleDoctorStatusToggle("In Session")}
//                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
//                       doctorStatus === "In Session"
//                         ? "bg-[#8B1E42] text-white shadow-sm"
//                         : "text-[#8B7562] hover:text-[#3D2E28]"
//                     }`}
//                   >
//                     <Activity className="w-3.5 h-3.5" />
//                     In Session
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               {loading ? (
//                 <div className="flex items-center justify-center p-12 text-[#8B7562] gap-2">
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   <span>Loading appointments...</span>
//                 </div>
//               ) : error ? (
//                 <div className="flex items-center justify-center p-12 text-[#8B1E42] gap-2">
//                   <AlertCircle className="w-5 h-5" />
//                   <span>{error}</span>
//                 </div>
//               ) : (
//                 <table className="w-full text-left text-base text-[#5B4B41]">
//                   <thead className="bg-[#EDE3D8] text-xs uppercase text-[#8B7562] border-b border-[#DCCFBF] tracking-wider">
//                     <tr>
//                       <th className="px-7 py-4">Time</th>
//                       <th className="px-7 py-4">Patient Details</th>
//                       <th className="px-7 py-4">Reason for Visit</th>
//                       <th className="px-7 py-4">Status</th>
//                       <th className="px-7 py-4 text-right">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-[#E6DCCF]">
//                     {filteredAppointments.length > 0 ? (
//                       filteredAppointments.map((app) => (
//                         <tr key={app.id} className="hover:bg-[#EDE3D8]/60 transition">
//                           <td className="px-7 py-5 font-mono text-sm font-semibold text-[#8B1E42] whitespace-nowrap">
//                             {app.time}
//                           </td>
//                           <td className="px-7 py-5">
//                             <div className="font-bold text-[#3D2E28] text-base">{app.patientName}</div>
//                             <div className="text-xs text-[#8B7562] mt-0.5">
//                               {app.age} yrs • {app.gender}
//                             </div>
//                           </td>
//                           <td className="px-7 py-5 text-[#5B4B41] font-medium">{app.type}</td>
//                           <td className="px-7 py-5">
//                             <span
//                               className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
//                                 app.status === "Completed"
//                                   ? "bg-[#52795A]/10 text-[#52795A] border border-[#52795A]/25"
//                                   : app.status === "In Consultation"
//                                   ? "bg-[#C08A3E]/10 text-[#C08A3E] border border-[#C08A3E]/25"
//                                   : "bg-[#DCCFBF]/40 text-[#8B7562] border border-[#DCCFBF]"
//                               }`}
//                             >
//                               <span
//                                 className={`w-2 h-2 rounded-full ${
//                                   app.status === "Completed"
//                                     ? "bg-[#52795A]"
//                                     : app.status === "In Consultation"
//                                     ? "bg-[#C08A3E]"
//                                     : "bg-[#8B7562]"
//                                 }`}
//                               />
//                               {app.status}
//                             </span>
//                           </td>
//                           <td className="px-7 py-5 text-right">
//                             <div className="flex items-center justify-end gap-3">
//                               <button
//                                 className="p-2 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#DCCFBF]/50 transition"
//                                 title="View Medical Chart"
//                               >
//                                 <FileText className="w-5 h-5" />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="5" className="px-7 py-10 text-center text-[#8B7562]">
//                           No appointments scheduled for this date.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </section>

//           {/* Calendar Box Section */}
//           <div className="w-full lg:w-auto flex justify-start order-1 lg:order-2">
//             <MonthCalendar
//               scheduledDays={scheduledDays}
//               selected={selectedDate}
//               onSelectDate={setSelectedDate}
//             />
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// // Calendar Component
// function MonthCalendar({ scheduledDays = [], selected, onSelectDate }) {
//   const [viewDate, setViewDate] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

//   const year = viewDate.getFullYear();
//   const month = viewDate.getMonth();

//   const monthLabel = viewDate.toLocaleDateString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

//   const firstWeekday = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const cells = [];
//   for (let i = 0; i < firstWeekday; i++) cells.push(null);
//   for (let d = 1; d <= daysInMonth; d++) cells.push(d);

//   const today = new Date();
//   const isToday = (d) =>
//     d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
//   const isSelected = (d) =>
//     d === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();

//   const changeMonth = (delta) => {
//     setViewDate(new Date(year, month + delta, 1));
//   };

//   const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   return (
//     <div className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl p-6 w-full lg:w-[380px] shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <div className="text-xs uppercase font-bold tracking-wider text-[#8B7562]">
//             Schedule
//           </div>
//           <div className="text-lg font-bold text-[#3D2E28]">{monthLabel}</div>
//         </div>
//         <div className="flex items-center gap-1.5">
//           <button
//             onClick={() => changeMonth(-1)}
//             className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
//             aria-label="Previous month"
//           >
//             <ChevronLeft className="w-5 h-5" />
//           </button>
//           <button
//             onClick={() => changeMonth(1)}
//             className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
//             aria-label="Next month"
//           >
//             <ChevronRight className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-7 gap-1.5 mb-2">
//         {weekdayLabels.map((w, i) => (
//           <div key={i} className="text-xs font-semibold text-[#8B7562] text-center">
//             {w}
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-7 gap-1.5">
//         {cells.map((d, i) =>
//           d === null ? (
//             <div key={i} className="h-9 w-9" />
//           ) : (
//             <button
//               key={i}
//               onClick={() => onSelectDate(new Date(year, month, d))}
//               className={`h-9 w-9 mx-auto flex flex-col items-center justify-center rounded-xl text-sm transition relative ${
//                 isSelected(d)
//                   ? "bg-[#8B1E42] text-white font-bold shadow-sm"
//                   : isToday(d)
//                   ? "border border-[#8B1E42] text-[#8B1E42] font-bold"
//                   : "text-[#3D2E28] hover:bg-[#EDE3D8]"
//               }`}
//             >
//               <span>{d}</span>
//               {scheduledDays.includes(d) && (
//                 <span
//                   className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
//                     isSelected(d) ? "bg-white" : "bg-[#C08A3E]"
//                   }`}
//                 />
//               )}
//             </button>
//           )
//         )}
//       </div>

//       <div className="mt-5 pt-3 border-t border-[#DCCFBF] flex items-center justify-between text-xs text-[#8B7562] font-medium">
//         <div className="flex items-center gap-2">
//           <span className="w-2 h-2 rounded-full bg-[#C08A3E]" />
//           Has appointments
//         </div>
//         <div>
//           {selected.toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   Search,
//   FileText,
//   LogOut,
//   Bell,
//   Stethoscope,
//   ChevronLeft,
//   ChevronRight,
//   Loader2,
//   AlertCircle,
//   X,
//   Edit3,
//   Calendar,
//   Clock,
//   User,
//   Check,
// } from "lucide-react";

// export default function DoctorDashboard() {
//   const { user, logout } = useAuth();
//   const [searchTerm, setSearchTerm] = useState("");

//   // State Management
//   const [appointments, setAppointments] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Modal State
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

//   // Helper function to format JS Date into YYYY-MM-DD string
//   const formatDateString = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   // 1. Fetch appointments using GET /appointments/:doctorId
//   const fetchDoctorAppointments = useCallback(async () => {
//     const doctorId = user?.doctorId || user?.id;

//     if (!doctorId) {
//       setLoading(false);
//       setError("Doctor ID not found. Please log in again.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(`http://localhost:3500/appointments/${doctorId}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       });

//       if (!response.ok) {
//         if (response.status === 401 || response.status === 403) {
//           throw new Error("Unauthorized access. Please log in as a doctor.");
//         }
//         if (response.status === 404) {
//           throw new Error("No appointment records found for this doctor.");
//         }
//         throw new Error("Failed to load doctor appointments.");
//       }

//       const data = await response.json();
      
//       const rawAppointments = data.appointments || [];

//       const formatted = rawAppointments.map((app) => {
//         const startDate = app.start_time ? new Date(app.start_time) : null;
        
//         const formattedTime = startDate 
//           ? startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
//           : "N/A";

//         return {
//           id: app.id,
//           patientName: app.patient_id ? `Patient #${app.patient_id}` : "Unknown Patient",
//           patientId: app.patient_id,
//           time: formattedTime,
//           type: app.notes || "General Consultation",
//           status: app.status || "scheduled",
//           rawDate: startDate ? formatDateString(startDate) : "",
//           startTime: app.start_time,
//           endTime: app.end_time,
//           notes: app.notes,
//         };
//       });

//       setAppointments(formatted);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchDoctorAppointments();
//   }, [fetchDoctorAppointments]);

//   // 2. Filter appointments matching selected calendar date
//   const selectedDateStr = formatDateString(selectedDate);
//   const todaysAppointments = appointments.filter((app) => {
//     if (!app.rawDate) return true;
//     return app.rawDate === selectedDateStr;
//   });

//   // Calculate days in the current month that have appointments
//   const scheduledDays = appointments
//     .filter((app) => {
//       if (!app.rawDate) return false;
//       const appDate = new Date(app.rawDate);
//       return (
//         appDate.getMonth() === selectedDate.getMonth() &&
//         appDate.getFullYear() === selectedDate.getFullYear()
//       );
//     })
//     .map((app) => new Date(app.rawDate).getDate());

//   // Search Filter
//   const filteredAppointments = todaysAppointments.filter(
//     (app) =>
//       app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       app.type.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // 3. Update appointment status via backend API
//   const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
//     try {
//       setIsUpdatingStatus(true);

//       // Call API endpoint to update appointment status
//       const response = await fetch(`http://localhost:3500/appointments/${appointmentId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ status: newStatus }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update status on server.");
//       }

//       // Optimistically update local state
//       setAppointments((prev) =>
//         prev.map((app) => (app.id === appointmentId ? { ...app, status: newStatus } : app))
//       );

//       // Sync local modal state
//       if (selectedAppointment && selectedAppointment.id === appointmentId) {
//         setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
//       }
//     } catch (err) {
//       console.error("Error updating appointment status:", err);
//       alert("Could not update status. Please try again.");
//     } finally {
//       setIsUpdatingStatus(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#EDE3D8] text-[#3D2E28] flex flex-col">
//       {/* Top Navigation */}
//       <header className="border-b border-[#DCCFBF] bg-[#F8F3EC]/90 backdrop-blur sticky top-0 z-10 px-8 py-5 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="bg-[#8B1E42]/10 text-[#8B1E42] p-2.5 rounded-2xl">
//             <Stethoscope className="w-7 h-7" />
//           </div>
//           <div>
//             <h1 className="font-bold text-xl leading-none text-[#3D2E28]">
//               Doctor Portal
//             </h1>
//             <span className="text-xs text-[#8B7562]">Clinical Management</span>
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           <button className="p-2.5 text-[#8B7562] hover:text-[#3D2E28] rounded-full hover:bg-[#EDE3D8] transition">
//             <Bell className="w-5 h-5" />
//           </button>
          
//           <div className="h-6 w-px bg-[#DCCFBF]" />
          
//           <div className="flex items-center gap-3">
//             <div className="text-right">
//               <div className="text-base font-semibold text-[#3D2E28]">
//                 {user?.name || user?.email || "Doctor"}
//               </div>
//               <div className="text-xs text-[#8B1E42] font-medium uppercase tracking-wider">
//                 {user?.role || "doctor"}
//               </div>
//             </div>
//             <button
//               onClick={logout}
//               className="p-2.5 text-[#8B1E42] hover:text-[#A32B54] hover:bg-[#8B1E42]/10 rounded-full transition"
//               title="Logout"
//             >
//               <LogOut className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content Area */}
//       <main className="flex-1 p-8 max-w-[1500px] w-full mx-auto">
//         <div className="flex flex-col lg:flex-row gap-8 items-start">
          
//           {/* Appointments Table Section */}
//           <section className="w-full lg:flex-1 bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl overflow-hidden order-2 lg:order-1 shadow-sm">
//             {/* Header Controls */}
//             <div className="p-7 border-b border-[#DCCFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-xl font-bold text-[#3D2E28]">
//                   Appointments for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                 </h2>
//                 <p className="text-sm text-[#8B7562] mt-0.5">
//                   Track patient queue, visit status, and medical history access.
//                 </p>
//               </div>

//               {/* Search Bar */}
//               <div className="relative w-full sm:w-auto">
//                 <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7562]" />
//                 <input
//                   type="text"
//                   placeholder="Search patient or reason..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-full text-sm text-[#3D2E28] placeholder-[#8B7562] focus:outline-none focus:border-[#8B1E42] w-full sm:w-64"
//                 />
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               {loading ? (
//                 <div className="flex items-center justify-center p-12 text-[#8B7562] gap-2">
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   <span>Loading appointments...</span>
//                 </div>
//               ) : error ? (
//                 <div className="flex items-center justify-center p-12 text-[#8B1E42] gap-2">
//                   <AlertCircle className="w-5 h-5" />
//                   <span>{error}</span>
//                 </div>
//               ) : (
//                 <table className="w-full text-left text-base text-[#5B4B41]">
//                   <thead className="bg-[#EDE3D8] text-xs uppercase text-[#8B7562] border-b border-[#DCCFBF] tracking-wider">
//                     <tr>
//                       <th className="px-7 py-4">Time</th>
//                       <th className="px-7 py-4">Patient Details</th>
//                       <th className="px-7 py-4">Reason for Visit</th>
//                       <th className="px-7 py-4">Status</th>
//                       <th className="px-7 py-4 text-right">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-[#E6DCCF]">
//                     {filteredAppointments.length > 0 ? (
//                       filteredAppointments.map((app) => (
//                         <tr key={app.id} className="hover:bg-[#EDE3D8]/60 transition">
//                           <td className="px-7 py-5 font-mono text-sm font-semibold text-[#8B1E42] whitespace-nowrap">
//                             {app.time}
//                           </td>
//                           <td className="px-7 py-5">
//                             <div className="font-bold text-[#3D2E28] text-base">{app.patientName}</div>
//                             <div className="text-xs text-[#8B7562] mt-0.5">
//                               Patient ID: {app.patientId}
//                             </div>
//                           </td>
//                           <td className="px-7 py-5 text-[#5B4B41] font-medium">{app.type}</td>
//                           <td className="px-7 py-5">
//                             <span
//                               className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${
//                                 app.status === "Completed" || app.status === "completed"
//                                   ? "bg-[#52795A]/10 text-[#52795A] border border-[#52795A]/25"
//                                   : app.status === "In Consultation" || app.status === "in consultation"
//                                   ? "bg-[#C08A3E]/10 text-[#C08A3E] border border-[#C08A3E]/25"
//                                   : app.status === "cancelled"
//                                   ? "bg-[#8B1E42]/10 text-[#8B1E42] border border-[#8B1E42]/25"
//                                   : "bg-[#DCCFBF]/40 text-[#8B7562] border border-[#DCCFBF]"
//                               }`}
//                             >
//                               <span
//                                 className={`w-2 h-2 rounded-full ${
//                                   app.status === "Completed" || app.status === "completed"
//                                     ? "bg-[#52795A]"
//                                     : app.status === "In Consultation" || app.status === "in consultation"
//                                     ? "bg-[#C08A3E]"
//                                     : app.status === "cancelled"
//                                     ? "bg-[#8B1E42]"
//                                     : "bg-[#8B7562]"
//                                 }`}
//                               />
//                               {app.status}
//                             </span>
//                           </td>
//                           <td className="px-7 py-5 text-right">
//                             <div className="flex items-center justify-end gap-3">
//                               <button
//                                 onClick={() => setSelectedAppointment(app)}
//                                 className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition flex items-center gap-1.5"
//                                 title="Manage Appointment"
//                               >
//                                 <Edit3 className="w-3.5 h-3.5" />
//                                 Options
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="5" className="px-7 py-10 text-center text-[#8B7562]">
//                           No appointments scheduled for this date.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </section>

//           {/* Calendar Box Section */}
//           <div className="w-full lg:w-auto flex justify-start order-1 lg:order-2">
//             <MonthCalendar
//               scheduledDays={scheduledDays}
//               selected={selectedDate}
//               onSelectDate={setSelectedDate}
//             />
//           </div>
//         </div>
//       </main>

//       {/* Appointment Options / Status Modal */}
//       {selectedAppointment && (
//         <div className="fixed inset-0 z-50 bg-[#3D2E28]/40 backdrop-blur-sm flex items-center justify-center p-4">
//           <div className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between border-b border-[#DCCFBF] pb-4 mb-5">
//               <div className="flex items-center gap-2.5">
//                 <div className="bg-[#8B1E42]/10 text-[#8B1E42] p-2 rounded-xl">
//                   <FileText className="w-5 h-5" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-lg text-[#3D2E28]">Appointment Details</h3>
//                   <span className="text-xs text-[#8B7562]">ID #{selectedAppointment.id}</span>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setSelectedAppointment(null)}
//                 className="p-1.5 text-[#8B7562] hover:text-[#3D2E28] rounded-full hover:bg-[#EDE3D8] transition"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Appointment Meta */}
//             <div className="space-y-3 bg-[#EDE3D8] p-4 rounded-2xl border border-[#DCCFBF] mb-5 text-sm text-[#5B4B41]">
//               <div className="flex items-center gap-2">
//                 <User className="w-4 h-4 text-[#8B1E42]" />
//                 <span className="font-semibold text-[#3D2E28]">{selectedAppointment.patientName}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Clock className="w-4 h-4 text-[#8B1E42]" />
//                 <span>Time: {selectedAppointment.time}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Calendar className="w-4 h-4 text-[#8B1E42]" />
//                 <span>Date: {selectedAppointment.rawDate}</span>
//               </div>
//               {selectedAppointment.notes && (
//                 <div className="pt-2 border-t border-[#DCCFBF]/60 text-xs text-[#8B7562]">
//                   <span className="font-semibold text-[#3D2E28]">Reason / Notes:</span>
//                   <p className="mt-0.5 italic">"{selectedAppointment.notes}"</p>
//                 </div>
//               )}
//             </div>

//             {/* Status Selection Section */}
//             <div>
//               <label className="block text-xs uppercase font-bold text-[#8B7562] tracking-wider mb-3">
//                 Update Appointment Status
//               </label>
              
//               <div className="grid grid-cols-2 gap-2.5">
//                 {[
//                   { label: "Scheduled", value: "scheduled", color: "hover:border-[#8B7562]" },
//                   { label: "In Consultation", value: "In Consultation", color: "hover:border-[#C08A3E]" },
//                   { label: "Completed", value: "Completed", color: "hover:border-[#52795A]" },
//                   { label: "Cancelled", value: "cancelled", color: "hover:border-[#8B1E42]" },
//                 ].map((opt) => {
//                   const isSelected = selectedAppointment.status === opt.value;
//                   return (
//                     <button
//                       key={opt.value}
//                       disabled={isUpdatingStatus}
//                       onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, opt.value)}
//                       className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
//                         isSelected
//                           ? "bg-[#8B1E42] text-white border-[#8B1E42] shadow-sm"
//                           : `bg-[#F8F3EC] text-[#3D2E28] border-[#DCCFBF] ${opt.color} hover:bg-[#EDE3D8]`
//                       }`}
//                     >
//                       <span>{opt.label}</span>
//                       {isSelected && <Check className="w-4 h-4 text-white" />}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Modal Actions */}
//             <div className="mt-6 pt-4 border-t border-[#DCCFBF] flex justify-end">
//               <button
//                 onClick={() => setSelectedAppointment(null)}
//                 className="px-5 py-2 rounded-full text-xs font-semibold bg-[#EDE3D8] text-[#3D2E28] hover:bg-[#DCCFBF] transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Calendar Component
// function MonthCalendar({ scheduledDays = [], selected, onSelectDate }) {
//   const [viewDate, setViewDate] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

//   const year = viewDate.getFullYear();
//   const month = viewDate.getMonth();

//   const monthLabel = viewDate.toLocaleDateString("en-US", {
//     month: "long",
//     year: "numeric",
//   });

//   const firstWeekday = new Date(year, month, 1).getDay();
//   const daysInMonth = new Date(year, month + 1, 0).getDate();

//   const cells = [];
//   for (let i = 0; i < firstWeekday; i++) cells.push(null);
//   for (let d = 1; d <= daysInMonth; d++) cells.push(d);

//   const today = new Date();
//   const isToday = (d) =>
//     d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
//   const isSelected = (d) =>
//     d === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();

//   const changeMonth = (delta) => {
//     setViewDate(new Date(year, month + delta, 1));
//   };

//   const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   return (
//     <div className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl p-6 w-full lg:w-[380px] shadow-sm">
//       <div className="flex items-center justify-between mb-4">
//         <div>
//           <div className="text-xs uppercase font-bold tracking-wider text-[#8B7562]">
//             Schedule
//           </div>
//           <div className="text-lg font-bold text-[#3D2E28]">{monthLabel}</div>
//         </div>
//         <div className="flex items-center gap-1.5">
//           <button
//             onClick={() => changeMonth(-1)}
//             className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
//             aria-label="Previous month"
//           >
//             <ChevronLeft className="w-5 h-5" />
//           </button>
//           <button
//             onClick={() => changeMonth(1)}
//             className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
//             aria-label="Next month"
//           >
//             <ChevronRight className="w-5 h-5" />
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-7 gap-1.5 mb-2">
//         {weekdayLabels.map((w, i) => (
//           <div key={i} className="text-xs font-semibold text-[#8B7562] text-center">
//             {w}
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-7 gap-1.5">
//         {cells.map((d, i) =>
//           d === null ? (
//             <div key={i} className="h-9 w-9" />
//           ) : (
//             <button
//               key={i}
//               onClick={() => onSelectDate(new Date(year, month, d))}
//               className={`h-9 w-9 mx-auto flex flex-col items-center justify-center rounded-xl text-sm transition relative ${
//                 isSelected(d)
//                   ? "bg-[#8B1E42] text-white font-bold shadow-sm"
//                   : isToday(d)
//                   ? "border border-[#8B1E42] text-[#8B1E42] font-bold"
//                   : "text-[#3D2E28] hover:bg-[#EDE3D8]"
//               }`}
//             >
//               <span>{d}</span>
//               {scheduledDays.includes(d) && (
//                 <span
//                   className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
//                     isSelected(d) ? "bg-white" : "bg-[#C08A3E]"
//                   }`}
//                 />
//               )}
//             </button>
//           )
//         )}
//       </div>

//       <div className="mt-5 pt-3 border-t border-[#DCCFBF] flex items-center justify-between text-xs text-[#8B7562] font-medium">
//         <div className="flex items-center gap-2">
//           <span className="w-2 h-2 rounded-full bg-[#C08A3E]" />
//           Has appointments
//         </div>
//         <div>
//           {selected.toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  FileText,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Edit3,
  Calendar,
  Clock,
  User,
  Check,
  Phone,
  Droplet,
  ShieldAlert,
  Shield,
  Settings,
  LayoutDashboard,
  Archive,
  Mail,
  Save,
} from "lucide-react";
import {
  formatWallClockDate,
  formatWallClockTime,
  formatWallClockDateTime,
  parseWallClock,
  toLocalDateString,
} from "../utils/dateTime";
import PortalLayout from "./PortalLayout";
import SettingsPage from "./SettingsPage";
import AppointmentArchive from "./AppointmentArchive";

const API_URL = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

const modalInputClass =
  "w-full px-3 py-2 bg-[#F8F3EC] border border-[#DCCFBF] rounded-xl text-xs text-[#3D2E28] placeholder-[#8B7562] focus:outline-none focus:border-[#8B1E42]";

// Canonical appointment statuses -> display label.
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

// Badge + dot styling per status for the appointments table and modal.
function getStatusBadge(status) {
  switch (status) {
    case "completed":
      return {
        chip: "bg-[#52795A]/10 text-[#52795A] border border-[#52795A]/25",
        dot: "bg-[#52795A]",
      };
    case "in_consultation":
      return {
        chip: "bg-[#C08A3E]/10 text-[#C08A3E] border border-[#C08A3E]/25",
        dot: "bg-[#C08A3E]",
      };
    case "cancelled":
    case "declined":
    case "no_show":
      return {
        chip: "bg-[#8B1E42]/10 text-[#8B1E42] border border-[#8B1E42]/25",
        dot: "bg-[#8B1E42]",
      };
    default:
      return {
        chip: "bg-[#DCCFBF]/40 text-[#8B7562] border border-[#DCCFBF]",
        dot: "bg-[#8B7562]",
      };
  }
}

function StatusBadge({ status, className = "" }) {
  const style = getStatusBadge(status);
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${style.chip} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {statusLabel(status)}
    </span>
  );
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Navigation tab state: 'appointments' | 'settings'
  const [activeTab, setActiveTab] = useState("appointments");

  // State Management
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Patient Profile State
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);

  // Re-render trigger so the doctor's In Session / Available pill follows the
  // clock even when no appointments change.
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Patient Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState(null);

  // Consultation Notes State
  const [patientNotes, setPatientNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // 1. Fetch appointments using GET /appointments/:doctorId
  const fetchDoctorAppointments = useCallback(async () => {
    const doctorId = user?.doctorId || user?.id;

    if (!doctorId) {
      setLoading(false);
      setError("Doctor ID not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/appointments/${doctorId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Unauthorized access. Please log in as a doctor.");
        }
        if (response.status === 404) {
          throw new Error("No appointment records found for this doctor.");
        }
        throw new Error("Failed to load doctor appointments.");
      }

      const data = await response.json();
      const rawAppointments = data.appointments || [];

      const formatted = rawAppointments.map((app) => {
        const startDate = parseWallClock(app.start_time);

        const formattedTime = startDate
          ? formatWallClockTime(startDate, { hour: "2-digit", minute: "2-digit" })
          : "N/A";

        return {
          id: app.id,
          patientName: app.patient_id ? `Patient #${app.patient_id}` : "Unknown Patient",
          patientId: app.patient_id,
          time: formattedTime,
          type: app.notes || "General Consultation",
          status: app.status || "scheduled",
          rawDate: startDate ? toLocalDateString(startDate) : "",
          startTime: app.start_time,
          endTime: app.end_time,
          notes: app.notes,
        };
      });

      setAppointments(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDoctorAppointments();
  }, [fetchDoctorAppointments]);

  // Keep the clock fresh so the In Session / Available pill flips on time.
  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // The doctor is "In Session" while a consultation is marked ongoing today, or
  // when the current time falls inside a scheduled appointment's window;
  // otherwise they are "Available".
  const doctorStatus = (() => {
    const now = nowTick;
    const todayStr = toLocalDateString(new Date());
    const inSession = appointments.some((app) => {
      if (app.status === "in_consultation") {
        return !app.rawDate || app.rawDate === todayStr;
      }
      if (app.status !== "scheduled") return false;
      const start = parseWallClock(app.startTime);
      const end = parseWallClock(app.endTime);
      return start && end && now >= start.getTime() && now <= end.getTime();
    });
    return inSession ? "In Session" : "Available";
  })();

  // 2. Fetch Patient Profile & Consultation Notes when the modal opens
  const fetchPatientNotes = useCallback(async (patientId) => {
    setLoadingNotes(true);
    setNotesError(null);

    try {
      const response = await fetch(`${API_URL}/appointments/patient/${patientId}/notes`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || resData.message || "Failed to load consultation notes.");
      }

      setPatientNotes(resData.notes || []);
    } catch (err) {
      console.error("Error fetching consultation notes:", err);
      setPatientNotes([]);
      setNotesError(err.message);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  const handleOpenOptions = async (app) => {
    setSelectedAppointment(app);
    setPatientProfile(null);
    setProfileError(null);
    setProfileNotice(null);
    setIsEditingProfile(false);
    setProfileForm({});
    setPatientNotes([]);
    setNotesError(null);
    setNoteText("");
    setStatusError(null);

    if (app.patientId) {
      fetchPatientNotes(app.patientId);
    }

    if (!app.patientId) return;

    try {
      setLoadingProfile(true);

      // Adjust endpoint base URL path if needed (e.g., http://localhost:3500/patients/ or /users/)
      const response = await fetch(`${API_URL}/patients/${app.patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch patient profile details.");
      }

      const resData = await response.json();

      if (resData.success && resData.data) {
        setPatientProfile(resData.data);
      } else {
        throw new Error("Patient data unavailable.");
      }
    } catch (err) {
      console.error("Error fetching patient profile:", err);
      setProfileError(err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setPatientProfile(null);
    setPatientNotes([]);
    setNoteText("");
    setIsEditingProfile(false);
    setProfileNotice(null);
    setStatusError(null);
  };

  // 3. Doctor edits the patient profile when the recorded data is inaccurate
  const handleStartEditProfile = () => {
    if (!patientProfile) return;

    setProfileForm({
      dateOfBirth: patientProfile.date_of_birth ? patientProfile.date_of_birth.split("T")[0] : "",
      gender: patientProfile.gender || "",
      phoneNumber: patientProfile.phone_number || "",
      bloodType: patientProfile.blood_type || "",
      emergencyContactName: patientProfile.emergency_contact_name || "",
      emergencyContactPhone: patientProfile.emergency_contact_phone || "",
      insuranceProvider: patientProfile.insurance_provider || "",
      insurancePolicyNumber: patientProfile.insurance_policy_number || "",
    });
    setProfileNotice(null);
    setIsEditingProfile(true);
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileNotice(null);

    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: patientProfile.user_id, ...profileForm }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.message || resData.error || "Failed to save the patient profile.");
      }

      setPatientProfile((prev) => ({
        ...prev,
        date_of_birth: profileForm.dateOfBirth,
        gender: profileForm.gender,
        phone_number: profileForm.phoneNumber,
        blood_type: profileForm.bloodType,
        emergency_contact_name: profileForm.emergencyContactName,
        emergency_contact_phone: profileForm.emergencyContactPhone,
        insurance_provider: profileForm.insuranceProvider,
        insurance_policy_number: profileForm.insurancePolicyNumber,
      }));

      setIsEditingProfile(false);
      setProfileNotice({ type: "success", text: "Patient profile updated." });
    } catch (err) {
      setProfileNotice({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  // 4. Consultation notes written by the doctor about the patient
  const handleSaveNote = async (e) => {
    e.preventDefault();

    const trimmed = noteText.trim();
    if (!trimmed || !selectedAppointment) return;

    setSavingNote(true);
    setNotesError(null);

    try {
      const response = await fetch(`${API_URL}/appointments/${selectedAppointment.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note: trimmed }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || resData.message || "Failed to save the note.");
      }

      setPatientNotes((prev) => [
        {
          ...resData.note,
          doctor_name: user?.name || user?.username || user?.email || "Doctor",
        },
        ...prev,
      ]);
      setNoteText("");
    } catch (err) {
      setNotesError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  // 5. Filter appointments matching selected calendar date
  const selectedDateStr = toLocalDateString(selectedDate);
  const todaysAppointments = appointments.filter((app) => {
    if (!app.rawDate) return true;
    return app.rawDate === selectedDateStr;
  });

  const scheduledDays = appointments
    .filter((app) => {
      if (!app.rawDate) return false;
      const appDate = parseWallClock(app.rawDate);
      return (
        appDate &&
        appDate.getMonth() === selectedDate.getMonth() &&
        appDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .map((app) => parseWallClock(app.rawDate).getDate());

  // Search Filter
  const filteredAppointments = todaysAppointments.filter(
    (app) =>
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. Update appointment status via backend API
  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      setStatusError(null);

      const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update status on server.");
      }

      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? { ...app, status: newStatus } : app))
      );

      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setStatusError(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const navItems = [
    { id: "appointments", label: "Appointments", icon: LayoutDashboard },
    { id: "archive", label: "Appointment Archive", icon: Archive },
    { id: "settings", label: "Settings", icon: Settings, sectionEnd: true },
  ];

  return (
    <PortalLayout
      title="Doctor Portal"
      subtitle="Clinical Management"
      brandIcon={<Stethoscope className="w-7 h-7" />}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={user}
      onLogout={logout}
      maxWidth="max-w-[1500px]"
    >
      {activeTab === "settings" ? (
        <SettingsPage />
      ) : activeTab === "archive" ? (
        <AppointmentArchive scope="all" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Appointments Table Section */}
          <section className="w-full lg:flex-1 bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl overflow-hidden order-2 lg:order-1 shadow-sm">
            {/* Header Controls */}
            <div className="p-7 border-b border-[#DCCFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-[#3D2E28]">
                    Appointments for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </h2>
                  {user?.role === "doctor" && (
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        doctorStatus === "In Session"
                          ? "bg-[#C08A3E]/10 text-[#C08A3E] border-[#C08A3E]/30"
                          : "bg-[#52795A]/10 text-[#52795A] border-[#52795A]/30"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          doctorStatus === "In Session" ? "bg-[#C08A3E] animate-pulse" : "bg-[#52795A]"
                        }`}
                      />
                      {doctorStatus === "In Session" ? "In Session" : "Available"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#8B7562] mt-0.5">
                  Track patient queue, visit status, and medical history access.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7562]" />
                <input
                  type="text"
                  placeholder="Search patient or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-[#EDE3D8] border border-[#DCCFBF] rounded-full text-sm text-[#3D2E28] placeholder-[#8B7562] focus:outline-none focus:border-[#8B1E42] w-full sm:w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
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
              ) : (
                <table className="w-full text-left text-base text-[#5B4B41]">
                  <thead className="bg-[#EDE3D8] text-xs uppercase text-[#8B7562] border-b border-[#DCCFBF] tracking-wider">
                    <tr>
                      <th className="px-7 py-4">Time</th>
                      <th className="px-7 py-4">Patient Details</th>
                      <th className="px-7 py-4">Reason for Visit</th>
                      <th className="px-7 py-4">Status</th>
                      <th className="px-7 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DCCF]">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-[#EDE3D8]/60 transition">
                          <td className="px-7 py-5 font-mono text-sm font-semibold text-[#8B1E42] whitespace-nowrap">
                            {app.time}
                          </td>
                          <td className="px-7 py-5">
                            <div className="font-bold text-[#3D2E28] text-base">{app.patientName}</div>
                            <div className="text-xs text-[#8B7562] mt-0.5">
                              Patient ID: {app.patientId}
                            </div>
                          </td>
                          <td className="px-7 py-5 text-[#5B4B41] font-medium">{app.type}</td>
                          <td className="px-7 py-5">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-7 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleOpenOptions(app)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition flex items-center gap-1.5"
                                title="View patient profile, write notes, and manage this appointment"
                              >
                                <User className="w-3.5 h-3.5" />
                                View Profile
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-7 py-10 text-center text-[#8B7562]">
                          No appointments scheduled for this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <div className="w-full lg:w-auto flex justify-start order-1 lg:order-2">
            <MonthCalendar
              scheduledDays={scheduledDays}
              selected={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </div>
      )}

      {/* Patient Profile / Appointment Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-[#3D2E28]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DCCFBF] pb-4 mb-5">
              <div className="flex items-center gap-3">
                {patientProfile?.avatar_url ? (
                  <img
                    src={patientProfile.avatar_url}
                    alt="Patient Avatar"
                    className="w-11 h-11 rounded-full object-cover border border-[#DCCFBF]"
                  />
                ) : (
                  <div className="bg-[#8B1E42]/10 text-[#8B1E42] p-2.5 rounded-2xl">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-[#3D2E28]">
                    {patientProfile?.display_name ||
                      patientProfile?.username?.replace(/-/g, " ") ||
                      selectedAppointment.patientName}
                  </h3>
                  <span className="text-xs text-[#8B7562]">
                    Appointment #{selectedAppointment.id} • Patient #{selectedAppointment.patientId}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-[#8B7562] hover:text-[#3D2E28] rounded-full hover:bg-[#EDE3D8] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Save Notice */}
            {profileNotice && (
              <div
                className={`p-3 rounded-2xl text-xs mb-5 flex items-center gap-2 ${
                  profileNotice.type === "success"
                    ? "bg-[#52795A]/10 border border-[#52795A]/25 text-[#52795A]"
                    : "bg-[#8B1E42]/10 border border-[#8B1E42]/20 text-[#8B1E42]"
                }`}
              >
                {profileNotice.type === "success" ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{profileNotice.text}</span>
              </div>
            )}

            {/* Patient Profile: View / Edit */}
            {loadingProfile ? (
              <div className="flex items-center justify-center py-8 text-[#8B7562] gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading patient profile...</span>
              </div>
            ) : profileError ? (
              <div className="p-4 bg-[#8B1E42]/10 border border-[#8B1E42]/20 rounded-2xl text-xs text-[#8B1E42] mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            ) : patientProfile ? (
              <div className="space-y-3 bg-[#EDE3D8] p-4 rounded-2xl border border-[#DCCFBF] mb-5 text-sm text-[#5B4B41]">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xs uppercase font-bold text-[#8B7562] tracking-wider">
                    Patient Profile
                  </h4>
                  {!isEditingProfile && (
                    <button
                      onClick={handleStartEditProfile}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition flex items-center gap-1.5"
                      title="Edit patient profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={profileForm.dateOfBirth}
                          onChange={handleProfileFormChange}
                          className={modalInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          value={profileForm.gender}
                          onChange={handleProfileFormChange}
                          className={modalInputClass}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          required
                          value={profileForm.phoneNumber}
                          onChange={handleProfileFormChange}
                          placeholder="09123456789"
                          className={modalInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Blood Type
                        </label>
                        <select
                          name="bloodType"
                          value={profileForm.bloodType}
                          onChange={handleProfileFormChange}
                          className={modalInputClass}
                        >
                          <option value="">Select Blood Type</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                            <option key={bt} value={bt}>{bt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DCCFBF]/60 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={profileForm.emergencyContactName}
                          onChange={handleProfileFormChange}
                          placeholder="Full Name"
                          className={modalInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Emergency Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={profileForm.emergencyContactPhone}
                          onChange={handleProfileFormChange}
                          placeholder="09123456789"
                          className={modalInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          name="insuranceProvider"
                          value={profileForm.insuranceProvider}
                          onChange={handleProfileFormChange}
                          placeholder="e.g. PhilHealth, Maxicare"
                          className={modalInputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#8B7562] tracking-wider mb-1">
                          Insurance Policy Number
                        </label>
                        <input
                          type="text"
                          name="insurancePolicyNumber"
                          value={profileForm.insurancePolicyNumber}
                          onChange={handleProfileFormChange}
                          placeholder="Policy / Member ID"
                          className={modalInputClass}
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DCCFBF]/60 flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        disabled={savingProfile}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F8F3EC] text-[#3D2E28] border border-[#DCCFBF] hover:bg-[#DCCFBF] transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-[#8B1E42] text-white hover:bg-[#A32B54] transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {savingProfile ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#8B7562] block">Full Name</span>
                        <span className="font-semibold text-[#3D2E28]">
                          {patientProfile.display_name || patientProfile.username || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8B7562] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#8B1E42]" /> Email
                        </span>
                        <span className="font-semibold text-[#3D2E28] break-all">
                          {patientProfile.email || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8B7562] block">Gender</span>
                        <span className="font-semibold text-[#3D2E28]">{patientProfile.gender || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[#8B7562] block">Date of Birth</span>
                        <span className="font-semibold text-[#3D2E28]">
                          {patientProfile.date_of_birth
                            ? formatWallClockDate(patientProfile.date_of_birth)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#8B1E42]" />
                        <span>{patientProfile.phone_number || "No Phone"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-[#8B1E42]" />
                        <span className="font-semibold text-[#3D2E28]">Blood: {patientProfile.blood_type || "N/A"}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DCCFBF]/60 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#8B7562] flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-[#C08A3E]" /> Emergency Contact
                        </span>
                        <div className="font-medium text-[#3D2E28] mt-0.5">
                          {patientProfile.emergency_contact_name || "N/A"}
                        </div>
                        <div className="text-[#8B7562]">{patientProfile.emergency_contact_phone || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-[#8B7562] flex items-center gap-1">
                          <Shield className="w-3 h-3 text-[#52795A]" /> Insurance
                        </span>
                        <div className="font-medium text-[#3D2E28] mt-0.5">
                          {patientProfile.insurance_provider || "N/A"}
                        </div>
                        <div className="text-[#8B7562]">
                          Policy #{patientProfile.insurance_policy_number || "N/A"}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* Appointment Visit Meta */}
            <div className="space-y-2 bg-[#EDE3D8]/50 p-3.5 rounded-2xl border border-[#DCCFBF] mb-5 text-xs text-[#5B4B41]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-[#3D2E28]">
                  <Clock className="w-3.5 h-3.5 text-[#8B1E42]" /> {selectedAppointment.time}
                </span>
                <span className="flex items-center gap-1.5 text-[#8B7562]">
                  <Calendar className="w-3.5 h-3.5" /> {selectedAppointment.rawDate}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div className="pt-1.5 text-[#8B7562]">
                  <span className="font-semibold text-[#3D2E28]">Reason:</span> "{selectedAppointment.notes}"
                </div>
              )}
            </div>

            {/* Consultation Notes */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs uppercase font-bold text-[#8B7562] tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8B1E42]" />
                  Consultation Notes
                </label>
                {!loadingNotes && !notesError && (
                  <span className="text-[10px] text-[#8B7562] font-medium">
                    {patientNotes.length} note{patientNotes.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              {notesError && (
                <div className="p-3 bg-[#8B1E42]/10 border border-[#8B1E42]/20 rounded-2xl text-xs text-[#8B1E42] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{notesError}</span>
                </div>
              )}

              {loadingNotes ? (
                <div className="flex items-center justify-center py-5 text-[#8B7562] gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading notes...</span>
                </div>
              ) : patientNotes.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                  {patientNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#EDE3D8] border border-[#DCCFBF] rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-[#3D2E28]">
                          {note.doctor_name || "Doctor"}
                        </span>
                        <span className="text-[10px] text-[#8B7562]">
                          {formatWallClockDateTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B4B41] whitespace-pre-wrap break-words">
                        {note.note}
                      </p>
                      {note.appointment_id && (
                        <div className="text-[10px] text-[#8B7562] mt-1.5">
                          Appointment #{note.appointment_id}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-[#8B7562] mb-3">
                  No consultation notes yet for this patient.
                </p>
              )}

              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Write a note about this patient while consulting..."
                  className="w-full px-3 py-2.5 bg-[#F8F3EC] border border-[#DCCFBF] rounded-xl text-xs text-[#3D2E28] placeholder-[#8B7562] focus:outline-none focus:border-[#8B1E42] resize-y"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-[#8B7562]">{noteText.length}/2000</span>
                  <button
                    type="submit"
                    disabled={savingNote || !noteText.trim()}
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-[#8B1E42] text-white hover:bg-[#A32B54] transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingNote ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {savingNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </form>
            </div>

            {/* Status Selection Section */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#8B7562] tracking-wider mb-2.5">
                Update Status
              </label>

              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={selectedAppointment.status} />
                <span className="text-[11px] text-[#8B7562]">
                  {user?.role === "admin"
                    ? "Admins can set any appointment status."
                    : "You can start a consultation or mark it completed."}
                </span>
              </div>

              <div className={`grid gap-2.5 ${user?.role === "admin" ? "grid-cols-2" : "grid-cols-2"}`}>
                {(user?.role === "admin"
                  ? [
                      { label: "Scheduled", value: "scheduled", color: "hover:border-[#8B7562]" },
                      { label: "In Consultation", value: "in_consultation", color: "hover:border-[#C08A3E]" },
                      { label: "Completed", value: "completed", color: "hover:border-[#52795A]" },
                      { label: "Cancelled", value: "cancelled", color: "hover:border-[#8B1E42]" },
                    ]
                  : [
                      { label: "In Consultation", value: "in_consultation", color: "hover:border-[#C08A3E]" },
                      { label: "Completed", value: "completed", color: "hover:border-[#52795A]" },
                    ]
                ).map((opt) => {
                  const isSelected = selectedAppointment.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      disabled={isUpdatingStatus || isSelected}
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, opt.value)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                        isSelected
                          ? "bg-[#8B1E42] text-white border-[#8B1E42] shadow-sm"
                          : `bg-[#F8F3EC] text-[#3D2E28] border-[#DCCFBF] ${opt.color} hover:bg-[#EDE3D8]`
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isUpdatingStatus && !isSelected && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {opt.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>

              {statusError && (
                <p className="mt-2.5 text-xs font-semibold text-[#8B1E42]">{statusError}</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-[#DCCFBF] flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#EDE3D8] text-[#3D2E28] hover:bg-[#DCCFBF] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

// Calendar Component
function MonthCalendar({ scheduledDays = [], selected, onSelectDate }) {
  const [viewDate, setViewDate] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) =>
    d === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();

  const changeMonth = (delta) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl p-6 w-full lg:w-[380px] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-[#8B7562]">
            Schedule
          </div>
          <div className="text-lg font-bold text-[#3D2E28]">{monthLabel}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-1.5 rounded-full text-[#8B7562] hover:text-[#3D2E28] hover:bg-[#EDE3D8] transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekdayLabels.map((w, i) => (
          <div key={i} className="text-xs font-semibold text-[#8B7562] text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) =>
          d === null ? (
            <div key={i} className="h-9 w-9" />
          ) : (
            <button
              key={i}
              onClick={() => onSelectDate(new Date(year, month, d))}
              className={`h-9 w-9 mx-auto flex flex-col items-center justify-center rounded-xl text-sm transition relative ${
                isSelected(d)
                  ? "bg-[#8B1E42] text-white font-bold shadow-sm"
                  : isToday(d)
                  ? "border border-[#8B1E42] text-[#8B1E42] font-bold"
                  : "text-[#3D2E28] hover:bg-[#EDE3D8]"
              }`}
            >
              <span>{d}</span>
              {scheduledDays.includes(d) && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    isSelected(d) ? "bg-white" : "bg-[#C08A3E]"
                  }`}
                />
              )}
            </button>
          )
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-[#DCCFBF] flex items-center justify-between text-xs text-[#8B7562] font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C08A3E]" />
          Has appointments
        </div>
        <div>
          {selected.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}