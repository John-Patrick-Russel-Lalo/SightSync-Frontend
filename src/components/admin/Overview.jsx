import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  Stethoscope,
  Package,
  ShoppingCart,
  Calendar,
  Archive,
  AlertTriangle,
  Banknote,
  Boxes,
  UserCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  parseWallClock,
  toLocalDateStringFromValue,
  wallClockTimeMs,
} from "../../utils/dateTime";

const API_URL = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

const RANGE_OPTIONS = [
  { id: 7, label: "Last 7 Days" },
  { id: 30, label: "Last 30 Days" },
  { id: 90, label: "Last 90 Days" },
];

const formatCurrency = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (n) => Number(n || 0).toLocaleString();

const toLocalISO = toLocalDateStringFromValue;

const fetchJson = async (url) => {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || body.message || `Request failed (${res.status})`);
  }
  return body;
};

const toList = (body, key) => {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body[key])) return body[key];
  return [];
};

const toCountMap = (rows, keyFn) =>
  rows.reduce((acc, row) => {
    const key = keyFn(row);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const getAppointmentStatus = (appointment) =>
  (appointment?.status || "scheduled").toLowerCase();

const getPatientStatus = (patient) => {
  if (
    patient?.has_profile === false ||
    patient?.profile_completed === false ||
    patient?.hasProfile === false
  ) {
    return "pending";
  }
  return (patient?.status || "active").toLowerCase();
};

const REPORT_ERROR_LABELS = {
  patients: "Patient Management",
  doctors: "Doctor Management",
  inventory: "Inventory Management",
  pos: "Point of Sale",
  schedules: "Schedule Management",
  archive: "Appointment Archive",
};

export default function Overview({ onNavigate }) {
  const [rangeDays, setRangeDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [errors, setErrors] = useState({});

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [posSummary, setPosSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [archives, setArchives] = useState([]);

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (rangeDays - 1));
    return { startDate: toLocalISO(start), endDate: toLocalISO(end) };
  }, [rangeDays]);

  const loadOverview = useCallback(async () => {
    setLoading(true);

    const tasks = [
      {
        key: "patients",
        run: async () => setUsers(toList(await fetchJson(`${API_URL}/users`))),
      },
      {
        key: "doctors",
        run: async () =>
          setDoctors(toList(await fetchJson(`${API_URL}/doctors?limit=100&offset=0`))),
      },
      {
        key: "inventory",
        run: async () =>
          setInventory(toList(await fetchJson(`${API_URL}/inventory?limit=200`))),
      },
      {
        key: "pos",
        run: async () => {
          const [salesBody, summaryBody] = await Promise.all([
            fetchJson(`${API_URL}/pos/sales?limit=200`),
            fetchJson(
              `${API_URL}/pos/sales/summary?startDate=${startDate}&endDate=${endDate}`
            ),
          ]);
          setSales(toList(salesBody));
          setPosSummary(summaryBody.data || null);
        },
      },
      {
        key: "schedules",
        run: async () =>
          setAppointments(toList(await fetchJson(`${API_URL}/appointments`), "appointments")),
      },
      {
        key: "archive",
        run: async () =>
          setArchives(toList(await fetchJson(`${API_URL}/appointments/archive`), "archives")),
      },
    ];

    const results = await Promise.allSettled(tasks.map((task) => task.run()));
    const nextErrors = {};
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        nextErrors[tasks[index].key] = result.reason?.message || "Failed to load data";
      }
    });

    setErrors(nextErrors);
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => loadOverview(), 0);
    return () => clearTimeout(timer);
  }, [loadOverview, reloadKey]);

  const rangeBounds = useMemo(() => {
    const start = parseWallClock(`${startDate}T00:00:00`);
    const end = parseWallClock(`${endDate}T23:59:59.999`);
    return { start: start?.getTime(), end: end?.getTime() };
  }, [startDate, endDate]);

  const isInRange = useCallback(
    (value) => {
      if (!value) return false;
      const time = wallClockTimeMs(value);
      if (Number.isNaN(time)) return false;
      return time >= rangeBounds.start && time <= rangeBounds.end;
    },
    [rangeBounds]
  );

  /* ---------------------------- Patient report ---------------------------- */
  const patientReport = useMemo(() => {
    const patients = users.filter((u) => u.role === "patient");
    const statusMap = toCountMap(patients, getPatientStatus);
    const newPatients = patients.filter((p) => isInRange(p.created_at));

    return {
      total: patients.length,
      newInRange: newPatients.length,
      pending: statusMap.pending || 0,
      segments: [
        { label: "Active", value: statusMap.active || 0, className: "bg-emerald-500" },
        { label: "Pending", value: statusMap.pending || 0, className: "bg-amber-500" },
        { label: "Inactive", value: statusMap.inactive || 0, className: "bg-stone-400" },
        { label: "Suspended", value: statusMap.suspended || 0, className: "bg-rose-500" },
      ],
      top: newPatients
        .slice()
        .sort((a, b) => wallClockTimeMs(b.created_at) - wallClockTimeMs(a.created_at))
        .slice(0, 3)
        .map((p) => ({
          id: p.id,
          name: p.display_name || p.username || `Patient #${p.id}`,
          meta: p.email || `@${p.username || p.id}`,
        })),
    };
  }, [users, isInRange]);

  /* ---------------------------- Doctor report ----------------------------- */
  const doctorReport = useMemo(() => {
    const accounts = users.filter((u) => u.role === "doctor");
    const withProfile = new Set(doctors.map((d) => String(d.user_id)));
    const fees = doctors
      .map((d) => Number(d.consultation_fee))
      .filter((f) => !Number.isNaN(f) && f > 0);
    const specialtyMap = toCountMap(
      doctors,
      (d) => d.specialty || "Unspecified"
    );

    return {
      total: accounts.length,
      profiled: withProfile.size,
      unprofiled: Math.max(0, accounts.length - withProfile.size),
      avgFee: fees.length ? fees.reduce((a, b) => a + b, 0) / fees.length : 0,
      segments: Object.entries(specialtyMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([label, value], idx) => ({
          label,
          value,
          className: [
            "bg-[#8B1E42]",
            "bg-cyan-600",
            "bg-amber-600",
            "bg-stone-500",
          ][idx],
        })),
      top: doctors.slice(0, 3).map((d) => ({
        id: d.user_id || d.profile_id,
        name: d.display_name || d.username || `Doctor #${d.user_id}`,
        meta: d.specialty || "General",
      })),
    };
  }, [users, doctors]);

  /* --------------------------- Inventory report --------------------------- */
  const inventoryReport = useMemo(() => {
    const lowStock = inventory.filter(
      (i) => Number(i.quantity) > 0 && Number(i.quantity) <= Number(i.reorder_level)
    );
    const outOfStock = inventory.filter((i) => Number(i.quantity) <= 0);
    const stockValue = inventory.reduce(
      (sum, i) => sum + Number(i.quantity || 0) * Number(i.unit_cost || 0),
      0
    );
    const retailValue = inventory.reduce(
      (sum, i) => sum + Number(i.quantity || 0) * Number(i.selling_price || 0),
      0
    );

    return {
      total: inventory.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      stockValue,
      retailValue,
      potentialMargin: retailValue - stockValue,
      top: [...lowStock]
        .sort((a, b) => Number(a.quantity) - Number(b.quantity))
        .slice(0, 3)
        .map((i) => ({
          id: i.id,
          name: getProductName(i),
          meta: `${formatNumber(i.quantity)} left · reorder at ${formatNumber(i.reorder_level)}`,
        })),
    };
  }, [inventory]);

  /* ------------------------------ POS report ------------------------------ */
  const posReport = useMemo(() => {
    const rangeSales = sales.filter((s) => isInRange(s.created_at));
    const completed = rangeSales.filter(
      (s) => (s.status || "completed").toLowerCase() === "completed"
    );
    const voided = rangeSales.filter((s) =>
      ["voided", "refunded", "cancelled"].includes((s.status || "").toLowerCase())
    );
    const summary = posSummary || {};
    const revenue = Number(summary.total_revenue ?? 0) || computedRevenue(completed);
    const transactions =
      Number(summary.transaction_count || 0) || completed.length;
    const itemsSold = Number(summary.items_sold || 0);
    const taxes = Number(summary.total_taxes || 0);
    const discounts = Number(summary.total_discounts || 0);
    const methodMap = toCountMap(completed, (s) => (s.payment_method || "cash").toLowerCase());

    return {
      transactions,
      revenue,
      itemsSold,
      taxes,
      discounts,
      average: transactions ? revenue / transactions : 0,
      voided: voided.length,
      segments: [
        { label: "Cash", value: methodMap.cash || 0, className: "bg-emerald-500" },
        { label: "Card", value: methodMap.card || 0, className: "bg-cyan-600" },
        { label: "QR", value: methodMap.qr || 0, className: "bg-violet-500" },
      ],
      top: completed
        .slice()
        .sort((a, b) => wallClockTimeMs(b.created_at) - wallClockTimeMs(a.created_at))
        .slice(0, 3)
        .map((s) => ({
          id: s.id,
          name: s.receipt_number,
          meta: `${s.customer_name || "Walk-in Customer"} · ${formatCurrency(s.total)}`,
        })),
    };
  }, [sales, posSummary, isInRange]);

  /* -------------------------- Schedule report ----------------------------- */
  const scheduleReport = useMemo(() => {
    // Terminal appointments (completed, cancelled, declined, no-show) are moved
    // to the archive, so merge both sources for a complete schedule picture.
    const appointmentHistory = [...appointments, ...archives];
    const rangeAppointments = appointmentHistory.filter((a) =>
      isInRange(a.start_time || a.date)
    );
    const statusMap = toCountMap(rangeAppointments, getAppointmentStatus);
    const todayISO = toLocalISO(new Date());
    const now = new Date().getTime();
    const today = appointmentHistory.filter(
      (a) => toLocalISO(a.start_time || a.date) === todayISO
    );
    const upcoming = appointmentHistory.filter((a) => {
      const time = wallClockTimeMs(a.start_time || a.date);
      return (
        !Number.isNaN(time) &&
        time >= now &&
        ["scheduled", "pending"].includes(getAppointmentStatus(a))
      );
    });
    const doctorMap = toCountMap(rangeAppointments, (a) => `Doctor #${a.doctor_id}`);

    return {
      total: rangeAppointments.length,
      today: today.length,
      upcoming: upcoming.length,
      segments: [
        { label: "Scheduled", value: statusMap.scheduled || 0, className: "bg-blue-500" },
        { label: "Pending", value: statusMap.pending || 0, className: "bg-amber-500" },
        { label: "Completed", value: statusMap.completed || 0, className: "bg-emerald-500" },
        {
          label: "Declined",
          value: (statusMap.declined || 0) + (statusMap.cancelled || 0),
          className: "bg-rose-500",
        },
      ],
      top: Object.entries(doctorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label, value]) => ({ id: label, name: label, meta: `${value} appointment${value === 1 ? "" : "s"}` })),
    };
  }, [appointments, archives, isInRange]);

  /* --------------------------- Archive report ----------------------------- */
  const archiveReport = useMemo(() => {
    const rangeArchives = archives.filter((a) => isInRange(a.archived_at || a.start_time));
    const statusMap = toCountMap(rangeArchives, (a) =>
      (a.status || "archived").toLowerCase()
    );

    return {
      total: rangeArchives.length,
      lifetime: archives.length,
      segments: [
        { label: "No-Show", value: statusMap.no_show || statusMap["no-show"] || 0, className: "bg-amber-500" },
        { label: "Declined", value: statusMap.declined || 0, className: "bg-[#8B1E42]" },
        { label: "Cancelled", value: statusMap.cancelled || statusMap.canceled || 0, className: "bg-rose-500" },
        { label: "Completed", value: statusMap.completed || 0, className: "bg-emerald-500" },
      ],
      top: rangeArchives
        .slice()
        .sort((a, b) => wallClockTimeMs(b.archived_at) - wallClockTimeMs(a.archived_at))
        .slice(0, 3)
        .map((a) => ({
          id: a.id,
          name: `Record #${a.id}`,
          meta: `${(a.status || "archived").replace(/_/g, " ")} · ${
            a.notes ? `"${a.notes}"` : "No notes"
          }`,
        })),
    };
  }, [archives, isInRange]);

  const headlineStats = [
    {
      title: "Patients",
      value: formatNumber(patientReport.total),
      icon: <Users className="w-5 h-5 text-[#8B1E42]" />,
      accent: `+${patientReport.newInRange} new in range`,
    },
    {
      title: "Doctors",
      value: formatNumber(doctorReport.total),
      icon: <Stethoscope className="w-5 h-5 text-cyan-700" />,
      accent: `${doctorReport.unprofiled} awaiting profile`,
    },
    {
      title: "Appointments",
      value: formatNumber(scheduleReport.total),
      icon: <Calendar className="w-5 h-5 text-blue-700" />,
      accent: `${scheduleReport.today} today · ${scheduleReport.upcoming} upcoming`,
    },
    {
      title: "Revenue",
      value: formatCurrency(posReport.revenue),
      icon: <Banknote className="w-5 h-5 text-emerald-700" />,
      accent: `${formatNumber(posReport.transactions)} transaction${posReport.transactions === 1 ? "" : "s"}`,
    },
    {
      title: "Inventory SKUs",
      value: formatNumber(inventoryReport.total),
      icon: <Package className="w-5 h-5 text-amber-700" />,
      accent: `Stock value ${formatCurrency(inventoryReport.stockValue)}`,
    },
    {
      title: "Low Stock",
      value: formatNumber(inventoryReport.lowStock + inventoryReport.outOfStock),
      icon: <AlertTriangle className="w-5 h-5 text-rose-700" />,
      accent: `${inventoryReport.outOfStock} out of stock`,
    },
  ];

  const sectionErrors = {
    patients: errors.patients,
    doctors: errors.doctors,
    inventory: errors.inventory,
    pos: errors.pos,
    schedules: errors.schedules,
    archive: errors.archive,
  };

  const hasAnyData =
    users.length ||
    doctors.length ||
    inventory.length ||
    sales.length ||
    appointments.length ||
    archives.length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B1E42]/10 text-[#8B1E42] rounded-xl border border-[#8B1E42]/15">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">System Overview</h2>
            <p className="text-sm text-stone-600">
              Consolidated reports across patients, doctors, inventory, sales, scheduling, and archives.
            </p>
          </div>
        </div>
        <button
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto bg-[#8B1E42] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#731836] transition shadow-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Date range filter */}
      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <Clock className="w-4 h-4" /> Reporting Window
        </span>
        <div className="bg-[#F2EAE1] p-1 rounded-xl border border-[#DCD0C0] flex items-center gap-1 overflow-x-auto">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setRangeDays(option.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                rangeDays === option.id
                  ? "bg-[#8B1E42] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-500 sm:ml-auto">
          {startDate} &rarr; {endDate}
        </p>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {headlineStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportCard
          title="Patient Management"
          subtitle={`${patientReport.total} registered patient${patientReport.total === 1 ? "" : "s"}`}
          icon={<UserCheck className="w-5 h-5 text-emerald-700" />}
          tabId="patients"
          onNavigate={onNavigate}
          loading={loading}
          error={sectionErrors.patients}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Metric label="New in range" value={formatNumber(patientReport.newInRange)} />
            <Metric label="Pending profile" value={formatNumber(patientReport.pending)} />
          </div>
          <DistributionBar segments={patientReport.segments} />
          <HighlightList items={patientReport.top} emptyLabel="No new sign-ups in this window." />
        </ReportCard>

        <ReportCard
          title="Doctor Management"
          subtitle={`${doctorReport.profiled} profile${doctorReport.profiled === 1 ? "" : "s"} on file`}
          icon={<Stethoscope className="w-5 h-5 text-cyan-700" />}
          tabId="doctors"
          onNavigate={onNavigate}
          loading={loading}
          error={sectionErrors.doctors}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Metric label="Unprofiled" value={formatNumber(doctorReport.unprofiled)} />
            <Metric label="Avg. fee" value={formatCurrency(doctorReport.avgFee)} />
          </div>
          <DistributionBar segments={doctorReport.segments} emptyLabel="No specialties recorded yet." />
          <HighlightList items={doctorReport.top} emptyLabel="No doctor profiles yet." />
        </ReportCard>

        <ReportCard
          title="Inventory Management"
          subtitle={`${inventoryReport.total} stock record${inventoryReport.total === 1 ? "" : "s"}`}
          icon={<Boxes className="w-5 h-5 text-amber-700" />}
          tabId="inventory"
          onNavigate={onNavigate}
          loading={loading}
          error={sectionErrors.inventory}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Metric label="Stock value" value={formatCurrency(inventoryReport.stockValue)} />
            <Metric label="Retail value" value={formatCurrency(inventoryReport.retailValue)} />
            <Metric label="Potential margin" value={formatCurrency(inventoryReport.potentialMargin)} />
            <Metric label="Out of stock" value={formatNumber(inventoryReport.outOfStock)} />
          </div>
          <HighlightList items={inventoryReport.top} emptyLabel="No items below reorder level." />
        </ReportCard>

        <ReportCard
          title="Point of Sale"
          subtitle={`${formatNumber(posReport.transactions)} transaction${posReport.transactions === 1 ? "" : "s"} in window`}
          icon={<ShoppingCart className="w-5 h-5 text-[#8B1E42]" />}
          tabId="pos"
          onNavigate={onNavigate}
          loading={loading}
          error={sectionErrors.pos}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Metric label="Revenue" value={formatCurrency(posReport.revenue)} />
            <Metric label="Avg. ticket" value={formatCurrency(posReport.average)} />
            <Metric label="Items sold" value={formatNumber(posReport.itemsSold)} />
            <Metric label="Tax collected" value={formatCurrency(posReport.taxes)} />
          </div>
          <DistributionBar segments={posReport.segments} emptyLabel="No sales in this window." />
          <HighlightList items={posReport.top} emptyLabel="No completed sales in this window." />
        </ReportCard>

        <ReportCard
          title="Schedule Management"
          subtitle={`${scheduleReport.total} appointment${scheduleReport.total === 1 ? "" : "s"} in window`}
          icon={<Calendar className="w-5 h-5 text-blue-700" />}
          tabId="schedules"
          onNavigate={onNavigate}
          loading={loading}
          error={sectionErrors.schedules}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Metric label="Today" value={formatNumber(scheduleReport.today)} />
            <Metric label="Upcoming" value={formatNumber(scheduleReport.upcoming)} />
          </div>
          <DistributionBar segments={scheduleReport.segments} emptyLabel="No bookings in this window." />
          <HighlightList items={scheduleReport.top} emptyLabel="No appointment activity yet." />
        </ReportCard>

        <ReportCard
          title="Appointment Archive"
          subtitle={`${formatNumber(archiveReport.total)} archived in window`}
          icon={<Archive className="w-5 h-5 text-stone-600" />}
          tabId="archive"
          onNavigate={onNavigate}
          loading={loading}
          error={sectionErrors.archive}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Metric label="All-time archive" value={formatNumber(archiveReport.lifetime)} />
            <Metric label="In window" value={formatNumber(archiveReport.total)} />
          </div>
          <DistributionBar segments={archiveReport.segments} emptyLabel="Nothing archived in this window." />
          <HighlightList items={archiveReport.top} emptyLabel="No archived appointments in this window." />
        </ReportCard>
      </div>

      {/* Global states */}
      {loading && !hasAnyData && (
        <div className="p-6 sm:p-10 flex items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
          <span className="text-sm font-medium">Compiling overview reports...</span>
        </div>
      )}

      {!loading && !hasAnyData && Object.keys(errors).length > 0 && (
        <div className="p-6 sm:p-10 text-center bg-rose-50/50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
          <p className="mt-2 font-semibold text-rose-800">Failed to load overview data</p>
          <ul className="text-xs text-stone-600 mt-2 space-y-1">
            {Object.keys(errors).map((key) => (
              <li key={key}>
                <strong className="text-stone-800">{REPORT_ERROR_LABELS[key] || key}:</strong>{" "}
                {errors[key]}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ helpers --------------------------------- */

function getProductName(item) {
  if (item.frame) return `${item.frame.brand} ${item.frame.model_number}`.trim();
  if (item.lens) return `${item.lens.brand} ${item.lens.lens_type}`.trim();
  return item.sku || "Unnamed item";
}

function computedRevenue(sales) {
  return sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
}

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="bg-[#F8F3EC] border border-[#DCD0C0] p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        <div className="p-2.5 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC] shrink-0">{icon}</div>
      </div>
      <div className="text-2xl font-extrabold text-stone-900 break-words">{value}</div>
      <div className="text-xs text-stone-500 font-medium">{accent}</div>
    </div>
  );
}

function ReportCard({ title, subtitle, icon, tabId, onNavigate, loading, error, children }) {
  return (
    <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 border-b border-[#EBE3D8] flex items-center justify-between gap-3 bg-[#FAF7F2]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-[#F2EAE1] text-[#8B1E42] rounded-xl border border-[#E3D8CC] shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-stone-900 truncate">{title}</h3>
            <p className="text-xs text-stone-500 mt-0.5 truncate">{subtitle}</p>
          </div>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate(tabId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition shrink-0"
          >
            Open
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {error ? (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="py-6 flex items-center justify-center gap-2 text-stone-500 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-[#8B1E42]" />
            Loading report...
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-wider truncate">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-stone-900 break-words">{value}</div>
    </div>
  );
}

function DistributionBar({ segments, emptyLabel = "Nothing to distribute yet." }) {
  const usable = segments.filter((s) => s.value > 0);
  const total = usable.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <p className="text-xs text-stone-500 bg-[#FAF7F2] border border-[#EBE3D8] rounded-xl px-4 py-3 text-center">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1 h-2.5 rounded-full overflow-hidden bg-[#E3D8CC]">
        {usable.map((segment) => (
          <div
            key={segment.label}
            className={`h-full ${segment.className}`}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {usable.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-xs text-stone-600">
            <span className={`w-2 h-2 rounded-full ${segment.className}`} />
            <span className="font-medium text-stone-800">{formatNumber(segment.value)}</span>
            <span>{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightList({ items, emptyLabel }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-xs text-stone-400 italic">{emptyLabel}</p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 bg-[#FAF7F2] border border-[#EBE3D8] rounded-xl px-4 py-2.5"
        >
          <div className="min-w-0">
            <div className="text-xs font-bold text-stone-900 truncate">{item.name}</div>
            <div className="text-[11px] text-stone-500 truncate">{item.meta}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
