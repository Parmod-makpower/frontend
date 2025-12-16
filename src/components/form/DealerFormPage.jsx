import { useEffect, useState } from "react";
import { submitDealerList } from "../../api/punchApi";
import logo from "../../assets/images/logo.png";
import { useCachedSSUsersDealers } from "../../auth/useSS";

export default function DealerFormPage() {
  /* ===================== STATE ===================== */
  const [special, setSpecial] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_special_fields");
      return saved
        ? JSON.parse(saved)
        : {
          your_name: "",
          designation: "",
          super_stockist_name: "",
          super_stockist_crm: "",
          distributor_name: "",
        };
    } catch {
      return {
        your_name: "",
        designation: "",
        super_stockist_name: "",
        distributor_name: "",
      };
    }
  });
  const {
    data: ssList = [],
  } = useCachedSSUsersDealers();

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
    pin_code: "",
    quantity: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [ssQuery, setSsQuery] = useState("");
  const [showSSDropdown, setShowSSDropdown] = useState(false);
  const filteredSS = ssList.filter(ss =>
    ss.party_name?.toLowerCase().includes(ssQuery.toLowerCase()) ||
    ss.name?.toLowerCase().includes(ssQuery.toLowerCase())
  );


  /* ===================== EFFECTS ===================== */
  useEffect(() => {
    localStorage.setItem("crm_special_fields", JSON.stringify(special));
  }, [special]);

  useEffect(() => {
    localStorage.setItem("crm_dealers_list", JSON.stringify(dealerList));
  }, [dealerList]);

  /* ===================== HANDLERS ===================== */
  const handleChange = (key, value) => {
    if (key === "mobile") value = value.replace(/[^0-9]/g, "").slice(0, 10);
    if (key === "pin_code") value = value.replace(/[^0-9]/g, "").slice(0, 6);
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const handleSpecialChange = (key, value) => {
    setSpecial({ ...special, [key]: value });
  };

  /* ===================== VALIDATION ===================== */
  const validateForm = () => {
    const newErrors = {};

    if (!form.dealer_name.trim()) newErrors.dealer_name = "Dealer Name required";
    if (!form.shop_name.trim()) newErrors.shop_name = "Shop Name required";

    if (!form.mobile) newErrors.mobile = "Mobile required";
    else if (form.mobile.length !== 10) newErrors.mobile = "10 digit mobile required";

    if (!form.block.trim()) newErrors.block = "Block required";
    if (!form.district.trim()) newErrors.district = "District required";

    if (!form.pin_code) newErrors.pin_code = "Pin Code required";
    else if (form.pin_code.length !== 6) newErrors.pin_code = "6 digit Pin Code";

    if (!form.quantity) newErrors.quantity = "Quantity required";
    else if (+form.quantity <= 0) newErrors.quantity = "Quantity > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===================== ACTIONS ===================== */
  const handleAddDealer = () => {
    if (!validateForm()) return;

    const newDealer = {
      id: Date.now(),
      ...special,
      ...form,
    };

    setDealerList([...dealerList, newDealer]);
    setForm({
      dealer_name: "",
      shop_name: "",
      mobile: "",
      block: "",
      district: "",
      pin_code: "",
      quantity: "",
    });
  };

  const handleDelete = (id) => {
    setDealerList(dealerList.filter((d) => d.id !== id));
  };

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

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* HEADER */}
      <div className="flex justify-center items-center py-3 bg-orange-100 shadow ">
        <img src={logo} alt="Logo" className="h-10 sm:h-14 object-contain" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 py-3">
        {/* LEFT FORM */}
        <div className="col-span-12 md:col-span-4 bg-white rounded shadow p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Special Details</h2>

          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Your Name"
              value={special.your_name}
              onChange={(e) => handleSpecialChange("your_name", e.target.value)}
              className="input"
            />

            <select
              value={special.designation}
              onChange={(e) => handleSpecialChange("designation", e.target.value)}
              className="input"
            >
              <option value="">Select Designation</option>
              <option value="State Head">State Head</option>
              <option value="ASM">ASM</option>
              <option value="TSM">TSM</option>
            </select>

            <div className="relative col-span-2">
              <input
                placeholder="Search Super Stockist"
                value={special.super_stockist_name || ssQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSsQuery(val);
                  handleSpecialChange("super_stockist_name", val); // ✅ localStorage sync
                  setShowSSDropdown(true);
                }}
                onFocus={() => setShowSSDropdown(true)}
                className="input"
              />


              {showSSDropdown && ssQuery && (
                <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow max-h-40 overflow-y-auto">
                  {filteredSS.length ? (
                    filteredSS.map((ss) => (
                      <div
                        key={ss.id}
                        onClick={() => {
  setSsQuery(ss.party_name);
  setShowSSDropdown(false);

  setSpecial({
    ...special,
    super_stockist_name: ss.party_name,
    super_stockist_crm: ss.crm_name,   // ✅ NEW
  });
}}


                        className="px-2 py-1 text-xs cursor-pointer hover:bg-orange-100"
                      >
                        <div className="font-medium">{ss.party_name}</div>
                        <div className="text-[10px] text-gray-500">
                          CRM: {ss.crm_name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-xs text-gray-400">
                      No SS found
                    </div>
                  )}
                </div>
              )}
            </div>


            <input
              placeholder="Distributor Name"
              value={special.distributor_name}
              onChange={(e) => handleSpecialChange("distributor_name", e.target.value)}
              className="input"
            />
          </div>

          <h2 className="text-sm font-semibold text-gray-700 pt-2">Dealer Info</h2>

          <div className="grid grid-cols-1 gap-2">
            {[
              ["dealer_name", "Dealer Name"],
              ["shop_name", "Shop Name"],
              ["mobile", "Mobile"],
              ["block", "Block"],
              ["district", "District"],
              ["pin_code", "Pin Code"],
              ["quantity", "Quantity"],
            ].map(([key, label]) => (
              <div key={key}>
                <input
                  placeholder={label}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`input ${errors[key] ? "border-red-400" : ""}`}
                />
                {errors[key] && (
                  <p className="text-[10px] text-red-500 mt-0.5">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddDealer}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
          >
            + Add Dealer
          </button>
        </div>

        {/* RIGHT TABLE */}
        <div className="col-span-12 md:col-span-8 bg-white rounded shadow p-4">
          <h2 className="text-sm font-semibold mb-3">Dealer List</h2>

          {!dealerList.length ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              No dealers added yet
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-xs">
                  <thead className="bg-orange-50">
                    <tr>
                      {[
                        "Name",
                        "Designation",
                        "SS",
                        "CRM",
                        "Distributor",
                        "Dealer",
                        "Shop",
                        "Mobile",
                        "Pin",
                        "Qty",
                        "Action",
                      ].map((h) => (
                        <th key={h} className="border p-2">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {dealerList.map((d) => (
                      <tr key={d.id} className="odd:bg-white even:bg-gray-50">
                        <td className="border p-1">{d.your_name}</td>
                        <td className="border p-1">{d.designation}</td>
                        <td className="border p-1">{d.super_stockist_name}</td>
                        <td className="border p-1">{d.super_stockist_crm}</td> 
                        <td className="border p-1">{d.distributor_name}</td>
                        <td className="border p-1">{d.dealer_name}</td>
                        <td className="border p-1">{d.shop_name}</td>
                        <td className="border p-1">{d.mobile}</td>
                        <td className="border p-1">{d.pin_code}</td>
                        <td className="border p-1 text-center">{d.quantity}</td>
                        <td className="border p-1 text-center">
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="text-red-600 text-xs"
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
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm flex justify-center items-center"
              >
                {loading && (
                  <span className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Submit All Dealers
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tailwind helper */}
      <style>{`
        .input{
          width:100%;
          border:1px solid #d1d5db;
          border-radius:0.5rem;
          padding:0.45rem 0.6rem;
          font-size:0.75rem;
          outline:none;
        }
        .input:focus{border-color:#60a5fa}
      `}</style>
    </div>
  );
}
