import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const API_BASE = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);
  // Live doctor presence for the booking page: { [doctorUserId]: "available" | "in_consultation" }
  const [doctorStatuses, setDoctorStatuses] = useState({});

  const socketRef = useRef(null);
  const toastTimerRef = useRef(null);

  // Clear the previous session's data while rendering rather than in an effect,
  // so a different user signing in on the same tab never sees stale rows.
  const [renderedUserId, setRenderedUserId] = useState(userId);
  if (userId !== renderedUserId) {
    setRenderedUserId(userId);
    setNotifications([]);
    setConnected(false);
    setToast(null);
    setDoctorStatuses({});
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const showToast = useCallback((notification) => {
    setToast(notification);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Reconnect whenever the signed-in user changes so the room matches the token.
    const socket = io(API_BASE, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (error) => {
      setConnected(false);
      console.error("Notification socket error:", error?.message || error);
    });

    socket.on("notifications:snapshot", ({ notifications: list }) => {
      if (Array.isArray(list)) setNotifications(list);
    });

    socket.on("notification:new", ({ notification }) => {
      if (!notification) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      showToast(notification);
    });

    socket.on("notification:read", ({ notification }) => {
      if (!notification) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? notification : n))
      );
    });

    socket.on("notifications:read-all", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });

    socket.on("doctor:status:snapshot", ({ statuses }) => {
      if (statuses && typeof statuses === "object") {
        setDoctorStatuses((prev) => ({ ...prev, ...statuses }));
      }
    });

    socket.on("doctor:status", ({ doctorId, status }) => {
      if (doctorId === undefined || doctorId === null || !status) return;
      setDoctorStatuses((prev) => ({ ...prev, [String(doctorId)]: status }));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, showToast]);

  // Re-sync over HTTP whenever the socket drops so a missed push while offline
  // cannot leave the bell stale after the connection comes back.
  useEffect(() => {
    if (!userId || !connected) return;

    let cancelled = false;
    fetch(`${API_BASE}/notifications`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setNotifications(data);
      })
      .catch((err) => console.error("Failed to sync notifications", err));

    return () => {
      cancelled = true;
    };
  }, [userId, connected]);

  const request = useCallback((event, payload) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return Promise.resolve(null);

    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 8000);
      socket.emit(event, payload, (response) => {
        clearTimeout(timer);
        resolve(response ?? null);
      });
    });
  }, []);

  const markRead = useCallback(
    async (id) => {
      if (id === undefined || id === null) return;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      const response = await request("notifications:mark-read", { id });
      if (response?.ok) return;

      if (response === null && !socketRef.current?.connected) {
        try {
          await fetch(`${API_BASE}/notifications/${id}/read`, {
            method: "PATCH",
            credentials: "include",
          });
        } catch (err) {
          console.error("Failed to mark notification as read", err);
        }
      }
    },
    [request]
  );

  const markAllRead = useCallback(async () => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const response = await request("notifications:mark-all-read");
    if (response?.ok) return;

    // Only fall back to REST when the socket was unavailable, not when the
    // server answered with an actual error.
    if (response === null && !socketRef.current?.connected) {
      try {
        await fetch(`${API_BASE}/notifications/mark-all-read`, {
          method: "PATCH",
          credentials: "include",
        });
      } catch (err) {
        console.error("Failed to mark all as read", err);
        setNotifications(previous);
      }
    }
  }, [notifications, request]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      connected,
      toast,
      doctorStatuses,
      dismissToast: () => setToast(null),
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, connected, toast, doctorStatuses, markRead, markAllRead]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
