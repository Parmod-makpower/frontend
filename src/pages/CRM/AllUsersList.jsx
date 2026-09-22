// import { useState, useMemo, useEffect } from "react";
// import {
//   useCachedSSUsers,
//   toggleSSStatus,
//   updateSSUser,
// } from "../../auth/useSS";
// import UserTable from "../../components/UserTable";
// import ChangePasswordModal from "../../components/ChangePasswordModal";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import MobilePageHeader from "../../components/MobilePageHeader";
// import { useAuth } from "../../context/AuthContext";
// import { updateStockLocation } from "../../auth/useSS";


// const ROLE_OPTIONS = ["SS", "DS", "ASM", "CRM" ];
// const ROLE_STORAGE_KEY = "users_selected_role";

// export default function AllUsersList() {
//   const [showModal, setShowModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   const [selectedRole, setSelectedRole] = useState(() => {
//     return localStorage.getItem(ROLE_STORAGE_KEY) || "SS";
//   });

//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const {
//     data: ssList = [],
//     isLoading,
//     error,
//     refetch,
//   } = useCachedSSUsers();

//   useEffect(() => {
//     localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
//   }, [selectedRole]);

//   // ✅ Search + Role Filter
//  const filteredList = useMemo(() => {
//   const term = searchTerm.toLowerCase();

//   return ssList
//     .filter((u) => {
//       const roleMatch = u.role === selectedRole;

//       const partyName = u.party_name?.toLowerCase() || "";
//       const mobile = u.mobile?.toString() || "";
//       const name = u.name?.toString() || "";
//       const user_id = u.user_id?.toString() || "";

//       const searchMatch =
//         !term ||
//         partyName.includes(term) ||
//         mobile.includes(searchTerm) ||
//         name.includes(searchTerm) ||
//         user_id.includes(searchTerm);

//       return roleMatch && searchMatch;
//     })
//     .sort((a, b) => {
//       const nameA = a.party_name?.toLowerCase() || "";
//       const nameB = b.party_name?.toLowerCase() || "";
//       return nameA.localeCompare(nameB);
//     });
// }, [searchTerm, selectedRole, ssList]);


//   const handleEdit = (user) => {
//     navigate("/add-new-user", { state: { editData: user } });
//   };

//   const handleToggle = async (id, currentStatus) => {
//     try {
//       await toggleSSStatus(id, !currentStatus);
//       toast.success(
//         currentStatus ? "User deactivated" : "User activated"
//       );
//       refetch();
//     } catch {
//       toast.error("Failed to toggle status");
//     }
//   };

//   const handleStockChange = async (id, newStock) => {
//   try {
//     await updateStockLocation(id, newStock);
//     toast.success(
//       `Stock changed to ${newStock === "DELHI" ? "Delhi" : "Mumbai"}`
//     );
//     refetch();
//   } catch {
//     toast.error("Failed to update stock");
//   }
// };



//   if (isLoading) return <p className="p-4 text-sm">Loading users...</p>;
//   if (error)
//     return (
//       <p className="p-4 text-sm text-red-500">
//         Failed to load users
//       </p>
//     );

//   return (
//     <div className="p-3 sm:p-4">
//       <MobilePageHeader title="Super Stockist" />

//       {/* 🔍 Toolbar */}
//       <div className="sm:pt-0 pt-[60px] mb-3">
//         <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//           {/* Search */}
//           <input
//             type="text"
//             placeholder="Search Party / Mobile"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="border px-3 py-2 rounded text-sm w-full sm:w-1/2 focus:outline-none focus:ring-1 focus:ring-green-500"
//           />

//           {/* Role Select */}
//           <select
//             value={selectedRole}
//             onChange={(e) => setSelectedRole(e.target.value)}
//             className="border px-3 py-2 rounded text-sm bg-white cursor-pointer w-full sm:w-32"
//           >
//             {ROLE_OPTIONS.map((role) => (
//               <option key={role} value={role}>
//                 {role}
//               </option>
//             ))}
//           </select>

//           {/* Add Button */}
//           <button
//             onClick={() => navigate("/add-new-user")}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center w-full sm:w-auto"
//           >
//             + Add User
//           </button>
          
//         </div>
//       </div>

//       {/* Users Table */}
//       <UserTable
//         user={user}
//         list={filteredList}
//         onEdit={handleEdit}
//         onToggleStatus={handleToggle}
//         onChangePassword={(user) => {
//           setSelectedUser(user);
//           setShowModal(true);
//         }}
//          onChangeStock={handleStockChange}
//       />

//       {/* Change Password Modal */}
//       <ChangePasswordModal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         onSave={async (newPass) => {
//           try {
//             await updateSSUser(selectedUser.id, {
//               password: newPass,
//             });
//             toast.success("Password updated");
//             setShowModal(false);
//             refetch();
//           } catch {
//             toast.error("Password update failed");
//           }
//         }}
//       />
//     </div>
//   );
// }



import { useState, useMemo, useEffect } from "react";
import {
  useCachedSSUsers,
  toggleSSStatus,
  updateSSUser,
  updateStockLocation,
} from "../../auth/useSS";

import UserTable from "../../components/UserTable";
import ChangePasswordModal from "../../components/ChangePasswordModal";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MobilePageHeader from "../../components/MobilePageHeader";
import BackButton from "../../Layout//BackButton";
import { useAuth } from "../../context/AuthContext";

import {
  Users,
  Search,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";

const ROLE_OPTIONS = ["SS", "DS", "ASM", "CRM"];
const ROLE_STORAGE_KEY = "users_selected_role";

export default function AllUsersList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRole, setSelectedRole] = useState(
    () => localStorage.getItem(ROLE_STORAGE_KEY) || "SS"
  );

  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: ssList = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCachedSSUsers();

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
  }, [selectedRole]);

  const filteredList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return ssList
      .filter((u) => {
        if (u.role !== selectedRole) return false;

        const values = [
          u.party_name,
          u.mobile,
          u.name,
          u.user_id,
        ].map((v) => v?.toString().toLowerCase() || "");

        return !term || values.some((v) => v.includes(term));
      })
      .sort((a, b) =>
        (a.party_name || "").localeCompare(b.party_name || "")
      );
  }, [searchTerm, selectedRole, ssList]);

  const roleCount = useMemo(
    () => ssList.filter((u) => u.role === selectedRole).length,
    [ssList, selectedRole]
  );

  const activeCount = filteredList.filter((u) => u.is_active).length;
  const inactiveCount = filteredList.length - activeCount;

  const handleEdit = (selectedUser) => {
    navigate("/add-new-user", {
      state: { editData: selectedUser },
    });
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleSSStatus(id, !currentStatus);
      toast.success(
        currentStatus ? "User deactivated" : "User activated"
      );
      refetch();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleStockChange = async (id, newStock) => {
    try {
      await updateStockLocation(id, newStock);
      toast.success(
        `Stock changed to ${
          newStock === "DELHI" ? "Delhi" : "Mumbai"
        }`
      );
      refetch();
    } catch {
      toast.error("Failed to update stock");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <RefreshCw size={16} className="animate-spin text-blue-600" />
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-100 p-4">
        <div className="mx-auto max-w-[1600px] border border-red-200 bg-white p-8 text-center shadow-sm">
          <UserX className="mx-auto mb-3 text-red-500" size={20} />

          <p className="text-sm font-semibold text-slate-700">
            Failed to load users
          </p>

          <button
            onClick={() => refetch()}
            className="mt-4 bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-100 px-3 pb-20 pt-3 sm:px-4 lg:px-5">

      {/* MOBILE HEADER */}
      <div className="sm:hidden">
        <MobilePageHeader title="Users" />
      </div>

      {/* =================================================
          SINGLE PAGE HEADER
      ================================================= */}

      <div className="mb-4 border border-slate-200 bg-white shadow-sm">

        {/* TOP LINE */}

        <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 sm:px-4">

          <div className="hidden md:block">
            <BackButton fallback="/" />
          </div>

          <div className="hidden h-7 w-px bg-slate-200 md:block" />

          {/* TITLE */}

          <div className="flex min-w-0 items-center gap-2">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-blue-50 text-blue-600">
              <Users size={17} />
            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <h1 className="truncate text-sm font-bold text-slate-800 sm:text-base">
                  User Management
                </h1>

                <span className="bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                  {roleCount}
                </span>

              </div>

              <p className="hidden text-[10px] text-slate-400 sm:block">
                Manage users, access, status & stock
              </p>

            </div>

          </div>

          {/* QUICK STATS */}

          <div className="ml-auto hidden items-center border-l border-slate-200 pl-3 lg:flex">

            <div className="px-3 text-center">

              <p className="text-[9px] uppercase tracking-wide text-slate-400">
                Total
              </p>

              <p className="text-sm font-bold text-slate-700">
                {filteredList.length}
              </p>

            </div>

            <div className="border-l border-slate-200 px-3 text-center">

              <p className="text-[9px] uppercase tracking-wide text-emerald-500">
                Active
              </p>

              <p className="text-sm font-bold text-emerald-600">
                {activeCount}
              </p>

            </div>

            <div className="border-l border-slate-200 px-3 text-center">

              <p className="text-[9px] uppercase tracking-wide text-red-400">
                Inactive
              </p>

              <p className="text-sm font-bold text-red-500">
                {inactiveCount}
              </p>

            </div>

          </div>

          {/* ADD */}

          <button
            type="button"
            onClick={() => navigate("/add-new-user")}
            className="
              flex
              items-center
              gap-1.5
              bg-blue-600
              px-3
              py-2
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              active:scale-95
            "
          >
            <Plus size={14} />

            <span className="hidden sm:inline">
              Add User
            </span>

            <span className="sm:hidden">
              Add
            </span>
          </button>

        </div>

        {/* =================================================
            SEARCH / FILTER ROW
        ================================================= */}

        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">

          {/* SEARCH */}

          <div className="relative min-w-0 flex-1">

            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search party, name, mobile or user ID..."
              className="
                h-9
                w-full
                border
                border-slate-200
                bg-white
                pl-9
                pr-3
                text-xs
                text-slate-700
                outline-none
                placeholder:text-slate-400
                focus:border-blue-500
              "
            />

          </div>

          {/* ROLE */}

          <div className="flex shrink-0 border border-slate-200 bg-white p-0.5">

            {ROLE_OPTIONS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  transition
                  sm:text-xs
                  ${
                    selectedRole === role
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }
                `}
              >
                {role}
              </button>
            ))}

          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="
              flex
              h-9
              shrink-0
              items-center
              justify-center
              gap-1.5
              border
              border-slate-200
              bg-white
              px-3
              text-xs
              font-semibold
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-blue-600
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={13}
              className={isFetching ? "animate-spin" : ""}
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>

        </div>

      </div>

      {/* MOBILE STATS */}

      <div className="mb-3 grid grid-cols-3 gap-2 lg:hidden">

        <div className="border border-slate-200 bg-white px-3 py-2 shadow-sm">

          <div className="flex items-center justify-between">

            <span className="text-[9px] font-bold uppercase text-slate-400">
              Total
            </span>

            <Users size={13} className="text-slate-300" />

          </div>

          <p className="mt-1 text-base font-bold text-slate-800">
            {filteredList.length}
          </p>

        </div>

        <div className="border border-emerald-100 bg-emerald-50 px-3 py-2">

          <div className="flex items-center justify-between">

            <span className="text-[9px] font-bold uppercase text-emerald-500">
              Active
            </span>

            <UserCheck size={13} className="text-emerald-400" />

          </div>

          <p className="mt-1 text-base font-bold text-emerald-600">
            {activeCount}
          </p>

        </div>

        <div className="border border-red-100 bg-red-50 px-3 py-2">

          <div className="flex items-center justify-between">

            <span className="text-[9px] font-bold uppercase text-red-400">
              Inactive
            </span>

            <UserX size={13} className="text-red-300" />

          </div>

          <p className="mt-1 text-base font-bold text-red-500">
            {inactiveCount}
          </p>

        </div>

      </div>

      {/* USERS */}

      <div className="border border-slate-200 bg-white shadow-sm">

        <UserTable
          user={user}
          list={filteredList}
          onEdit={handleEdit}
          onToggleStatus={handleToggle}
          onChangePassword={(selected) => {
            setSelectedUser(selected);
            setShowModal(true);
          }}
          onChangeStock={handleStockChange}
        />

      </div>

      {/* PASSWORD MODAL */}

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