// ✅ Updated SchemeForm.jsx - Separate Page + Auto Created_By from Context
import { useState, useEffect } from "react";
import { useAddScheme, useUpdateScheme } from "../hooks/useSchemes";
import ProductSearchSelect from "../components/ProductSearchSelect";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useSchemes } from "../hooks/useSchemes";

export default function SchemeForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode

  const addScheme = useAddScheme();
  const updateScheme = useUpdateScheme();
  const { data: schemes = [] } = useSchemes();

  const editingScheme = id
    ? schemes.find((scheme) => scheme.id === parseInt(id))
    : null;

  const isEdit = !!editingScheme;

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [conditions, setConditions] = useState([]);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    if (isEdit && editingScheme) {
      setName(editingScheme.name);
      setStartDate(editingScheme.start_date);
      setEndDate(editingScheme.end_date);
      setConditions(
        editingScheme.conditions.map((c) => ({
          product_id: c.product,
          min_quantity: c.min_quantity,
        }))
      );
      setRewards(
        editingScheme.rewards.map((r) => ({
          product_id: r.product,
          quantity: r.quantity,
        }))
      );
    }
  }, [isEdit, editingScheme]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name,
      start_date: startDate,
      end_date: endDate,
      created_by: user.user_id, // ✅ Auto from context
      conditions: conditions.map((c) => ({
        product: parseInt(c.product_id),
        min_quantity: parseInt(c.min_quantity),
      })),
      rewards: rewards.map((r) => ({
        product: parseInt(r.product_id),
        quantity: parseInt(r.quantity),
      })),
    };

    if (isEdit) {
      updateScheme.mutate(
        { id: editingScheme.id, updatedData: payload },
        { onSuccess: () => navigate("/schemes") }
      );
    } else {
      addScheme.mutate(payload, {
        onSuccess: () => navigate("/schemes"),
      });
    }
  };

  const addCondition = () =>
    setConditions([...conditions, { product_id: "", min_quantity: "" }]);

  const addReward = () =>
    setRewards([...rewards, { product_id: "", quantity: "" }]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? "✏ Edit Scheme" : "➕ New Scheme"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Scheme Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </div>

        {/* Conditions */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold">Conditions</label>
            <button
              type="button"
              onClick={addCondition}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              + Add
            </button>
          </div>
          {conditions.map((c, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <ProductSearchSelect
                value={c.product_id}
                onChange={(val) =>
                  setConditions(
                    conditions.map((item, idx) =>
                      idx === i ? { ...item, product_id: val } : item
                    )
                  )
                }
              />
              <input
                type="number"
                placeholder="Min Quantity"
                value={c.min_quantity}
                onChange={(e) =>
                  setConditions(
                    conditions.map((item, idx) =>
                      idx === i
                        ? { ...item, min_quantity: e.target.value }
                        : item
                    )
                  )
                }
                className="border p-2 rounded"
                required
              />
            </div>
          ))}
        </div>

        {/* Rewards */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="font-semibold">Rewards</label>
            <button
              type="button"
              onClick={addReward}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              + Add
            </button>
          </div>
          {rewards.map((r, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <ProductSearchSelect
                value={r.product_id}
                onChange={(val) =>
                  setRewards(
                    rewards.map((item, idx) =>
                      idx === i ? { ...item, product_id: val } : item
                    )
                  )
                }
              />
              <input
                type="number"
                placeholder="Reward Quantity"
                value={r.quantity}
                onChange={(e) =>
                  setRewards(
                    rewards.map((item, idx) =>
                      idx === i ? { ...item, quantity: e.target.value } : item
                    )
                  )
                }
                className="border p-2 rounded"
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => navigate("/schemes")}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            {isEdit ? "Update" : "Create"} Scheme
          </button>
        </div>
      </form>
    </div>
  );
}
