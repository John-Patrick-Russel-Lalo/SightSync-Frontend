import { useState, useEffect } from "react";
import { Bell, Settings, LogOut, X, Menu, WifiOff } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useNotifications } from "../context/NotificationContext";
import { parseWallClock } from "../utils/dateTime";

const DEFAULT_NOTIFICATIONS = [];

// Notification timestamps are timezone-less wall clock values from the API.
// Plain text (e.g. "12:30 PM") is kept as-is for backwards compatibility.
function renderNotificationTime(value) {
  if (!value) return "Just now";

  const parsed = parseWallClock(value);
  if (!parsed) return String(value);

  return parsed.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    notifications: liveNotifications,
    unreadCount,
    connected,
    toast,
    dismissToast,
    markRead,
    markAllRead,
  } = useNotifications();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => {
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // The socket-backed list wins; the `notifications` prop stays as a fallback.
  const isLive = liveNotifications.length > 0;
  const displayNotifications = isLive ? liveNotifications : notifications;
  const unread = isLive
    ? unreadCount
    : displayNotifications.filter((n) => !n.is_read).length;

  const displayName =
    user?.display_name || user?.name || user?.username || "Portal User";
  const role = user?.role || "user";

  const handleNavClick = (id) => {
    onTabChange(id);
    setSidebarOpen(false);
  };

  const sidebarProps = {
    title,
    subtitle,
    brandIcon,
    activeTab,
    onNavClick: handleNavClick,
    displayName,
    role,
    onLogout: () => {
      setSidebarOpen(false);
      setShowLogoutConfirm(true);
    },
    onClose: () => setSidebarOpen(false),
  };

  return (
    <div className="min-h-screen bg-[#EDE3D8] text-stone-800 flex font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex w-64 bg-[#EDE3D8] border-r border-[#DCD0C0] flex-col justify-between shrink-0 h-screen sticky top-0">
        <SidebarContent {...sidebarProps} navItems={navItems} onClose={null} />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-[#EDE3D8] border-r border-[#DCD0C0] flex flex-col justify-between lg:hidden">
          <SidebarContent {...sidebarProps} navItems={navItems} />
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="border-b border-[#DCD0C0] bg-[#EDE3D8]/90 backdrop-blur sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-[#E2D6C7] transition"
              title="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden overflow-hidden">
              <h1 className="font-bold text-base sm:text-lg text-stone-900 leading-tight truncate">{title}</h1>
              <span className="text-[11px] sm:text-xs font-medium text-stone-500 truncate block">{subtitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-[#E2D6C7] transition"
              title={connected ? "Notifications (live)" : "Notifications (reconnecting…)"}
            >
              <Bell className="w-5 h-5" />
              {!connected && (
                <span className="absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#EDE3D8]" />
              )}
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
                notifications={displayNotifications}
                onMarkAllRead={markAllRead}
                onMarkRead={markRead}
                connected={connected}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </header>

        <main className={`flex-1 px-4 py-6 sm:p-6 md:p-8 ${maxWidth} w-full mx-auto space-y-6 sm:space-y-8`}>{children}</main>
      </div>

      {toast && (
        <div className="fixed z-[60] bottom-4 right-4 left-4 sm:left-auto sm:w-96">
          <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-2xl p-4 flex gap-3 items-start">
            <span className="w-2 h-2 shrink-0 rounded-full mt-1.5 bg-[#8B1E42]" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-stone-900">{toast.title}</div>
              <p className="text-xs text-stone-500 mt-0.5">{toast.detail}</p>
              <span className="text-[11px] font-medium text-stone-400 mt-1 inline-block">
                {renderNotificationTime(toast.time)}
              </span>
            </div>
            <button
              onClick={dismissToast}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-[#EBE3D8] transition shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          user={user}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={async () => {
            setShowLogoutConfirm(false);
            await onLogout?.();
          }}
        />
      )}
    </div>
  );
}

function SidebarContent({
  title,
  subtitle,
  brandIcon,
  navItems = [],
  activeTab,
  onNavClick,
  displayName,
  role,
  onLogout,
  onClose,
}) {
  const mainItems = navItems.filter((item) => !item.sectionEnd);
  const bottomItems = navItems.filter((item) => item.sectionEnd);

  const renderNavItems = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onNavClick(item.id)}
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
    <>
      <div className="p-6 space-y-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#8B1E42] text-white p-2.5 rounded-xl shadow-sm shrink-0">
            {brandIcon}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-lg text-stone-900 leading-tight truncate">{title}</h1>
            <span className="text-xs font-medium text-stone-500 truncate block">{subtitle}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-[#E2D6C7] transition shrink-0"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
    </>
  );
}

function NotificationsDropdown({
  notifications,
  onMarkAllRead,
  onMarkRead,
  connected,
  onClose,
}) {
  return (
    <div className="absolute right-0 top-12 w-72 sm:w-80 bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-2xl overflow-hidden z-50">
      <div className="px-4 py-3 border-b border-[#EBE3D8] flex items-center justify-between bg-[#FAF7F2]">
        <h3 className="text-sm font-bold text-stone-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {!connected && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600"
              title="Reconnecting to the realtime server"
            >
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
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
            const isRead = Boolean(n.is_read);
            return (
              <li
                key={n.id}
                onClick={() => !isRead && onMarkRead?.(n.id)}
                className={`px-4 py-3.5 flex gap-3 ${
                  isRead ? "" : "bg-[#8B1E42]/5 cursor-pointer hover:bg-[#8B1E42]/10"
                }`}
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
                    {renderNotificationTime(n.time)}
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
