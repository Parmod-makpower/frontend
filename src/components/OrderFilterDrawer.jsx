import { useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import { useCachedSSUsers } from "../auth/useSS";
import { useAuth } from "../context/AuthContext";


const OrderFilterDrawer = ({ open, setOpen, filters, setFilters, onApply }) => {
    const { user } = useAuth();
    const { data: ssUsers = [] } = useCachedSSUsers();
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredParties = ssUsers.filter((u) =>
        u.party_name.toLowerCase().includes(filters.party_name.toLowerCase())
    );

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const clearFilters = () => {
        setFilters({
            order_id: "",
            party_name: "",
            from_date: "",
            to_date: "",
        });
        onApply();
        setOpen(false);
    };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Offcanvas Panel */}
            <div
                className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 
        ${open ? "translate-x-0" : "translate-x-full"} `}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FaFilter /> Filters
                    </h2>
                    <button onClick={() => setOpen(false)}>
                        <FaTimes className="text-xl cursor-pointer" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Order ID</label>
                        <input
                            type="text"
                            name="order_id"
                            value={filters.order_id}
                            onChange={handleChange}
                            placeholder="Search order ID"
                            className="w-full mt-1 p-2 border rounded-lg"
                        />
                    </div>
                    {(user?.role === "ADMIN" || user?.role === "CRM") && (
                        <div className="relative">
                            <label className="text-sm font-medium">Party Name</label>
                            <input
                                type="text"
                                name="party_name"
                                value={filters.party_name}
                                onChange={(e) => {
                                    handleChange(e);
                                    setShowSuggestions(true);
                                }}
                                placeholder="Search party"
                                className="w-full mt-1 p-2 border rounded-lg"
                                autoComplete="off"
                            />

                            {/* Suggestions Box */}
                            {showSuggestions && filters.party_name.length > 0 && (
                                <div className="absolute left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-50 shadow-md">
                                    {filteredParties.length > 0 ? (
                                        filteredParties.map((party) => (
                                            <div
                                                key={party.id}
                                                className="p-2 hover:bg-blue-50 cursor-pointer"
                                                onClick={() => {
                                                    setFilters({ ...filters, party_name: party.party_name });
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {party.party_name}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-gray-500">No match found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}


                    <div>
                        <label className="text-sm font-medium">From Date</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">To Date</label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-lg"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-between">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-200 rounded-lg font-medium"
                    >
                        Clear
                    </button>

                    <button
                        onClick={() => {
                            onApply();
                            setOpen(false);
                        }}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </>
    );
};

export default OrderFilterDrawer;
