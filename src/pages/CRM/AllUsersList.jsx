import { useState, useMemo, useEffect } from "react";
import {
  useCachedSSUsers,
  toggleSSStatus,
  updateSSUser,
} from "../../auth/useSS";
import UserTable from "../../components/UserTable";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MobilePageHeader from "../../components/MobilePageHeader";
import { useAuth } from "../../context/AuthContext";
import { updateStockLocation } from "../../auth/useSS";


const ROLE_OPTIONS = ["SS", "DS", "ASM", "CRM" ];
const ROLE_STORAGE_KEY = "users_selected_role";

export default function AllUsersList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem(ROLE_STORAGE_KEY) || "SS";
  });

  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: ssList = [],
    isLoading,
    error,
    refetch,
  } = useCachedSSUsers();

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
  }, [selectedRole]);

  // ✅ Search + Role Filter
 const filteredList = useMemo(() => {
  const term = searchTerm.toLowerCase();

  return ssList
    .filter((u) => {
      const roleMatch = u.role === selectedRole;

      const partyName = u.party_name?.toLowerCase() || "";
      const mobile = u.mobile?.toString() || "";
      const name = u.name?.toString() || "";
      const user_id = u.user_id?.toString() || "";

      const searchMatch =
        !term ||
        partyName.includes(term) ||
        mobile.includes(searchTerm) ||
        name.includes(searchTerm) ||
        user_id.includes(searchTerm);

      return roleMatch && searchMatch;
    })
    .sort((a, b) => {
      const nameA = a.party_name?.toLowerCase() || "";
      const nameB = b.party_name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    });
}, [searchTerm, selectedRole, ssList]);


  const handleEdit = (user) => {
    navigate("/add-new-user", { state: { editData: user } });
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleSSStatus(id, !currentStatus);
      toast.success(
        currentStatus ? "User deactivated" : "User activated"
      );
      refetch();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleStockChange = async (id, newStock) => {
  try {
    await updateStockLocation(id, newStock);
    toast.success(
      `Stock changed to ${newStock === "DELHI" ? "Delhi" : "Mumbai"}`
    );
    refetch();
  } catch {
    toast.error("Failed to update stock");
  }
};



  if (isLoading) return <p className="p-4 text-sm">Loading users...</p>;
  if (error)
    return (
      <p className="p-4 text-sm text-red-500">
        Failed to load users
      </p>
    );

  return (
    <div className="p-3 sm:p-4">
      <MobilePageHeader title="Super Stockist" />

      {/* 🔍 Toolbar */}
      <div className="sm:pt-0 pt-[60px] mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search Party / Mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-2 rounded text-sm w-full sm:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />

          {/* Role Select */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border px-3 py-2 rounded text-sm bg-white cursor-pointer w-full sm:w-32"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={() => navigate("/add-new-user")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center w-full sm:w-auto"
          >
            + Add User
          </button>
          
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        user={user}
        list={filteredList}
        onEdit={handleEdit}
        onToggleStatus={handleToggle}
        onChangePassword={(user) => {
          setSelectedUser(user);
          setShowModal(true);
        }}
         onChangeStock={handleStockChange}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={async (newPass) => {
          try {
            await updateSSUser(selectedUser.id, {
              password: newPass,
            });
            toast.success("Password updated");
            setShowModal(false);
            refetch();
          } catch {
            toast.error("Password update failed");
          }
        }}
      />
    </div>
  );
}


// import { useState, useMemo, useEffect } from "react";
// import {
//   useCachedSSUsers,
//   toggleSSStatus,
//   updateSSUser,
//   updateStockLocation,
// } from "../../auth/useSS";

// import UserTable from "../../components/UserTable";
// import ChangePasswordModal from "../../components/ChangePasswordModal";

// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import MobilePageHeader from "../../components/MobilePageHeader";
// import { useAuth } from "../../context/AuthContext";

// import {
//   Users,
//   Search,
//   Plus,
//   RefreshCw,
//   UserCheck,
//   UserX,
// } from "lucide-react";

// const ROLE_OPTIONS = ["SS", "DS", "ASM", "CRM"];
// const ROLE_STORAGE_KEY = "users_selected_role";

// export default function AllUsersList() {
//   const [showModal, setShowModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   const [selectedRole, setSelectedRole] = useState(() => {
//     return (
//       localStorage.getItem(ROLE_STORAGE_KEY) || "SS"
//     );
//   });

//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const {
//     data: ssList = [],
//     isLoading,
//     error,
//     refetch,
//     isFetching,
//   } = useCachedSSUsers();

//   useEffect(() => {
//     localStorage.setItem(
//       ROLE_STORAGE_KEY,
//       selectedRole
//     );
//   }, [selectedRole]);

//   // =====================================================
//   // FILTER + SEARCH
//   // =====================================================

//   const filteredList = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase();

//     return ssList
//       .filter((u) => {
//         const roleMatch =
//           u.role === selectedRole;

//         const partyName =
//           u.party_name?.toString().toLowerCase() || "";

//         const mobile =
//           u.mobile?.toString().toLowerCase() || "";

//         const name =
//           u.name?.toString().toLowerCase() || "";

//         const userId =
//           u.user_id?.toString().toLowerCase() || "";

//         const searchMatch =
//           !term ||
//           partyName.includes(term) ||
//           mobile.includes(term) ||
//           name.includes(term) ||
//           userId.includes(term);

//         return roleMatch && searchMatch;
//       })
//       .sort((a, b) => {
//         const nameA =
//           a.party_name?.toLowerCase() || "";

//         const nameB =
//           b.party_name?.toLowerCase() || "";

//         return nameA.localeCompare(nameB);
//       });
//   }, [searchTerm, selectedRole, ssList]);

//   // =====================================================
//   // ROLE COUNTS
//   // =====================================================

//   const roleCount = useMemo(() => {
//     return ssList.filter(
//       (u) => u.role === selectedRole
//     ).length;
//   }, [ssList, selectedRole]);

//   const activeCount = useMemo(() => {
//     return filteredList.filter(
//       (u) => u.is_active
//     ).length;
//   }, [filteredList]);

//   const inactiveCount = filteredList.length - activeCount;

//   // =====================================================
//   // EDIT
//   // =====================================================

//   const handleEdit = (selectedUser) => {
//     navigate("/add-new-user", {
//       state: {
//         editData: selectedUser,
//       },
//     });
//   };

//   // =====================================================
//   // TOGGLE STATUS
//   // =====================================================

//   const handleToggle = async (
//     id,
//     currentStatus
//   ) => {
//     try {
//       await toggleSSStatus(
//         id,
//         !currentStatus
//       );

//       toast.success(
//         currentStatus
//           ? "User deactivated"
//           : "User activated"
//       );

//       refetch();
//     } catch {
//       toast.error(
//         "Failed to update user status"
//       );
//     }
//   };

//   // =====================================================
//   // STOCK LOCATION
//   // =====================================================

//   const handleStockChange = async (
//     id,
//     newStock
//   ) => {
//     try {
//       await updateStockLocation(
//         id,
//         newStock
//       );

//       toast.success(
//         `Stock changed to ${
//           newStock === "DELHI"
//             ? "Delhi"
//             : "Mumbai"
//         }`
//       );

//       refetch();
//     } catch {
//       toast.error(
//         "Failed to update stock"
//       );
//     }
//   };

//   // =====================================================
//   // LOADING
//   // =====================================================

//   if (isLoading) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center bg-gray-50">
//         <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
//           <RefreshCw
//             size={15}
//             className="animate-spin text-blue-600"
//           />
//           Loading users...
//         </div>
//       </div>
//     );
//   }

//   // =====================================================
//   // ERROR
//   // =====================================================

//   if (error) {
//     return (
//       <div className="min-h-full bg-gray-50 p-4">
//         <div className="mx-auto max-w-[1600px] rounded-xl border border-red-100 bg-white p-8 text-center shadow-sm">
//           <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
//             <UserX size={17} />
//           </div>

//           <p className="text-sm font-bold text-gray-700">
//             Failed to load users
//           </p>

//           <button
//             type="button"
//             onClick={() => refetch()}
//             className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-blue-700 active:scale-95"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-full bg-gray-50 px-3 pb-20 pt-3 sm:px-4 lg:px-5">

//       {/* MOBILE HEADER */}
//       <div className="sm:hidden">
//         <MobilePageHeader title="Users" />
//       </div>

//       {/* =================================================
//           PAGE HEADER
//       ================================================= */}

//       <div className="mb-3 flex items-center justify-between gap-3">

//         <div className="flex min-w-0 items-center gap-2.5">

//           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//             <Users size={16} />
//           </div>

//           <div className="min-w-0">

//             <div className="flex items-center gap-2">

//               <h1 className="truncate text-sm font-bold text-gray-900 sm:text-base">
//                 User Management
//               </h1>

//               <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">
//                 {roleCount}
//               </span>

//             </div>

//             <p className="hidden text-[9px] text-gray-400 sm:block">
//               Manage users, access, status and stock location
//             </p>

//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             navigate("/add-new-user")
//           }
//           className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-95"
//         >
//           <Plus size={13} />
//           <span className="hidden sm:inline">
//             Add User
//           </span>
//           <span className="sm:hidden">
//             Add
//           </span>
//         </button>
//       </div>

//       {/* =================================================
//           STATS
//       ================================================= */}

//       <div className="mb-3 grid grid-cols-3 gap-2">

//         <div className="rounded-lg border border-gray-200 bg-white px-2.5 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
//           <div className="flex items-center justify-between">
//             <p className="text-[8px] font-bold uppercase tracking-wide text-gray-400">
//               Total
//             </p>

//             <Users
//               size={12}
//               className="text-gray-300"
//             />
//           </div>

//           <p className="mt-1 text-sm font-bold text-gray-800">
//             {filteredList.length}
//           </p>
//         </div>

//         <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5">
//           <div className="flex items-center justify-between">
//             <p className="text-[8px] font-bold uppercase tracking-wide text-emerald-500">
//               Active
//             </p>

//             <UserCheck
//               size={12}
//               className="text-emerald-400"
//             />
//           </div>

//           <p className="mt-1 text-sm font-bold text-emerald-600">
//             {activeCount}
//           </p>
//         </div>

//         <div className="rounded-lg border border-red-100 bg-red-50/60 px-2.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5">
//           <div className="flex items-center justify-between">
//             <p className="text-[8px] font-bold uppercase tracking-wide text-red-400">
//               Inactive
//             </p>

//             <UserX
//               size={12}
//               className="text-red-300"
//             />
//           </div>

//           <p className="mt-1 text-sm font-bold text-red-500">
//             {inactiveCount}
//           </p>
//         </div>

//       </div>

//       {/* =================================================
//           SEARCH / ROLE TOOLBAR
//       ================================================= */}

//       <div className="mb-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm">

//         <div className="flex flex-col gap-2 sm:flex-row">

//           {/* SEARCH */}

//           <div className="relative min-w-0 flex-1">

//             <Search
//               size={14}
//               className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             />

//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) =>
//                 setSearchTerm(
//                   e.target.value
//                 )
//               }
//               placeholder="Search party, name, mobile or user ID..."
//               className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-[10px] text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
//             />

//             {searchTerm && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSearchTerm("")
//                 }
//                 className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-1 text-[9px] font-bold text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
//               >
//                 Clear
//               </button>
//             )}

//           </div>

//           {/* ROLE */}

//           <div className="flex rounded-lg bg-gray-100 p-0.5">

//             {ROLE_OPTIONS.map((role) => (
//               <button
//                 key={role}
//                 type="button"
//                 onClick={() =>
//                   setSelectedRole(role)
//                 }
//                 className={`flex-1 rounded-md px-3 py-1.5 text-[9px] font-bold transition-all duration-200 sm:flex-none ${
//                   selectedRole === role
//                     ? "bg-white text-blue-600 shadow-sm"
//                     : "text-gray-500 hover:text-gray-700"
//                 }`}
//               >
//                 {role}
//               </button>
//             ))}

//           </div>

//           {/* REFRESH */}

//           <button
//             type="button"
//             onClick={() => refetch()}
//             disabled={isFetching}
//             className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[9px] font-bold text-gray-600 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:opacity-50"
//           >
//             <RefreshCw
//               size={12}
//               className={
//                 isFetching
//                   ? "animate-spin"
//                   : ""
//               }
//             />
//             <span className="hidden sm:inline">
//               Refresh
//             </span>
//           </button>

//         </div>

//         <div className="mt-2 flex items-center justify-between">

//           <p className="text-[8px] text-gray-400">
//             Showing{" "}
//             <span className="font-bold text-gray-600">
//               {filteredList.length}
//             </span>{" "}
//             {selectedRole} users
//           </p>

//           {searchTerm && (
//             <p className="text-[8px] text-blue-500">
//               Search active
//             </p>
//           )}

//         </div>

//       </div>

//       {/* =================================================
//           USERS
//       ================================================= */}

//       <UserTable
//         user={user}
//         list={filteredList}
//         onEdit={handleEdit}
//         onToggleStatus={handleToggle}
//         onChangePassword={(selected) => {
//           setSelectedUser(selected);
//           setShowModal(true);
//         }}
//         onChangeStock={handleStockChange}
//       />

//       {/* =================================================
//           PASSWORD MODAL
//       ================================================= */}

//       <ChangePasswordModal
//         isOpen={showModal}
//         onClose={() =>
//           setShowModal(false)
//         }
//         onSave={async (newPass) => {
//           try {
//             await updateSSUser(
//               selectedUser.id,
//               {
//                 password: newPass,
//               }
//             );

//             toast.success(
//               "Password updated"
//             );

//             setShowModal(false);
//             refetch();
//           } catch {
//             toast.error(
//               "Password update failed"
//             );
//           }
//         }}
//       />

//     </div>
//   );
// }