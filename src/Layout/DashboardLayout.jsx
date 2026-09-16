
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import Navbar from "./../components/Navbar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Separate Navbar Component */}
      <Navbar />

      {/* Page Content */}
      <main className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0 lg:p-4">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.08)] md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

// import { Outlet } from "react-router-dom";
// import BottomNav from "./BottomNav";
// import Navbar from "./../components/Navbar";
// import { useState } from "react";

// export default function DashboardLayout() {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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