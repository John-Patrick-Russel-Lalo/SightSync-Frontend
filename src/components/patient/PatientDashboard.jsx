import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PortalLayout from "../PortalLayout";
import PatientProfileForm from "../PatientProfileForm";
import SettingsPage from "../SettingsPage";
import PatientAppointments from "./PatientAppointments";
import ScheduleAppointmentPage from "../admin/ScheduleAppointmentPage";
import { User, CalendarHeart, CalendarPlus, Settings } from "lucide-react";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "My Appointments", icon: CalendarHeart },
    { id: "book", label: "Book Appointment", icon: CalendarPlus },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings, sectionEnd: true },
  ];

  return (
    <PortalLayout
      title="Patient Portal"
      subtitle="Manage your health and appointments"
      brandIcon={<User className="w-6 h-6" />}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={user}
      onLogout={logout}
    >
      {activeTab === "overview" && <PatientAppointments />}
      {activeTab === "book" && <ScheduleAppointmentPage />}
      {activeTab === "profile" && <PatientProfileForm />}
      {activeTab === "settings" && <SettingsPage />}
    </PortalLayout>
  );
}