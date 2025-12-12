import { useEffect, useState } from "react";
import { submitDealerList } from "../../api/punchApi";
import logo from "../../assets/images/logo.png";

export default function DealerFormPage() {
  const [special, setSpecial] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_special_fields");
      return saved
        ? JSON.parse(saved)
        : { your_name: "", super_stockist_name: "", distributor_name: "" };
    } catch {
      return { your_name: "", super_stockist_name: "", distributor_name: "" };
    }
  });

  const [dealerList, setDealerList] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_dealers_list");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    dealer_name: "",
    shop_name: "",
    mobile: "",
    block: "",
    district: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("crm_special_fields", JSON.stringify(special));
  }, [special]);

  useEffect(() => {
    localStorage.setItem("crm_dealers_list", JSON.stringify(dealerList));
  }, [dealerList]);

  const handleChange = (key, value) => {
    if (key === "mobile") value = value.replace(/[^0-9]/g, "").slice(0, 10);
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const handleSpecialChange = (key, value) => {
    setSpecial({ ...special, [key]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.dealer_name.trim()) newErrors.dealer_name = "Dealer Name is required";
    if (!form.shop_name.trim()) newErrors.shop_name = "Shop Name is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile is required";
    else if (form.mobile.length < 10) newErrors.mobile = "Mobile must be 10 digits";
    if (!form.block.trim()) newErrors.block = "Block is required";
    if (!form.district.trim()) newErrors.district = "District is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDealer = () => {
    if (!validateForm()) return;

    const newDealer = { id: Date.now(), ...form, ...special };
    setDealerList([...dealerList, newDealer]);
    setForm({ dealer_name: "", shop_name: "", mobile: "", block: "", district: "" });
  };

  const handleDelete = (id) => setDealerList(dealerList.filter((d) => d.id !== id));

  const handleSubmitDealers = async () => {
    if (!dealerList.length) return alert("No dealers to submit");
    setLoading(true);
    try {
      await submitDealerList(dealerList);
      alert("Submitted successfully!");
      setDealerList([]);
      localStorage.removeItem("crm_dealers_list");
    } catch {
      alert("Submit failed");
    }
    setLoading(false);
  };

  return (
    <div className=" mx-auto  pb-20 bg-white">
      {/* Logo */}
      <div className="flex justify-center bg-orange-100 py-3">
        <img src={logo} alt="Logo" className="h-10 sm:h-14 object-contain drop-shadow-md" />
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* LEFT FORM */}
        <div className="col-span-12 sm:col-span-4 bg-yellow-50 p-4 shado space-y-3">
          <h2 className="text-md font-semibold mb-1">Special Fields</h2>
          <div className="space-y-2">
            <div className="flex gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Full Name</label>
              <input
                placeholder="Your Name"
                value={special.your_name}
                onChange={(e) => handleSpecialChange("your_name", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">SS Name</label>
              <input
                placeholder="Super Stockist Name"
                value={special.super_stockist_name}
                onChange={(e) => handleSpecialChange("super_stockist_name", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-300"
              />
            </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Distributor Name</label>
              <input
                placeholder="Distributor Name"
                value={special.distributor_name}
                onChange={(e) => handleSpecialChange("distributor_name", e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-300"
              />
            </div>
          </div>

          <h2 className="text-md font-semibold mt-3 mb-1">Dealer Info</h2>
          <div className="space-y-2">
            {[
              { key: "dealer_name", label: "Dealer Name", type: "text" },
              { key: "shop_name", label: "Shop Name", type: "text" },
              { key: "mobile", label: "Mobile", type: "tel" },
              { key: "block", label: "Block", type: "text" },
              { key: "district", label: "District", type: "text" },
            ].map((field) => (
              <div key={field.key} className="col-2">
                <label className="block text-xs font-medium mb-1">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.label}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  maxLength={field.key === "mobile" ? 10 : undefined}
                  className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 ${
                    errors[field.key] ? "focus:ring-red-400 border-red-400" : "focus:ring-blue-300"
                  }`}
                />
                {errors[field.key] && (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddDealer}
            className="w-full bg-green-600 text-white py-1.5 rounded shadow hover:bg-green-700 text-sm mt-2 transition"
          >
            Add Dealer
          </button>
        </div>

        {/* RIGHT TABLE */}
        <div className="col-span-12 sm:col-span-8 bg-white p-4 ">
          <h2 className="text-md font-semibold mb-2">Dealer List</h2>
          {!dealerList.length ? (
            <div className="text-gray-500 text-center py-10 text-sm">No dealers added yet.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm text-xs sm:text-sm">
                  <thead className="bg-orange-50">
                    <tr>
                      {["Your Name", "SS", "Distributor", "Dealer", "Shop", "Mobile", "Block", "District",  "Action"].map((head) => (
                        <th key={head} className="p-2 border text-[10px] sm:text-xs">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dealerList.map((d) => (
                      <tr key={d.id} className="odd:bg-white even:bg-gray-50 text-[10px] sm:text-xs">
                         <td className="p-1 border">{d.your_name}</td>
                        <td className="p-1 border">{d.super_stockist_name}</td>
                        <td className="p-1 border">{d.distributor_name}</td>
                        <td className="p-1 border">{d.dealer_name}</td>
                        <td className="p-1 border">{d.shop_name}</td>
                        <td className="p-1 border">{d.mobile}</td>
                        <td className="p-1 border">{d.block}</td>
                        <td className="p-1 border">{d.district}</td>
                        <td className="p-1 border text-center">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="text-red-600 hover:underline text-xs"
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
                className="mt-3 w-full bg-blue-600 text-white py-1.5 rounded shadow hover:bg-blue-700 flex justify-center items-center text-sm transition"
              >
                {loading && (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                )}
                Submit All Dealers
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
