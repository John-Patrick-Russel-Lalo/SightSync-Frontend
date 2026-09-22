import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PortalLayout from "./PortalLayout";
import PatientProfileForm from "./PatientProfileForm";
import ScheduleAppointmentPage from "./admin/ScheduleAppointmentPage";
import SettingsPage from "./SettingsPage";
import { User, Calendar, Settings } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const navItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "appointments", label: "Appointments", icon: Calendar },
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
      {activeTab === "profile" && <PatientProfileForm />}
      {activeTab === "appointments" && <ScheduleAppointmentPage />}
      {activeTab === "settings" && <SettingsPage />}
    </PortalLayout>
  );
}