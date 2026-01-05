import { useState, useMemo } from "react";
import { useOrders } from "../../hooks/useOrders";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaFilter } from "react-icons/fa";
import TrackingFilter from "../../components/TrackingFilter";
import { IoChevronBack } from "react-icons/io5";
import axios from "../../api/axios"


const TrackingOrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");


    const toggleSelectOrder = (id) => {
        setSelectedOrders(prev =>
            prev.includes(id)
                ? prev.filter(o => o !== id)
                : [...prev, id]
        );
    };

    const selectAllOrders = () => {
        const visibleIds = filteredOrders.map(o => o.id);

        const allSelected = visibleIds.every(id =>
            selectedOrders.includes(id)
        );

        if (allSelected) {
            // sirf visible orders unselect
            setSelectedOrders(prev =>
                prev.filter(id => !visibleIds.includes(id))
            );
        } else {
            // sirf visible orders select
            setSelectedOrders(prev =>
                Array.from(new Set([...prev, ...visibleIds]))
            );
        }
    };



    const [drawerOpen, setDrawerOpen] = useState(false);

    // 🔹 Input typing ke liye (API hit nahi hogi)
    const [tempFilters, setTempFilters] = useState({
        order_id: "",
        party_name: "",
        from_date: "",
        to_date: "",
    });

    // 🔹 Sirf Apply button par change honge (API hit)
    const [appliedFilters, setAppliedFilters] = useState({
        order_id: "",
        party_name: "",
        from_date: "",
        to_date: "",
    });

    const {
        data: orders = [],
        isLoading,
        isError,
        refetch,
    } = useOrders(appliedFilters); // ✅ ONLY applied filters


    const handleDelete = async () => {
        if (!window.confirm("Are you sure? This action is PERMANENT.")) return;

        try {
            await axios.post("/crm/orders/bulk-delete/", {
                order_ids: selectedOrders,
            });

            setSelectedOrders([]);
            refetch();
        } catch (err) {
            alert("Delete failed");
            console.error(err);
        }
    };
    const filteredOrders = useMemo(() => {
        if (statusFilter === "ALL") return orders;
        return orders.filter(o => o.status === statusFilter);
    }, [orders, statusFilter]);


    if (isLoading) return <p className="p-4 text-sm">Loading...</p>;
    if (isError) return <p className="p-4 text-sm text-red-500">Error</p>;

    return (
        <div className="">
            {/* MOBILE HEADER */}
            <div className="fixed sm:hidden top-0 left-0 right-0 z-50 bg-white p-3 border-b border-gray-300 shadow flex items-center justify-between">
                <button
                    onClick={() => window.history.back()}
                    className="text-gray-700 hover:text-blue-600 text-2xl font-bold px-1"
                >
                    <IoChevronBack />
                </button>

                <div className="text-sm text-gray-700 ps-3">
                    Filter Orders: <span className="font-semibold">{orders.length}</span>
                </div>

                <button
                    onClick={() => setDrawerOpen(true)}
                    className="px-3 py-2 text-blue-800 text-sm flex items-center gap-2"
                >
                    <FaFilter /> Filters
                </button>
            </div>

            <div className="grid grid-cols-12 gap-4 pt-[60px] sm:pt-0 mb-20 sm:mb-0">
                {/* TABLE */}
                <div className="col-span-12 md:col-span-10">
                    <div className="h-[74vh] overflow-y-auto">
                        <table className="w-full border text-sm text-center">
                            <thead className="bg-blue-100 border sticky top-0">
                                <tr>
                                    {user?.role === "ADMIN" && (
                                        <th className="border">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filteredOrders.length > 0 &&
                                                    filteredOrders.every(o => selectedOrders.includes(o.id))
                                                }

                                                onChange={selectAllOrders}
                                            />
                                        </th>
                                    )}
                                    <th className="border">#</th>
                                    <th className="border">Order ID</th>

                                    {(user?.role === "ADMIN" || user?.role === "CRM") && (
                                        <th className="border">Party</th>
                                    )}

                                    <th className="border">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="bg-blue-100 px-2 cursor-pointer w-full"
                                        >
                                            <option value="ALL">All</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </th>

                                    <th className="border">Date</th>
                                    <th className="border">Time</th>
                                    <th className="border">View</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="border p-4 text-gray-500">
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((o, i) => (
                                        <tr
                                            key={o.id}
                                            className={`${selectedOrders.includes(o.id)
                                                ? "bg-yellow-200"
                                                : i % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-green-50"
                                                }
                                                hover:bg-gray-100`}

                                        >{user?.role === "ADMIN" && (
                                            <td className="border">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(o.id)}
                                                    onChange={() => toggleSelectOrder(o.id)}
                                                />
                                            </td>
                                        )}
                                            <td className="border">{i + 1}</td>
                                            <td className="border font-medium ">{o.order_id}</td>

                                            {(user?.role === "ADMIN" || user?.role === "CRM") && (
                                                <td className="border">{o.ss_name}</td>
                                            )}

                                            <td
                                                className={`border font-semibold
                                                        ${o.status === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : o.status === "APPROVED"
                                                            ? "bg-green-100 text-green-800"
                                                            : o.status === "REJECTED"
                                                                ? "bg-red-100 text-red-800"
                                                                : ""
                                                    }
                                                         `}
                                            >
                                                {o.status}
                                            </td>


                                            <td className="border text-xs text-gray-600">
                                                <FaCalendarAlt className="inline mr-1 text-gray-400" />
                                                {new Date(o.created_at).toLocaleDateString("en-IN")}
                                            </td>
                                            <td className="border text-xs text-gray-600">
                                                {new Date(o.created_at).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true
                                                })}
                                            </td>
                                            <td className="border cursor-pointer" onClick={() =>
                                                navigate(`/orders-tracking/${o.order_id}`)
                                            }><a className="text-blue-600">open</a></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-xs px-2 flex justify-between items-center bg-blue-100 ">
                        <p className="py-1"> Showing <b>{filteredOrders.length}</b> orders</p>
                        {user?.role === "ADMIN" && (
                            <button
                                disabled={selectedOrders.length === 0}
                                onClick={handleDelete}
                                className={`text-sm px-3 py-1 rounded 
                             ${selectedOrders.length === 0
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-red-500 text-white"
                                    }`}
                            >
                                Permanent Delete ({selectedOrders.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* DESKTOP FILTER */}
                <div className="hidden md:block col-span-2">
                    <TrackingFilter
                        open={true}
                        setOpen={() => { }}
                        filters={tempFilters}
                        setFilters={setTempFilters}
                        inline={true}
                        onApply={() => {
                            setAppliedFilters(tempFilters);
                            refetch();
                        }}
                    />
                </div>
            </div>

            {/* MOBILE FILTER DRAWER */}
            <TrackingFilter
                open={drawerOpen}
                setOpen={setDrawerOpen}
                filters={tempFilters}
                setFilters={setTempFilters}
                onApply={() => {
                    setAppliedFilters(tempFilters);
                    refetch();
                    setDrawerOpen(false);
                }}
            />
        </div>
    );
};

export default TrackingOrdersPage;
