import { useState } from "react";
import { FaLock, FaTimes, FaSave } from "react-icons/fa";

export default function ChangePasswordModal({ isOpen, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword) return alert("Please enter a new password");
    onSave(newPassword);
    setNewPassword("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaLock /> Change Password
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaSave /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



// import { useEffect, useState } from "react";
// import {
//   FaLock,
//   FaTimes,
//   FaSave,
//   FaEye,
//   FaEyeSlash,
// } from "react-icons/fa";

// export default function ChangePasswordModal({
//   isOpen,
//   onClose,
//   onSave,
// }) {
//   const [newPassword, setNewPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setNewPassword("");
//       setShowPassword(false);
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!newPassword.trim()) {
//       alert("Please enter a new password");
//       return;
//     }

//     onSave(newPassword);
//     setNewPassword("");
//   };

//   return (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 px-3 backdrop-blur-[2px] animate-in fade-in duration-200"
//       onMouseDown={(e) => {
//         if (e.target === e.currentTarget) {
//           onClose();
//         }
//       }}
//     >
//       <div className="w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
//         {/* =================================================
//             HEADER
//         ================================================= */}
//         <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
//           <div className="flex items-center gap-2.5">
//             <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
//               <FaLock className="text-sm" />
//             </div>

//             <div>
//               <h2 className="text-sm font-bold text-gray-800">
//                 Change Password
//               </h2>

//               <p className="mt-0.5 text-[9px] text-gray-400">
//                 Set a new password for this user
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-200 hover:text-gray-700 active:scale-95"
//           >
//             <FaTimes className="text-xs" />
//           </button>
//         </div>

//         {/* =================================================
//             BODY
//         ================================================= */}
//         <form onSubmit={handleSubmit}>
//           <div className="p-4">
//             <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-gray-500">
//               New Password
//             </label>

//             <div className="relative">
//               <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400" />

//               <input
//                 autoFocus
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter new password"
//                 value={newPassword}
//                 onChange={(e) =>
//                   setNewPassword(e.target.value)
//                 }
//                 className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-10 text-xs text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-50"
//               />

//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowPassword((prev) => !prev)
//                 }
//                 className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-700 active:scale-95"
//                 title={
//                   showPassword
//                     ? "Hide password"
//                     : "Show password"
//                 }
//               >
//                 {showPassword ? (
//                   <FaEyeSlash className="text-[11px]" />
//                 ) : (
//                   <FaEye className="text-[11px]" />
//                 )}
//               </button>
//             </div>

//             <p className="mt-1.5 text-[8px] text-gray-400">
//               Enter the new password and click Save.
//             </p>
//           </div>

//           {/* =================================================
//               FOOTER
//           ================================================= */}
//           <div className="flex gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="h-9 flex-1 rounded-lg border border-gray-200 bg-white text-[10px] font-bold text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 active:scale-[0.98]"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={!newPassword.trim()}
//               className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 text-[10px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-purple-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
//             >
//               <FaSave className="text-[10px]" />
//               Save Password
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }