import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PortalLayout from "../PortalLayout";
import PatientProfileForm from "../PatientProfileForm";
import SettingsPage from "../SettingsPage";
import PatientAppointments from "./PatientAppointments";
import BookAppointment from "./BookAppointment";
import AppointmentArchive from "../AppointmentArchive";
import { User, CalendarHeart, CalendarPlus, Settings, Archive } from "lucide-react";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { id: "overview", label: "My Appointments", icon: CalendarHeart },
    { id: "book", label: "Book Appointment", icon: CalendarPlus },
    { id: "archive", label: "Appointment Archive", icon: Archive },
    { id: "profile", label: "My Profile", icon: User, sectionEnd: true },
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
      {activeTab === "book" && <BookAppointment />}
      {activeTab === "archive" && <AppointmentArchive scope="my" />}
      {activeTab === "profile" && <PatientProfileForm />}
      {activeTab === "settings" && <SettingsPage />}
    </PortalLayout>
  );
}