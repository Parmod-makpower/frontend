// ✅ SchemeForm.jsx
import { useState, useEffect } from "react";
import { useAddScheme, useUpdateScheme, useSchemes } from "../hooks/useSchemes";
import ProductSearchSelect from "../components/ProductSearchSelect";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus, FaEdit, FaGift, FaCheck, FaTimes } from "react-icons/fa";

export default function SchemeForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const addScheme = useAddScheme();
  const updateScheme = useUpdateScheme();
  const { data: schemes = [] } = useSchemes();

  const editingScheme = id ? schemes.find(s => s.id === parseInt(id)) : null;
  const isEdit = !!editingScheme;

  const [conditions, setConditions] = useState([]);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    if (isEdit && editingScheme) {
      setConditions(
        editingScheme.conditions.map(c => ({
          product_id: c.product,
          min_quantity: c.min_quantity,
        }))
      );
      setRewards(
        editingScheme.rewards.map(r => ({
          product_id: r.product,
          quantity: r.quantity,
        }))
      );
    }
  }, [isEdit, editingScheme]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      created_by: user.user_id,
      conditions: conditions.map(c => ({
        product: parseInt(c.product_id),
        min_quantity: parseInt(c.min_quantity),
      })),
      rewards: rewards.map(r => ({
        product: parseInt(r.product_id),
        quantity: parseInt(r.quantity),
      })),
    };

    const onSuccess = () => navigate("/schemes");

    isEdit
      ? updateScheme.mutate({ id: editingScheme.id, updatedData: payload }, { onSuccess })
      : addScheme.mutate(payload, { onSuccess });
  };

  const addCondition = () =>
    setConditions([...conditions, { product_id: "", min_quantity: "" }]);

  const addReward = () =>
    setRewards([...rewards, { product_id: "", quantity: "" }]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-700 mb-6">
        {isEdit ? <FaEdit /> : <FaPlus />} {isEdit ? "Edit Scheme" : "Create New Scheme"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Conditions Section */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <FaCheck className="text-green-600" /> Conditions
            </h3>
            <button
              type="button"
              onClick={addCondition}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FaPlus /> Add Condition
            </button>
          </div>
          {conditions.map((c, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <ProductSearchSelect
                value={c.product_id}
                onChange={(val) =>
                  setConditions(conditions.map((item, idx) =>
                    idx === i ? { ...item, product_id: val } : item
                  ))
                }
              />
              <input
                type="number"
                placeholder="Min Quantity"
                value={c.min_quantity}
                onChange={(e) =>
                  setConditions(conditions.map((item, idx) =>
                    idx === i ? { ...item, min_quantity: e.target.value } : item
                  ))
                }
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:border-blue-500"
                required
              />
            </div>
          ))}
        </section>

        {/* Rewards Section */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <FaGift className="text-purple-600" /> Rewards
            </h3>
            <button
              type="button"
              onClick={addReward}
              className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
            >
              <FaPlus /> Add Reward
            </button>
          </div>
          {rewards.map((r, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <ProductSearchSelect
                value={r.product_id}
                onChange={(val) =>
                  setRewards(rewards.map((item, idx) =>
                    idx === i ? { ...item, product_id: val } : item
                  ))
                }
              />
              <input
                type="number"
                placeholder="Reward Quantity"
                value={r.quantity}
                onChange={(e) =>
                  setRewards(rewards.map((item, idx) =>
                    idx === i ? { ...item, quantity: e.target.value } : item
                  ))
                }
                className="border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:border-blue-500"
                required
              />
            </div>
          ))}
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/schemes")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded flex items-center gap-2"
          >
            <FaTimes /> Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaCheck /> {isEdit ? "Update" : "Create"} Scheme
          </button>
        </div>
      </form>
    </div>
  );
}
