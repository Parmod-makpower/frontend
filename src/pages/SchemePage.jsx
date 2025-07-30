import { useEffect, useState } from "react";
import {
  fetchSchemes,
  addScheme,
  updateScheme,
  deleteScheme as deleteSchemeAPI,
} from "../auth/useSchemes";
import { fetchFilteredProducts } from "../auth/useProducts";

export default function SchemePage() {
  const [schemes, setSchemes] = useState([]);
  const [formData, setFormData] = useState({
    scheme_name: "",
    scheme_type: "single",
    conditions: [{ product_id: "", quantity: "", search: "", suggestions: [] }],
    rewards: [{ product_id: "", quantity: "", search: "", suggestions: [] }],
  });
  const [formMode, setFormMode] = useState("add");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productMap, setProductMap] = useState({});

  useEffect(() => {
  loadSchemes();
  loadAllProducts(); // 👈 Add this line
}, []);
const loadAllProducts = async () => {
  let page = 1;
  let hasMore = true;
  const allProducts = [];

  while (hasMore) {
    const res = await fetchFilteredProducts("", page, 100);
    allProducts.push(...(res.results || []));
    hasMore = !!res.next;
    page++;
  }

  // Map बना लो
  const newMap = {};
  allProducts.forEach((p) => {
    newMap[p.product_id] = p.product_name;
  });

  setProductMap(newMap);
};


  const loadSchemes = async () => {
    setLoading(true);
    try {
      const data = await fetchSchemes();
      setSchemes(data);
    } catch (error) {
      console.error("Failed to load schemes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (id) => {
    return productMap[id] || `Product ${id}`;
  };

  const searchProduct = async (field, index, query) => {
    const res = await fetchFilteredProducts(query);
    const results = res.results || [];
    const updated = [...formData[field]];
    updated[index].search = query;
    updated[index].suggestions = results;
    setFormData({ ...formData, [field]: updated });

    // store in map for future quick access
    const newMap = {};
    results.forEach((p) => {
      newMap[p.product_id] = p.product_name;
    });
    setProductMap((prev) => ({ ...prev, ...newMap }));
  };

  const handleProductSelect = (field, index, product) => {
    const updated = [...formData[field]];
    updated[index].product_id = product.product_id;
    updated[index].search = product.product_name;
    updated[index].suggestions = [];
    setFormData({ ...formData, [field]: updated });

    setProductMap((prev) => ({
      ...prev,
      [product.product_id]: product.product_name,
    }));
  };

  const handleQuantityChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index].quantity = value;
    setFormData({ ...formData, [field]: updated });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRow = (field) => {
    setFormData({
      ...formData,
      [field]: [
        ...formData[field],
        { product_id: "", quantity: "", search: "", suggestions: [] },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      scheme_name: formData.scheme_name,
      scheme_type: formData.scheme_type,
      conditions: formData.conditions.map((c) => ({
        product_id: c.product_id,
        quantity: c.quantity,
      })),
      rewards: formData.rewards.map((r) => ({
        product_id: r.product_id,
        quantity: r.quantity,
      })),
    };

    try {
      if (formMode === "edit") {
        await updateScheme(editId, payload);
      } else {
        await addScheme(payload);
      }
      resetForm();
      loadSchemes();
    } catch (error) {
      console.error("Error submitting scheme:", error);
    }
  };

  const deleteScheme = async (id) => {
    if (!confirm("Are you sure you want to delete this scheme?")) return;
    try {
      await deleteSchemeAPI(id);
      loadSchemes();
    } catch (error) {
      console.error("Error deleting scheme:", error);
    }
  };

  const handleEdit = (scheme) => {
    setFormMode("edit");
    setEditId(scheme.id);
    setFormData({
      scheme_name: scheme.scheme_name,
      scheme_type: scheme.scheme_type,
      conditions: scheme.conditions.map((c) => ({
        ...c,
        search: getProductName(c.product_id),
        suggestions: [],
      })),
      rewards: scheme.rewards.map((r) => ({
        ...r,
        search: getProductName(r.product_id),
        suggestions: [],
      })),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormMode("add");
    setEditId(null);
    setFormData({
      scheme_name: "",
      scheme_type: "single",
      conditions: [{ product_id: "", quantity: "", search: "", suggestions: [] }],
      rewards: [{ product_id: "", quantity: "", search: "", suggestions: [] }],
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {formMode === "edit" ? "Edit Scheme" : "Add Scheme"}
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left - Schemes List */}
        <div className="md:w-1/2 bg-gray-50 p-4 rounded shadow max-h-[70vh] overflow-auto">
          <h3 className="font-semibold mb-3 text-lg">Available Schemes</h3>
          {loading ? (
            <p className="text-sm text-gray-600">Loading schemes...</p>
          ) : schemes.length === 0 ? (
            <p className="text-sm text-gray-600">No schemes available.</p>
          ) : (
            schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="border p-3 rounded mb-3 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium text-base">{scheme.scheme_name}</h4>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => handleEdit(scheme)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteScheme(scheme.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-700">
                  <p>
                    <strong>Type:</strong> {scheme.scheme_type}
                  </p>
                  <p>
                    <strong>Conditions:</strong>{" "}
                    {scheme.conditions
                      .map((c) => `${getProductName(c.product_id)} (${c.quantity})`)
                      .join(", ")}
                  </p>
                  <p>
                    <strong>Rewards:</strong>{" "}
                    {scheme.rewards
                      .map((r) => `${getProductName(r.product_id)} (${r.quantity})`)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right - Form */}
        <form
          onSubmit={handleSubmit}
          className="md:w-1/2 bg-white p-4 rounded shadow space-y-4 text-sm"
        >
          <div>
            <label className="block font-semibold mb-1">Scheme Name</label>
            <input
              type="text"
              name="scheme_name"
              value={formData.scheme_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded text-sm"
              style={{ fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Scheme Type</label>
            <select
              name="scheme_type"
              value={formData.scheme_type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded text-sm"
              style={{ fontSize: "0.85rem" }}
            >
              <option value="single">Single</option>
              <option value="combo">Combo</option>
            </select>
          </div>
          {/* Conditions */}
          <div>
            <label className="block font-semibold mb-2">Conditions</label>
            {formData.conditions.map((item, i) => (
              <div key={i} className="mb-3 relative">
                <input
                  type="text"
                  value={item.search}
                  onChange={(e) => searchProduct("conditions", i, e.target.value)}
                  placeholder="Search product"
                  className="border border-gray-300 p-2 rounded w-full text-sm"
                  style={{ fontSize: "0.85rem" }}
                />
                {item.suggestions.length > 0 && (
                  <ul className="absolute z-20 bg-white border border-gray-300 rounded w-full max-h-36 overflow-auto text-sm">
                    {item.suggestions.map((product, idx) => (
                      <li
                        key={`${product.product_id}-${idx}`}
                        onClick={() => handleProductSelect("conditions", i, product)}
                        className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                      >
                        {product.product_name}
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange("conditions", i, e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full mt-1 text-sm"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddRow("conditions")}
              className="text-blue-600 text-xs hover:underline"
            >
              + Add Condition
            </button>
          </div>

          {/* Rewards */}
          <div>
            <label className="block font-semibold mb-2">Rewards</label>
            {formData.rewards.map((item, i) => (
              <div key={i} className="mb-3 relative">
                <input
                  type="text"
                  value={item.search}
                  onChange={(e) => searchProduct("rewards", i, e.target.value)}
                  placeholder="Search product"
                  className="border border-gray-300 p-2 rounded w-full text-sm"
                  style={{ fontSize: "0.85rem" }}
                />
                {item.suggestions.length > 0 && (
                  <ul className="absolute z-20 bg-white border border-gray-300 rounded w-full max-h-36 overflow-auto text-sm">
                    {item.suggestions.map((product, idx) => (
                      <li
                        key={`${product.product_id}-${idx}`}
                        onClick={() => handleProductSelect("rewards", i, product)}
                        className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
                      >
                        {product.product_name}
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange("rewards", i, e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full mt-1 text-sm"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddRow("rewards")}
              className="text-blue-600 text-xs hover:underline"
            >
              + Add Reward
            </button>
          </div>


          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
              style={{ fontSize: "0.85rem" }}
            >
              {formMode === "edit" ? "Update Scheme" : "Submit Scheme"}
            </button>
            {formMode === "edit" && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                style={{ fontSize: "0.85rem" }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
