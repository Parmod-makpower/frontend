import { useEffect, useState } from "react";
import { submitDealerList } from "../../api/punchApi";

export default function DealerFormPage() {
  const [dealerList, setDealerList] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dealers_list");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    dealer_name: "",
    shop_name: "",
    mobile: "",
    block: "",
    district: "",
  });

  useEffect(() => {
    localStorage.setItem("crm_dealers_list", JSON.stringify(dealerList));
  }, [dealerList]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleAddDealer = () => {
    if (!form.dealer_name.trim()) return alert("Dealer name required");
    if (!form.mobile.trim()) return alert("Mobile number required");

    const newDealer = {
      id: Date.now(),
      ...form,
    };

    setDealerList((prev) => [...prev, newDealer]);

    setForm({
      dealer_name: "",
      shop_name: "",
      mobile: "",
      block: "",
      district: "",
    });
  };

  const handleDelete = (id) => {
    setDealerList((prev) => prev.filter((d) => d.id !== id));
  };

  // ===========================
  // SUBMIT TO GOOGLE SHEET
  // ===========================
  const handleSubmitDealers = async () => {
    if (dealerList.length === 0) return alert("No dealers to submit");

    setLoading(true);
    try {
      const res = await submitDealerList(dealerList);

      alert("Submitted successfully!");

      localStorage.removeItem("crm_dealers_list");
      setDealerList([]);
    } catch (err) {
      console.log(err);
      alert("Submit failed");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto px-3 pb-24">
      <div className="grid grid-cols-12 gap-4 pt-[60px] sm:pt-2">

        {/* LEFT FORM */}
        <div className="col-span-12 sm:col-span-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-4">

          <input
            type="text"
            placeholder="Dealer Name"
            value={form.dealer_name}
            onChange={(e) => handleChange("dealer_name", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="Shop Name"
            value={form.shop_name}
            onChange={(e) => handleChange("shop_name", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="Mobile"
            maxLength={10}
            inputMode="numeric"
            value={form.mobile}
            onChange={(e) =>
              handleChange("mobile", e.target.value.replace(/[^0-9]/g, ""))
            }
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="Block"
            value={form.block}
            onChange={(e) => handleChange("block", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            placeholder="District"
            value={form.district}
            onChange={(e) => handleChange("district", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />

          <button
            onClick={handleAddDealer}
            className="w-full bg-green-600 text-white py-2 rounded shadow hover:bg-green-700"
          >
            Add Dealer
          </button>
        </div>

        {/* RIGHT TABLE */}
        <div className="col-span-12 sm:col-span-8 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Dealer List</h2>

          {dealerList.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              No dealers added yet.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="p-2 border">Dealer</th>
                      <th className="p-2 border">Shop</th>
                      <th className="p-2 border">Mobile</th>
                      <th className="p-2 border">Block</th>
                      <th className="p-2 border">District</th>
                      <th className="p-2 border text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dealerList.map((d) => (
                      <tr key={d.id} className="odd:bg-white even:bg-gray-50">
                        <td className="p-2 border">{d.dealer_name}</td>
                        <td className="p-2 border">{d.shop_name}</td>
                        <td className="p-2 border">{d.mobile}</td>
                        <td className="p-2 border">{d.block}</td>
                        <td className="p-2 border">{d.district}</td>
                        <td className="p-2 border text-center">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleSubmitDealers}
                disabled={loading}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 flex justify-center"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Submit All Dealers"
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
