import { useState } from "react";
import { createSSUser, updateSSUser } from "../../auth/useSS";
import { useCachedSSUsers } from "../../auth/useSS";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useQueryClient } from "@tanstack/react-query";

export default function AddNewUser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const editData = location.state?.editData || null;
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useCachedSSUsers();

  const crmUsers = allUsers.filter((u) => u.role === "CRM");
  const ssUsers = allUsers.filter((u) => u.role === "SS");

  const [form, setForm] = useState(
    editData || {
      id: null,
      name: "",
      mobile: "",
      password: "",
      party_name: "",
      role: "",
      crm: "",
      ss: "",
    }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return value === ""; // numbers / select fields
};


  const extractErrors = (err) => {
    const response = err.response?.data;
    if (!response) return { non_field_errors: ["Something went wrong."] };

    const formatted = {};
    for (let key in response) {
      formatted[key] = Array.isArray(response[key])
        ? response[key]
        : [String(response[key])];
    }
    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // FRONTEND REQUIRED VALIDATION
    const requiredFields = ["role", "name", "mobile"];

    // CRM required only when CRM visible
    if (showCRMField) {
      requiredFields.push("crm");
    }

    // SS required only when SS visible
    if (showSSField) {
      requiredFields.push("ss");
    }

    if (showPartyField) {
      requiredFields.push("party_name");
    }

    let newErrors = {};

    requiredFields.forEach((field) => {
  if (isEmpty(form[field])) {
    newErrors[field] = ["This field is required"];
  }
});


    // Password required only for new user
   if (!form.id && isEmpty(form.password)) {
  newErrors.password = ["Password is required"];
}

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let payload = { ...form };

      if (!payload.password?.trim()) delete payload.password;

      if (form.role === "CRM") {
        payload.party_name = "";
        payload.crm = null;
        payload.ss = null;
      }

      if (form.role === "SS") {
        payload.ss = null;
      }

      if ((form.role === "ASM" || form.role === "DS") && user.role !== "ADMIN") {
        payload.crm = null;
      }

      if (form.id) {
        await updateSSUser(form.id, payload);
        toast.success("User updated successfully");
      } else {
        await createSSUser(payload);
        toast.success("User added successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["ss-users"] });
      navigate("/all-users/list");
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const showCRMField =
    user.role === "ADMIN" &&
    (form.role === "SS" || form.role === "ASM" || form.role === "DS");

  // SS field only for DS (NOT for ASM)
  const showSSField = form.role === "DS";

  // Party Name only for SS & DS (NOT for ASM)
  const showPartyField = form.role === "SS" || form.role === "DS";

  const showPassword = !form.id;

  return (
    <div className="mx-auto sm:p-4">
      <MobilePageHeader title={form.id ? "Edit User" : "Add New User"} />

      <h2 className="text-xl font-semibold mb-4 bg-gray-200 p-2 px-4">
        {form.id ? "Edit User" : "Add New User"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-whi shadow-m rounded-xl p-6 space-y-4"
      >
        {/* ROLE FIELD - ALWAYS VISIBLE */}
        <div>
          <label className="text-gray-700 mb-1 block text-sm">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={!!form.id}  // 👈 EDIT MODE ME ROLE DISABLE
            className={`border p-2 rounded w-full text-sm focus:ring focus:ring-blue-200 ${form.id ? "bg-gray-200 cursor-not-allowed" : "" }`} >
            <option value="">Select Role</option>
            {user.role === "ADMIN" && <option value="CRM">CRM</option>}
            {user.role === "ADMIN" && <option value="SS">Super Stockist</option>}
            {/* <option value="ASM">ASM</option> */}
            <option value="DS">Distributor</option>
          </select>

          {errors.role && (
            <p className="text-red-600 text-xs mt-1">{errors.role[0]}</p>
          )}
        </div>

        {/* OTHER FIELDS ONLY AFTER ROLE SELECTED */}
        {form.role && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* CRM FIELD -- ONLY ADMIN CAN SEE */}
            {showCRMField && (
              <div className="">
                <label className="text-gray-700 mb-1 block text-sm">CRM</label>
                <select
                  name="crm"
                  value={form.crm}
                  onChange={handleChange}
                  className="border p-2 rounded w-full text-sm"
                >
                  <option value="">Select CRM</option>
                  {crmUsers.map((crm) => (
                    <option key={crm.id} value={crm.id}>
                      {crm.name || crm.mobile}
                    </option>
                  ))}
                </select>
                {errors.crm && (
                  <p className="text-red-600 text-xs mt-1">{errors.crm[0]}</p>
                )}

              </div>
            )}

            {/* SS FIELD */}
            {showSSField && (
              <div>
                <label className="text-gray-700 mb-1 block text-sm">
                  Select SS
                </label>
                <select
                  name="ss"
                  value={form.ss}
                  onChange={handleChange}
                  className="border p-2 rounded w-full text-sm"
                >
                  <option value="">Select Super Stockist</option>
                  {ssUsers.map((ss) => (
                    <option key={ss.id} value={ss.id}>
                      {ss.party_name || ss.mobile}
                    </option>
                  ))}
                </select>
                {errors.ss && (
                  <p className="text-red-600 text-xs mt-1">{errors.ss[0]}</p>
                )}

              </div>
            )}

            {/* NAME */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-1 text-sm">
                Owner Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded w-full text-sm"
              />
              {errors.name && (<p className="text-red-600 text-xs mt-1">{errors.name[0]}</p>)}
            </div>

            {/* MOBILE */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-1 text-sm">
                Mobile
              </label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="border p-2 rounded w-full text-sm"
              />
              {errors.mobile && (
                <p className="text-red-600 text-xs mt-1">{errors.mobile[0]}</p>
              )}
            </div>

            {/* PARTY NAME */}
            {showPartyField && (
              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-1 text-sm">
                  Party/Shop Name
                </label>
                <input
                  name="party_name"
                  value={form.party_name}
                  onChange={handleChange}
                  className="border p-2 rounded w-full text-sm"
                />
                {errors.party_name && (
                  <p className="text-red-600 text-xs mt-1">{errors.party_name[0]}</p>
                )}

              </div>
            )}

            {/* PASSWORD */}
            {showPassword && (
              <div>
                <label className="flex items-center gap-2 text-gray-700 mb-1 text-sm">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="border p-2 rounded w-full text-sm"
                />

                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.password[0]}
                  </p>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 text-sm mt-3 transition col-1"
              disabled={loading}
            >
              <FaSave />
              {loading ? "Saving..." : form.id ? "Update" : "Create"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
