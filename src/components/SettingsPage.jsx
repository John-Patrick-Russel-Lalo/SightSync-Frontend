import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  Shield,
  ShieldCheck,
  Stethoscope,
  User,
  Palette,
  Lock,
  Check,
  Globe,
  Clock,
  Save,
  Eye,
  Database,
  Users,
  HeartPulse,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role || "patient";

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [twoFactor, setTwoFactor] = useState(false);
  const [timeout, setTimeoutValue] = useState("30");
  const [saved, setSaved] = useState(false);

  // Admin-only options
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [requireVerification, setRequireVerification] = useState(true);
  const [defaultRole, setDefaultRole] = useState("patient");
  const [auditLogging, setAuditLogging] = useState(true);

  // Doctor-only options
  const [autoAccept, setAutoAccept] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [bufferMinutes, setBufferMinutes] = useState("15");

  // Patient-only options
  const [shareProfile, setShareProfile] = useState(true);
  const [showContacts, setShowContacts] = useState(true);

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const roleInfo = {
    admin: { label: "Admin", icon: ShieldCheck, blurb: "System-wide settings and permissions" },
    doctor: { label: "Doctor", icon: Stethoscope, blurb: "Clinical and availability preferences" },
    patient: { label: "Patient", icon: HeartPulse, blurb: "Privacy and appointment preferences" },
  }[role] || { label: "Patient", icon: HeartPulse, blurb: "Privacy and appointment preferences" };

  const RoleIcon = roleInfo.icon;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Settings</h2>
          <p className="text-sm text-stone-600">Manage your preferences, security, and notifications.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-full">
              <Check className="w-3.5 h-3.5" /> Changes saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#8B1E42] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#731836] transition shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Role Summary Banner */}
      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-[#8B1E42]/10 text-[#8B1E42] rounded-2xl shrink-0">
          <RoleIcon className="w-7 h-7" />
        </div>
        <div>
          <div className="text-lg font-bold text-stone-900 capitalize">{role} Settings</div>
          <p className="text-sm text-stone-600">{roleInfo.blurb}</p>
        </div>
      </div>

      {/* Account & General */}
      <SettingsCard
        title="Account & Profile"
        description="Basic account details and general preferences."
        icon={<User className="w-4 h-4 text-[#8B1E42]" />}
      >
        <SettingRow
          icon={<User className="w-4 h-4" />}
          title="Display name"
          description="Name shown across the portal"
        >
          <input
            type="text"
            defaultValue={user?.display_name || user?.name || user?.username || ""}
            placeholder="Your name"
            className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] w-56"
          />
        </SettingRow>
        <SettingRow
          icon={<Globe className="w-4 h-4" />}
          title="Language"
          description="Preferred language for the interface"
        >
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium"
          >
            <option value="en">English</option>
            <option value="fil">Filipino</option>
            <option value="es">Spanish</option>
          </select>
        </SettingRow>
        <SettingRow
          icon={<Palette className="w-4 h-4" />}
          title="Theme"
          description="Appearance of the portal"
        >
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </SettingRow>
      </SettingsCard>

      {/* Notifications (all roles) */}
      <SettingsCard
        title="Notifications"
        description="Choose how you want to be notified."
        icon={<Bell className="w-4 h-4 text-[#8B1E42]" />}
      >
        <SettingRow
          icon={<Bell className="w-4 h-4" />}
          title="Email notifications"
          description="Receive important updates by email"
        >
          <Toggle checked={emailNotif} onChange={setEmailNotif} />
        </SettingRow>
        <SettingRow
          icon={<Bell className="w-4 h-4" />}
          title="SMS notifications"
          description="Receive alerts via text message"
        >
          <Toggle checked={smsNotif} onChange={setSmsNotif} />
        </SettingRow>
        <SettingRow
          icon={<Bell className="w-4 h-4" />}
          title="Push notifications"
          description="In-app push notifications"
        >
          <Toggle checked={pushNotif} onChange={setPushNotif} />
        </SettingRow>
      </SettingsCard>

      {/* Security (all roles) */}
      <SettingsCard
        title="Privacy & Security"
        description="Protect your account and control access."
        icon={<Lock className="w-4 h-4 text-[#8B1E42]" />}
      >
        <SettingRow
          icon={<Lock className="w-4 h-4" />}
          title="Two-factor authentication"
          description="Add an extra layer of account security"
        >
          <Toggle checked={twoFactor} onChange={setTwoFactor} />
        </SettingRow>
        <SettingRow
          icon={<Clock className="w-4 h-4" />}
          title="Session timeout"
          description="Automatically sign out after inactivity"
        >
          <select
            value={timeout}
            onChange={(e) => setTimeoutValue(e.target.value)}
            className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="never">Never</option>
          </select>
        </SettingRow>
      </SettingsCard>

      {/* Admin Role Options */}
      {role === "admin" && (
        <SettingsCard
          title="System Preferences"
          description="Organization-wide defaults and access controls."
          icon={<Shield className="w-4 h-4 text-[#8B1E42]" />}
        >
          <SettingRow
            icon={<Users className="w-4 h-4" />}
            title="Allow new registrations"
            description="Permit new user sign-ups on the portal"
          >
            <Toggle checked={allowRegistrations} onChange={setAllowRegistrations} />
          </SettingRow>
          <SettingRow
            icon={<Shield className="w-4 h-4" />}
            title="Require email verification"
            description="New users must verify their email address"
          >
            <Toggle checked={requireVerification} onChange={setRequireVerification} />
          </SettingRow>
          <SettingRow
            icon={<Database className="w-4 h-4" />}
            title="Audit logging"
            description="Record administrative actions for review"
          >
            <Toggle checked={auditLogging} onChange={setAuditLogging} />
          </SettingRow>
          <SettingRow
            icon={<Users className="w-4 h-4" />}
            title="Default role for new users"
            description="Assigned when an account is created"
          >
            <select
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value)}
              className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium capitalize"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </SettingRow>
        </SettingsCard>
      )}

      {/* Doctor Role Options */}
      {role === "doctor" && (
        <SettingsCard
          title="Clinical Preferences"
          description="Availability and scheduling defaults."
          icon={<Stethoscope className="w-4 h-4 text-[#8B1E42]" />}
        >
          <SettingRow
            icon={<Stethoscope className="w-4 h-4" />}
            title="Auto-accept requests"
            description="Approve appointment requests automatically"
          >
            <Toggle checked={autoAccept} onChange={setAutoAccept} />
          </SettingRow>
          <SettingRow
            icon={<Clock className="w-4 h-4" />}
            title="Appointment buffer"
            description="Extra minutes reserved between visits"
          >
            <select
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(e.target.value)}
              className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium"
            >
              <option value="0">No buffer</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </SettingRow>
          <SettingRow
            icon={<Bell className="w-4 h-4" />}
            title="Day-before reminders"
            description="Send reminders to patients before visits"
          >
            <Toggle checked={reminders} onChange={setReminders} />
          </SettingRow>
        </SettingsCard>
      )}

      {/* Patient Role Options */}
      {role === "patient" && (
        <SettingsCard
          title="Privacy Preferences"
          description="Control how your health information is used."
          icon={<Eye className="w-4 h-4 text-[#8B1E42]" />}
        >
          <SettingRow
            icon={<Shield className="w-4 h-4" />}
            title="Share profile with doctors"
            description="Allow doctors to view your medical record"
          >
            <Toggle checked={shareProfile} onChange={setShareProfile} />
          </SettingRow>
          <SettingRow
            icon={<Eye className="w-4 h-4" />}
            title="Show emergency contacts"
            description="Display contact details to clinic staff"
          >
            <Toggle checked={showContacts} onChange={setShowContacts} />
          </SettingRow>
        </SettingsCard>
      )}
    </div>
  );
}

function SettingsCard({ title, description, icon, children }) {
  return (
    <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#EBE3D8] flex items-center gap-3 bg-[#FAF7F2]">
        <div className="p-2.5 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC]">{icon}</div>
        <div>
          <h3 className="text-base font-bold text-stone-900">{title}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-4 divide-y divide-[#EBE3D8]">{children}</div>
    </section>
  );
}

function SettingRow({ icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 px-2">
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC] text-[#8B1E42] shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-stone-900">{title}</div>
          <p className="text-xs text-stone-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full p-0.5 transition ${checked ? "bg-[#8B1E42]" : "bg-stone-300"}`}
    >
      <span
        className={`block w-5 h-5 rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}