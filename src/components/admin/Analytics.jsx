import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChartLine,
  ChartColumn,
  Compass,
  Target,
  Zap,
  Info,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertTriangle,
  AlertCircle,
  CircleCheck,
  Stethoscope,
  Calendar,
  ShoppingCart,
  Boxes,
  UserCheck,
  Clock,
  Banknote,
} from "lucide-react";
import { toLocalDateString, wallClockTimeMs } from "../../utils/dateTime";

const API_URL = import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

const MODES = [
  {
    id: "descriptive",
    label: "Descriptive",
    icon: ChartLine,
    blurb: "What happened across the clinic during the selected period.",
  },
  {
    id: "prescriptive",
    label: "Prescriptive",
    icon: Compass,
    blurb: "Recommended actions to fix risks and capture opportunities.",
  },
];

const RANGE_OPTIONS = [
  { id: 7, label: "Last 7 Days" },
  { id: 30, label: "Last 30 Days" },
  { id: 90, label: "Last 90 Days" },
];

const SEVERITY = {
  critical: {
    label: "Critical",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    accent: "border-l-rose-500",
    icon: AlertTriangle,
    iconClass: "text-rose-700",
  },
  warning: {
    label: "Warning",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    accent: "border-l-amber-500",
    icon: AlertCircle,
    iconClass: "text-amber-700",
  },
  opportunity: {
    label: "Opportunity",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    accent: "border-l-blue-500",
    icon: Target,
    iconClass: "text-blue-700",
  },
  positive: {
    label: "Performing Well",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accent: "border-l-emerald-500",
    icon: CircleCheck,
    iconClass: "text-emerald-700",
  },
};

const SEVERITY_ORDER = ["critical", "warning", "opportunity", "positive"];

const formatCurrency = (n) =>
  `₱${Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatNumber = (n) => Number(n || 0).toLocaleString();

const formatPercent = (n) => `${(Number(n) || 0).toFixed(1)}%`;

const toLocalISO = toLocalDateString;

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

const toTime = (value) => {
  if (!value) return null;
  const time = wallClockTimeMs(value);
  return Number.isNaN(time) ? null : time;
};

const getSaleStatus = (sale) => (sale?.status || "completed").toLowerCase();

const isVoidedSale = (sale) =>
  ["voided", "refunded", "cancelled"].includes(getSaleStatus(sale));

const getAppointmentStatus = (appt) => (appt?.status || "scheduled").toLowerCase();

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

const getProductName = (item) => {
  if (item?.frame) return `${item.frame.brand} ${item.frame.model_number}`.trim();
  if (item?.lens) return `${item.lens.brand} ${item.lens.lens_type}`.trim();
  return item?.sku || "Unnamed item";
};

const countBy = (rows, keyFn) =>
  rows.reduce((acc, row) => {
    const key = keyFn(row);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const sumOf = (rows, valueFn) =>
  rows.reduce((sum, row) => sum + Number(valueFn(row) || 0), 0);

const pctChange = (current, previous) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};

const ratio = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);

export default function Analytics({ onNavigate }) {
  const [mode, setMode] = useState("descriptive");
  const [rangeDays, setRangeDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [reviewed, setReviewed] = useState([]);

  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [archives, setArchives] = useState([]);

  const bounds = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (rangeDays - 1));
    const prevEnd = new Date(startDate);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - (rangeDays - 1));

    return {
      startISO: toLocalISO(startDate),
      endISO: toLocalISO(endDate),
      start: startDate.getTime(),
      end: endDate.getTime() + 86400000 - 1,
      prevStart: prevStart.getTime(),
      prevEnd: prevEnd.getTime(),
    };
  }, [rangeDays]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);

    const tasks = [
      {
        key: "users",
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
        key: "sales",
        run: async () => setSales(toList(await fetchJson(`${API_URL}/pos/sales?limit=200`))),
      },
      {
        key: "appointments",
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadAnalytics(), 0);
    return () => clearTimeout(timer);
  }, [loadAnalytics, reloadKey]);

  const inWindow = useCallback(
    (time, from = bounds.start, to = bounds.end) => {
      const stamp = toTime(time);
      return stamp !== null && stamp >= from && stamp <= to;
    },
    [bounds]
  );

  /* --------------------- Derived datasets (windowed) --------------------- */

  const salesInWindow = useMemo(
    () => sales.filter((s) => inWindow(s.created_at)),
    [sales, inWindow]
  );
  const salesPrev = useMemo(
    () => sales.filter((s) => inWindow(s.created_at, bounds.prevStart, bounds.prevEnd)),
    [sales, inWindow, bounds]
  );

  const completedSales = useMemo(
    () => salesInWindow.filter((s) => !isVoidedSale(s)),
    [salesInWindow]
  );
  const completedPrevSales = useMemo(
    () => salesPrev.filter((s) => !isVoidedSale(s)),
    [salesPrev]
  );

  // Terminal appointments (completed, cancelled, declined, no-show) live in
  // appointment_archive, so count both sources to keep status totals complete.
  const appointmentHistory = useMemo(
    () => [...appointments, ...archives],
    [appointments, archives]
  );

  const appointmentsInWindow = useMemo(
    () => appointmentHistory.filter((a) => inWindow(a.start_time || a.date)),
    [appointmentHistory, inWindow]
  );
  const appointmentsPrev = useMemo(
    () => appointmentHistory.filter((a) => inWindow(a.start_time || a.date, bounds.prevStart, bounds.prevEnd)),
    [appointmentHistory, inWindow, bounds]
  );

  const archivesInWindow = useMemo(
    () => archives.filter((a) => inWindow(a.archived_at || a.start_time)),
    [archives, inWindow]
  );

  const patients = useMemo(
    () => users.filter((u) => u.role === "patient"),
    [users]
  );
  const doctorAccounts = useMemo(
    () => users.filter((u) => u.role === "doctor"),
    [users]
  );

  const newPatients = useMemo(
    () => patients.filter((p) => inWindow(p.created_at)),
    [patients, inWindow]
  );
  const newPatientsPrev = useMemo(
    () => patients.filter((p) => inWindow(p.created_at, bounds.prevStart, bounds.prevEnd)),
    [patients, inWindow, bounds]
  );

  /* ------------------------- Comparison availability --------------------- */

  const comparisonReady = useMemo(() => {
    const stamps = [
      ...sales.map((s) => toTime(s.created_at)),
      ...appointments.map((a) => toTime(a.start_time || a.date)),
    ].filter((t) => t !== null);
    if (stamps.length === 0) return false;
    return Math.min(...stamps) <= bounds.prevStart;
  }, [sales, appointments, bounds]);

  /* ------------------------------- Sales stats ---------------------------- */

  const salesStats = useMemo(() => {
    const revenue = sumOf(completedSales, (s) => s.total);
    const prevRevenue = sumOf(completedPrevSales, (s) => s.total);
    const transactions = completedSales.length;
    const prevTransactions = completedPrevSales.length;
    const voided = salesInWindow.filter(isVoidedSale).length;
    const methodCounts = countBy(completedSales, (s) => (s.payment_method || "cash").toLowerCase());
    const discounts = sumOf(completedSales, (s) => s.discount_amount);
    const taxes = sumOf(completedSales, (s) => s.tax_amount);

    return {
      revenue,
      revenueDelta: pctChange(revenue, prevRevenue),
      transactions,
      transactionsDelta: pctChange(transactions, prevTransactions),
      average: transactions ? revenue / transactions : 0,
      averageDelta: pctChange(
        transactions ? revenue / transactions : 0,
        prevTransactions ? prevRevenue / prevTransactions : 0
      ),
      voided,
      voidRate: ratio(voided, salesInWindow.length),
      discounts,
      taxes,
      methodCounts,
    };
  }, [completedSales, completedPrevSales, salesInWindow]);

  /* ---------------------------- Sold line items --------------------------- */

  const soldLines = useMemo(() => {
    const map = new Map();
    completedSales.forEach((sale) => {
      (Array.isArray(sale.items) ? sale.items : []).forEach((line) => {
        const key = line.sku || line.product_name || String(line.inventory_id ?? "");
        if (!key) return;
        const entry = map.get(key) || {
          key,
          name: line.product_name || line.sku || "Unnamed product",
          quantity: 0,
          revenue: 0,
        };
        entry.quantity += Number(line.quantity || 0);
        entry.revenue += Number(
          line.line_total ?? Number(line.unit_price || 0) * Number(line.quantity || 0)
        );
        map.set(key, entry);
      });
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [completedSales]);

  const soldInventoryIds = useMemo(() => {
    const ids = new Set();
    completedSales.forEach((sale) => {
      (Array.isArray(sale.items) ? sale.items : []).forEach((line) => {
        if (line.inventory_id !== undefined && line.inventory_id !== null) {
          ids.add(String(line.inventory_id));
        }
      });
    });
    return ids;
  }, [completedSales]);

  /* --------------------------- Appointment stats ------------------------- */

  const appointmentStats = useMemo(() => {
    const statusCounts = countBy(appointmentsInWindow, getAppointmentStatus);
    const prevCounts = countBy(appointmentsPrev, getAppointmentStatus);
    const completed = statusCounts.completed || 0;
    const lost =
      (statusCounts.cancelled || 0) +
      (statusCounts.canceled || 0) +
      (statusCounts.declined || 0) +
      (statusCounts.no_show || 0) +
      (statusCounts["no-show"] || 0);
    const noShow = (statusCounts.no_show || 0) + (statusCounts["no-show"] || 0);
    const completionRate = ratio(completed, appointmentsInWindow.length);
    const prevCompletionRate = ratio(prevCounts.completed || 0, appointmentsPrev.length);

    return {
      total: appointmentsInWindow.length,
      totalDelta: pctChange(appointmentsInWindow.length, appointmentsPrev.length),
      statusCounts,
      completed,
      lost,
      noShow,
      noShowRate: ratio(noShow, appointmentsInWindow.length),
      pending: statusCounts.pending || 0,
      scheduled: statusCounts.scheduled || 0,
      completionRate,
      completionDelta: completionRate - prevCompletionRate,
    };
  }, [appointmentsInWindow, appointmentsPrev]);

  /* ----------------------------- Doctor stats ---------------------------- */

  const doctorPerformance = useMemo(() => {
    const rows = doctorAccounts.map((account) => {
      const booked = appointmentsInWindow.filter((a) => String(a.doctor_id) === String(account.id));
      const completedCount = booked.filter((a) => getAppointmentStatus(a) === "completed").length;
      const lostCount = booked.filter((a) =>
        ["cancelled", "canceled", "declined", "no_show", "no-show"].includes(getAppointmentStatus(a))
      ).length;
      const profile = doctors.find((d) => String(d.user_id) === String(account.id));

      return {
        id: account.id,
        name: account.display_name || account.username || `Doctor #${account.id}`,
        hasProfile: Boolean(profile),
        specialty: profile?.specialty || null,
        booked: booked.length,
        completed: completedCount,
        lost: lostCount,
        completionRate: ratio(completedCount, booked.length),
      };
    });

    return {
      rows: rows.sort((a, b) => b.booked - a.booked),
      unprofiled: rows.filter((r) => !r.hasProfile).length,
      idle: rows.filter((r) => r.booked === 0),
      topShare: (() => {
        const total = rows.reduce((sum, r) => sum + r.booked, 0);
        const max = rows.reduce((best, r) => Math.max(best, r.booked), 0);
        return total ? (max / total) * 100 : 0;
      })(),
    };
  }, [doctorAccounts, doctors, appointmentsInWindow]);

  /* ---------------------------- Inventory stats --------------------------- */

  const inventoryStats = useMemo(() => {
    const outOfStock = inventory.filter((i) => Number(i.quantity) <= 0);
    const lowStock = inventory.filter(
      (i) => Number(i.quantity) > 0 && Number(i.quantity) <= Number(i.reorder_level)
    );
    const overstock = inventory.filter(
      (i) =>
        Number(i.reorder_level) > 0 &&
        Number(i.quantity) > Number(i.reorder_level) * 5 &&
        !soldInventoryIds.has(String(i.id))
    );
    const stockValue = sumOf(inventory, (i) => Number(i.quantity || 0) * Number(i.unit_cost || 0));
    const retailValue = sumOf(
      inventory,
      (i) => Number(i.quantity || 0) * Number(i.selling_price || 0)
    );
    const deadCapital = sumOf(
      overstock,
      (i) => Number(i.quantity || 0) * Number(i.unit_cost || 0)
    );
    const sellThrough = inventory.length
      ? ratio(
          inventory.filter((i) => soldInventoryIds.has(String(i.id))).length,
          inventory.length
        )
      : 0;

    return {
      total: inventory.length,
      outOfStock,
      lowStock,
      overstock,
      stockValue,
      retailValue,
      deadCapital,
      sellThrough,
    };
  }, [inventory, soldInventoryIds]);

  /* ------------------------------ Patient stats --------------------------- */

  const patientStats = useMemo(() => {
    const statusCounts = countBy(patients, getPatientStatus);
    return {
      total: patients.length,
      newInWindow: newPatients.length,
      newDelta: pctChange(newPatients.length, newPatientsPrev.length),
      pending: statusCounts.pending || 0,
      suspended: statusCounts.suspended || 0,
      inactive: statusCounts.inactive || 0,
      active: statusCounts.active || 0,
    };
  }, [patients, newPatients, newPatientsPrev]);

  /* -------------------------------- Charts -------------------------------- */

  const buckets = useMemo(() => {
    const count = rangeDays <= 30 ? rangeDays : Math.ceil(rangeDays / 7);
    const stepMs = (bounds.end - bounds.start + 1) / count;
    const list = [];

    for (let i = 0; i < count; i += 1) {
      const from = bounds.start + i * stepMs;
      const to = i === count - 1 ? bounds.end : from + stepMs - 1;
      const date = new Date(from);
      list.push({
        from,
        to,
        label:
          rangeDays <= 30
            ? date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
            : `W${i + 1} ${date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}`,
      });
    }
    return list;
  }, [rangeDays, bounds]);

  const revenueTrend = useMemo(
    () =>
      buckets.map((bucket) => ({
        label: bucket.label,
        value: sumOf(
          completedSales.filter((s) => inWindow(s.created_at, bucket.from, bucket.to)),
          (s) => s.total
        ),
        secondary: completedSales.filter((s) => inWindow(s.created_at, bucket.from, bucket.to))
          .length,
      })),
    [buckets, completedSales, inWindow]
  );

  const appointmentTrend = useMemo(
    () =>
      buckets.map((bucket) => {
        const rows = appointmentsInWindow.filter((a) =>
          inWindow(a.start_time || a.date, bucket.from, bucket.to)
        );
        return {
          label: bucket.label,
          value: rows.length,
          completed: rows.filter((a) => getAppointmentStatus(a) === "completed").length,
        };
      }),
    [buckets, appointmentsInWindow, inWindow]
  );

  const emptyBuckets = useMemo(
    () => appointmentTrend.filter((b) => b.value === 0).length,
    [appointmentTrend]
  );

  /* ------------------------------- Kpis ---------------------------------- */

  const kpis = [
    {
      key: "revenue",
      title: "Revenue",
      value: formatCurrency(salesStats.revenue),
      delta: comparisonReady ? salesStats.revenueDelta : null,
      icon: <Banknote className="w-5 h-5 text-emerald-700" />,
      hint: `${formatNumber(salesStats.transactions)} completed sales`,
    },
    {
      key: "average",
      title: "Average Ticket",
      value: formatCurrency(salesStats.average),
      delta: comparisonReady ? salesStats.averageDelta : null,
      icon: <ChartColumn className="w-5 h-5 text-[#8B1E42]" />,
      hint: `${formatCurrency(salesStats.discounts)} in discounts given`,
    },
    {
      key: "appointments",
      title: "Appointments",
      value: formatNumber(appointmentStats.total),
      delta: comparisonReady ? appointmentStats.totalDelta : null,
      icon: <Calendar className="w-5 h-5 text-blue-700" />,
      hint: `${formatPercent(appointmentStats.completionRate)} completion rate`,
    },
    {
      key: "patients",
      title: "New Patients",
      value: formatNumber(patientStats.newInWindow),
      delta: comparisonReady ? patientStats.newDelta : null,
      icon: <UserCheck className="w-5 h-5 text-cyan-700" />,
      hint: `${formatNumber(patientStats.total)} total on file`,
    },
    {
      key: "stock",
      title: "Stock Value",
      value: formatCurrency(inventoryStats.stockValue),
      delta: null,
      icon: <Boxes className="w-5 h-5 text-amber-700" />,
      hint: `${formatPercent(inventoryStats.sellThrough)} catalog sell-through`,
    },
    {
      key: "attendance",
      title: "Attendance",
      value: formatPercent(appointmentStats.completionRate),
      delta: comparisonReady ? appointmentStats.completionDelta : null,
      invert: true,
      icon: <Clock className="w-5 h-5 text-violet-700" />,
      hint: `${formatNumber(appointmentStats.noShow)} no-shows recorded`,
    },
  ];

  /* ---------------------------- Prescriptive rules ------------------------ */

  const insights = useMemo(() => {
    const list = [];
    const push = (insight) => list.push(insight);

    /* Scheduling: actionable approvals */
    if (appointmentStats.pending > 0) {
      push({
        id: "pending-approvals",
        severity: "critical",
        category: "Scheduling",
        title: `${formatNumber(appointmentStats.pending)} appointment request${appointmentStats.pending === 1 ? "" : "s"} awaiting approval`,
        detail:
          "Unapproved requests hold patient slots hostage and reduce the chance they get rebooked. Approve or decline them today.",
        action: "Review pending requests",
        tabId: "schedules",
        metric: `${formatNumber(appointmentStats.pending)} pending`,
      });
    }

    /* Scheduling: no-shows */
    if (appointmentStats.noShowRate > 10) {
      push({
        id: "no-show-rate",
        severity: appointmentStats.noShowRate > 20 ? "critical" : "warning",
        category: "Scheduling",
        title: `No-show rate is ${formatPercent(appointmentStats.noShowRate)}`,
        detail: `${formatNumber(appointmentStats.noShow)} of ${formatNumber(appointmentStats.total)} appointments were no-shows. Enable SMS reminders 24 hours ahead and require a small confirmation step at booking.`,
        action: "Open schedule board",
        tabId: "schedules",
        metric: formatPercent(appointmentStats.noShowRate),
      });
    }

    /* Scheduling: empty days */
    if (emptyBuckets > 0 && appointmentStats.total > 0) {
      push({
        id: "idle-slots",
        severity: "opportunity",
        category: "Scheduling",
        title: `${emptyBuckets} of ${appointmentTrend.length} periods had zero bookings`,
        detail:
          "Unused capacity is lost revenue. Run a mid-week promo or open those slots to walk-ins to absorb overflow.",
        action: "Review calendar",
        tabId: "schedules",
        metric: `${emptyBuckets} idle periods`,
      });
    }

    /* Scheduling: workload concentration */
    if (doctorPerformance.topShare > 60 && appointmentStats.total >= 5) {
      push({
        id: "workload-concentration",
        severity: "warning",
        category: "Scheduling",
        title: `One doctor is handling ${formatPercent(doctorPerformance.topShare)} of bookings`,
        detail:
          "Concentrated schedules create long queues and single points of failure. Rebalance duty hours so other specialists receive referrals.",
        action: "Manage doctor schedules",
        tabId: "doctor-schedules",
        metric: formatPercent(doctorPerformance.topShare),
      });
    }

    /* Inventory: stockouts */
    if (inventoryStats.outOfStock.length > 0) {
      push({
        id: "stockouts",
        severity: "critical",
        category: "Inventory",
        title: `${formatNumber(inventoryStats.outOfStock.length)} SKU${inventoryStats.outOfStock.length === 1 ? " is" : "s are"} out of stock`,
        detail: `Immediate reorder needed: ${inventoryStats.outOfStock
          .slice(0, 3)
          .map((i) => getProductName(i))
          .join(", ")}${inventoryStats.outOfStock.length > 3 ? `, +${inventoryStats.outOfStock.length - 3} more` : ""}.`,
        action: "Replenish inventory",
        tabId: "inventory",
        metric: `${formatNumber(inventoryStats.outOfStock.length)} out of stock`,
      });
    }

    /* Inventory: reorder level */
    if (inventoryStats.lowStock.length > 0) {
      push({
        id: "low-stock",
        severity: "warning",
        category: "Inventory",
        title: `${formatNumber(inventoryStats.lowStock.length)} SKU${inventoryStats.lowStock.length === 1 ? "" : "s"} at or below reorder level`,
        detail:
          "Raise a purchase order now to avoid losing sales. Raising the reorder level on fast movers will prevent the next shortage.",
        action: "Open low stock list",
        tabId: "inventory",
        metric: `${formatNumber(inventoryStats.lowStock.length)} low stock`,
      });
    }

    /* Inventory: dead capital */
    if (inventoryStats.overstock.length > 0 && inventoryStats.deadCapital > 0) {
      push({
        id: "dead-capital",
        severity: "opportunity",
        category: "Inventory",
        title: `${formatCurrency(inventoryStats.deadCapital)} tied up in slow-moving stock`,
        detail: `${formatNumber(inventoryStats.overstock.length)} item${
          inventoryStats.overstock.length === 1 ? "" : "s"
        } sit far above reorder level with no sales this period. Bundle, discount, or return them to free working capital.`,
        action: "Review slow movers",
        tabId: "inventory",
        metric: formatCurrency(inventoryStats.deadCapital),
      });
    }

    /* Sales: ticket erosion */
    if (
      comparisonReady &&
      salesStats.averageDelta !== null &&
      salesStats.averageDelta < -10
    ) {
      push({
        id: "ticket-erosion",
        severity: "warning",
        category: "Point of Sale",
        title: `Average ticket dropped ${formatPercent(Math.abs(salesStats.averageDelta))} vs. last period`,
        detail:
          "Lower baskets usually mean customers are skipping lens or frame upgrades. Introduce a frame + lens bundle at a modest discount to lift attach rate.",
        action: "Review sales history",
        tabId: "pos",
        metric: formatPercent(salesStats.averageDelta),
      });
    }

    /* Sales: voids */
    if (salesStats.voidRate > 5) {
      push({
        id: "sale-voids",
        severity: salesStats.voidRate > 15 ? "warning" : "opportunity",
        category: "Point of Sale",
        title: `${formatNumber(salesStats.voided)} voided sale${salesStats.voided === 1 ? "" : "s"} this period (${formatPercent(salesStats.voidRate)})`,
        detail:
          "Each void returns stock and erases revenue. Require a reason code on void and review which cashier is producing them.",
        action: "Inspect voided receipts",
        tabId: "pos",
        metric: formatPercent(salesStats.voidRate),
      });
    }

    /* Sales: payment mix */
    const qrShare = ratio(salesStats.methodCounts.qr || 0, salesStats.transactions);
    if (salesStats.transactions >= 5 && qrShare < 10) {
      push({
        id: "qr-adoption",
        severity: "opportunity",
        category: "Point of Sale",
        title: `QR payments are only ${formatPercent(qrShare)} of transactions`,
        detail:
          "Promoting QR at checkout shortens queues and removes cash-handling risk. Display a counter sign and add a small QR-only discount.",
        action: "Open checkout",
        tabId: "pos",
        metric: formatPercent(qrShare),
      });
    }

    /* Sales: winners to restock */
    if (soldLines.length > 0) {
      const top = soldLines[0];
      push({
        id: "top-seller",
        severity: "positive",
        category: "Point of Sale",
        title: `${top.name} is the top seller at ${formatCurrency(top.revenue)}`,
        detail: `${formatNumber(top.quantity)} unit${
          top.quantity === 1 ? "" : "s"
        } moved this period. Make sure stock covers the next cycle and feature it at the counter.`,
        action: "Check its stock level",
        tabId: "inventory",
        metric: formatCurrency(top.revenue),
      });
    }

    /* Patients: pending profiles */
    if (patientStats.pending > 0) {
      push({
        id: "pending-profiles",
        severity: "warning",
        category: "Patients",
        title: `${formatNumber(patientStats.pending)} patient profile${patientStats.pending === 1 ? " is" : "s are"} incomplete`,
        detail:
          "Incomplete profiles block records-based prescriptions and insurance claims. Send a completion reminder or review them yourself.",
        action: "Open patient management",
        tabId: "patients",
        metric: `${formatNumber(patientStats.pending)} pending`,
      });
    }

    /* Patients: suspended */
    if (patientStats.suspended > 0) {
      push({
        id: "suspended-accounts",
        severity: "opportunity",
        category: "Patients",
        title: `${formatNumber(patientStats.suspended)} suspended account${patientStats.suspended === 1 ? "" : "s"} on file`,
        detail:
          "Review each account for reinstatement. Unsuspending returning patients recovers a warm customer for one message.",
        action: "Review statuses",
        tabId: "patients",
        metric: `${formatNumber(patientStats.suspended)} suspended`,
      });
    }

    /* Patients: growth stall */
    if (patientStats.newInWindow === 0 && patientStats.total > 0) {
      push({
        id: "growth-stall",
        severity: "warning",
        category: "Patients",
        title: "No new patient registrations this period",
        detail:
          "Zero acquisition with an existing base usually points to a reach problem. Test a referral promo or a free screening event.",
        action: "View patient list",
        tabId: "patients",
        metric: "0 new",
      });
    }

    /* Doctors: unprofiled accounts */
    if (doctorPerformance.unprofiled > 0) {
      push({
        id: "doctor-profiles",
        severity: "warning",
        category: "Doctors",
        title: `${formatNumber(doctorPerformance.unprofiled)} doctor account${doctorPerformance.unprofiled === 1 ? " has" : "s have"} no profile`,
        detail:
          "Without a specialty, fee, and slot duration, these accounts cannot accept bookings and are invisible to patients.",
        action: "Create doctor profiles",
        tabId: "doctors",
        metric: `${formatNumber(doctorPerformance.unprofiled)} incomplete`,
      });
    }

    /* Doctors: idle */
    if (doctorPerformance.idle.length > 0 && appointmentStats.total > 0) {
      push({
        id: "idle-doctors",
        severity: "opportunity",
        category: "Doctors",
        title: `${formatNumber(doctorPerformance.idle.length)} doctor${doctorPerformance.idle.length === 1 ? " has" : "s have"} zero bookings`,
        detail: `${doctorPerformance.idle
          .slice(0, 3)
          .map((d) => d.name)
          .join(", ")}${
          doctorPerformance.idle.length > 3 ? `, +${doctorPerformance.idle.length - 3} more` : ""
        }. Adjust their duty hours or cross-refer them from busier specialists.`,
        action: "Open doctor schedules",
        tabId: "doctor-schedules",
        metric: `${formatNumber(doctorPerformance.idle.length)} idle`,
      });
    }

    /* Archive: lost demand */
    if (archivesInWindow.length > 0) {
      push({
        id: "archived-demand",
        severity: "warning",
        category: "Archive",
        title: `${formatNumber(archivesInWindow.length)} archived appointment${archivesInWindow.length === 1 ? "" : "s"} this period`,
        detail:
          "Declined and no-show history is recoverable demand. Call these patients to rebook into open slots before they go elsewhere.",
        action: "Open appointment archive",
        tabId: "archive",
        metric: `${formatNumber(archivesInWindow.length)} archived`,
      });
    }

    if (list.length === 0) {
      push({
        id: "all-clear",
        severity: "positive",
        category: "Summary",
        title: "No actions recommended right now",
        detail:
          "Every monitored area is inside its healthy range. Keep the reporting window rolling to catch changes early.",
        action: null,
        tabId: null,
        metric: "All clear",
      });
    }

    return list.sort(
      (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    );
  }, [
    appointmentStats,
    archivesInWindow,
    doctorPerformance,
    emptyBuckets,
    inventoryStats,
    patientStats,
    salesStats,
    soldLines,
    appointmentTrend,
    comparisonReady,
  ]);

  const severityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, opportunity: 0, positive: 0 };
    insights.forEach((insight) => {
      counts[insight.severity] += 1;
    });
    return counts;
  }, [insights]);

  const insightsByCategory = useMemo(() => {
    const groups = new Map();
    insights.forEach((insight) => {
      if (!groups.has(insight.category)) groups.set(insight.category, []);
      groups.get(insight.category).push(insight);
    });
    return [...groups.entries()];
  }, [insights]);

  const toggleReviewed = (id) =>
    setReviewed((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const hasData =
    users.length || doctors.length || inventory.length || sales.length || appointments.length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B1E42]/10 text-[#8B1E42] rounded-xl border border-[#8B1E42]/15">
            <ChartLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Analytics</h2>
            <p className="text-sm text-stone-600">
              Understand what happened, then decide what to do about it.
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

      {/* Controls */}
      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="bg-[#F2EAE1] p-1 rounded-xl border border-[#DCD0C0] flex items-center gap-1 overflow-x-auto">
            {MODES.map((option) => {
              const Icon = option.icon;
              const isActive = mode === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setMode(option.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                    isActive
                      ? "bg-[#8B1E42] text-white shadow-sm"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="lg:ml-auto flex items-center gap-3">
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
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-[#EBE3D8] text-xs text-stone-500">
          <span className="font-semibold uppercase tracking-wider text-stone-500">
            {bounds.startISO} &rarr; {bounds.endISO}
          </span>
          <span className="hidden sm:inline text-stone-300">|</span>
          <span>{MODES.find((m) => m.id === mode)?.blurb}</span>
          {!comparisonReady && mode === "descriptive" && (
            <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100/60 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              <Info className="w-3.5 h-3.5" />
              Not enough history for period-over-period comparison
            </span>
          )}
        </div>
      </div>

      {loading && !hasData ? (
        <div className="p-6 sm:p-10 flex items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
          <span className="text-sm font-medium">Crunching analytics...</span>
        </div>
      ) : !loading && !hasData && Object.keys(errors).length > 0 ? (
        <div className="p-6 sm:p-10 text-center bg-rose-50/50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
          <p className="mt-2 font-semibold text-rose-800">Failed to load analytics data</p>
          <p className="text-xs text-stone-600 mt-1">{Object.values(errors)[0]}</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : mode === "descriptive" ? (
        <DescriptiveView
          kpis={kpis}
          comparisonReady={comparisonReady}
          revenueTrend={revenueTrend}
          appointmentTrend={appointmentTrend}
          salesStats={salesStats}
          appointmentStats={appointmentStats}
          doctorPerformance={doctorPerformance}
          inventoryStats={inventoryStats}
          patientStats={patientStats}
          soldLines={soldLines}
        />
      ) : (
        <PrescriptiveView
          insights={insights}
          groups={insightsByCategory}
          severityCounts={severityCounts}
          reviewed={reviewed}
          onToggleReviewed={toggleReviewed}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

/* ---------------------------- Descriptive view --------------------------- */

function DescriptiveView({
  kpis,
  comparisonReady,
  revenueTrend,
  appointmentTrend,
  salesStats,
  appointmentStats,
  doctorPerformance,
  inventoryStats,
  patientStats,
  soldLines,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.key} {...kpi} comparisonReady={comparisonReady} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel
          title="Revenue & Transaction Trend"
          subtitle={`${formatNumber(sumOf(revenueTrend, (b) => b.value))} total across ${revenueTrend.length} periods`}
          icon={<ChartColumn className="w-5 h-5 text-emerald-700" />}
          className="lg:col-span-2"
        >
          <BarChart data={revenueTrend} valueKey="value" formatValue={formatCurrency} color="bg-[#8B1E42]" />
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <MiniStat label="Revenue" value={formatCurrency(sumOf(revenueTrend, (b) => b.value))} />
            <MiniStat label="Sales" value={formatNumber(sumOf(revenueTrend, (b) => b.secondary))} />
            <MiniStat
              label="Peak period"
              value={
                revenueTrend.length
                  ? revenueTrend.reduce((best, b) => (b.value > best.value ? b : best), revenueTrend[0])
                      .label
                  : "—"
              }
            />
          </div>
        </Panel>

        <Panel
          title="Payment Method Mix"
          subtitle={`${formatNumber(salesStats.transactions)} completed sales`}
          icon={<Banknote className="w-5 h-5 text-cyan-700" />}
        >
          <DistributionList
            segments={[
              { label: "Cash", value: salesStats.methodCounts.cash || 0, className: "bg-emerald-500" },
              { label: "Card", value: salesStats.methodCounts.card || 0, className: "bg-cyan-600" },
              { label: "QR", value: salesStats.methodCounts.qr || 0, className: "bg-violet-500" },
            ]}
            emptyLabel="No completed sales in this window."
          />
          <div className="mt-4 space-y-2 border-t border-[#EBE3D8] pt-4 text-xs">
            <Line label="Tax collected" value={formatCurrency(salesStats.taxes)} />
            <Line label="Discounts granted" value={formatCurrency(salesStats.discounts)} />
            <Line label="Voided sales" value={formatNumber(salesStats.voided)} />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Appointment Volume"
          subtitle={`${formatNumber(appointmentStats.total)} booked · ${formatNumber(appointmentStats.completed)} completed`}
          icon={<Calendar className="w-5 h-5 text-blue-700" />}
        >
          <BarChart data={appointmentTrend} valueKey="value" formatValue={formatNumber} color="bg-blue-600" />
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <MiniStat label="Completion" value={formatPercent(appointmentStats.completionRate)} />
            <MiniStat label="No-shows" value={formatNumber(appointmentStats.noShow)} />
            <MiniStat label="Lost" value={formatNumber(appointmentStats.lost)} />
          </div>
        </Panel>

        <Panel
          title="Appointment Outcomes"
          subtitle="Status distribution for the reporting window"
          icon={<Stethoscope className="w-5 h-5 text-amber-700" />}
        >
          <DistributionList
            segments={[
              { label: "Completed", value: appointmentStats.completed, className: "bg-emerald-500" },
              { label: "Scheduled", value: appointmentStats.scheduled, className: "bg-blue-500" },
              { label: "Pending", value: appointmentStats.pending, className: "bg-amber-500" },
              { label: "Lost", value: appointmentStats.lost, className: "bg-rose-500" },
            ]}
            emptyLabel="No appointments in this window."
          />
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <MiniStat label="Total" value={formatNumber(appointmentStats.total)} />
            <MiniStat label="Pending" value={formatNumber(appointmentStats.pending)} />
            <MiniStat label="Lost" value={formatNumber(appointmentStats.lost)} />
          </div>
        </Panel>
      </div>

      <Panel
        title="Doctor Performance"
        subtitle={`${formatNumber(doctorPerformance.rows.length)} doctor account${doctorPerformance.rows.length === 1 ? "" : "s"} · top doctor handles ${formatPercent(doctorPerformance.topShare)} of bookings`}
        icon={<Stethoscope className="w-5 h-5 text-cyan-700" />}
      >
        {doctorPerformance.rows.length === 0 ? (
          <EmptyState message="No doctor accounts found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm text-stone-700">
              <thead className="bg-[#F2EAE1]/80 text-xs uppercase text-stone-500 tracking-wider border-b border-[#EBE3D8] font-semibold">
                <tr>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Profile</th>
                  <th className="px-4 py-3 text-right">Booked</th>
                  <th className="px-4 py-3 text-right">Completed</th>
                  <th className="px-4 py-3 text-right">Lost</th>
                  <th className="px-4 py-3 w-48">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D8]">
                {doctorPerformance.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#F2EAE1]/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-stone-900">{row.name}</div>
                      {row.specialty && (
                        <div className="text-xs text-stone-500">{row.specialty}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          row.hasProfile
                            ? "bg-emerald-100/70 text-emerald-800 border-emerald-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {row.hasProfile ? "On file" : "Missing"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-stone-900">
                      {formatNumber(row.booked)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-stone-700">
                      {formatNumber(row.completed)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-stone-700">
                      {formatNumber(row.lost)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-[#E3D8CC] overflow-hidden">
                          <div
                            className="h-full bg-[#8B1E42]"
                            style={{ width: `${row.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-stone-700 w-12 text-right">
                          {formatPercent(row.completionRate)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Top Moving Products"
          subtitle="Ranked by revenue from completed sales"
          icon={<ShoppingCart className="w-5 h-5 text-[#8B1E42]" />}
        >
          {soldLines.length === 0 ? (
            <EmptyState message="No product-level sales data available for this window." />
          ) : (
            <div className="space-y-2.5">
              {soldLines.slice(0, 6).map((line, index) => {
                const max = soldLines[0].revenue || 1;
                return (
                  <div key={line.key} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-stone-400 shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-stone-900 truncate">{line.name}</span>
                        <span className="font-bold text-stone-900 shrink-0">
                          {formatCurrency(line.revenue)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E3D8CC] mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#8B1E42]"
                          style={{ width: `${(line.revenue / max) * 100}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {formatNumber(line.quantity)} unit{line.quantity === 1 ? "" : "s"} sold
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel
          title="Patient Base & Inventory Position"
          subtitle="Snapshot metrics for the current period"
          icon={<UserCheck className="w-5 h-5 text-amber-700" />}
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <MiniStat label="Total patients" value={formatNumber(patientStats.total)} />
            <MiniStat label="New in window" value={formatNumber(patientStats.newInWindow)} />
            <MiniStat label="Pending profile" value={formatNumber(patientStats.pending)} />
            <MiniStat label="Suspended" value={formatNumber(patientStats.suspended)} />
            <MiniStat label="Stock value" value={formatCurrency(inventoryStats.stockValue)} />
            <MiniStat label="Retail value" value={formatCurrency(inventoryStats.retailValue)} />
            <MiniStat label="Out of stock" value={formatNumber(inventoryStats.outOfStock.length)} />
            <MiniStat label="Low stock" value={formatNumber(inventoryStats.lowStock.length)} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------- Prescriptive view -------------------------- */

function PrescriptiveView({ insights, groups, severityCounts, reviewed, onToggleReviewed, onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SEVERITY_ORDER.map((severity) => {
          const config = SEVERITY[severity];
          const Icon = config.icon;
          return (
            <div
              key={severity}
              className={`bg-[#F8F3EC] border border-[#DCD0C0] border-l-4 ${config.accent} rounded-2xl shadow-sm p-4 flex items-center gap-3`}
            >
              <div className="p-2.5 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC]">
                <Icon className={`w-4 h-4 ${config.iconClass}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-extrabold text-stone-900">
                  {severityCounts[severity]}
                </div>
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider truncate">
                  {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-sm text-blue-900">
        <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
        <p>
          {insights.length} recommendation{insights.length === 1 ? "" : "s"} generated from live
          thresholds across scheduling, inventory, sales, patient, and doctor data. Ticking a card
          marks it as reviewed for this session.
        </p>
      </div>

      {groups.map(([category, items]) => (
        <section key={category} className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            {category}
            <span className="text-xs font-medium text-stone-400 normal-case tracking-normal">
              {items.length} item{items.length === 1 ? "" : "s"}
            </span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                reviewed={reviewed.includes(insight.id)}
                onToggleReviewed={onToggleReviewed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function InsightCard({ insight, reviewed, onToggleReviewed, onNavigate }) {
  const config = SEVERITY[insight.severity];
  const Icon = config.icon;

  return (
    <article
      className={`bg-[#F8F3EC] border border-[#DCD0C0] border-l-4 ${config.accent} rounded-2xl shadow-sm p-4 sm:p-5 space-y-3 transition ${
        reviewed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC] shrink-0`}>
          <Icon className={`w-4 h-4 ${config.iconClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.badge}`}
            >
              {config.label}
            </span>
            {insight.metric && (
              <span className="text-[11px] font-semibold text-stone-500">{insight.metric}</span>
            )}
          </div>
          <h4 className="text-sm font-bold text-stone-900">{insight.title}</h4>
        </div>
        <button
          onClick={() => onToggleReviewed(insight.id)}
          className={`p-1.5 rounded-xl transition shrink-0 ${
            reviewed
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "text-stone-400 hover:text-stone-700 hover:bg-[#EBE3D8]"
          }`}
          title={reviewed ? "Mark as unresolved" : "Mark as reviewed"}
        >
          <CircleCheck className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">{insight.detail}</p>

      {insight.action && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#EBE3D8]">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            <Zap className="w-3.5 h-3.5" /> Recommended action
          </span>
          {onNavigate && insight.tabId && (
            <button
              onClick={() => onNavigate(insight.tabId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition"
            >
              {insight.action}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/* --------------------------------- pieces -------------------------------- */

function Panel({ title, subtitle, icon, className = "", children }) {
  return (
    <section
      className={`bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      <div className="p-4 sm:p-5 border-b border-[#EBE3D8] flex items-center gap-3 bg-[#FAF7F2]">
        <div className="p-2 bg-[#F2EAE1] text-[#8B1E42] rounded-xl border border-[#E3D8CC] shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-stone-900 truncate">{title}</h3>
          <p className="text-xs text-stone-500 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function KpiCard({ title, value, delta, icon, hint, invert = false, comparisonReady }) {
  const trend =
    delta === null || delta === undefined
      ? { key: "none", label: "Snapshot", Icon: Minus, className: "text-stone-500 bg-stone-200/70" }
      : delta > 0.5
        ? { key: "up", label: `${formatPercent(Math.abs(delta))} vs prev.`, Icon: TrendingUp, className: "text-emerald-800 bg-emerald-100/70" }
        : delta < -0.5
          ? { key: "down", label: `${formatPercent(Math.abs(delta))} vs prev.`, Icon: TrendingDown, className: "text-rose-800 bg-rose-100/70" }
          : { key: "flat", label: "Flat vs prev.", Icon: Minus, className: "text-stone-600 bg-stone-200/70" };

  const isGood = invert ? delta < -0.5 : delta > 0.5;
  const isBad = invert ? delta > 0.5 : delta < -0.5;
  const TrendIcon = trend.Icon;

  return (
    <div className="bg-[#F8F3EC] border border-[#DCD0C0] p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </span>
        <div className="p-2.5 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC] shrink-0">{icon}</div>
      </div>
      <div className="text-2xl font-extrabold text-stone-900 break-words">{value}</div>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${trend.className} ${
            comparisonReady ? "" : "opacity-60"
          }`}
        >
          <TrendIcon className="w-3 h-3" />
          {comparisonReady ? trend.label : "No baseline"}
        </span>
        {(isGood || isBad) && (
          <span
            className={`inline-flex items-center text-[11px] font-bold ${
              isGood ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {isGood ? "Good" : "Watch"}
          </span>
        )}
      </div>
      <div className="text-xs text-stone-500 font-medium">{hint}</div>
    </div>
  );
}

function BarChart({ data, valueKey, formatValue, color = "bg-[#8B1E42]" }) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey] || 0)));

  if (data.length === 0) {
    return <EmptyState message="No data in this window." />;
  }

  return (
    <div>
      <div className="flex items-end gap-[3px] h-40" role="img" aria-label="Trend chart">
        {data.map((point, index) => {
          const value = Number(point[valueKey] || 0);
          const height = Math.max(value > 0 ? 4 : 2, (value / max) * 160);
          return (
            <div
              key={`${point.label}-${index}`}
              className="flex-1 flex items-end"
              title={`${point.label}: ${formatValue(value)}`}
            >
              <div
                className={`w-full rounded-t-md ${color} ${value > 0 ? "opacity-90" : "opacity-25"} transition hover:opacity-100`}
                style={{ height }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-[3px] mt-2">
        {data.map((point, index) => (
          <div
            key={`label-${point.label}-${index}`}
            className="flex-1 text-[9px] text-stone-500 text-center truncate"
          >
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionList({ segments, emptyLabel }) {
  const usable = segments.filter((s) => s.value > 0);
  const total = usable.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <EmptyState message={emptyLabel} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden bg-[#E3D8CC]">
        {usable.map((segment) => (
          <div
            key={segment.label}
            className={`h-full ${segment.className}`}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="space-y-2">
        {usable.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-stone-600">
              <span className={`w-2.5 h-2.5 rounded-full ${segment.className}`} />
              {segment.label}
            </span>
            <span className="font-semibold text-stone-800">
              {formatNumber(segment.value)}
              <span className="text-stone-400 font-medium ml-1.5">
                ({formatPercent((segment.value / total) * 100)})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl px-2.5 py-2.5 sm:px-4 sm:py-3">
      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider truncate">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-stone-900 break-words">{value}</div>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-500">{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-6 sm:py-8 text-center text-stone-500">
      <ChartColumn className="w-7 h-7 mx-auto text-stone-300" />
      <p className="mt-2 text-sm font-medium">{message}</p>
    </div>
  );
}
