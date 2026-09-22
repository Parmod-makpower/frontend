// // import { Outlet } from "react-router-dom";
// // import BottomNav from "./BottomNav";
// // import Navbar from "./../components/Navbar";

// // export default function DashboardLayout() {
// //   return (
// //     <div className="flex min-h-screen flex-col bg-gray-50">
// //       {/* Separate Navbar Component */}
// //       <Navbar />

// //       {/* Page Content */}
// //       <main className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0 lg:p-4">
// //         <Outlet />
// //       </main>

// //       {/* Mobile Bottom Navigation */}
// //       <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.08)] md:hidden">
// //         <BottomNav />
// //       </div>
// //     </div>
// //   );
// // }

// // import { Outlet } from "react-router-dom";
// // import BottomNav from "./BottomNav";
// // import Navbar from "./../components/Navbar";
// // import { useState } from "react";

// // export default function DashboardLayout() {
// //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// //   return (
// //     <div className="min-h-screen bg-[#f5f7fb]">

// //       {/* ================= DESKTOP APP SHELL ================= */}
// //       <div className="hidden md:block">

// //         <Navbar
// //           sidebarCollapsed={sidebarCollapsed}
// //           setSidebarCollapsed={setSidebarCollapsed}
// //         />

// //         {/* MAIN CONTENT */}
// //         <main
// //           className={`min-h-screen pt-[64px] transition-all duration-200 ${
// //             sidebarCollapsed
// //               ? "ml-[72px]"
// //               : "ml-[220px]"
// //           }`}
// //         >
// //           <div className="min-h-[calc(100vh-64px)] p-4 lg:p-5">
// //             <Outlet />
// //           </div>
// //         </main>

// //       </div>

// //       {/* ================= MOBILE ================= */}
// //       <div className="md:hidden min-h-screen">

// //         <main className="min-h-screen pb-20">
// //           <Outlet />
// //         </main>

// //         <div className="fixed bottom-0 left-0 right-0 z-[100]">
// //           <BottomNav />
// //         </div>

// //       </div>

// //     </div>
// //   );
// // }


// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import BottomNav from "./BottomNav";
// import Navbar from "./Navbar";
// import { useEffect, useState } from "react";
// import { ArrowLeft } from "lucide-react";

// export default function DashboardLayout() {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();

//   // ---------------------------------------------------------
//   // BACK BUTTON
//   // ---------------------------------------------------------
//   const handleBack = () => {
//     // Browser/React Router ki previous history par jayega
//     navigate(-1);
//   };

//   return (
//     <div className="min-h-screen bg-[#f5f7fb]">

//       {/* ================= DESKTOP APP SHELL ================= */}
//       <div className="hidden md:block">

//         <Navbar
//           sidebarCollapsed={sidebarCollapsed}
//           setSidebarCollapsed={setSidebarCollapsed}
//         />

//         {/* MAIN CONTENT */}
//         <main
//           className={`min-h-screen pt-[64px] transition-all duration-200 ${
//             sidebarCollapsed
//               ? "ml-[72px]"
//               : "ml-[220px]"
//           }`}
//         >
//           <div className="min-h-[calc(100vh-64px)] p-4 lg:p-5">

//             {/* =================================================
//                 GLOBAL BACK BUTTON
//                 Desktop Only
//             ================================================== */}
//             {/* <div className="mb-3">
//               <button
//                 type="button"
//                 onClick={handleBack}
//                 className="
//                   group
//                   inline-flex
//                   items-center
//                   gap-2
//                   rounded-xl
//                   border border-[#e2e8f0]
//                   bg-white
//                   px-3.5
//                   py-2
//                   text-xs
//                   font-semibold
//                   text-[#475569]
//                   shadow-sm
//                   transition-all
//                   duration-200
//                   hover:-translate-x-0.5
//                   hover:border-blue-200
//                   hover:bg-blue-50
//                   hover:text-[#1769ff]
//                   active:scale-[0.98]
//                   cursor-pointer
//                 "
//                 title="Go back"
//               >
//                 <ArrowLeft
//                   size={16}
//                   strokeWidth={2.2}
//                   className="
//                     transition-transform
//                     duration-200
//                     group-hover:-translate-x-0.5
//                   "
//                 />

//                 <span>Back</span>
//               </button>
//             </div> */}

//             {/* PAGE */}
//             <Outlet />

//           </div>
//         </main>

//       </div>

//       {/* ================= MOBILE ================= */}
//       <div className="md:hidden min-h-screen">

//         <main className="min-h-screen pb-20">
//           <Outlet />
//         </main>

//         <div className="fixed bottom-0 left-0 right-0 z-[100]">
//           <BottomNav />
//         </div>

//       </div>

//     </div>
//   );
// }


import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Navbar from "./Navbar";
import { useState } from "react";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#f5f7fb]">

      {/* =====================================================
          DESKTOP APP
      ===================================================== */}
      <div className="hidden h-full md:block">

        {/* ===================================================
            GLOBAL NAVBAR + SIDEBAR
        =================================================== */}
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* ===================================================
            MAIN APPLICATION AREA
        =================================================== */}
        <main
          className={`
            fixed
            bottom-0
            right-0
            top-[64px]
            overflow-hidden
            transition-[left]
            duration-300
            ease-out
            ${
              sidebarCollapsed
                ? "left-[72px]"
                : "left-[220px]"
            }
          `}
        >
          <div
            className="
              flex
              h-full
              min-h-0
              flex-col
              overflow-hidden
              p-3
              lg:p-4
            "
          >
            {/* =================================================
                PAGE AREA
                Each page controls its own Back button,
                scrolling and internal layout.
            ================================================= */}
            <div
              className="
                min-h-0
                flex-1
                overflow-hidden
              "
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          MOBILE APP
      ===================================================== */}
      <div className="relative h-full md:hidden">

        <main
          className="
            h-full
            overflow-y-auto
            overflow-x-hidden
            pb-20
          "
        >
          <Outlet />
        </main>

        {/* MOBILE BOTTOM NAV */}
        <div
          className="
            fixed
            bottom-0
            left-0
            right-0
            z-[100]
          "
        >
          <BottomNav />
        </div>

      </div>
    </div>
  );
}