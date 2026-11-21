import { useEffect, useState } from "react";
import { Bell, Check, CircleUserRound, Eye, FileText, LockKeyhole, Mail, Monitor, SlidersHorizontal, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const defaults = { compact: false, largeText: false, reduceMotion: false, browserAlerts: false };
const keyFor = (id) => `sightsync:settings:${id || "guest"}`;
const load = (id) => { try { return { ...defaults, ...JSON.parse(localStorage.getItem(keyFor(id)) || "{}") }; } catch { return defaults; } };

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(() => load(user?.id));
  const [notice, setNotice] = useState("");
  useEffect(() => setSettings(load(user?.id)), [user?.id]);
  useEffect(() => {
    localStorage.setItem(keyFor(user?.id), JSON.stringify(settings));
    document.documentElement.dataset.portalDensity = settings.compact ? "compact" : "comfortable";
    document.documentElement.dataset.portalText = settings.largeText ? "large" : "normal";
    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? "true" : "false";
  }, [settings, user?.id]);
  const set = (name, value) => setSettings((current) => ({ ...current, [name]: value }));
  const browserAlerts = async (value) => {
    if (!value) return set("browserAlerts", false);
    if (!("Notification" in window)) return setNotice("Browser notifications are not supported by this browser.");
    const permission = await Notification.requestPermission();
    set("browserAlerts", permission === "granted");
    setNotice(permission === "granted" ? "Browser notifications are enabled for this device." : "Browser notification permission was not granted.");
  };
  const name = user?.display_name || user?.name || user?.username || "SightSync user";
  const provider = user?.provider === "google" ? "Google" : user?.provider === "facebook" ? "Facebook" : "Email and password";
  return <div className="space-y-6 sm:space-y-8 pb-8">
    <header className="space-y-2"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-[#8B1E42] text-white"><SlidersHorizontal className="w-5 h-5" /></div><div><h2 className="text-xl sm:text-2xl font-bold text-stone-900">Settings</h2><p className="text-sm text-stone-600">Manage your account information and portal experience.</p></div></div>{notice && <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full"><Check className="w-3.5 h-3.5" />{notice}</p>}</header>
    <Card title="Account" description="Your sign-in identity is managed securely by SightSync." icon={<CircleUserRound className="w-4 h-4" />}>
      <ReadOnly icon={<UserRound className="w-4 h-4" />} title="Account name" value={name} description="Display names cannot be changed from portal settings." />
      <ReadOnly icon={<Mail className="w-4 h-4" />} title="Email address" value={user?.email || "No email address on file"} description="Used for appointment and account communications." />
      <ReadOnly icon={<LockKeyhole className="w-4 h-4" />} title="Sign-in method" value={provider} description="Your active account authentication method." />
    </Card>
    <Card title="Notifications" description="Choose how this browser can alert you about SightSync activity." icon={<Bell className="w-4 h-4" />}>
      <Row icon={<Bell className="w-4 h-4" />} title="Browser notifications" description="Allow alerts on this device when supported."><Toggle checked={settings.browserAlerts} onChange={browserAlerts} /></Row>
      <ReadOnly icon={<Mail className="w-4 h-4" />} title="Email notifications" value="Appointment requests and approvals" description="Sent to the email address shown above." />
    </Card>
    <Card title="Accessibility & display" description="These preferences are saved on this device and browser." icon={<Eye className="w-4 h-4" />}>
      <Row icon={<Monitor className="w-4 h-4" />} title="Compact layout" description="Reduce spacing in portal lists and panels."><Toggle checked={settings.compact} onChange={(v) => set("compact", v)} /></Row>
      <Row icon={<FileText className="w-4 h-4" />} title="Larger text" description="Increase text size for easier reading."><Toggle checked={settings.largeText} onChange={(v) => set("largeText", v)} /></Row>
      <Row icon={<Eye className="w-4 h-4" />} title="Reduce motion" description="Minimize portal animations and transitions."><Toggle checked={settings.reduceMotion} onChange={(v) => set("reduceMotion", v)} /></Row>
    </Card>
  </div>;
}

function Card({ title, description, icon, children }) { return <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden"><div className="p-4 sm:p-6 border-b border-[#EBE3D8] flex items-center gap-3 bg-[#FAF7F2]"><div className="p-2.5 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC] text-[#8B1E42]">{icon}</div><div><h3 className="text-base font-bold text-stone-900">{title}</h3><p className="text-xs text-stone-500 mt-0.5">{description}</p></div></div><div className="p-4 divide-y divide-[#EBE3D8]">{children}</div></section>; }
function Row({ icon, title, description, children }) { return <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-4 px-2"><div className="flex items-start gap-3 min-w-0"><div className="p-2 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC] text-[#8B1E42] shrink-0">{icon}</div><div><div className="text-sm font-semibold text-stone-900">{title}</div><p className="text-xs text-stone-500 mt-0.5">{description}</p></div></div><div className="self-end sm:self-auto sm:shrink-0">{children}</div></div>; }
function ReadOnly({ icon, title, value, description }) { return <Row icon={icon} title={title} description={description}><span className="block max-w-xs text-right text-sm font-medium text-stone-700 break-words">{value}</span></Row>; }
function Toggle({ checked, onChange }) { return <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full p-0.5 transition ${checked ? "bg-[#8B1E42]" : "bg-stone-300"}`}><span className={`block w-5 h-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} /></button>; }
