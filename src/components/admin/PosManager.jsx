import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  History,
  Receipt,
  Search,
  Plus,
  Minus,
  X,
  Trash2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  Banknote,
  CreditCard,
  QrCode,
  Coins,
  User,
  Eye,
  Ban,
  Store,
  Layers,
  CheckCircle2,
} from "lucide-react";

const API_POS_URL = "http://localhost:3500/pos";
const API_INVENTORY_URL = "http://localhost:3500/inventory";

const inputClass =
  "w-full pl-4 pr-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]";

const TAB_DEFS = [
  { id: "checkout", label: "Checkout", icon: ShoppingCart },
  { id: "sales", label: "Sales History", icon: History },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "qr", label: "QR", icon: QrCode },
];

const CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "frame", label: "Frames" },
  { id: "lens", label: "Lenses" },
  { id: "accessory", label: "Accessories" },
];

const round2 = (n) => Math.round(n * 100) / 100;

const toLocalISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const defaultStartDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toLocalISO(d);
};

export default function PosManager() {
  const [activeTab, setActiveTab] = useState("checkout");

  // Checkout state
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [lastSale, setLastSale] = useState(null);

  // Sales history state
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);
  const [salesSearch, setSalesSearch] = useState("");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(() => toLocalISO(new Date()));
  const [summary, setSummary] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailLoading, setSaleDetailLoading] = useState(false);

  const fetchWithCredentials = async (url, options = {}) => {
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  };

  const getProductName = (item) => {
    if (item.frame)
      return `${item.frame.brand} ${item.frame.model_number}`.trim();
    if (item.lens) return `${item.lens.brand} ${item.lens.lens_type}`.trim();
    return item.sku;
  };

  const fetchInventory = async () => {
    setInventoryLoading(true);
    setInventoryError(null);
    try {
      const response = await fetchWithCredentials(
        `${API_INVENTORY_URL}?limit=200`
      );
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to fetch inventory");
      setInventory(result.data || []);
    } catch (err) {
      setInventoryError(err.message);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    setSalesError(null);
    try {
      const response = await fetchWithCredentials(`${API_POS_URL}/sales?limit=100`);
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to fetch sales");
      setSales(result.data || []);
    } catch (err) {
      setSalesError(err.message);
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetchWithCredentials(
        `${API_POS_URL}/sales/summary?startDate=${startDate}&endDate=${endDate}`
      );
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to fetch summary");
      setSummary(result.data);
    } catch {
      setSummary(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
      fetchSales();
      fetchSummary();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== "sales") return;
    const timer1 = setTimeout(() => fetchSales(), 0);
    const timer2 = setTimeout(() => fetchSummary(), 0);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "sales") return;
    const timer = setTimeout(() => fetchSummary(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const filteredInventory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return inventory.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      if (!matchesCategory) return false;
      if (!term) return true;
      const haystack = [item.sku, item.category, getProductName(item)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [inventory, searchTerm, categoryFilter]);

  const filteredSales = useMemo(() => {
    const term = salesSearch.trim().toLowerCase();
    if (!term) return sales;
    return sales.filter((sale) =>
      [sale.receipt_number, sale.customer_name, sale.payment_method, sale.sold_by_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [sales, salesSearch]);

  const addToCart = (item) => {
    if (Number(item.quantity) <= 0) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.inventoryId === item.id);
      if (existing) {
        if (existing.quantity + 1 > Number(item.quantity)) {
          alert(`Only ${item.quantity} unit(s) in stock for ${item.sku}.`);
          return prev;
        }
        return prev.map((l) =>
          l.inventoryId === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [
        ...prev,
        {
          inventoryId: item.id,
          sku: item.sku,
          name: getProductName(item),
          category: item.category,
          unitPrice: Number(item.selling_price),
          quantity: 1,
          available: Number(item.quantity),
        },
      ];
    });
  };

  const updateCartQty = (inventoryId, delta) => {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.inventoryId !== inventoryId) return l;
          const next = l.quantity + delta;
          if (next < 1) return l;
          if (next > l.available) {
            alert(`Only ${l.available} unit(s) in stock for ${l.sku}.`);
            return l;
          }
          return { ...l, quantity: next };
        })
    );
  };

  const removeFromCart = (inventoryId) => {
    setCart((prev) => prev.filter((l) => l.inventoryId !== inventoryId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setDiscountAmount("");
    setTaxRate("");
    setAmountTendered("");
    setCheckoutError(null);
  };

  const subtotal = round2(
    cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
  );
  const discount = round2(Number(discountAmount) || 0);
  const tax = round2(subtotal * ((Number(taxRate) || 0) / 100));
  const total = round2(subtotal - discount + tax);
  const tendered = Number(amountTendered) || 0;
  const change = paymentMethod === "cash" ? round2(Math.max(0, tendered - total)) : null;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === "cash" && tendered < total) {
      setCheckoutError("Cash tendered must be at least the total amount.");
      return;
    }
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const payload = {
        items: cart.map((l) => ({ inventoryId: l.inventoryId, quantity: l.quantity })),
        customerName: customerName || null,
        paymentMethod,
        amountTendered: amountTendered === "" || amountTendered == null ? null : tendered,
        discountAmount: Number(discountAmount) || 0,
        taxRate: Number(taxRate) || 0,
      };

      const response = await fetchWithCredentials(`${API_POS_URL}/sales`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Sale failed");

      setLastSale(result.sale);
      clearCart();
      fetchInventory();
      fetchSales();
      fetchSummary();
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoidSale = async (sale) => {
    if (
      !window.confirm(
        `Void sale ${sale.receipt_number} for ${formatCurrency(sale.total)}? Sold stock will be restored.`
      )
    ) {
      return;
    }
    try {
      const response = await fetchWithCredentials(
        `${API_POS_URL}/sales/${sale.id}/void`,
        { method: "PATCH" }
      );
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Void failed");
      fetchSales();
      fetchSummary();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewSale = async (id) => {
    setSaleDetailLoading(true);
    try {
      const response = await fetchWithCredentials(`${API_POS_URL}/sales/${id}`);
      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to load sale");
      setSelectedSale(result.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaleDetailLoading(false);
    }
  };

  const formatCurrency = (n) => `₱${Number(n || 0).toFixed(2)}`;
  const formatDate = (d) =>
    new Date(d).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Point of Sale</h2>
          <p className="text-sm text-stone-600">
            Ring up frames, lenses, and accessories with live inventory deductions.
          </p>
        </div>
        <button
          onClick={() => (activeTab === "sales" ? fetchSales() : fetchInventory())}
          className="flex items-center gap-2 bg-[#8B1E42] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#731836] transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh{activeTab === "sales" ? " Sales" : " Inventory"}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-[#F2EAE1] p-1 rounded-xl border border-[#DCD0C0] flex items-center gap-1 overflow-x-auto">
          {TAB_DEFS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#8B1E42] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Checkout Tab */}
      {activeTab === "checkout" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Product Catalog */}
          <section className="lg:col-span-3 bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#EBE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2]">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Products</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {filteredInventory.length} item{filteredInventory.length === 1 ? "" : "s"} available to sell
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search SKU, brand, model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] w-full"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] cursor-pointer font-medium"
                >
                  {CATEGORY_FILTERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5">
              {inventoryLoading ? (
                <div className="p-12 flex items-center justify-center gap-3 text-stone-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
                  <span className="text-sm font-medium">Fetching products...</span>
                </div>
              ) : inventoryError ? (
                <div className="p-10 text-center bg-rose-50/50 rounded-2xl">
                  <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
                  <p className="mt-2 font-semibold text-rose-800">Failed to load products</p>
                  <p className="text-xs text-stone-600 mt-1">{inventoryError}</p>
                  <button
                    onClick={fetchInventory}
                    className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="p-14 text-center text-stone-500">
                  <Store className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="mt-3 text-sm font-medium">No products match your filters.</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Add inventory items first in the Inventory Management tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredInventory.map((item) => {
                    const inCart = cart.find((l) => l.inventoryId === item.id);
                    const available = Number(item.quantity);
                    const outOfStock = available <= 0;
                    return (
                      <div
                        key={item.id}
                        className="bg-[#FAF7F2] border border-[#EBE3D8] rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 hover:border-[#DCD0C0] transition"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-stone-900 leading-snug">
                                {getProductName(item)}
                              </div>
                              <div className="text-xs text-stone-500 mt-0.5 font-mono">{item.sku}</div>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-[#E8DDD0] px-2.5 py-1 rounded-full capitalize shrink-0">
                              <Layers className="w-3 h-3 text-[#8B1E42]" />
                              {item.category}
                            </span>
                          </div>
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              outOfStock
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : Number(item.quantity) <= Number(item.reorder_level)
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-emerald-100/70 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {outOfStock && <AlertTriangle className="w-3 h-3" />}
                            {available.toLocaleString()} in stock
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-lg font-extrabold text-stone-900">
                            {formatCurrency(item.selling_price)}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            disabled={outOfStock}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {inCart ? (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add More ({inCart.quantity})
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Cart & Payment */}
          <section className="lg:col-span-2 bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden self-start lg:sticky lg:top-24">
            <div className="p-5 border-b border-[#EBE3D8] flex items-center justify-between bg-[#FAF7F2]">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Current Order</h3>
                <p className="text-xs text-stone-500 mt-0.5">{cart.length} line item{cart.length === 1 ? "" : "s"}</p>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-100/60 rounded-xl transition"
                  title="Clear cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {checkoutError && (
              <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{checkoutError}</span>
              </div>
            )}

            <div className="p-5 space-y-5">
              {/* Cart lines */}
              {cart.length === 0 ? (
                <div className="py-8 text-center text-stone-500">
                  <Package className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="mt-3 text-sm font-medium">Your cart is empty.</p>
                  <p className="text-xs text-stone-400 mt-1">Add products from the catalog to begin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((line) => (
                    <div
                      key={line.inventoryId}
                      className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-stone-900 text-sm truncate">{line.name}</div>
                        <div className="text-xs text-stone-500 font-mono truncate">{line.sku}</div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          <span className="font-semibold text-stone-800">{formatCurrency(line.unitPrice)}</span> x {line.quantity} ={" "}
                          <span className="font-bold text-stone-900">{formatCurrency(line.unitPrice * line.quantity)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => updateCartQty(line.inventoryId, -1)}
                          className="p-1.5 bg-[#E8DDD0] hover:bg-[#DCD0C0] rounded-lg text-stone-700 transition"
                          title="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-stone-900">{line.quantity}</span>
                        <button
                          onClick={() => updateCartQty(line.inventoryId, 1)}
                          className="p-1.5 bg-[#E8DDD0] hover:bg-[#DCD0C0] rounded-lg text-stone-700 transition"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(line.inventoryId)}
                          className="p-1.5 ml-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 rounded-lg transition"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Discount (₱)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#DCD0C0]">
                  <span className="font-bold text-stone-900 text-base">Total</span>
                  <span className="font-extrabold text-[#8B1E42] text-xl">{formatCurrency(total)}</span>
                </div>
                {paymentMethod === "cash" && change !== null && (
                  <div className="flex justify-between text-stone-600">
                    <span>Change</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(change)}</span>
                  </div>
                )}
              </div>

              {/* Payment form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Customer Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Walk-in customer"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Payment Method
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isActive = paymentMethod === method.id;
                      return (
                        <button
                          type="button"
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                            isActive
                              ? "bg-[#8B1E42] text-white border-[#8B1E42] shadow-sm"
                              : "bg-[#F2EAE1] text-stone-700 border-[#DCD0C0] hover:bg-white/60"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Amount Tendered
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={paymentMethod === "cash" ? "Cash received" : "Optional"}
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5">
                    {paymentMethod === "cash"
                      ? tendered >= total
                        ? `Change: ${formatCurrency(change)}`
                        : `Short of ${formatCurrency(round2(total - tendered))}`
                      : "Card / QR payments do not require change."}
                  </p>
                </div>

                <button
                  onClick={handleCompleteSale}
                  disabled={cart.length === 0 || submitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#8B1E42] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#731836] transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing sale...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Complete Sale · {formatCurrency(total)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Sales History Tab */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <StatCard
              title="Transactions"
              value={summary ? Number(summary.transaction_count || 0).toLocaleString() : "—"}
              icon={<ShoppingCart className="w-5 h-5 text-[#8B1E42]" />}
              accent={`${startDate} to ${endDate}`}
            />
            <StatCard
              title="Revenue"
              value={summary ? formatCurrency(summary.total_revenue) : "—"}
              icon={<Banknote className="w-5 h-5 text-emerald-700" />}
              accent="Completed sales only"
            />
            <StatCard
              title="Items Sold"
              value={summary ? Number(summary.items_sold || 0).toLocaleString() : "—"}
              icon={<Package className="w-5 h-5 text-cyan-700" />}
              accent="Units across all sales"
            />
            <StatCard
              title="Tax Collected"
              value={summary ? formatCurrency(summary.total_taxes) : "—"}
              icon={<Coins className="w-5 h-5 text-amber-700" />}
              accent={`Discounts: ${summary ? formatCurrency(summary.total_discounts) : "—"}`}
            />
          </div>

          {/* Date range filter */}
          <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-end gap-4 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex-1" />
            <button
              onClick={() => {
                fetchSales();
                fetchSummary();
              }}
              className="inline-flex items-center gap-2 bg-[#8B1E42] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#731836] transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Apply Range
            </button>
          </div>

          {/* Sales table */}
          <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#EBE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2]">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Sales Records</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {filteredSales.length} record{filteredSales.length === 1 ? "" : "s"} loaded
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search receipt, customer, cashier..."
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {salesLoading ? (
                <div className="p-16 flex items-center justify-center gap-3 text-stone-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
                  <span className="text-sm font-medium">Fetching sales records...</span>
                </div>
              ) : salesError ? (
                <div className="p-10 text-center bg-rose-50/50">
                  <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
                  <p className="mt-2 font-semibold text-rose-800">Failed to load sales</p>
                  <p className="text-xs text-stone-600 mt-1">{salesError}</p>
                  <button
                    onClick={fetchSales}
                    className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredSales.length === 0 ? (
                <div className="p-14 text-center text-stone-500">
                  <Receipt className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="mt-3 text-sm font-medium">No sales found.</p>
                  <p className="text-xs text-stone-400 mt-1">Complete a sale from the Checkout tab.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-stone-700">
                  <thead className="bg-[#F2EAE1]/80 text-xs uppercase text-stone-500 tracking-wider border-b border-[#EBE3D8] font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Receipt No.</th>
                      <th className="px-6 py-3.5">Customer</th>
                      <th className="px-6 py-3.5">Payment</th>
                      <th className="px-6 py-3.5">Total</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Cashier</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3D8]">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-[#F2EAE1]/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-stone-900">{sale.receipt_number}</span>
                        </td>
                        <td className="px-6 py-4">{sale.customer_name || "Walk-in Customer"}</td>
                        <td className="px-6 py-4">
                          <PaymentBadge method={sale.payment_method} />
                        </td>
                        <td className="px-6 py-4 font-semibold text-stone-900">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={sale.status} />
                        </td>
                        <td className="px-6 py-4">{sale.sold_by_name || "—"}</td>
                        <td className="px-6 py-4 text-stone-600 whitespace-nowrap">
                          {formatDate(sale.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleViewSale(sale.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition mr-2"
                            title="View receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          {sale.status === "completed" && (
                            <button
                              onClick={() => handleVoidSale(sale)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-100/60 hover:bg-rose-700 hover:text-white transition"
                              title="Void sale"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Void
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Modal: Receipt (success) */}
      {lastSale && (
        <ModalLayer>
          <ModalHeader
            title="Sale Completed"
            subtitle={`${lastSale.receipt_number} · ${formatDate(lastSale.created_at)}`}
            onClose={() => setLastSale(null)}
          />
          <div className="text-center -mt-2">
            <div className="inline-flex p-3 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="mt-3 font-bold text-stone-900 text-lg">{formatCurrency(lastSale.total)}</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {lastSale.customer_name || "Walk-in Customer"} ·{" "}
              {(lastSale.payment_method || "cash").toUpperCase()}
            </p>
            {lastSale.change_amount !== null && Number(lastSale.change_amount) > 0 && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <Coins className="w-3.5 h-3.5" /> Change due: {formatCurrency(lastSale.change_amount)}
              </p>
            )}
          </div>
          <div className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl divide-y divide-[#E3D8CC] max-h-52 overflow-y-auto">
            {(lastSale.items || []).map((line, idx) => (
              <div key={idx} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="font-semibold text-stone-900 truncate">{line.product_name}</div>
                  <div className="text-xs text-stone-500 font-mono">{line.sku}</div>
                </div>
                <div className="shrink-0 text-right ml-3">
                  <div className="text-stone-600">
                    {formatCurrency(line.unit_price)} x {line.quantity}
                  </div>
                  <div className="font-bold text-stone-900">{formatCurrency(line.line_total)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end pt-2 border-t border-[#EBE3D8]">
            <button
              onClick={() => setLastSale(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] shadow-sm transition"
            >
              New Sale
            </button>
          </div>
        </ModalLayer>
      )}

      {/* Modal: Sale details */}
      {selectedSale && (
        <ModalLayer>
          <ModalHeader
            title={`Sale ${selectedSale.receipt_number}`}
            subtitle={formatDate(selectedSale.created_at)}
            onClose={() => setSelectedSale(null)}
          />
          {saleDetailLoading ? (
            <div className="p-10 flex items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
              <span className="text-sm font-medium">Loading receipt...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <DetailChip label="Customer" value={selectedSale.customer_name || "Walk-in Customer"} />
                <DetailChip label="Cashier" value={selectedSale.sold_by_name || "—"} />
                <DetailChip
                  label="Payment Method"
                  value={(selectedSale.payment_method || "cash").toUpperCase()}
                />
                <DetailChip label="Status" value={(selectedSale.status || "").toUpperCase()} />
              </div>

              <div className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl divide-y divide-[#E3D8CC] max-h-64 overflow-y-auto">
                {(selectedSale.items || []).map((line) => (
                  <div key={line.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-900 truncate">{line.product_name}</div>
                      <div className="text-xs text-stone-500 font-mono">{line.sku}</div>
                    </div>
                    <div className="shrink-0 text-right ml-3">
                      <div className="text-stone-600">
                        {formatCurrency(line.unit_price)} x {line.quantity}
                      </div>
                      <div className="font-bold text-stone-900">{formatCurrency(line.line_total)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl p-4 space-y-1.5 text-sm">
                <Row label="Subtotal" value={formatCurrency(selectedSale.subtotal)} />
                <Row label="Discount" value={`- ${formatCurrency(selectedSale.discount_amount)}`} />
                <Row label="Tax" value={formatCurrency(selectedSale.tax_amount)} />
                <div className="flex justify-between items-center pt-2 border-t border-[#DCD0C0]">
                  <span className="font-bold text-stone-900">Total</span>
                  <span className="font-extrabold text-[#8B1E42] text-lg">
                    {formatCurrency(selectedSale.total)}
                  </span>
                </div>
                {selectedSale.amount_tendered !== null && (
                  <div className="flex justify-between text-stone-600 pt-1">
                    <span>Tendered</span>
                    <span className="font-semibold text-stone-800">
                      {formatCurrency(selectedSale.amount_tendered)}
                    </span>
                  </div>
                )}
                {selectedSale.change_amount !== null && Number(selectedSale.change_amount) > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Change</span>
                    <span className="font-bold text-emerald-700">
                      {formatCurrency(selectedSale.change_amount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[#EBE3D8]">
                <button
                  onClick={() => setSelectedSale(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] shadow-sm transition"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </ModalLayer>
      )}
    </div>
  );
}

/* ------------------------ Presentational helpers ------------------------ */

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="bg-[#F8F3EC] border border-[#DCD0C0] p-5 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</span>
        <div className="p-2.5 bg-[#F2EAE1] rounded-xl border border-[#E3D8CC]">{icon}</div>
      </div>
      <div className="text-2xl font-extrabold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 font-medium">{accent}</div>
    </div>
  );
}

function PaymentBadge({ method }) {
  const config = {
    cash: {
      icon: Banknote,
      classes: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    card: {
      icon: CreditCard,
      classes: "bg-cyan-100 text-cyan-800 border-cyan-200",
    },
    qr: {
      icon: QrCode,
      classes: "bg-violet-100 text-violet-800 border-violet-200",
    },
  };
  const { icon: Icon, classes } = config[method] || config.cash;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${classes}`}>
      <Icon className="w-3 h-3" />
      {method}
    </span>
  );
}

function StatusBadge({ status }) {
  const isVoided = status === "voided";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
        isVoided
          ? "bg-rose-100 text-rose-800 border-rose-200"
          : status === "refunded"
            ? "bg-amber-100 text-amber-800 border-amber-200"
            : "bg-emerald-100/70 text-emerald-800 border-emerald-200"
      }`}
    >
      {isVoided && <Ban className="w-3 h-3" />}
      {status}
    </span>
  );
}

function DetailChip({ label, value }) {
  return (
    <div className="bg-[#F2EAE1] border border-[#E3D8CC] rounded-xl px-4 py-3">
      <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-stone-900">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-stone-600">
      <span>{label}</span>
      <span className="font-semibold text-stone-800">{value}</span>
    </div>
  );
}

function ModalLayer({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-stone-900">{title}</h3>
        <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-[#EBE3D8] transition"
        title="Close"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}