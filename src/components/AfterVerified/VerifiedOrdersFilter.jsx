import { FaFilter } from "react-icons/fa";
import PartySearchInput from "../PartySearchInput";

export default function VerifiedOrdersFilter({
    open,
    setOpen,
    filters,
    setFilters,
    onApply,
    inline = false,
}) {
    const handleChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClear = () => {
        const cleared = {
            q: "",
            party: "",
            fromDate: "",
            toDate: "",
            punched: filters.punched, // preserve
        };

        setFilters(cleared);
        onApply(cleared); // 🔥 direct apply
    };

    return (
        <div
            className={`${inline
                ? "bg-white border shadow p-1"
                : `fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-lg z-50 transform ${open ? "translate-x-0" : "translate-x-full"
                } transition-transform`
                }`}
        >
            {!inline && (
                <div className="flex justify-between items-center p-3 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        Filters
                    </h2>
                    <button onClick={() => setOpen(false)}>✕</button>
                </div>
            )}

            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="font-semibold text-sm flex items-center gap-1 ">
                        <FaFilter /> Filters
                    </h2>

                </div>
                {/* 🔎 Order */}
                <label className="text-xs">Order ID</label>
                <input
                    value={filters.q}
                    onChange={(e) => handleChange("q", e.target.value)}
                    placeholder=" Order ID / Code"
                    className="w-full border px-2 py-1 text-sm rounded"
                />


                {/* 🏢 Party */}
                <label className="text-xs">Party name</label>

                <PartySearchInput
                    value={filters.party}
                    setValue={(val) => handleChange("party", val)}
                    onSelect={(user) => {
                        handleChange("party", user.party_name); // 🔥 filter apply
                    }}
                    placeholder="Search Party"
                />

                {/* 📅 Date */}
                <label className="text-xs">From Date</label>
                <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => handleChange("fromDate", e.target.value)}
                    className="w-full border px-2 py-1 text-sm rounded"
                />

                <label className="text-xs">To Date</label>
                <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => handleChange("toDate", e.target.value)}
                    className="w-full border px-2 py-1 text-sm rounded"
                />

                <div className="pt-4 border-t flex gap-2">
                    <button
                        onClick={handleClear}
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
        </div>
    );
}