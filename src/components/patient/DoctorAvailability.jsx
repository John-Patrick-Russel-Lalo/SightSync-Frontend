import { useState, useEffect } from "react";
import {
  Stethoscope,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
  Clock,
  WifiOff,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

const API_URL =
  import.meta.env.VITE_PROD_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3500";

const PRESENCE_META = {
  in_consultation: {
    label: "In Consultation",
    chip: "bg-[#C08A3E]/10 text-[#C08A3E] border border-[#C08A3E]/25",
    dot: "bg-[#C08A3E] animate-pulse",
  },
  available: {
    label: "Available Now",
    chip: "bg-[#52795A]/10 text-[#52795A] border border-[#52795A]/25",
    dot: "bg-[#52795A]",
  },
  unknown: {
    label: "Checking status…",
    chip: "bg-[#DCCFBF]/40 text-[#8B7562] border border-[#DCCFBF]",
    dot: "bg-[#8B7562]",
  },
};

export default function DoctorAvailability({ onBook }) {
  const { doctorStatuses, connected } = useNotifications();

  const [doctorList, setDoctorList] = useState([]);
  const [httpStatuses, setHttpStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asOf, setAsOf] = useState(() => new Date());

  // The socket keeps statuses fresh; the HTTP snapshot is the fallback baseline
  // (socket wins where both have an entry).
  const statuses = { ...httpStatuses, ...doctorStatuses };
  const statusOf = (doc) => statuses[String(doc.user_id)];

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/doctors/available`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load doctor availability.");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setDoctorList(data.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    fetch(`${API_URL}/doctors/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.statuses) setHttpStatuses(data.statuses);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setAsOf(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const rank = { in_consultation: 0, available: 1 };
  const sortedDoctors = [...doctorList].sort((a, b) => {
    const ra = rank[statuses[String(a.user_id)]] ?? 2;
    const rb = rank[statuses[String(b.user_id)]] ?? 2;
    if (ra !== rb) return ra - rb;
    return String(a.display_name || a.username || "").localeCompare(
      String(b.display_name || b.username || "")
    );
  });

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/doctors/available`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
        fetch(`${API_URL}/doctors/status`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }),
      ]);

      if (!listRes.ok) throw new Error("Failed to refresh doctor availability.");

      const listData = await listRes.json();
      const statusData = await statusRes.json().catch(() => null);
      setDoctorList(listData.data || []);
      if (statusData?.statuses) setHttpStatuses(statusData.statuses);
      setAsOf(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const asOfLabel = asOf.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <section className="w-full bg-[#F8F3EC] border border-[#DCCFBF] rounded-3xl overflow-hidden shadow-sm">
      <div className="p-4 sm:p-6 lg:p-7 border-b border-[#DCCFBF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-[#3D2E28]">
            Doctor Availability
          </h2>
          <p className="text-sm text-[#8B7562] mt-0.5">
            See which doctors are free to take a walk-in right now.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
              connected
                ? "bg-[#52795A]/10 text-[#52795A] border-[#52795A]/25"
                : "bg-[#C08A3E]/10 text-[#C08A3E] border-[#C08A3E]/25"
            }`}
          >
            {connected ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                Reconnecting…
              </>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8B7562]">
            <Clock className="w-3.5 h-3.5" />
            As of {asOfLabel}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#EDE3D8] border border-[#DCCFBF] text-sm font-semibold text-[#3D2E28] hover:bg-[#DCCFBF]/60 transition disabled:opacity-60"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-7">
        {!connected && (
          <div className="flex items-start gap-2 text-xs text-[#8B7562] bg-[#EDE3D8]/60 border border-[#DCCFBF] rounded-2xl px-4 py-3 mb-5">
            <WifiOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              The live feed is reconnecting, so statuses may be slightly
              outdated. Use Refresh to pull the latest state.
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm rounded-2xl px-4 py-3 mb-5 bg-[#8B1E42]/10 text-[#8B1E42] border border-[#8B1E42]/25">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {loading && doctorList.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-14 text-[#8B7562] text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin" />
            Checking which doctors are in…
          </div>
        ) : sortedDoctors.length === 0 ? (
          <div className="py-14 text-center">
            <div className="bg-[#8B1E42]/10 text-[#8B1E42] w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-[#3D2E28] mb-1">
              No doctors on duty right now
            </h3>
            <p className="text-sm text-[#8B7562]">
              There are no doctors currently accepting appointments. Please
              check back later.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4 text-[11px] font-medium text-[#8B7562]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C08A3E] animate-pulse" />
                With a patient
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#52795A]" />
                Free for walk-in
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedDoctors.map((doc) => {
                const meta = PRESENCE_META[statusOf(doc)] || PRESENCE_META.unknown;
                return (
                  <div
                    key={doc.user_id}
                    className="flex items-center gap-3 rounded-2xl border border-[#DCCFBF] bg-[#EDE3D8]/60 p-4"
                  >
                    <span className="w-11 h-11 rounded-full bg-[#8B1E42] text-white flex items-center justify-center font-bold text-base shrink-0">
                      {(doc.display_name || doc.username || "D")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-sm text-[#3D2E28] truncate">
                        {doc.display_name || doc.username}
                      </span>
                      <span className="block text-xs text-[#8B7562] truncate">
                        {doc.specialty || "General"}
                        {doc.consultation_fee
                          ? ` — ₱${parseFloat(doc.consultation_fee).toFixed(2)}`
                          : ""}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mt-2 ${meta.chip}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-[#8B7562] mt-5">
              Availability reflects whether the doctor is currently with a
              patient. {onBook ? (
                <button
                  type="button"
                  onClick={onBook}
                  className="font-semibold text-[#8B1E42] hover:text-[#731836] transition"
                >
                  Prefer an appointment? Book one instead.
                </button>
              ) : null}
            </p>
          </>
        )}
      </div>
    </section>
  );
}