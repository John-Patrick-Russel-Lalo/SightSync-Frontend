import { useState } from "react";
import { Bell, Settings, LogOut, X } from "lucide-react";

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: "New appointment request",
    detail: "A patient booked a new consultation slot.",
    time: "2m ago",
  },
  {
    id: 2,
    title: "System maintenance",
    detail: "Scheduled maintenance is set for Sunday at 02:00 AM.",
    time: "1h ago",
  },
  {
    id: 3,
    title: "Profile update",
    detail: "Your account profile was updated successfully.",
    time: "1d ago",
  },
];

export default function PortalLayout({
  title,
  subtitle,
  brandIcon,
  navItems = [],
  activeTab,
  onTabChange,
  user = {},
  onLogout,
  notifications = DEFAULT_NOTIFICATIONS,
  maxWidth = "max-w-7xl",
  children,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState([]);

  const mainItems = navItems.filter((item) => !item.sectionEnd);
  const bottomItems = navItems.filter((item) => item.sectionEnd);

  const unread = notifications.length - readIds.length;

  const displayName =
    user?.display_name || user?.name || user?.username || "Portal User";
  const role = user?.role || "user";

  const markAllRead = () => setReadIds(notifications.map((n) => n.id));

  const renderNavItems = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            isActive
              ? "bg-[#8B1E42] text-white shadow-sm"
              : "text-stone-600 hover:text-stone-900 hover:bg-[#E2D6C7]"
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </button>
      );
    });

  return (
    <div className="min-h-screen bg-[#EDE3D8] text-stone-800 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#EDE3D8] border-r border-[#DCD0C0] flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#8B1E42] text-white p-2.5 rounded-xl shadow-sm shrink-0">
              {brandIcon}
            </div>
            <div>
              <h1 className="font-bold text-lg text-stone-900 leading-tight">{title}</h1>
              <span className="text-xs font-medium text-stone-500">{subtitle}</span>
            </div>
          </div>

          {mainItems.length > 0 && <nav className="space-y-1.5">{renderNavItems(mainItems)}</nav>}

          {bottomItems.length > 0 && (
            <div>
              <div className="h-px bg-[#DCD0C0] mb-4" />
              <nav className="space-y-1.5">{renderNavItems(bottomItems)}</nav>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#DCD0C0] bg-[#E8DDD0]/50 flex items-center justify-between">
          <div className="overflow-hidden mr-2">
            <div className="text-sm font-semibold text-stone-900 truncate">{displayName}</div>
            <div className="text-xs text-[#8B1E42] font-semibold uppercase tracking-wider truncate">
              {role}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-rose-700 hover:text-rose-800 hover:bg-rose-100/60 rounded-xl transition shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="border-b border-[#DCD0C0] bg-[#EDE3D8]/90 backdrop-blur sticky top-0 z-10 px-8 py-4 flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-[#E2D6C7] transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#8B1E42] text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            <button
              onClick={() => onTabChange("settings")}
              className={`p-2 rounded-xl transition flex items-center gap-2 ${
                activeTab === "settings"
                  ? "bg-[#8B1E42] text-white"
                  : "text-stone-600 hover:text-stone-900 hover:bg-[#E2D6C7]"
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showNotifications && (
              <NotificationsDropdown
                notifications={notifications}
                readIds={readIds}
                onMarkAllRead={markAllRead}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </header>

        <main className={`flex-1 p-8 ${maxWidth} w-full mx-auto space-y-8`}>{children}</main>
      </div>
    </div>
  );
}

function NotificationsDropdown({ notifications, readIds, onMarkAllRead, onClose }) {
  return (
    <div className="absolute right-0 top-12 w-80 bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-2xl overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-[#EBE3D8] flex items-center justify-between bg-[#FAF7F2]">
        <h3 className="text-sm font-bold text-stone-900">Notifications</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-[#8B1E42] hover:text-[#731836] transition"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-[#EBE3D8] transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <ul className="max-h-80 overflow-y-auto divide-y divide-[#EBE3D8]">
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const isRead = readIds.includes(n.id);
            return (
              <li
                key={n.id}
                className={`px-4 py-3.5 flex gap-3 ${isRead ? "" : "bg-[#8B1E42]/5"}`}
              >
                <span
                  className={`w-2 h-2 shrink-0 rounded-full mt-1.5 ${
                    isRead ? "bg-stone-300" : "bg-[#8B1E42]"
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-stone-900">{n.title}</div>
                  <p className="text-xs text-stone-500 mt-0.5">{n.detail}</p>
                  <span className="text-[11px] font-medium text-stone-400 mt-1 inline-block">
                    {n.time}
                  </span>
                </div>
              </li>
            );
          })
        ) : (
          <li className="px-4 py-10 text-center text-sm text-stone-500">No notifications.</li>
        )}
      </ul>
    </div>
  );
}