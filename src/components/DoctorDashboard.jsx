
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
} from "lucide-react";
import PortalLayout from "./PortalLayout";
import SettingsPage from "./SettingsPage";

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

  // Helper function to format JS Date into YYYY-MM-DD string
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

      const response = await fetch(`http://localhost:3500/appointments/${doctorId}`, {
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
        const startDate = app.start_time ? new Date(app.start_time) : null;
        
        const formattedTime = startDate 
          ? startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
          : "N/A";

        return {
          id: app.id,
          patientName: app.patient_id ? `Patient #${app.patient_id}` : "Unknown Patient",
          patientId: app.patient_id,
          time: formattedTime,
          type: app.notes || "General Consultation",
          status: app.status || "scheduled",
          rawDate: startDate ? formatDateString(startDate) : "",
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

  // 2. Fetch Patient Profile when Options modal opens
  const handleOpenOptions = async (app) => {
    setSelectedAppointment(app);
    setPatientProfile(null);
    setProfileError(null);

    if (!app.patientId) return;

    try {
      setLoadingProfile(true);

      // Adjust endpoint base URL path if needed (e.g., http://localhost:3500/patients/ or /users/)
      const response = await fetch(`http://localhost:3500/patients/${app.patientId}`, {
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

  // 3. Filter appointments matching selected calendar date
  const selectedDateStr = formatDateString(selectedDate);
  const todaysAppointments = appointments.filter((app) => {
    if (!app.rawDate) return true;
    return app.rawDate === selectedDateStr;
  });

  const scheduledDays = appointments
    .filter((app) => {
      if (!app.rawDate) return false;
      const appDate = new Date(app.rawDate);
      return (
        appDate.getMonth() === selectedDate.getMonth() &&
        appDate.getFullYear() === selectedDate.getFullYear()
      );
    })
    .map((app) => new Date(app.rawDate).getDate());

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

      const response = await fetch(`http://localhost:3500/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status on server.");
      }

      setAppointments((prev) =>
        prev.map((app) => (app.id === appointmentId ? { ...app, status: newStatus } : app))
      );

      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Could not update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const navItems = [
    { id: "appointments", label: "Appointments", icon: LayoutDashboard },
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
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Appointments Table Section */}
          <section className="w-full lg:flex-1 bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl overflow-hidden order-2 lg:order-1 shadow-sm">
            {/* Header Controls */}
            <div className="p-7 border-b border-[#DCCFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#3D2E28]">
                  Appointments for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h2>
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
                            <span
                              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${
                                app.status === "Completed" || app.status === "completed"
                                  ? "bg-[#52795A]/10 text-[#52795A] border border-[#52795A]/25"
                                  : app.status === "In Consultation" || app.status === "in consultation"
                                  ? "bg-[#C08A3E]/10 text-[#C08A3E] border border-[#C08A3E]/25"
                                  : app.status === "cancelled"
                                  ? "bg-[#8B1E42]/10 text-[#8B1E42] border border-[#8B1E42]/25"
                                  : "bg-[#DCCFBF]/40 text-[#8B7562] border border-[#DCCFBF]"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  app.status === "Completed" || app.status === "completed"
                                    ? "bg-[#52795A]"
                                    : app.status === "In Consultation" || app.status === "in consultation"
                                    ? "bg-[#C08A3E]"
                                    : app.status === "cancelled"
                                    ? "bg-[#8B1E42]"
                                    : "bg-[#8B7562]"
                                }`}
                              />
                              {app.status}
                            </span>
                          </td>
                          <td className="px-7 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleOpenOptions(app)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition flex items-center gap-1.5"
                                title="Manage Appointment"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Options
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

      {/* Options Modal with Patient Profile */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-[#3D2E28]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-150">
            
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
                    {patientProfile?.username?.replace(/-/g, " ") || selectedAppointment.patientName}
                  </h3>
                  <span className="text-xs text-[#8B7562]">
                    Appointment #{selectedAppointment.id} • Patient #{selectedAppointment.patientId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setPatientProfile(null);
                }}
                className="p-1.5 text-[#8B7562] hover:text-[#3D2E28] rounded-full hover:bg-[#EDE3D8] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Loading / Error / Data View */}
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
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8B7562] block">Gender</span>
                    <span className="font-semibold text-[#3D2E28]">{patientProfile.gender || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[#8B7562] block">Date of Birth</span>
                    <span className="font-semibold text-[#3D2E28]">
                      {patientProfile.date_of_birth
                        ? new Date(patientProfile.date_of_birth).toLocaleDateString()
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
                    <div className="text-[#8B7562]">{patientProfile.emergency_contact_phone}</div>
                  </div>
                  <div>
                    <span className="text-[#8B7562] flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#52795A]" /> Insurance
                    </span>
                    <div className="font-medium text-[#3D2E28] mt-0.5">
                      {patientProfile.insurance_provider || "N/A"}
                    </div>
                    <div className="text-[#8B7562]">Policy #{patientProfile.insurance_policy_number}</div>
                  </div>
                </div>
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

            {/* Status Selection Section */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#8B7562] tracking-wider mb-2.5">
                Update Status
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Scheduled", value: "scheduled", color: "hover:border-[#8B7562]" },
                  { label: "In Consultation", value: "In Consultation", color: "hover:border-[#C08A3E]" },
                  { label: "Completed", value: "Completed", color: "hover:border-[#52795A]" },
                  { label: "Cancelled", value: "cancelled", color: "hover:border-[#8B1E42]" },
                ].map((opt) => {
                  const isSelected = selectedAppointment.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, opt.value)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                        isSelected
                          ? "bg-[#8B1E42] text-white border-[#8B1E42] shadow-sm"
                          : `bg-[#F8F3EC] text-[#3D2E28] border-[#DCCFBF] ${opt.color} hover:bg-[#EDE3D8]`
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-[#DCCFBF] flex justify-end">
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setPatientProfile(null);
                }}
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