import { useState, useEffect } from "react";
import {
  Receipt,
  Loader2,
  AlertCircle,
  RefreshCw,
  Check,
  CheckCircle2,
  Ban,
  Undo2,
  Package,
  Banknote,
} from "lucide-react";
import { formatWallClockDateTime } from "../../utils/dateTime";

const API_URL =
  import.meta.env.VITE_PROD_URL || import.meta.env.VITE_API_URL || "http://localhost:3500";

const STATUS_META = {
  completed: {
    label: "Completed",
    badge: "bg-[#52795A]/10 text-[#52795A] border-[#52795A]/25",
    icon: CheckCircle2,
    hint: "Paid in full — this order is complete.",
  },
  voided: {
    label: "Voided",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    icon: Ban,
    hint: "This order was cancelled at the counter and the items were returned to stock.",
  },
  refunded: {
    label: "Refunded",
    badge: "bg-[#C08A3E]/10 text-[#C08A3E] border-[#C08A3E]/25",
    icon: Undo2,
    hint: "The payment for this order was refunded.",
  },
};

const UNKNOWN_STATUS = {
  label: "Unknown",
  badge: "bg-stone-100 text-stone-700 border-stone-300",
  icon: Receipt,
  hint: "",
};

const PAYMENT_LABELS = {
  cash: "Cash",
  card: "Card",
  qr: "QR",
};

function formatPeso(value) {
  const amount = Number(value) || 0;
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function OrderCard({ order }) {
  const status = (order.status || "").toLowerCase();
  const meta = STATUS_META[status] || UNKNOWN_STATUS;
  const StatusIcon = meta.icon;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Receipt + status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Receipt className="w-4 h-4 text-[#8B1E42] shrink-0" />
          <span className="font-bold text-stone-900 text-sm truncate">
            {order.receipt_number}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.badge}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {meta.label}
        </span>
      </div>

      {/* Tracking strip: placed -> final status */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#52795A]/15 text-[#52795A]">
            <Check className="w-3 h-3" />
          </span>
          <span className="font-semibold text-stone-700">Ordered</span>
          <span className="text-stone-500 hidden sm:inline">
            {formatWallClockDateTime(order.created_at)}
          </span>
        </div>
        <div className="h-px flex-1 bg-[#DCD0C0]" />
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusIcon className={`w-4 h-4 ${status === "completed" ? "text-[#52795A]" : status === "refunded" ? "text-[#C08A3E]" : "text-rose-600"}`} />
          <span className="font-semibold text-stone-700">{meta.label}</span>
        </div>
      </div>
      {meta.hint && <p className="text-xs text-stone-500 -mt-2">{meta.hint}</p>}

      {/* Items */}
      {items.length > 0 ? (
        <div className="bg-[#FAF7F2] border border-[#E3D8CC] rounded-xl divide-y divide-[#E3D8CC]">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <div className="font-semibold text-stone-900 truncate">
                  {item.product_name}
                </div>
                <div className="text-xs text-stone-500 font-mono">{item.sku}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs text-stone-500">
                  {formatPeso(item.unit_price)} × {item.quantity}
                </div>
                <div className="font-bold text-stone-900">{formatPeso(item.line_total)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-stone-500">No item details recorded.</p>
      )}

      {/* Totals */}
      <div className="space-y-1.5 text-xs text-stone-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-800">{formatPeso(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span className="font-semibold text-stone-800">
            − {formatPeso(order.discount_amount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span className="font-semibold text-stone-800">{formatPeso(order.tax_amount)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-[#E3D8CC]">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Banknote className="w-3.5 h-3.5" />
          {PAYMENT_LABELS[order.payment_method] || order.payment_method || "Cash"}
        </span>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
            Total
          </div>
          <div className="text-lg font-extrabold text-[#8B1E42]">
            {formatPeso(order.total)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/pos/sales/mine?limit=100`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized access. Please log in as a patient.");
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to load your orders.");
      }

      setOrders(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 0);
    return () => clearTimeout(timer);
  }, []);

  const completedOrders = orders.filter(
    (order) => (order.status || "").toLowerCase() === "completed"
  );
  const affectedOrders = orders.length - completedOrders.length;
  const totalSpent = completedOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0
  );

  const stats = [
    { label: "Total Orders", value: orders.length, icon: <Receipt className="w-4 h-4" /> },
    {
      label: "Completed",
      value: completedOrders.length,
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    { label: "Void / Refund", value: affectedOrders, icon: <Ban className="w-4 h-4" /> },
    { label: "Total Spent", value: formatPeso(totalSpent), icon: <Banknote className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B1E42]/10 text-[#8B1E42] rounded-xl border border-[#8B1E42]/15">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">My Orders</h2>
            <p className="text-sm text-stone-600">
              Track purchases made at the clinic counter under your account.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-auto bg-[#8B1E42] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#731836] transition shadow-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center gap-3 text-stone-500 bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
          <span className="text-sm font-medium">Loading your orders...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <span className="font-bold">Orders unavailable: </span>
            {error}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 sm:p-10 text-center bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl">
          <Package className="w-8 h-8 mx-auto text-stone-400" />
          <p className="mt-3 font-semibold text-stone-800">No orders yet</p>
          <p className="mt-1 text-sm text-stone-500">
            Purchases made at the clinic counter and linked to your account will
            appear here for tracking.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-3.5 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 text-[#8B1E42] mb-1">
                  {stat.icon}
                </div>
                <div className="text-xl font-extrabold text-stone-900">{stat.value}</div>
                <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Order list */}
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
