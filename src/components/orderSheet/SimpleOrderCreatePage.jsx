import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useCachedSSUsers } from "../../auth/useSS";
import { useCreateSimpleOrder } from "../../hooks/CRM/useCreateSimpleOrder";

export default function SimpleOrderCreateModal({ showModal, setShowModal }) {
    const { user } = useAuth();
    const { data: ssUsers = [] } = useCachedSSUsers();
    const createOrder = useCreateSimpleOrder();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const [selectedSS, setSelectedSS] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false); // ⭐ NEW

    const listRef = useRef(null);

    // 🔍 Filter only when user is typing
    useEffect(() => {
        if (!searchTerm || isSelecting) {
            setFilteredUsers([]);
            return;
        }

        const filtered = ssUsers.filter((ss) =>
            ss.party_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredUsers(filtered);
        setHighlightIndex(0);
    }, [searchTerm, ssUsers, isSelecting]);

    if (!showModal) return null;

    // ⌨️ Keyboard navigation
    const handleKeyDown = (e) => {
        if (!filteredUsers.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < filteredUsers.length - 1 ? prev + 1 : prev
            );
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const ss = filteredUsers[highlightIndex];
            handleSelectSS(ss);
        }
    };

    // ✅ Proper select handler
    const handleSelectSS = (ss) => {
        setIsSelecting(true);
        setSelectedSS(ss);
        setSearchTerm(ss.party_name);
        setFilteredUsers([]);
    };

    // ✍️ When user starts typing again
    const handleChange = (e) => {
        setIsSelecting(false);
        setSelectedSS(null);
        setSearchTerm(e.target.value);
    };

    const handleCreate = () => {
        if (!selectedSS) return alert("Party select kare");

        setLoading(true);

        createOrder.mutate(
            {
                ss_id: selectedSS.id,
                crm_id: user.id,
            },
            {
                onSuccess: (data) => {
                    // ✅ SAME API REFRESH AS SUBMIT / HOLD / REJECT
                    queryClient.invalidateQueries({
                        queryKey: ["crmOrders"],
                        exact: false,
                    });

                    alert("Order created successfully");

                    setSelectedSS(null);
                    setSearchTerm("");
                    setShowModal(false);
                    setLoading(false);

                    // (optional) agar direct order detail pe jaana ho:
                    // navigate(`/crm/orders/${data.order.id}`);
                },
                onError: () => {
                    alert("Order create failed");
                    setLoading(false);
                },
            }
        );
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-5">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Create Empty Order</h2>
                    <button
                        onClick={() => setShowModal(false)}
                        className="text-xl text-gray-500"
                    >
                        ×
                    </button>
                </div>

                {/* BODY */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={searchTerm}
                        placeholder="Search Party..."
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        className="w-full border px-3 py-2 rounded focus:outline-none"
                    />

                    {filteredUsers.length > 0 && !isSelecting && (
                        <div className="absolute left-0 right-0 top-full bg-white border shadow-lg max-h-48 overflow-y-auto z-50">
                            {filteredUsers.map((ss, index) => (
                                <div
                                    key={ss.id}
                                    onClick={() => handleSelectSS(ss)}
                                    className={`px-3 py-2 text-sm cursor-pointer ${highlightIndex === index
                                            ? "bg-orange-100"
                                            : "hover:bg-gray-100"
                                        }`}
                                >
                                    {ss.party_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 border rounded cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white cursor-pointer ${loading
                                ? "bg-green-400"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {loading ? "Creating..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
