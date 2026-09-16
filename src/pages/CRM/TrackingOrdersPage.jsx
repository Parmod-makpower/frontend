// import { useState, useMemo } from "react";
// import { useOrders } from "../../hooks/useOrders";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { FaCalendarAlt, FaFilter } from "react-icons/fa";
// import TrackingFilter from "../../components/TrackingFilter";
// import { IoChevronBack } from "react-icons/io5";
// import axios from "../../api/axios"


// const TrackingOrdersPage = () => {
//     const { user } = useAuth();
//     const navigate = useNavigate();
//     const [selectedOrders, setSelectedOrders] = useState([]);
//     const [statusFilter, setStatusFilter] = useState("ALL");


//     const toggleSelectOrder = (id) => {
//         setSelectedOrders(prev =>
//             prev.includes(id)
//                 ? prev.filter(o => o !== id)
//                 : [...prev, id]
//         );
//     };

//     const selectAllOrders = () => {
//         const visibleIds = filteredOrders.map(o => o.id);

//         const allSelected = visibleIds.every(id =>
//             selectedOrders.includes(id)
//         );

//         if (allSelected) {
//             // sirf visible orders unselect
//             setSelectedOrders(prev =>
//                 prev.filter(id => !visibleIds.includes(id))
//             );
//         } else {
//             // sirf visible orders select
//             setSelectedOrders(prev =>
//                 Array.from(new Set([...prev, ...visibleIds]))
//             );
//         }
//     };



//     const [drawerOpen, setDrawerOpen] = useState(false);

//     // 🔹 Input typing ke liye (API hit nahi hogi)
//     const [tempFilters, setTempFilters] = useState({
//         order_id: "",
//         party_name: "",
//         from_date: "",
//         to_date: "",
//     });

//     // 🔹 Sirf Apply button par change honge (API hit)
//     const [appliedFilters, setAppliedFilters] = useState({
//         order_id: "",
//         party_name: "",
//         from_date: "",
//         to_date: "",
//     });

//     const {
//         data: orders = [],
//         isLoading,
//         isError,
//         refetch,
//     } = useOrders(appliedFilters); // ✅ ONLY applied filters


//     const handleDelete = async () => {
//         if (!window.confirm("Are you sure? This action is PERMANENT.")) return;

//         try {
//             await axios.post("/crm/orders/bulk-delete/", {
//                 order_ids: selectedOrders,
//             });

//             setSelectedOrders([]);
//             refetch();
//         } catch (err) {
//             alert("Delete failed");
//             console.error(err);
//         }
//     };
//     const filteredOrders = useMemo(() => {
//         if (statusFilter === "ALL") return orders;
//         return orders.filter(o => o.status === statusFilter);
//     }, [orders, statusFilter]);


//     if (isLoading) return <p className="p-4 text-sm">Loading...</p>;
//     if (isError) return <p className="p-4 text-sm text-red-500">Error</p>;

//     return (
//         <div className="">
//             {/* MOBILE HEADER */}
//             <div className="fixed sm:hidden top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow flex items-center justify-between">
//                 <button
//                     onClick={() => window.history.back()}
//                     className="text-gray-700 hover:text-blue-600 text-2xl font-bold px-1"
//                 >
//                     <IoChevronBack />
//                 </button>

//                 <div className="text-sm text-gray-700 ps-3">
//                     Filter Orders: <span className="font-semibold">{orders.length}</span>
//                 </div>

//                 <button
//                     onClick={() => setDrawerOpen(true)}
//                     className="px-3 py-2 text-blue-800 text-sm flex items-center gap-2"
//                 >
//                     <FaFilter /> Filters
//                 </button>
//             </div>

//             <div className="grid grid-cols-12 gap-4 pt-[60px] sm:pt-0 mb-20 sm:mb-0">
//                 {/* TABLE */}
//                 <div className="col-span-12 md:col-span-10">
//                     <div className="h-[74vh] overflow-y-auto">
//                         <table className="w-full border text-sm text-center">
//                             <thead className="bg-blue-100 border sticky top-0">
//                                 <tr>
//                                     {user?.role === "ADMIN" && (
//                                         <th className="border">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={
//                                                     filteredOrders.length > 0 &&
//                                                     filteredOrders.every(o => selectedOrders.includes(o.id))
//                                                 }

//                                                 onChange={selectAllOrders}
//                                             />
//                                         </th>
//                                     )}
//                                     <th className="border">#</th>
//                                     <th className="border">Order ID</th>

//                                     {(user?.role === "ADMIN" || user?.role === "CRM") && (
//                                         <th className="border">Party</th>
//                                     )}

//                                     <th className="border">
//                                         <select
//                                             value={statusFilter}
//                                             onChange={(e) => setStatusFilter(e.target.value)}
//                                             className="bg-blue-100 px-2 cursor-pointer w-full"
//                                         >
//                                             <option value="ALL">All</option>
//                                             <option value="PENDING">Pending</option>
//                                             <option value="APPROVED">Approved</option>
//                                             <option value="REJECTED">Rejected</option>
//                                             <option value="HOLD">Hold</option>
//                                         </select>
//                                     </th>

//                                     <th className="border">Date</th>
//                                     <th className="border">Time</th>
//                                     <th className="border">View</th>
//                                 </tr>
//                             </thead>

//                             <tbody>
//                                 {filteredOrders.length === 0 ? (
//                                     <tr>
//                                         <td colSpan={5} className="border p-4 text-gray-500">
//                                             No orders found
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     filteredOrders.map((o, i) => (
//                                         <tr
//                                             key={o.id}
//                                             className={`${selectedOrders.includes(o.id)
//                                                 ? "bg-yellow-200"
//                                                 : i % 2 === 0
//                                                     ? "bg-white"
//                                                     : "bg-green-50"
//                                                 }
//                                                 hover:bg-gray-100`}

//                                         >{user?.role === "ADMIN" && (
//                                             <td className="border">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={selectedOrders.includes(o.id)}
//                                                     onChange={() => toggleSelectOrder(o.id)}
//                                                 />
//                                             </td>
//                                         )}
//                                             <td className="border">{i + 1}</td>
//                                             <td className="border font-medium ">{o.order_id}</td>

//                                             {(user?.role === "ADMIN" || user?.role === "CRM") && (
//                                                 <td className="border">{o.ss_name}</td>
//                                             )}

//                                             <td
//                                                 className={`border font-semibold
//                                                         ${o.status === "PENDING"
//                                                         ? "bg-yellow-100 text-yellow-800"
//                                                         : o.status === "APPROVED"
//                                                             ? "bg-green-100 text-green-800"
//                                                         : o.status === "HOLD"
//                                                             ? "bg-gray-100 text-gray-800"
//                                                             : o.status === "REJECTED"
//                                                                 ? "bg-red-100 text-red-800"
//                                                                 : ""
//                                                     }
//                                                          `}
//                                             >
//                                                 {o.status}
//                                             </td>


//                                             <td className="border text-xs text-gray-600">
//                                                 <FaCalendarAlt className="inline mr-1 text-gray-400" />
//                                                 {new Date(o.created_at).toLocaleDateString("en-IN")}
//                                             </td>
//                                             <td className="border text-xs text-gray-600">
//                                                 {new Date(o.created_at).toLocaleTimeString("en-IN", {
//                                                     hour: "2-digit",
//                                                     minute: "2-digit",
//                                                     hour12: true
//                                                 })}
//                                             </td>
//                                             <td className="border cursor-pointer" onClick={() =>
//                                                 navigate(`/orders-tracking/${o.order_id}`)
//                                             }><a className="text-blue-600">open</a></td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="text-xs px-2 flex justify-between items-center bg-blue-100 ">
//                         <p className="py-1"> Showing <b>{filteredOrders.length}</b> orders</p>
//                         {user?.role === "ADMIN" && (
//                             <button
//                                 disabled={selectedOrders.length === 0}
//                                 onClick={handleDelete}
//                                 className={`text-sm px-3 py-1 rounded 
//                              ${selectedOrders.length === 0
//                                         ? "bg-gray-300 cursor-not-allowed"
//                                         : "bg-red-500 text-white"
//                                     }`}
//                             >
//                                 Permanent Delete ({selectedOrders.length})
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 {/* DESKTOP FILTER */}
//                 <div className="hidden md:block col-span-2">
//                     <TrackingFilter
//                         open={true}
//                         setOpen={() => { }}
//                         filters={tempFilters}
//                         setFilters={setTempFilters}
//                         inline={true}
//                         onApply={() => {
//                             setAppliedFilters(tempFilters);
//                             refetch();
//                         }}
//                     />
//                 </div>
//             </div>

//             {/* MOBILE FILTER DRAWER */}
//             <TrackingFilter
//                 open={drawerOpen}
//                 setOpen={setDrawerOpen}
//                 filters={tempFilters}
//                 setFilters={setTempFilters}
//                 onApply={() => {
//                     setAppliedFilters(tempFilters);
//                     refetch();
//                     setDrawerOpen(false);
//                 }}
//             />
//         </div>
//     );
// };

// export default TrackingOrdersPage;




import { useState, useMemo } from "react";
import { useOrders } from "../../hooks/useOrders";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
    FaCalendarAlt,
    FaFilter,
    FaChevronRight,
    FaSyncAlt,
    FaBoxOpen,
    FaSearch,
} from "react-icons/fa";

import TrackingFilter from "../../components/TrackingFilter";
import { IoChevronBack } from "react-icons/io5";
import axios from "../../api/axios";


/* =========================================================
   STATUS
========================================================= */

const getStatusStyle = (status) => {
    switch (status) {
        case "PENDING":
            return "bg-amber-50 text-amber-700 border-amber-100";

        case "APPROVED":
            return "bg-emerald-50 text-emerald-700 border-emerald-100";

        case "HOLD":
            return "bg-slate-100 text-slate-700 border-slate-200";

        case "REJECTED":
            return "bg-red-50 text-red-700 border-red-100";

        default:
            return "bg-slate-50 text-slate-600 border-slate-200";
    }
};


/* =========================================================
   MAIN
========================================================= */

const TrackingOrdersPage = () => {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [selectedOrders, setSelectedOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [drawerOpen, setDrawerOpen] = useState(false);


    /* =====================================================
       FILTERS
    ===================================================== */

    const [tempFilters, setTempFilters] = useState({
        order_id: "",
        party_name: "",
        from_date: "",
        to_date: "",
    });

    const [appliedFilters, setAppliedFilters] = useState({
        order_id: "",
        party_name: "",
        from_date: "",
        to_date: "",
    });


    /* =====================================================
       ORDERS
    ===================================================== */

    const {
        data: orders = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useOrders(appliedFilters);


    /* =====================================================
       SELECT
    ===================================================== */

    const toggleSelectOrder = (id) => {

        setSelectedOrders((prev) =>
            prev.includes(id)
                ? prev.filter((o) => o !== id)
                : [...prev, id]
        );

    };


    const selectAllOrders = () => {

        const visibleIds = filteredOrders.map((o) => o.id);

        const allSelected = visibleIds.every((id) =>
            selectedOrders.includes(id)
        );

        if (allSelected) {

            setSelectedOrders((prev) =>
                prev.filter((id) => !visibleIds.includes(id))
            );

        } else {

            setSelectedOrders((prev) =>
                Array.from(
                    new Set([
                        ...prev,
                        ...visibleIds,
                    ])
                )
            );

        }
    };


    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async () => {

        if (
            !window.confirm(
                "Are you sure? This action is PERMANENT."
            )
        ) {
            return;
        }

        try {

            await axios.post(
                "/crm/orders/bulk-delete/",
                {
                    order_ids: selectedOrders,
                }
            );

            setSelectedOrders([]);

            refetch();

        } catch (err) {

            alert("Delete failed");

            console.error(err);

        }
    };


    /* =====================================================
       STATUS FILTER
    ===================================================== */

    const filteredOrders = useMemo(() => {

        if (statusFilter === "ALL") {
            return orders;
        }

        return orders.filter(
            (o) => o.status === statusFilter
        );

    }, [orders, statusFilter]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (isLoading) {

        return (
            <div className="min-h-screen bg-slate-50 p-3 sm:p-5">

                <div className="mx-auto max-w-7xl">

                    {/* HEADER SKELETON */}

                    <div
                        className="
                            h-16
                            animate-pulse
                            rounded-2xl
                            bg-white
                            border border-slate-200
                        "
                    />

                    {/* TABLE SKELETON */}

                    <div
                        className="
                            mt-4
                            overflow-hidden
                            rounded-2xl
                            border border-slate-200
                            bg-white
                            shadow-sm
                        "
                    >

                        <div className="h-12 bg-slate-100 animate-pulse" />

                        <div className="space-y-2 p-3">

                            {[1, 2, 3, 4, 5, 6, 7].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="
                                            h-12
                                            rounded-xl
                                            bg-slate-50
                                            animate-pulse
                                        "
                                    />

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (isError) {

        return (
            <div className="min-h-screen bg-slate-50 p-4">

                <div className="flex min-h-[70vh] items-center justify-center">

                    <div
                        className="
                            w-full max-w-sm
                            rounded-2xl
                            border border-red-100
                            bg-white
                            p-7
                            text-center
                            shadow-sm
                            animate-[fadeIn_.35s_ease-out]
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex h-12 w-12
                                items-center justify-center
                                rounded-xl
                                bg-red-50
                                text-red-500
                            "
                        >
                            <FaBoxOpen />
                        </div>

                        <h2 className="mt-4 text-sm font-bold text-slate-900">
                            Unable to load orders
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Please try again.
                        </p>

                        <button
                            onClick={() => refetch()}
                            className="
                                mt-5
                                rounded-xl
                                bg-blue-600
                                px-5 py-2.5
                                text-xs font-bold
                                text-white
                                transition-all
                                duration-200
                                hover:bg-blue-700
                                hover:-translate-y-0.5
                                hover:shadow-lg
                                active:scale-95
                            "
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div
            className="
                min-h-screen
                bg-slate-50
                text-slate-800
            "
        >


            {/* =================================================
                MOBILE HEADER
            ================================================= */}

            <div
                className="
                    fixed
                    left-0 right-0 top-0
                    z-50
                    flex
                    items-center
                    justify-between
                    border-b border-slate-200
                    bg-white/90
                    px-3 py-3
                    shadow-sm
                    backdrop-blur-xl
                    sm:hidden
                "
            >

                {/* BACK */}

                <button
                    onClick={() => window.history.back()}
                    className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-700
                        transition-all
                        duration-200
                        hover:bg-slate-200
                        active:scale-90
                    "
                >
                    <IoChevronBack />
                </button>


                {/* TITLE */}

                <div className="text-center">

                    <p
                        className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.16em]
                            text-blue-600
                        "
                    >
                        Order Tracking
                    </p>

                    <p className="text-xs font-bold text-slate-800">
                        {filteredOrders.length} Orders
                    </p>

                </div>


                {/* FILTER */}

                <button
                    onClick={() => setDrawerOpen(true)}
                    className="
                        flex
                        items-center
                        gap-1.5
                        rounded-xl
                        bg-blue-50
                        px-3 py-2
                        text-[11px]
                        font-bold
                        text-blue-700
                        transition-all
                        duration-200
                        hover:bg-blue-100
                        active:scale-95
                    "
                >

                    <FaFilter className="text-[10px]" />

                    Filters

                </button>

            </div>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-12
                    gap-4
                    px-3
                    pb-20
                    pt-[64px]
                    sm:px-5
                    sm:pb-5
                    sm:pt-4
                "
            >


                {/* =================================================
                    ORDER SECTION
                ================================================= */}

                <div className="col-span-12 md:col-span-10">


                    <div
                        className="
                            overflow-hidden
                            rounded-2xl
                            border border-slate-200
                            bg-white
                            shadow-sm
                            transition-shadow
                            duration-300
                            hover:shadow-md
                        "
                    >


                        {/* =================================================
                            DESKTOP HEADER
                        ================================================= */}

                        <div
                            className="
                                hidden
                                items-center
                                justify-between
                                border-b border-slate-100
                                px-4 py-3
                                sm:flex
                            "
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex h-10 w-10
                                        items-center justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                        transition-all
                                        duration-300
                                        hover:scale-105
                                        hover:rotate-2
                                    "
                                >
                                    <FaBoxOpen />
                                </div>


                                <div>

                                    <h1
                                        className="
                                            text-sm
                                            font-bold
                                            text-slate-900
                                        "
                                    >
                                        Order Tracking
                                    </h1>

                                    <p
                                        className="
                                            mt-0.5
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        {filteredOrders.length} orders
                                        {isFetching && (
                                            <span className="ml-1 text-blue-500">
                                                • Updating
                                            </span>
                                        )}
                                    </p>

                                </div>

                            </div>


                            {/* REFRESH */}

                            <button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className="
                                    group
                                    flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border border-slate-200
                                    px-3 py-2
                                    text-[11px]
                                    font-semibold
                                    text-slate-600
                                    transition-all
                                    duration-200
                                    hover:border-blue-200
                                    hover:bg-blue-50
                                    hover:text-blue-600
                                    active:scale-95
                                    disabled:opacity-50
                                "
                            >

                                <FaSyncAlt
                                    className={`
                                        transition-transform
                                        duration-300
                                        ${
                                            isFetching
                                                ? "animate-spin"
                                                : "group-hover:rotate-180"
                                        }
                                    `}
                                />

                                Refresh

                            </button>

                        </div>


                        {/* =================================================
                            TABLE
                        ================================================= */}

                        <div
                            className="
                                max-h-[74vh]
                                overflow-auto
                                scrollbar-thin
                            "
                        >

                            <table
                                className="
                                    w-full
                                    min-w-[700px]
                                    border-collapse
                                    text-xs
                                    text-center
                                "
                            >

                                {/* =================================================
                                    THEAD
                                ================================================= */}

                                <thead
                                    className="
                                        sticky
                                        top-0
                                        z-10
                                        bg-blue-50
                                    "
                                >

                                    <tr>

                                        {/* ADMIN */}

                                        {user?.role === "ADMIN" && (

                                            <th
                                                className="
                                                    border-b
                                                    border-slate-200
                                                    px-3 py-3
                                                "
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        filteredOrders.length > 0 &&
                                                        filteredOrders.every(
                                                            (o) =>
                                                                selectedOrders.includes(
                                                                    o.id
                                                                )
                                                        )
                                                    }
                                                    onChange={
                                                        selectAllOrders
                                                    }
                                                    className="
                                                        h-3.5
                                                        w-3.5
                                                        cursor-pointer
                                                        accent-blue-600
                                                    "
                                                />

                                            </th>

                                        )}


                                        <th className="border-b border-slate-200 px-3 py-3 text-slate-500">
                                            #
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-slate-500">
                                            Order ID
                                        </th>


                                        {(user?.role === "ADMIN" ||
                                            user?.role === "CRM") && (

                                            <th className="border-b border-slate-200 px-3 py-3 text-slate-500">
                                                Party
                                            </th>

                                        )}


                                        <th className="border-b border-slate-200 px-3 py-3">

                                            <select
                                                value={statusFilter}
                                                onChange={(e) =>
                                                    setStatusFilter(
                                                        e.target.value
                                                    )
                                                }
                                                className="
                                                    cursor-pointer
                                                    rounded-lg
                                                    bg-blue-50
                                                    px-2 py-1
                                                    text-[10px]
                                                    font-bold
                                                    text-slate-600
                                                    outline-none
                                                    transition-all
                                                    hover:bg-blue-100
                                                "
                                            >

                                                <option value="ALL">
                                                    All Status
                                                </option>

                                                <option value="PENDING">
                                                    Pending
                                                </option>

                                                <option value="APPROVED">
                                                    Approved
                                                </option>

                                                <option value="REJECTED">
                                                    Rejected
                                                </option>

                                                <option value="HOLD">
                                                    Hold
                                                </option>

                                            </select>

                                        </th>


                                        <th className="border-b border-slate-200 px-3 py-3 text-slate-500">
                                            Date
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-slate-500">
                                            Time
                                        </th>

                                        <th className="border-b border-slate-200 px-3 py-3 text-slate-500">
                                            View
                                        </th>

                                    </tr>

                                </thead>


                                {/* =================================================
                                    TBODY
                                ================================================= */}

                                <tbody>

                                    {filteredOrders.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={
                                                    user?.role === "ADMIN"
                                                        ? 8
                                                        : 7
                                                }
                                                className="p-14"
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        flex-col
                                                        items-center
                                                        animate-[fadeIn_.4s_ease-out]
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex h-14 w-14
                                                            items-center
                                                            justify-center
                                                            rounded-2xl
                                                            bg-slate-50
                                                            text-slate-300
                                                        "
                                                    >
                                                        <FaSearch />
                                                    </div>

                                                    <p
                                                        className="
                                                            mt-3
                                                            text-xs
                                                            font-bold
                                                            text-slate-500
                                                        "
                                                    >
                                                        No orders found
                                                    </p>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-[10px]
                                                            text-slate-400
                                                        "
                                                    >
                                                        Try changing your
                                                        filters
                                                    </p>

                                                </div>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredOrders.map((o, i) => (

                                            <tr
                                                key={o.id}
                                                style={{
                                                    animationDelay: `${Math.min(
                                                        i * 35,
                                                        500
                                                    )}ms`,
                                                }}
                                                className={`
                                                    group
                                                    border-b
                                                    border-slate-100
                                                    transition-all
                                                    duration-200
                                                    animate-[rowIn_.35s_ease-out_both]
                                                    ${
                                                        selectedOrders.includes(
                                                            o.id
                                                        )
                                                            ? "bg-amber-50"
                                                            : "bg-white"
                                                    }
                                                    hover:bg-blue-50/50
                                                `}
                                            >

                                                {/* ADMIN CHECKBOX */}

                                                {user?.role === "ADMIN" && (

                                                    <td className="px-3 py-3">

                                                        <input
                                                            type="checkbox"
                                                            checked={selectedOrders.includes(
                                                                o.id
                                                            )}
                                                            onChange={() =>
                                                                toggleSelectOrder(
                                                                    o.id
                                                                )
                                                            }
                                                            className="
                                                                h-3.5
                                                                w-3.5
                                                                cursor-pointer
                                                                accent-blue-600
                                                            "
                                                        />

                                                    </td>

                                                )}


                                                {/* NUMBER */}

                                                <td
                                                    className="
                                                        px-3 py-3
                                                        text-slate-400
                                                    "
                                                >
                                                    {i + 1}
                                                </td>


                                                {/* ORDER ID */}

                                                <td className="px-3 py-3">

                                                    <span
                                                        className="
                                                            font-bold
                                                            text-slate-800
                                                            transition-colors
                                                            duration-200
                                                            group-hover:text-blue-600
                                                        "
                                                    >
                                                        {o.order_id}
                                                    </span>

                                                </td>


                                                {/* PARTY */}

                                                {(user?.role === "ADMIN" ||
                                                    user?.role === "CRM") && (

                                                    <td
                                                        className="
                                                            max-w-[180px]
                                                            truncate
                                                            px-3 py-3
                                                            font-medium
                                                            text-slate-600
                                                            transition-colors
                                                            group-hover:text-slate-800
                                                        "
                                                    >
                                                        {o.ss_name || "—"}
                                                    </td>

                                                )}


                                                {/* STATUS */}

                                                <td className="px-3 py-3">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            rounded-full
                                                            border
                                                            px-2.5 py-1
                                                            text-[10px]
                                                            font-bold
                                                            transition-all
                                                            duration-200
                                                            group-hover:scale-105
                                                            ${getStatusStyle(
                                                                o.status
                                                            )}
                                                        `}
                                                    >

                                                        <span
                                                            className={`
                                                                mr-1.5
                                                                h-1.5
                                                                w-1.5
                                                                rounded-full
                                                                ${
                                                                    o.status ===
                                                                    "APPROVED"
                                                                        ? "bg-emerald-500"
                                                                        : o.status ===
                                                                          "REJECTED"
                                                                        ? "bg-red-500"
                                                                        : o.status ===
                                                                          "HOLD"
                                                                        ? "bg-slate-500"
                                                                        : "bg-amber-500"
                                                                }
                                                            `}
                                                        />

                                                        {o.status}

                                                    </span>

                                                </td>


                                                {/* DATE */}

                                                <td
                                                    className="
                                                        px-3 py-3
                                                        text-slate-500
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                        "
                                                    >

                                                        <FaCalendarAlt
                                                            className="
                                                                text-[9px]
                                                                text-slate-300
                                                            "
                                                        />

                                                        {new Date(
                                                            o.created_at
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}

                                                    </span>

                                                </td>


                                                {/* TIME */}

                                                <td
                                                    className="
                                                        px-3 py-3
                                                        text-slate-500
                                                    "
                                                >

                                                    {new Date(
                                                        o.created_at
                                                    ).toLocaleTimeString(
                                                        "en-IN",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        }
                                                    )}

                                                </td>


                                                {/* OPEN */}

                                                <td className="px-3 py-3">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/orders-tracking/${o.order_id}`
                                                            )
                                                        }
                                                        className="
                                                            group/open
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-lg
                                                            bg-blue-50
                                                            px-2.5 py-1.5
                                                            text-[10px]
                                                            font-bold
                                                            text-blue-600
                                                            transition-all
                                                            duration-200
                                                            hover:-translate-y-0.5
                                                            hover:bg-blue-600
                                                            hover:text-white
                                                            hover:shadow-md
                                                            active:scale-95
                                                        "
                                                    >

                                                        Open

                                                        <FaChevronRight
                                                            className="
                                                                text-[8px]
                                                                transition-transform
                                                                duration-200
                                                                group-hover/open:translate-x-0.5
                                                            "
                                                        />

                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div
                            className="
                                flex
                                min-h-11
                                items-center
                                justify-between
                                gap-3
                                border-t
                                border-slate-100
                                bg-slate-50/70
                                px-3 py-2
                            "
                        >

                            <p
                                className="
                                    text-[10px]
                                    text-slate-400
                                "
                            >

                                Showing{" "}

                                <b className="text-slate-600">
                                    {filteredOrders.length}
                                </b>{" "}

                                orders

                            </p>


                            {user?.role === "ADMIN" && (

                                <button
                                    disabled={
                                        selectedOrders.length === 0
                                    }
                                    onClick={handleDelete}
                                    className={`
                                        rounded-lg
                                        px-3 py-1.5
                                        text-[10px]
                                        font-bold
                                        transition-all
                                        duration-200
                                        ${
                                            selectedOrders.length === 0
                                                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                                                : "bg-red-500 text-white hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-md active:scale-95"
                                        }
                                    `}
                                >

                                    Delete

                                    {selectedOrders.length > 0 &&
                                        ` (${selectedOrders.length})`}

                                </button>

                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    DESKTOP FILTER
                ================================================= */}

                <div
                    className="
                        col-span-2
                        hidden
                        md:block
                    "
                >

                    <TrackingFilter
                        open={true}
                        setOpen={() => {}}
                        filters={tempFilters}
                        setFilters={setTempFilters}
                        inline={true}
                        onApply={() => {

                            setAppliedFilters(
                                tempFilters
                            );

                            refetch();

                        }}
                    />

                </div>

            </div>


            {/* =================================================
                MOBILE FILTER DRAWER
            ================================================= */}

            <TrackingFilter
                open={drawerOpen}
                setOpen={setDrawerOpen}
                filters={tempFilters}
                setFilters={setTempFilters}
                onApply={() => {

                    setAppliedFilters(
                        tempFilters
                    );

                    refetch();

                    setDrawerOpen(false);

                }}
            />


            {/* =================================================
                ANIMATION KEYFRAMES
            ================================================= */}

            <style>
                {`
                    @keyframes rowIn {
                        from {
                            opacity: 0;
                            transform: translateY(6px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(5px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        *,
                        *::before,
                        *::after {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important;
                        }
                    }
                `}
            </style>

        </div>
    );
};


export default TrackingOrdersPage;