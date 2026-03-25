import { Loader2, FileText } from "lucide-react";

export default function PDFModal({
    isOpen,
    onClose,
    onConfirm,
    selectedFilter,
    setSelectedFilter,
    cargoDetails,
    setCargoDetails,
    loading = false,
}) {
    if (!isOpen) return null;

    const options = [
        { label: "All", value: "ALL" },
        { label: "Accessories", value: "ACCESSORIES" },
        { label: "Battery", value: "BATTERY" },
    ];

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded shadow-xl w-[520px] p-5 space-y-4">

                {/* HEADER */}
                <div className="flex items-center gap-2 border-b pb-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <h2 className="text-lg font-semibold">Download PDF</h2>
                </div>

                {/* ✅ CARGO DETAILS */}
                <div className="space-y-2 ">
                    <label className="text-xs">Cargo Name</label>
                    <input
                        type="text"
                        placeholder="Cargo Name"
                        value={cargoDetails.cargoName}
                        onChange={(e) =>
                            setCargoDetails({ ...cargoDetails, cargoName: e.target.value })
                        }
                        className="w-full border p-1 px-2 rounded text-sm"
                    />
                     <label className="text-xs">Parcel Size / KG</label>
                    <input
                        type="text"
                        placeholder="Parcel Size / KG"
                        value={cargoDetails.cargoParcel}
                        onChange={(e) =>
                            setCargoDetails({ ...cargoDetails, cargoParcel: e.target.value })
                        }
                        className="w-full border p-1 px-2 rounded text-sm"
                    />
                    <label className="text-xs">Mobile</label>
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={cargoDetails.cargoMobile}
                        onChange={(e) =>
                            setCargoDetails({ ...cargoDetails, cargoMobile: e.target.value })
                        }
                        className="w-full border p-1 px-2 rounded text-sm"
                    />
                    <label className="text-xs">Location</label>
                    <input
                        type="text"
                        placeholder="Cargo Location"
                        value={cargoDetails.cargoLocation}
                        onChange={(e) =>
                            setCargoDetails({ ...cargoDetails, cargoLocation: e.target.value })
                        }
                        className="w-full border p-1 px-2 rounded text-sm"
                    />

                </div>

                {/* OPTIONS */}
                <div className="flex gap-2">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSelectedFilter(opt.value)}
                            className={`flex-1 p-1 px-2 rounded border text-sm ${selectedFilter === opt.value
                                ? "bg-orange-600 text-white"
                                : "bg-white hover:bg-gray-100"
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-2 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm cursor-pointer"
                    >Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={!selectedFilter || loading}
                        className={`px-4 py-2 rounded text-white text-sm ${!selectedFilter || loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700 cursor-pointer"
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                        ) : (
                            "Download"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}