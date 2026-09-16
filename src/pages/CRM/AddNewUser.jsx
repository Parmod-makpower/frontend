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



// import {
//   useState,
//   useMemo,
// } from "react";

// import {
//   createSSUser,
//   updateSSUser,
//   useCachedSSUsers,
// } from "../../auth/useSS";

// import toast from "react-hot-toast";

// import {
//   useNavigate,
//   useLocation,
// } from "react-router-dom";

// import {
//   UserPlus,
//   UserRound,
//   Save,
//   ArrowLeft,
//   ShieldCheck,
//   Building2,
//   Phone,
//   LockKeyhole,
// } from "lucide-react";

// import { useAuth } from "../../context/AuthContext";
// import MobilePageHeader from "../../components/MobilePageHeader";
// import { useQueryClient } from "@tanstack/react-query";
// import Select from "react-select";

// export default function AddNewUser() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const location = useLocation();
//   const editData =
//     location.state?.editData || null;

//   const queryClient =
//     useQueryClient();

//   const {
//     data: allUsers = [],
//   } = useCachedSSUsers();

//   // =====================================================
//   // USERS
//   // =====================================================

//   const crmUsers = useMemo(
//     () =>
//       allUsers.filter(
//         (u) => u.role === "CRM"
//       ),
//     [allUsers]
//   );

//   const ssUsers = useMemo(
//     () =>
//       allUsers.filter(
//         (u) => u.role === "SS"
//       ),
//     [allUsers]
//   );

//   // =====================================================
//   // ROLE OPTIONS
//   // =====================================================

//   const roleOptions = [
//     ...(user?.role === "ADMIN"
//       ? [
//           {
//             value: "CRM",
//             label: "CRM",
//           },
//           {
//             value: "SS",
//             label: "Super Stockist",
//           },
//         ]
//       : []),

//     {
//       value: "ASM",
//       label: "ASM",
//     },

//     {
//       value: "DS",
//       label: "Distributor",
//     },
//   ];

//   const crmOptions = crmUsers.map(
//     (crm) => ({
//       value: crm.id,
//       label: `${crm.name} (${crm.mobile})`,
//     })
//   );

//   const ssOptions = ssUsers.map(
//     (ss) => ({
//       value: ss.id,
//       label:
//         ss.party_name ||
//         ss.name,
//     })
//   );

//   // =====================================================
//   // FORM
//   // =====================================================

//   const [form, setForm] = useState(
//     editData || {
//       id: null,
//       role: "",
//       crm: "",
//       ss: "",
//       name: "",
//       mobile: "",
//       password: "",
//       party_name: "",
//     }
//   );

//   const [errors, setErrors] =
//     useState({});

//   const [loading, setLoading] =
//     useState(false);

//   // =====================================================
//   // CONDITIONS
//   // =====================================================

//   const showCRMField =
//     user?.role === "ADMIN" &&
//     ["SS", "ASM", "DS"].includes(
//       form.role
//     );

//   const showSSField =
//     form.role === "DS";

//   const showPartyField =
//     form.role === "SS" ||
//     form.role === "DS";

//   const showPasswordField =
//     !form.id;

//   // =====================================================
//   // INPUT
//   // =====================================================

//   const inputClass =
//     "h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-[10px] text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50";

//   // =====================================================
//   // CHANGE
//   // =====================================================

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]:
//         e.target.value,
//     });

//     setErrors({
//       ...errors,
//       [e.target.name]: "",
//     });
//   };

//   // =====================================================
//   // EMPTY
//   // =====================================================

//   const isEmpty = (value) => {
//     if (
//       value === null ||
//       value === undefined
//     ) {
//       return true;
//     }

//     if (
//       typeof value === "string"
//     ) {
//       return value.trim() === "";
//     }

//     return value === "";
//   };

//   // =====================================================
//   // API ERRORS
//   // =====================================================

//   const extractErrors = (err) => {
//     const response =
//       err.response?.data;

//     if (!response) {
//       return {
//         non_field_errors: [
//           "Something went wrong",
//         ],
//       };
//     }

//     const formatted = {};

//     for (let key in response) {
//       formatted[key] =
//         Array.isArray(response[key])
//           ? response[key]
//           : [
//               String(
//                 response[key]
//               ),
//             ];
//     }

//     return formatted;
//   };

//   // =====================================================
//   // SUBMIT
//   // =====================================================

//   const handleSubmit = async (
//     e
//   ) => {
//     e.preventDefault();

//     setErrors({});

//     const requiredFields = [
//       "role",
//       "name",
//       "mobile",
//     ];

//     if (showCRMField) {
//       requiredFields.push("crm");
//     }

//     if (showSSField) {
//       requiredFields.push("ss");
//     }

//     if (showPartyField) {
//       requiredFields.push(
//         "party_name"
//       );
//     }

//     const newErrors = {};

//     requiredFields.forEach(
//       (field) => {
//         if (
//           isEmpty(form[field])
//         ) {
//           newErrors[field] = [
//             "This field is required",
//           ];
//         }
//       }
//     );

//     if (
//       !form.id &&
//       isEmpty(form.password)
//     ) {
//       newErrors.password = [
//         "Password is required",
//       ];
//     }

//     if (
//       Object.keys(newErrors)
//         .length > 0
//     ) {
//       setErrors(newErrors);
//       return;
//     }

//     setLoading(true);

//     try {
//       let payload = {
//         ...form,
//       };

//       // REMOVE EMPTY PASSWORD

//       if (
//         !payload.password?.trim()
//       ) {
//         delete payload.password;
//       }

//       // CRM

//       if (form.role === "CRM") {
//         payload.party_name = "";
//         payload.crm = null;
//         payload.ss = null;
//       }

//       // SS

//       if (form.role === "SS") {
//         payload.ss = null;
//       }

//       // NON ADMIN

//       if (
//         (form.role === "ASM" ||
//           form.role === "DS") &&
//         user.role !== "ADMIN"
//       ) {
//         delete payload.crm;
//       }

//       // UPDATE

//       if (form.id) {
//         await updateSSUser(
//           form.id,
//           payload
//         );

//         toast.success(
//           "User updated successfully"
//         );
//       } else {
//         await createSSUser(
//           payload
//         );

//         toast.success(
//           "User created successfully"
//         );
//       }

//       queryClient.invalidateQueries({
//         queryKey: ["ss-users"],
//       });

//       navigate(
//         "/all-users/list"
//       );
//     } catch (err) {
//       setErrors(
//         extractErrors(err)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =====================================================
//   // SELECT STYLE
//   // =====================================================

//   const customSelectStyles = {
//     control: (
//       provided,
//       state
//     ) => ({
//       ...provided,

//       minHeight: "36px",

//       height: "36px",

//       borderRadius: "8px",

//       borderColor:
//         state.isFocused
//           ? "#60a5fa"
//           : "#e5e7eb",

//       backgroundColor:
//         state.isFocused
//           ? "#ffffff"
//           : "#f9fafb",

//       boxShadow:
//         state.isFocused
//           ? "0 0 0 3px rgba(59,130,246,0.08)"
//           : "none",

//       fontSize: "10px",

//       transition:
//         "all 0.2s ease",

//       "&:hover": {
//         borderColor:
//           "#93c5fd",
//       },
//     }),

//     valueContainer: (
//       provided
//     ) => ({
//       ...provided,
//       padding: "0 10px",
//     }),

//     input: (
//       provided
//     ) => ({
//       ...provided,
//       fontSize: "10px",
//       margin: 0,
//       padding: 0,
//     }),

//     singleValue: (
//       provided
//     ) => ({
//       ...provided,
//       fontSize: "10px",
//       fontWeight: 600,
//       color: "#374151",
//     }),

//     placeholder: (
//       provided
//     ) => ({
//       ...provided,
//       fontSize: "10px",
//       color: "#9ca3af",
//     }),

//     option: (
//       provided,
//       state
//     ) => ({
//       ...provided,
//       fontSize: "10px",
//       padding: "9px 10px",
//       backgroundColor:
//         state.isFocused
//           ? "#eff6ff"
//           : "#fff",
//       color: "#374151",
//       cursor: "pointer",
//     }),

//     menu: (
//       provided
//     ) => ({
//       ...provided,
//       zIndex: 9999,
//       borderRadius: "8px",
//       overflow: "hidden",
//     }),
//   };

//   // =====================================================
//   // FIELD ERROR
//   // =====================================================

//   const FieldError = ({
//     name,
//   }) => {
//     if (!errors[name]) {
//       return null;
//     }

//     return (
//       <p className="mt-1 text-[8px] font-medium text-red-500">
//         {errors[name][0]}
//       </p>
//     );
//   };

//   // =====================================================
//   // PAGE
//   // =====================================================

//   return (
//     <div className="min-h-full bg-gray-50 px-3 pb-20 pt-3 sm:px-4 lg:px-5">

//       {/* MOBILE HEADER */}

//       <div className="sm:hidden">
//         <MobilePageHeader
//           title={
//             form.id
//               ? "Edit User"
//               : "Add User"
//           }
//         />
//       </div>

//       <div className="mx-auto max-w-[1200px]">

//         {/* =================================================
//             HEADER
//         ================================================= */}

//         <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:px-4">

//           <div className="flex min-w-0 items-center gap-2.5">

//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/all-users/list"
//                 )
//               }
//               className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-gray-700 active:scale-95 sm:flex"
//             >
//               <ArrowLeft
//                 size={14}
//               />
//             </button>

//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//               {form.id ? (
//                 <UserRound
//                   size={16}
//                 />
//               ) : (
//                 <UserPlus
//                   size={16}
//                 />
//               )}
//             </div>

//             <div className="min-w-0">

//               <div className="flex items-center gap-2">

//                 <h1 className="truncate text-sm font-bold text-gray-900 sm:text-base">
//                   {form.id
//                     ? "Edit User"
//                     : "Create User"}
//                 </h1>

//                 <span className="hidden rounded-md bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-600 sm:inline">
//                   User Management
//                 </span>

//               </div>

//               <p className="mt-0.5 hidden text-[9px] text-gray-400 sm:block">
//                 Manage account details, role and access
//               </p>

//             </div>

//           </div>

//           <div className="hidden items-center gap-1.5 sm:flex">

//             <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5">
//               <ShieldCheck
//                 size={11}
//                 className="text-blue-500"
//               />

//               <span className="text-[8px] font-semibold text-gray-500">
//                 Secure User Setup
//               </span>
//             </div>

//           </div>

//         </div>

//         {/* =================================================
//             FORM
//         ================================================= */}

//         <form
//           onSubmit={
//             handleSubmit
//           }
//           className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
//         >

//           {/* FORM HEADER */}

//           <div className="border-b border-gray-100 bg-gray-50 px-3 py-3 sm:px-4">

//             <div className="flex items-center gap-2">

//               <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
//                 <UserRound
//                   size={12}
//                 />
//               </div>

//               <div>

//                 <h2 className="text-xs font-bold text-gray-800">
//                   User Information
//                 </h2>

//                 <p className="text-[8px] text-gray-400">
//                   Fill the required details below
//                 </p>

//               </div>

//             </div>

//           </div>

//           {/* FORM BODY */}

//           <div className="p-3 sm:p-4">

//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

//               {/* ROLE */}

//               <div>

//                 <label className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
//                   <ShieldCheck
//                     size={9}
//                     className="text-gray-400"
//                   />
//                   Role
//                 </label>

//                 <Select
//                   options={
//                     roleOptions
//                   }
//                   value={
//                     roleOptions.find(
//                       (option) =>
//                         option.value ===
//                         form.role
//                     ) || null
//                   }
//                   onChange={(
//                     selected
//                   ) => {
//                     setForm({
//                       ...form,
//                       role: selected
//                         ? selected.value
//                         : "",
//                     });

//                     setErrors({
//                       ...errors,
//                       role: "",
//                     });
//                   }}
//                   placeholder="Select role..."
//                   isDisabled={
//                     !!form.id
//                   }
//                   styles={
//                     customSelectStyles
//                   }
//                 />

//                 <FieldError name="role" />

//               </div>

//               {/* CRM */}

//               {showCRMField && (
//                 <div>

//                   <label className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
//                     <UserRound
//                       size={9}
//                       className="text-gray-400"
//                     />
//                     CRM
//                   </label>

//                   <Select
//                     options={
//                       crmOptions
//                     }
//                     value={
//                       crmOptions.find(
//                         (option) =>
//                           option.value ===
//                           form.crm
//                       ) || null
//                     }
//                     onChange={(
//                       selected
//                     ) => {
//                       setForm({
//                         ...form,
//                         crm: selected
//                           ? selected.value
//                           : "",
//                       });

//                       setErrors({
//                         ...errors,
//                         crm: "",
//                       });
//                     }}
//                     placeholder="Search CRM..."
//                     isClearable
//                     styles={
//                       customSelectStyles
//                     }
//                   />

//                   <FieldError name="crm" />

//                 </div>
//               )}

//               {/* SS */}

//               {showSSField && (
//                 <div>

//                   <label className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
//                     <Building2
//                       size={9}
//                       className="text-gray-400"
//                     />
//                     Super Stockist
//                   </label>

//                   <Select
//                     options={
//                       ssOptions
//                     }
//                     value={
//                       ssOptions.find(
//                         (option) =>
//                           option.value ===
//                           form.ss
//                       ) || null
//                     }
//                     onChange={(
//                       selected
//                     ) => {
//                       setForm({
//                         ...form,
//                         ss: selected
//                           ? selected.value
//                           : "",
//                       });

//                       setErrors({
//                         ...errors,
//                         ss: "",
//                       });
//                     }}
//                     placeholder="Search SS..."
//                     isClearable
//                     styles={
//                       customSelectStyles
//                     }
//                   />

//                   <FieldError name="ss" />

//                 </div>
//               )}

//               {/* NAME */}

//               <div>

//                 <label className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
//                   <UserRound
//                     size={9}
//                     className="text-gray-400"
//                   />
//                   Owner Name
//                 </label>

//                 <input
//                   type="text"
//                   name="name"
//                   value={
//                     form.name
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="Enter owner name"
//                   className={
//                     inputClass
//                   }
//                 />

//                 <FieldError name="name" />

//               </div>

//               {/* MOBILE */}

//               <div>

//                 <label className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
//                   <Phone
//                     size={9}
//                     className="text-gray-400"
//                   />
//                   Mobile Number
//                 </label>

//                 <input
//                   type="text"
//                   name="mobile"
//                   value={
//                     form.mobile
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   placeholder="Enter mobile number"
//                   className={
//                     inputClass
//                   }
//                 />

//                 <FieldError name="mobile" />

//               </div>

//               {/* PARTY */}

//               {showPartyField && (
//                 <div>

//                   <label className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
//                     <Building2
//                       size={9}
//                       className="text-gray-400"
//                     />
//                     Party / Shop Name
//                   </label>

//                   <input
//                     type="text"
//                     name="party_name"
//                     value={
//                       form.party_name
//                     }
//                     onChange={
//                       handleChange
//                     }
//                     placeholder="Enter party name"
//                     className={
//                       inputClass
//                     }
//                   />

//                   <FieldError name="party_name" />

//                 </div>
//               )}

//               {/* PASSWORD */}

//               {showPasswordField && (
//                 <div>

//                   <label className="mb-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gray-500">
//                     <LockKeyhole
//                       size={9}
//                       className="text-gray-400"
//                     />
//                     Password
//                   </label>

//                   <input
//                     type="password"
//                     name="password"
//                     value={
//                       form.password
//                     }
//                     onChange={
//                       handleChange
//                     }
//                     placeholder="Enter password"
//                     className={
//                       inputClass
//                     }
//                   />

//                   <FieldError name="password" />

//                 </div>
//               )}

//             </div>

//           </div>

//           {/* =================================================
//               FOOTER
//           ================================================= */}

//           <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">

//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/all-users/list"
//                 )
//               }
//               className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-[10px] font-bold text-gray-600 transition-all duration-200 hover:bg-gray-100 active:scale-[0.98]"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className={`flex h-9 items-center justify-center gap-2 rounded-lg px-5 text-[10px] font-bold text-white shadow-sm transition-all duration-200 active:scale-[0.98] ${
//                 loading
//                   ? "cursor-not-allowed bg-blue-400"
//                   : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
//               }`}
//             >

//               {loading ? (
//                 <>
//                   <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save size={12} />

//                   {form.id
//                     ? "Update User"
//                     : "Create User"}
//                 </>
//               )}

//             </button>

//           </div>

//         </form>

//       </div>

//     </div>
//   );
// }