import { useState, useMemo } from "react";
import { createSSUser, updateSSUser, useCachedSSUsers } from "../../auth/useSS";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSave, FaUserPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

export default function AddNewUser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const editData = location.state?.editData || null;
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useCachedSSUsers();

  // =========================
  // FILTER USERS
  // =========================
  const crmUsers = useMemo(
    () => allUsers.filter((u) => u.role === "CRM"),
    [allUsers]
  );

  const ssUsers = useMemo(
    () => allUsers.filter((u) => u.role === "SS"),
    [allUsers]
  );

  // =========================
  // REACT SELECT OPTIONS
  // =========================
  const roleOptions = [
    ...(user?.role === "ADMIN"
      ? [
          { value: "CRM", label: "CRM" },
          { value: "SS", label: "Super Stockist" },
        ]
      : []),
    { value: "ASM", label: "ASM" },
    { value: "DS", label: "Distributor" },
  ];

  const crmOptions = crmUsers.map((crm) => ({
    value: crm.id,
    label: `${crm.name} (${crm.mobile})`,
  }));

  const ssOptions = ssUsers.map((ss) => ({
    value: ss.id,
    label: `${ss.party_name || ss.name}`,
  }));

  // =========================
  // FORM STATE
  // =========================
  const [form, setForm] = useState(
    editData || {
      id: null,
      role: "",
      crm: "",
      ss: "",
      name: "",
      mobile: "",
      password: "",
      party_name: "",
    }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // =========================
  // CONDITIONS
  // =========================
  const showCRMField =
    user?.role === "ADMIN" &&
    ["SS", "ASM", "DS"].includes(form.role);

  const showSSField = form.role === "DS";

  const showPartyField =
    form.role === "SS" || form.role === "DS";

  const showPasswordField = !form.id;

  // =========================
  // COMMON INPUT STYLE
  // =========================
  const inputClass =
    "w-full rounded border border-gray-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100";

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // =========================
  // EMPTY CHECK
  // =========================
  const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    return value === "";
  };

  // =========================
  // API ERROR FORMAT
  // =========================
  const extractErrors = (err) => {
    const response = err.response?.data;

    if (!response) {
      return {
        non_field_errors: ["Something went wrong"],
      };
    }

    const formatted = {};

    for (let key in response) {
      formatted[key] = Array.isArray(response[key])
        ? response[key]
        : [String(response[key])];
    }

    return formatted;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    const requiredFields = ["role", "name", "mobile"];

    if (showCRMField) {
      requiredFields.push("crm");
    }

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

    if (!form.id && isEmpty(form.password)) {
      newErrors.password = ["Password is required"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let payload = { ...form };

      // REMOVE EMPTY PASSWORD
      if (!payload.password?.trim()) {
        delete payload.password;
      }

      // CRM ROLE
      if (form.role === "CRM") {
        payload.party_name = "";
        payload.crm = null;
        payload.ss = null;
      }

      // SS ROLE
      if (form.role === "SS") {
        payload.ss = null;
      }

      // NON ADMIN
      if (
        (form.role === "ASM" || form.role === "DS") &&
        user.role !== "ADMIN"
      ) {
        delete payload.crm;
      }

      // UPDATE
      if (form.id) {
        await updateSSUser(form.id, payload);
        toast.success("User updated successfully");
      } else {
        await createSSUser(payload);
        toast.success("User created successfully");
      }

      queryClient.invalidateQueries({
        queryKey: ["ss-users"],
      });

      navigate("/all-users/list");
    } catch (err) {
      setErrors(extractErrors(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REACT SELECT STYLE
  // =========================
 const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: "34px",
    borderRadius: "5px",
    borderColor: state.isFocused ? "#22c55e" : "#d1d5db",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(34,197,94,0.15)"
      : "none",
    fontSize: "13px", // 👈 small text
    "&:hover": {
      borderColor: "#22c55e",
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: "0 8px",
    fontSize: "13px",
  }),

  input: (provided) => ({
    ...provided,
    fontSize: "13px",
    margin: "0px",
    padding: "0px",
  }),

  singleValue: (provided) => ({
    ...provided,
    fontSize: "13px",
  }),

  placeholder: (provided) => ({
    ...provided,
    fontSize: "13px",
    color: "#9ca3af",
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: "13px",
    backgroundColor: state.isFocused ? "#f0fdf4" : "#fff",
    color: "#111827",
    cursor: "pointer",
  }),

  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    fontSize: "13px",
  }),
};

  return (
    <div className="min-h-screen bg-gray-50 sm:p-4">
      <MobilePageHeader
        title={form.id ? "Edit User" : "Add New User"}
      />

      <div className="mx-auto max-w-7xl pt-[70px] sm:pt-0">
        {/* HEADER */}
        <div className="mb-5 flex items-center justify-between rounded bg-white p-5 shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {form.id ? "Edit User" : "Create New User"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Manage CRM, SS, ASM and Distributor users
            </p>
          </div>

          <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <FaUserPlus size={22} />
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* ROLE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Select Role
              </label>

              <Select
                options={roleOptions}
                value={
                  roleOptions.find(
                    (option) => option.value === form.role
                  ) || null
                }
                onChange={(selected) => {
                  setForm({
                    ...form,
                    role: selected ? selected.value : "",
                  });

                  setErrors({
                    ...errors,
                    role: "",
                  });
                }}
                placeholder="Search Role..."
                isDisabled={!!form.id}
                styles={customSelectStyles}
              />

              {errors.role && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.role[0]}
                </p>
              )}
            </div>

            {/* CRM */}
            {showCRMField && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select CRM
                </label>

                <Select
                  options={crmOptions}
                  value={
                    crmOptions.find(
                      (option) => option.value === form.crm
                    ) || null
                  }
                  onChange={(selected) => {
                    setForm({
                      ...form,
                      crm: selected ? selected.value : "",
                    });

                    setErrors({
                      ...errors,
                      crm: "",
                    });
                  }}
                  placeholder="Search CRM..."
                  isClearable
                  styles={customSelectStyles}
                />

                {errors.crm && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.crm[0]}
                  </p>
                )}
              </div>
            )}

            {/* SS */}
            {showSSField && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Super Stockist
                </label>

                <Select
                  options={ssOptions}
                  value={
                    ssOptions.find(
                      (option) => option.value === form.ss
                    ) || null
                  }
                  onChange={(selected) => {
                    setForm({
                      ...form,
                      ss: selected ? selected.value : "",
                    });

                    setErrors({
                      ...errors,
                      ss: "",
                    });
                  }}
                  placeholder="Search Super Stockist..."
                  isClearable
                  styles={customSelectStyles}
                />

                {errors.ss && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.ss[0]}
                  </p>
                )}
              </div>
            )}

            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Owner Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter owner name"
                className={inputClass}
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name[0]}
                </p>
              )}
            </div>

            {/* MOBILE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mobile Number
              </label>

              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className={inputClass}
              />

              {errors.mobile && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.mobile[0]}
                </p>
              )}
            </div>

            {/* PARTY NAME */}
            {showPartyField && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Party / Shop Name
                </label>

                <input
                  type="text"
                  name="party_name"
                  value={form.party_name}
                  onChange={handleChange}
                  placeholder="Enter party name"
                  className={inputClass}
                />

                {errors.party_name && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.party_name[0]}
                  </p>
                )}
              </div>
            )}

            {/* PASSWORD */}
            {showPasswordField && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={inputClass}
                />

                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* BUTTON */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[180px] items-center justify-center gap-2 rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaSave />

              {loading
                ? "Saving..."
                : form.id
                ? "Update User"
                : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}