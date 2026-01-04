import { useState } from "react";
import { FaFilter, FaTimes } from "react-icons/fa";
import { useCachedSSUsers } from "../auth/useSS";
import { useAuth } from "../context/AuthContext";

{/* FILTERS */}
const TrackingFilter = ({ open, setOpen, filters, setFilters, onApply, inline = false, }) => {
    const { user } = useAuth();
    const { data: ssUsers = [] } = useCachedSSUsers();
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredParties = ssUsers.filter((u) =>
        (u.party_name || "").toLowerCase().includes((filters.party_name || "").toLowerCase())
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
            {open && !inline && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Offcanvas Panel */}
            <div
                className={
                    inline
                        ? "bg-gray-50 border p-4  space-y-3"
                        : `fixed right-0 top-0 p-4 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 
         ${open ? "translate-x-0" : "translate-x-full"}`
                }
            >

                {/* Header */}
                <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="font-semibold text-sm flex items-center gap-1 ">
                        <FaFilter /> Filters
                    </h2>
                    {!inline && (
                        <button onClick={() => setOpen(false)}>
                            <FaTimes className="text-xl cursor-pointer" />
                        </button>
                    )}

                </div>

                {/* Body */}
                
                    <div>
                        <label className="text-xs">Order ID</label>
                        <input
                            type="text"
                            name="order_id"
                            value={filters.order_id}
                            onChange={handleChange}
                            placeholder="Search order ID"
                            className="w-full border px-2 py-1 text-sm rounded"
                        />
                    </div>
                    {(user?.role === "ADMIN" || user?.role === "CRM") && (
                        <div className="relative">
                            <label className="text-xs">Party Name</label>
                            <input
                                type="text"
                                name="party_name"
                                value={filters.party_name}
                                onChange={(e) => {
                                    handleChange(e);
                                    setShowSuggestions(true);
                                }}
                                placeholder="Search party"
                                className="w-full border px-2 py-1 text-sm rounded"
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
                        <label className="text-xs">From Date</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleChange}
                            className="w-full border px-2 py-1 text-sm rounded"
                        />
                    </div>

                    <div>
                        <label className="text-xs">To Date</label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleChange}
                            className="w-full border px-2 py-1 text-sm rounded"
                        />
                    </div>
                

                {/* Footer */}
                <div className="pt-4 border-t flex gap-2">
                    <button
                        onClick={clearFilters}
                        className="w-full bg-gray-500 text-white text-sm py-1 rounded"
                    >
                        Clear
                    </button>

                    <button
                        onClick={() => {
                            onApply();
                            setOpen(false);
                        }}
                        className="w-full bg-red-500 text-white text-sm py-1 rounded"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </>
    );
};

export default TrackingFilter;
