import { useState, useEffect, useMemo } from "react";
import {
  Package,
  Boxes,
  Glasses,
  Aperture,
  Plus,
  X,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Search,
  Layers,
  PencilLine,
  Warehouse,
  CircleDollarSign,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3500/inventory";

const TAB_DEFS = [
  { id: "inventory", label: "All Inventory", icon: Package },
  { id: "frames", label: "Frames Catalog", icon: Glasses },
  { id: "lenses", label: "Lenses Catalog", icon: Aperture },
  { id: "low-stock", label: "Low Stock", icon: AlertTriangle },
];

const EMPTY_FRAME_FORM = {
  brand: "",
  modelNumber: "",
  color: "",
  frameType: "",
  material: "",
  gender: "unisex",
  lensWidth: "",
  bridgeWidth: "",
  templeLength: "",
};

const EMPTY_LENS_FORM = {
  brand: "",
  lensType: "",
  material: "",
  indexValue: "",
  coating: "",
  minSphere: "",
  maxSphere: "",
  minCylinder: "",
  maxCylinder: "",
};

const EMPTY_INVENTORY_FORM = {
  sku: "",
  category: "frame",
  frameId: "",
  lensId: "",
  quantity: 0,
  reorderLevel: 5,
  unitCost: 0,
  sellingPrice: 0,
};

const inputClass =
  "w-full pl-4 pr-4 py-2.5 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42]";

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState("0");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState("inventory");
  const [submitting, setSubmitting] = useState(false);

  // Forms state
  const [frameForm, setFrameForm] = useState(EMPTY_FRAME_FORM);
  const [lensForm, setLensForm] = useState(EMPTY_LENS_FORM);
  const [inventoryForm, setInventoryForm] = useState(EMPTY_INVENTORY_FORM);

  // Reference catalogs for the create modal dropdowns
  const [framesList, setFramesList] = useState([]);
  const [lensesList, setLensesList] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Unified fetch utility that automatically includes cookie credentials
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

  const buildEndpoint = (tab) => {
    let endpoint = API_BASE_URL;
    if (tab === "frames") endpoint += "/frames";
    if (tab === "lenses") endpoint += "/lenses";
    if (tab === "low-stock") endpoint += "/low-stock";
    return endpoint;
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithCredentials(buildEndpoint(activeTab));

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to fetch");

      setItems(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const haystack = [
        item.sku,
        item.category,
        item.brand,
        item.model_number,
        item.lens_type,
        item.color,
        item.frame?.brand,
        item.frame?.model_number,
        item.frame?.color,
        item.lens?.brand,
        item.lens?.lens_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [items, searchTerm]);

  // Summary stats for the inventory tabs
  const summary = useMemo(() => {
    const lowStock = items.filter((i) => Number(i.quantity) <= Number(i.reorder_level)).length;
    const stockValue = items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unit_cost || 0), 0);
    const retailValue = items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.selling_price || 0), 0);
    return { lowStock, stockValue, retailValue };
  }, [items]);

  const fetchCatalogs = async () => {
    setCatalogLoading(true);
    try {
      const [framesRes, lensesRes] = await Promise.all([
        fetchWithCredentials(`${API_BASE_URL}/frames`),
        fetchWithCredentials(`${API_BASE_URL}/lenses`),
      ]);

      if (framesRes.status === 401 || framesRes.status === 403 || lensesRes.status === 401 || lensesRes.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }

      const framesData = framesRes.ok ? (await framesRes.json()).data || [] : [];
      const lensesData = lensesRes.ok ? (await lensesRes.json()).data || [] : [];

      setFramesList(framesData);
      setLensesList(lensesData);
    } catch (err) {
      alert(err.message);
    } finally {
      setCatalogLoading(false);
    }
  };

  const resetForms = (type) => {
    setCreateType(type || "inventory");
    setFrameForm(EMPTY_FRAME_FORM);
    setLensForm(EMPTY_LENS_FORM);
    setInventoryForm(EMPTY_INVENTORY_FORM);
  };

  const openCreateModal = (type = "inventory") => {
    resetForms(type);
    setIsCreateModalOpen(true);
    fetchCatalogs();
  };

  // Stock Adjustment Handler
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const response = await fetchWithCredentials(`${API_BASE_URL}/${selectedItem.id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: Number(newQuantity) }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Stock update failed");

      setIsStockModalOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Create Handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let endpoint = API_BASE_URL;
      let bodyData = {};

      if (createType === "frame") {
        endpoint += "/frames";
        bodyData = { ...frameForm };
      } else if (createType === "lens") {
        endpoint += "/lenses";
        bodyData = { ...lensForm };
      } else {
        bodyData = {
          ...inventoryForm,
          quantity: Number(inventoryForm.quantity),
          reorderLevel: Number(inventoryForm.reorderLevel),
          unitCost: Number(inventoryForm.unitCost),
          sellingPrice: Number(inventoryForm.sellingPrice),
          frameId: inventoryForm.frameId ? Number(inventoryForm.frameId) : undefined,
          lensId: inventoryForm.lensId ? Number(inventoryForm.lensId) : undefined,
        };
      }

      const response = await fetchWithCredentials(endpoint, {
        method: "POST",
        body: JSON.stringify(bodyData),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Creation failed");

      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Item Deletion Handler
  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      let endpoint = `${API_BASE_URL}/${id}`;
      if (type === "frames") endpoint = `${API_BASE_URL}/frames/${id}`;
      if (type === "lenses") endpoint = `${API_BASE_URL}/lenses/${id}`;

      const response = await fetchWithCredentials(endpoint, { method: "DELETE" });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Unauthorized: You must be logged in as an administrator.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Delete failed");

      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatCurrency = (n) => `₱${Number(n || 0).toFixed(2)}`;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Inventory Management</h2>
          <p className="text-sm text-stone-600">
            Track medication stock, frames, lenses, and replenishment schedules.
          </p>
        </div>
        <button
          onClick={() => openCreateModal("inventory")}
          className="flex items-center gap-2 bg-[#8B1E42] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#731836] transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </button>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

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

        <button
          onClick={fetchData}
          className="p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-[#E2D6C7] transition"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Stats */}
      {(activeTab === "inventory" || activeTab === "low-stock") && !loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Total SKUs"
            value={items.length}
            icon={<Warehouse className="w-5 h-5 text-[#8B1E42]" />}
            accent="Stock records in catalog"
          />
          <StatCard
            title="Low Stock Alerts"
            value={summary.lowStock}
            icon={<AlertTriangle className="w-5 h-5 text-amber-700" />}
            accent="Items at or below reorder level"
          />
          <StatCard
            title="Stock Value"
            value={formatCurrency(summary.stockValue)}
            icon={<CircleDollarSign className="w-5 h-5 text-emerald-700" />}
            accent={`Retail value: ${formatCurrency(summary.retailValue)}`}
          />
        </div>
      )}

      {/* Table Card */}
      <section className="bg-[#F8F3EC] border border-[#DCD0C0] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EBE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2]">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {TAB_DEFS.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {filteredItems.length} record{filteredItems.length === 1 ? "" : "s"} loaded
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search SKU, brand, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#F2EAE1] border border-[#DCD0C0] rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E42]/20 focus:border-[#8B1E42] w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex items-center justify-center gap-3 text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B1E42]" />
              <span className="text-sm font-medium">Fetching inventory records...</span>
            </div>
          ) : error ? (
            <div className="p-10 text-center bg-rose-50/50">
              <AlertCircle className="w-6 h-6 mx-auto text-rose-600" />
              <p className="mt-2 font-semibold text-rose-800">Failed to load data</p>
              <p className="text-xs text-stone-600 mt-1">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-[#8B1E42] text-white rounded-xl text-xs font-semibold hover:bg-[#731836] transition shadow-sm"
              >
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-14 text-center text-stone-500">
              <Boxes className="w-8 h-8 mx-auto text-stone-300" />
              <p className="mt-3 text-sm font-medium">No records found.</p>
              <p className="text-xs text-stone-400 mt-1">Try a different tab or clear your search.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-[#F2EAE1]/80 text-xs uppercase text-stone-500 tracking-wider border-b border-[#EBE3D8] font-semibold">
                <tr>
                  {activeTab === "frames" && (
                    <>
                      <th className="px-6 py-3.5">Brand / Model</th>
                      <th className="px-6 py-3.5">Color</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Material</th>
                      <th className="px-6 py-3.5">Gender</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </>
                  )}
                  {activeTab === "lenses" && (
                    <>
                      <th className="px-6 py-3.5">Brand</th>
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Material</th>
                      <th className="px-6 py-3.5">Coating</th>
                      <th className="px-6 py-3.5">Index</th>
                      <th className="px-6 py-3.5">Sphere Range</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </>
                  )}
                  {(activeTab === "inventory" || activeTab === "low-stock") && (
                    <>
                      <th className="px-6 py-3.5">SKU</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Details</th>
                      <th className="px-6 py-3.5">Quantity</th>
                      <th className="px-6 py-3.5">Reorder Level</th>
                      <th className="px-6 py-3.5">Unit Cost</th>
                      <th className="px-6 py-3.5">Selling Price</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D8]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F2EAE1]/50 transition-colors">
                    {activeTab === "frames" && (
                      <>
                        <td className="px-6 py-4">
                          <div className="font-bold text-stone-900">{item.brand}</div>
                          <div className="text-xs text-stone-500">{item.model_number}</div>
                        </td>
                        <td className="px-6 py-4">{item.color || "-"}</td>
                        <td className="px-6 py-4 capitalize">{item.frame_type || "-"}</td>
                        <td className="px-6 py-4">{item.material || "-"}</td>
                        <td className="px-6 py-4 capitalize">{item.gender || "unisex"}</td>
                        <td className="px-6 py-4 text-right">
                          <DeleteButton onClick={() => handleDelete(item.id, "frames")} />
                        </td>
                      </>
                    )}

                    {activeTab === "lenses" && (
                      <>
                        <td className="px-6 py-4 font-bold text-stone-900">{item.brand}</td>
                        <td className="px-6 py-4">{item.lens_type}</td>
                        <td className="px-6 py-4">{item.material}</td>
                        <td className="px-6 py-4">{item.coating || "-"}</td>
                        <td className="px-6 py-4">{item.index_value || "-"}</td>
                        <td className="px-6 py-4">
                          {item.min_sphere && item.max_sphere
                            ? `${item.min_sphere} to ${item.max_sphere}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DeleteButton onClick={() => handleDelete(item.id, "lenses")} />
                        </td>
                      </>
                    )}

                    {(activeTab === "inventory" || activeTab === "low-stock") && (
                      <>
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-stone-900">{item.sku}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-[#E8DDD0] px-2.5 py-1 rounded-full capitalize">
                            <Layers className="w-3 h-3 text-[#8B1E42]" />
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-stone-700">
                          {item.frame && `${item.frame.brand} ${item.frame.model_number}`}
                          {item.lens && `${item.lens.brand} ${item.lens.lens_type}`}
                          {!item.frame && !item.lens && "Accessory"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              Number(item.quantity) <= Number(item.reorder_level)
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-emerald-100/70 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {Number(item.quantity) <= Number(item.reorder_level) && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {Number(item.quantity).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{Number(item.reorder_level).toLocaleString()}</td>
                        <td className="px-6 py-4 text-stone-600">{formatCurrency(item.unit_cost)}</td>
                        <td className="px-6 py-4 font-semibold text-stone-900">
                          {formatCurrency(item.selling_price)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setNewQuantity(String(item.quantity));
                              setIsStockModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8B1E42] bg-[#8B1E42]/10 hover:bg-[#8B1E42] hover:text-white transition mr-2"
                          >
                            <PencilLine className="w-3.5 h-3.5" />
                            Adjust Stock
                          </button>
                          <DeleteButton onClick={() => handleDelete(item.id, "inventory")} />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal: Adjust Stock */}
      {isStockModalOpen && selectedItem && (
        <ModalLayer>
          <ModalHeader
            title="Adjust Stock"
            subtitle={`SKU: ${selectedItem.sku}`}
            onClose={() => {
              setIsStockModalOpen(false);
              setSelectedItem(null);
            }}
          />

          <form onSubmit={handleAdjustStock} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                New Quantity
              </label>
              <input
                type="number"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                required
                className={inputClass}
              />
              <p className="text-xs text-stone-500 mt-1.5">
                Current stock: <strong className="text-stone-800">{selectedItem.quantity}</strong>
              </p>
            </div>

            <ModalActions
              onCancel={() => {
                setIsStockModalOpen(false);
                setSelectedItem(null);
              }}
              submitLabel="Save Adjustment"
              submittingLabel="Saving..."
              submitting={false}
            />
          </form>
        </ModalLayer>
      )}

      {/* Modal: Create Item */}
      {isCreateModalOpen && (
        <ModalLayer>
          <ModalHeader
            title="Create Item"
            subtitle="Register a new inventory record or catalog reference."
            onClose={() => setIsCreateModalOpen(false)}
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Register As
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "inventory", label: "Inventory Item", icon: Layers },
                { id: "frame", label: "Frame Reference", icon: Glasses },
                { id: "lens", label: "Lens Reference", icon: Aperture },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = createType === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => resetForms(opt.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                      isActive
                        ? "bg-[#8B1E42] text-white border-[#8B1E42] shadow-sm"
                        : "bg-[#F2EAE1] text-stone-700 border-[#DCD0C0] hover:bg-white/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-5">
            {createType === "frame" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Brand" required>
                  <input
                    placeholder="Brand (e.g. Ray-Ban) *"
                    value={frameForm.brand}
                    onChange={(e) => setFrameForm({ ...frameForm, brand: e.target.value })}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Model Number" required>
                  <input
                    placeholder="Model Number *"
                    value={frameForm.modelNumber}
                    onChange={(e) => setFrameForm({ ...frameForm, modelNumber: e.target.value })}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Color">
                  <input
                    placeholder="Color"
                    value={frameForm.color}
                    onChange={(e) => setFrameForm({ ...frameForm, color: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Frame Type">
                  <input
                    placeholder="e.g. Round, Square"
                    value={frameForm.frameType}
                    onChange={(e) => setFrameForm({ ...frameForm, frameType: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Material">
                  <input
                    placeholder="e.g. Acetate, Titanium"
                    value={frameForm.material}
                    onChange={(e) => setFrameForm({ ...frameForm, material: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Gender">
                  <select
                    value={frameForm.gender}
                    onChange={(e) => setFrameForm({ ...frameForm, gender: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                  </select>
                </Field>
              </div>
            )}

            {createType === "lens" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Brand" required>
                  <input
                    placeholder="Brand *"
                    value={lensForm.brand}
                    onChange={(e) => setLensForm({ ...lensForm, brand: e.target.value })}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Lens Type" required>
                  <input
                    placeholder="e.g. Single Vision *"
                    value={lensForm.lensType}
                    onChange={(e) => setLensForm({ ...lensForm, lensType: e.target.value })}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Material" required>
                  <input
                    placeholder="e.g. Polycarbonate *"
                    value={lensForm.material}
                    onChange={(e) => setLensForm({ ...lensForm, material: e.target.value })}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Coating">
                  <input
                    placeholder="e.g. Anti-glare"
                    value={lensForm.coating}
                    onChange={(e) => setLensForm({ ...lensForm, coating: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Index Value">
                  <input
                    placeholder="e.g. 1.67"
                    value={lensForm.indexValue}
                    onChange={(e) => setLensForm({ ...lensForm, indexValue: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            {createType === "inventory" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="SKU" required>
                  <input
                    placeholder="SKU *"
                    value={inventoryForm.sku}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, sku: e.target.value })}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={inventoryForm.category}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="frame">Frame</option>
                    <option value="lens">Lens</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </Field>

                {inventoryForm.category === "frame" && (
                  <Field label="Frame Reference" required>
                    <select
                      value={inventoryForm.frameId}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, frameId: e.target.value })}
                      required
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">
                        {catalogLoading ? "Loading frames..." : "Select a frame..."}
                      </option>
                      {framesList.map((f) => (
                        <option key={f.id} value={f.id}>
                          #{f.id} · {f.brand} {f.model_number}
                        </option>
                      ))}
                    </select>
                    {!catalogLoading && framesList.length === 0 && (
                      <p className="text-xs text-amber-700 bg-amber-100/50 border border-amber-200 rounded-xl px-3 py-2 mt-1.5">
                        No frame references available yet. Register one first in the Frames Catalog tab.
                      </p>
                    )}
                  </Field>
                )}

                {inventoryForm.category === "lens" && (
                  <Field label="Lens Reference" required>
                    <select
                      value={inventoryForm.lensId}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, lensId: e.target.value })}
                      required
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">
                        {catalogLoading ? "Loading lenses..." : "Select a lens..."}
                      </option>
                      {lensesList.map((l) => (
                        <option key={l.id} value={l.id}>
                          #{l.id} · {l.brand} {l.lens_type}
                        </option>
                      ))}
                    </select>
                    {!catalogLoading && lensesList.length === 0 && (
                      <p className="text-xs text-amber-700 bg-amber-100/50 border border-amber-200 rounded-xl px-3 py-2 mt-1.5">
                        No lens references available yet. Register one first in the Lenses Catalog tab.
                      </p>
                    )}
                  </Field>
                )}

                <Field label="Initial Quantity">
                  <input
                    placeholder="Initial Quantity"
                    type="number"
                    min="0"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Reorder Level">
                  <input
                    placeholder="Reorder Level"
                    type="number"
                    min="0"
                    value={inventoryForm.reorderLevel}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, reorderLevel: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Unit Cost">
                  <input
                    placeholder="Unit Cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={inventoryForm.unitCost}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unitCost: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Selling Price">
                  <input
                    placeholder="Selling Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={inventoryForm.sellingPrice}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, sellingPrice: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            <ModalActions
              onCancel={() => setIsCreateModalOpen(false)}
              submitLabel="Create Item"
              submittingLabel="Creating..."
              submitting={submitting}
            />
          </form>
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

function DeleteButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 rounded-xl transition"
      title="Delete"
    >
      <Trash2 className="w-4 h-4" />
    </button>
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

function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, submitLabel, submittingLabel, submitting = false }) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EBE3D8]">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-[#E2D6C7] transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B1E42] text-white hover:bg-[#731836] shadow-sm transition disabled:opacity-50"
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </div>
  );
}