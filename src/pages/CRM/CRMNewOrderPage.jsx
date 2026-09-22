// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { useCachedSSUsers } from "../../auth/useSS";
// import { useCreateSimpleOrder } from "../../hooks/CRM/useCreateSimpleOrder";
// import OrderGoogleSheet from "./OrderGoogleSheet";
// import { ArrowLeft, Search, UserRound, X, CheckCircle2 } from "lucide-react";
// import { verifyCRMOrder } from "../../hooks/useCRMOrders";

// export default function CRMNewOrderPage() {
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const { data: ssUsers = [], isLoading: ssLoading } = useCachedSSUsers();
//     const createOrder = useCreateSimpleOrder();
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedSS, setSelectedSS] = useState(null);
//     const [showSuggestions, setShowSuggestions] = useState(false);
//     const [selectedCity, setSelectedCity] = useState("Delhi");

//     // ⭐ Newly created CRM order
//     const [createdOrder, setCreatedOrder] = useState(null);

//     const filteredUsers = useMemo(() => {
//         const term = searchTerm.trim().toLowerCase();

//         if (!term || selectedSS) return [];

//         return ssUsers
//             .filter((ss) =>
//                 String(ss?.party_name || "")
//                     .toLowerCase()
//                     .includes(term)
//             )
//             .slice(0, 20);
//     }, [searchTerm, ssUsers, selectedSS]);

//     const handleSelectSS = (ss) => {
//         setSelectedSS(ss);
//         setSearchTerm(ss.party_name || "");
//         setShowSuggestions(false);
//     };

//     const handleClearSS = () => {
//         // Don't allow changing party after order has been created
//         if (createdOrder) return;

//         setSelectedSS(null);
//         setSearchTerm("");
//         setShowSuggestions(false);
//     };

//     const handleCreateOrder = () => {
//         if (!selectedSS) {
//             alert("Please select Party / SS first.");
//             return;
//         }

//         if (!user?.id) {
//             alert("CRM user information not found.");
//             return;
//         }

//         createOrder.mutate(
//             {
//                 ss_id: selectedSS.id,
//                 crm_id: user.id,
//             },
//             {
//                 onSuccess: (data) => {
//                     console.log("Simple order created:", data);

//                     if (!data?.order?.id) {
//                         console.error("Created order ID missing:", data);
//                         alert("Order created but order ID was not received.");
//                         return;
//                     }

//                     // 🔥 New order ke liye previous order ka product data remove
//                     localStorage.removeItem("crm_selected_products");

//                     // Existing selected party values ko current party ke saath sync rakho
//                     localStorage.setItem(
//                         "crm_selected_ss",
//                         JSON.stringify(selectedSS.id)
//                     );

//                     localStorage.setItem(
//                         "crm_selected_ss_name",
//                         selectedSS.party_name || ""
//                     );

//                     // Default dispatch location
//                     setSelectedCity("Delhi");

//                     setCreatedOrder(data.order);
//                 },

//                 onError: (error) => {
//                     console.error("Create order failed:", error);

//                     alert(
//                         error?.response?.data?.detail ||
//                         error?.response?.data?.error ||
//                         "Order create failed."
//                     );
//                 },
//             }
//         );
//     };

//     const handleSubmitOrder = async () => {
//         if (!createdOrder?.id) {
//             alert("Order not found.");
//             return;
//         }

//         const savedProducts = localStorage.getItem("crm_selected_products");

//         if (!savedProducts) {
//             alert("Please add at least one product.");
//             return;
//         }

//         let selectedProducts = [];

//         try {
//             selectedProducts = JSON.parse(savedProducts);
//         } catch (error) {
//             console.error("Invalid selected products:", error);
//             alert("Unable to read selected products.");
//             return;
//         }

//         if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
//             alert("Please add at least one product.");
//             return;
//         }

//         const items = selectedProducts
//             .map((item) => ({
//                 product: item.product ?? item.id ?? item.product_id,
//                 quantity: Number(item.quantity) || 0,
//             }))
//             .filter((item) => item.product && item.quantity > 0);

//         if (items.length === 0) {
//             alert("Please enter valid product quantities.");
//             return;
//         }

//         const payload = {
//             status: "APPROVED",
//             dispatch_location: selectedCity,
//             items,
//         };

//         console.log("Submitting CRM order:", {
//             orderId: createdOrder.id,
//             payload,
//         });

//         setIsSubmitting(true);

//         try {
//             await verifyCRMOrder(createdOrder.id, payload);

//             alert("Order submitted successfully.");

//             localStorage.removeItem("crm_selected_products");
//             localStorage.removeItem("crm_selected_ss");
//             localStorage.removeItem("crm_selected_ss_name");

//             navigate("/all/orders-history");
//         } catch (error) {
//             console.error("CRM order submit failed:", error);

//             alert(
//                 error?.response?.data?.detail ||
//                 error?.response?.data?.error ||
//                 "Order submit failed."
//             );
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     const orderCreated = Boolean(createdOrder?.id);

//     return (
//         <div className="min-h-screen bg-[#f5f7fb] pb-24">
//             {/* HEADER */}
//             <div className="sticky top-0 z-40 border-b border-[#e7edf5] bg-white/95 backdrop-blur">
//                 <div className="flex min-h-[64px] items-center justify-between gap-3 px-3 sm:px-5">
//                     <div className="flex min-w-0 items-center gap-3">
//                         <button
//                             type="button"
//                             onClick={() => navigate(-1)}
//                             className="
//                 inline-flex h-9 w-9 shrink-0 items-center justify-center
//                 rounded-lg border border-[#e2e8f0]
//                 bg-white text-[#475569]
//                 transition-all duration-200
//                 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1769ff]
//                 active:scale-95
//               "
//                             title="Back"
//                         >
//                             <ArrowLeft size={17} />
//                         </button>

//                         <div className="min-w-0">
//                             <h1 className="truncate text-base font-bold text-[#0f172a] sm:text-lg">
//                                 Create New Order
//                             </h1>

//                             <p className="hidden text-xs text-[#94a3b8] sm:block">
//                                 Create CRM order for an SS / Party
//                             </p>
//                         </div>
//                     </div>

//                     <div className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 sm:flex">
//                         <UserRound size={15} className="text-[#1769ff]" />

//                         <span className="max-w-[180px] truncate text-xs font-semibold text-[#1769ff]">
//                             {user?.name || user?.user_id || "CRM"}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* PAGE CONTENT */}
//             <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-5">
//                 {/* PARTY SELECTION */}
//                 <section className="rounded-2xl border border-[#e7edf5] bg-white p-4 shadow-sm sm:p-5">
//                     <div className="mb-3">
//                         <h2 className="text-sm font-bold text-[#0f172a]">
//                             Select Party / SS
//                         </h2>

//                         <p className="mt-0.5 text-xs text-[#94a3b8]">
//                             Select the party for which you want to create the order.
//                         </p>
//                     </div>

//                     <div className="relative max-w-xl">
//                         <div
//                             className={`
//                 flex h-11 items-center rounded-xl border bg-white
//                 transition-all duration-200
//                 ${showSuggestions
//                                     ? "border-[#1769ff] ring-2 ring-blue-100"
//                                     : "border-[#dbe3ee]"
//                                 }
//               `}
//                         >
//                             <Search
//                                 size={17}
//                                 className="ml-3 shrink-0 text-[#94a3b8]"
//                             />

//                             <input
//                                 type="text"
//                                 value={searchTerm}
//                                 disabled={orderCreated}
//                                 placeholder={
//                                     ssLoading ? "Loading parties..." : "Search Party Name..."
//                                 }
//                                 onChange={(e) => {
//                                     if (orderCreated) return;

//                                     setSearchTerm(e.target.value);
//                                     setSelectedSS(null);
//                                     setShowSuggestions(true);
//                                 }}
//                                 onFocus={() => {
//                                     if (!orderCreated && !selectedSS && searchTerm.trim()) {
//                                         setShowSuggestions(true);
//                                     }
//                                 }}
//                                 className="
//                   h-full min-w-0 flex-1 bg-transparent
//                   px-3 text-sm text-[#0f172a]
//                   outline-none placeholder:text-[#94a3b8]
//                   disabled:cursor-default
//                 "
//                             />

//                             {selectedSS && !orderCreated && (
//                                 <button
//                                     type="button"
//                                     onClick={handleClearSS}
//                                     className="
//                     mr-2 inline-flex h-7 w-7 items-center justify-center
//                     rounded-lg text-[#94a3b8]
//                     transition hover:bg-slate-100 hover:text-[#475569]
//                   "
//                                     title="Change party"
//                                 >
//                                     <X size={15} />
//                                 </button>
//                             )}
//                         </div>

//                         {/* SUGGESTIONS */}
//                         {showSuggestions &&
//                             !selectedSS &&
//                             !orderCreated &&
//                             filteredUsers.length > 0 && (
//                                 <div
//                                     className="
//                     absolute left-0 right-0 top-[calc(100%+6px)] z-50
//                     max-h-64 overflow-y-auto
//                     rounded-xl border border-[#e2e8f0]
//                     bg-white shadow-xl
//                   "
//                                 >
//                                     {filteredUsers.map((ss) => (
//                                         <button
//                                             key={ss.id}
//                                             type="button"
//                                             onClick={() => handleSelectSS(ss)}
//                                             className="
//                         flex w-full items-center gap-3
//                         border-b border-[#f1f5f9] px-4 py-3
//                         text-left last:border-b-0
//                         transition-colors duration-150
//                         hover:bg-blue-50
//                       "
//                                         >
//                                             <div
//                                                 className="
//                           flex h-8 w-8 shrink-0 items-center justify-center
//                           rounded-lg bg-blue-50 text-[#1769ff]
//                         "
//                                             >
//                                                 <UserRound size={15} />
//                                             </div>

//                                             <div className="min-w-0">
//                                                 <p className="truncate text-sm font-semibold text-[#0f172a]">
//                                                     {ss.party_name || "Unnamed Party"}
//                                                 </p>

//                                                 <p className="mt-0.5 truncate text-[11px] text-[#94a3b8]">
//                                                     {ss.name || ss.user_id || ss.mobile || ""}
//                                                 </p>
//                                             </div>
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}

//                         {showSuggestions &&
//                             !selectedSS &&
//                             !orderCreated &&
//                             searchTerm.trim() &&
//                             !ssLoading &&
//                             filteredUsers.length === 0 && (
//                                 <div
//                                     className="
//                     absolute left-0 right-0 top-[calc(100%+6px)] z-50
//                     rounded-xl border border-[#e2e8f0]
//                     bg-white p-4 text-center shadow-xl
//                   "
//                                 >
//                                     <p className="text-sm font-medium text-[#475569]">
//                                         No party found
//                                     </p>
//                                 </div>
//                             )}
//                     </div>

//                     {/* SELECTED PARTY */}
//                     {selectedSS && (
//                         <div
//                             className="
//                 mt-4 flex flex-wrap items-center justify-between gap-3
//                 rounded-xl border border-blue-100
//                 bg-blue-50/60 px-4 py-3
//               "
//                         >
//                             <div className="flex min-w-0 items-center gap-3">
//                                 <div
//                                     className="
//                     flex h-9 w-9 shrink-0 items-center justify-center
//                     rounded-lg bg-white text-[#1769ff] shadow-sm
//                   "
//                                 >
//                                     <UserRound size={17} />
//                                 </div>

//                                 <div className="min-w-0">
//                                     <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">
//                                         Selected Party
//                                     </p>

//                                     <p className="truncate text-sm font-bold text-[#0f172a]">
//                                         {selectedSS.party_name || "Unnamed Party"}
//                                     </p>

//                                     <p className="truncate text-[11px] text-[#64748b]">
//                                         {selectedSS.name || selectedSS.user_id || ""}
//                                     </p>
//                                 </div>
//                             </div>

//                             {orderCreated && (
//                                 <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
//                                     <CheckCircle2
//                                         size={15}
//                                         className="text-emerald-600"
//                                     />

//                                     <span className="text-xs font-semibold text-emerald-700">
//                                         Order Created
//                                     </span>

//                                     <span className="text-xs font-bold text-[#0f172a]">
//                                         {createdOrder.order_id}
//                                     </span>
//                                 </div>
//                             )}

//                             {!orderCreated && (
//                                 <button
//                                     type="button"
//                                     onClick={handleClearSS}
//                                     className="
//                     rounded-lg border border-blue-200 bg-white
//                     px-3 py-1.5 text-xs font-semibold text-[#1769ff]
//                     transition-all duration-200
//                     hover:bg-blue-50 active:scale-95
//                   "
//                                 >
//                                     Change Party
//                                 </button>
//                             )}
//                         </div>
//                     )}
//                 </section>

//                 {/* ORDER AREA */}
//                 <section className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm">
//                     {!selectedSS ? (
//                         <div className="flex min-h-[300px] items-center justify-center p-6">
//                             <div className="max-w-sm text-center">
//                                 <div
//                                     className="
//                     mx-auto mb-3 flex h-12 w-12 items-center
//                     justify-center rounded-2xl bg-blue-50 text-[#1769ff]
//                   "
//                                 >
//                                     <Search size={21} />
//                                 </div>

//                                 <h3 className="text-sm font-bold text-[#0f172a]">
//                                     Select a Party First
//                                 </h3>

//                                 <p className="mt-1 text-xs leading-5 text-[#94a3b8]">
//                                     Select an SS / Party above to start creating the order.
//                                 </p>
//                             </div>
//                         </div>
//                     ) : !orderCreated ? (
//                         <div className="flex min-h-[260px] items-center justify-center p-6">
//                             <div className="max-w-md text-center">
//                                 <div
//                                     className="
//                     mx-auto mb-4 flex h-14 w-14 items-center
//                     justify-center rounded-2xl bg-blue-50 text-[#1769ff]
//                   "
//                                 >
//                                     <UserRound size={23} />
//                                 </div>

//                                 <h3 className="text-base font-bold text-[#0f172a]">
//                                     Ready to Create Order
//                                 </h3>

//                                 <p className="mt-1 text-xs leading-5 text-[#64748b]">
//                                     Party selected:
//                                     <span className="ml-1 font-semibold text-[#0f172a]">
//                                         {selectedSS.party_name}
//                                     </span>
//                                 </p>

//                                 <button
//                                     type="button"
//                                     onClick={handleCreateOrder}
//                                     disabled={createOrder.isPending}
//                                     className="
//                     mt-5 inline-flex items-center justify-center gap-2
//                     rounded-xl bg-[#1769ff]
//                     px-6 py-2.5 text-sm font-semibold text-white
//                     shadow-sm transition-all duration-200
//                     hover:bg-blue-700
//                     active:scale-[0.98]
//                     disabled:cursor-not-allowed disabled:bg-blue-300
//                   "
//                                 >
//                                     {createOrder.isPending
//                                         ? "Creating Order..."
//                                         : "Start Order"}
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <>
//                             {/* ORDER HEADER */}
//                             <div
//                                 className="
//                   flex flex-wrap items-center justify-between gap-3
//                   border-b border-[#e7edf5]
//                   px-4 py-3 sm:px-5
//                 "
//                             >
//                                 <div className="flex min-w-0 items-center gap-3">
//                                     <div
//                                         className="
//                       flex h-9 w-9 shrink-0 items-center justify-center
//                       rounded-lg bg-blue-50 text-[#1769ff]
//                     "
//                                     >
//                                         <CheckCircle2 size={17} />
//                                     </div>

//                                     <div className="min-w-0">
//                                         <h2 className="text-sm font-bold text-[#0f172a]">
//                                             {createdOrder.order_id}
//                                         </h2>

//                                         <p className="truncate text-[11px] text-[#64748b]">
//                                             {createdOrder.ss_party_name}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                     {/* DISPATCH LOCATION */}
//                                     <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-white p-1">
//                                         <button
//                                             type="button"
//                                             onClick={() => setSelectedCity("Delhi")}
//                                             className={`
//         rounded-lg px-3 py-2 text-xs font-semibold
//         transition-all duration-200
//         ${selectedCity === "Delhi"
//                                                     ? "bg-[#1769ff] text-white shadow-sm"
//                                                     : "text-[#64748b] hover:bg-blue-50 hover:text-[#1769ff]"
//                                                 }
//       `}
//                                         >
//                                             Delhi
//                                         </button>

//                                         <button
//                                             type="button"
//                                             onClick={() => setSelectedCity("Mumbai")}
//                                             className={`
//         rounded-lg px-3 py-2 text-xs font-semibold
//         transition-all duration-200
//         ${selectedCity === "Mumbai"
//                                                     ? "bg-[#1769ff] text-white shadow-sm"
//                                                     : "text-[#64748b] hover:bg-blue-50 hover:text-[#1769ff]"
//                                                 }
//       `}
//                                         >
//                                             Mumbai
//                                         </button>
//                                     </div>

//                                     {/* ORDER ID */}
//                                     <div className="hidden rounded-lg bg-slate-50 px-3 py-2 sm:block">
//                                         <span className="text-[10px] font-medium uppercase tracking-wide text-[#94a3b8]">
//                                             Order ID
//                                         </span>

//                                         <p className="text-xs font-bold text-[#0f172a]">
//                                             #{createdOrder.id}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* ⭐ EXISTING GOOGLE SHEET — UNCHANGED */}
//                             <div className="p-2 sm:p-3">
//                                 <OrderGoogleSheet />


//                             </div>
//                         </>
//                     )}
//                 </section>
//             </div>
//             {orderCreated && (
//                 <div
//                     className="
//       fixed bottom-0 right-0 left-0 z-[110]
//       flex h-[64px] items-center justify-end
//       border-t border-[#e7edf5]
//       bg-white/95 px-4
//       shadow-[0_-4px_16px_rgba(15,23,42,0.08)]
//       backdrop-blur-sm
//       md:left-[220px] md:px-6
//     "
//                 >
//                     <div className="mr-auto hidden items-center gap-2 sm:flex">
//                         <span className="text-xs text-[#94a3b8]">
//                             Dispatch:
//                         </span>

//                         <span className="text-xs font-semibold text-[#0f172a]">
//                             {selectedCity}
//                         </span>

//                         <span className="mx-1 text-[#cbd5e1]">•</span>

//                         <span className="text-xs text-[#64748b]">
//                             {createdOrder.order_id}
//                         </span>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={handleSubmitOrder}
//                         disabled={isSubmitting}
//                         className={`
//         inline-flex min-w-[150px]
//         items-center justify-center gap-2
//         rounded-xl px-7 py-2.5
//         text-sm font-semibold text-white
//         shadow-sm transition-all duration-200
//         active:scale-[0.98]
//         ${isSubmitting
//                                 ? "cursor-not-allowed bg-blue-400"
//                                 : "cursor-pointer bg-[#1769ff] hover:bg-blue-700"
//                             }
//       `}
//                     >
//                         {isSubmitting ? "Submitting..." : "Submit Order"}
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }




import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useCachedSSUsers } from "../../auth/useSS";
import { useCreateSimpleOrder } from "../../hooks/CRM/useCreateSimpleOrder";
import { verifyCRMOrder } from "../../hooks/useCRMOrders";
import OrderGoogleSheet from "./OrderGoogleSheet";
import {
    ArrowLeft,
    Search,
    UserRound,
    X,
    CheckCircle2,
    FileText,
    MapPin,
} from "lucide-react";

export default function CRMNewOrderPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const {
        data: ssUsers = [],
        isLoading: ssLoading,
    } = useCachedSSUsers();

    const createOrder = useCreateSimpleOrder();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSS, setSelectedSS] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCity, setSelectedCity] = useState("Delhi");
    const [notes, setNotes] = useState("");
    const [createdOrder, setCreatedOrder] = useState(null);

    // ---------------------------------------------------------
    // FILTER PARTY / SS
    // ---------------------------------------------------------
    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        if (!term || selectedSS) return [];

        return ssUsers
            .filter((ss) =>
                String(ss?.party_name || "")
                    .toLowerCase()
                    .includes(term)
            )
            .slice(0, 20);
    }, [searchTerm, ssUsers, selectedSS]);

    // ---------------------------------------------------------
    // SELECT PARTY
    // ---------------------------------------------------------
    const handleSelectSS = (ss) => {
        setSelectedSS(ss);
        setSearchTerm(ss.party_name || "");
        setShowSuggestions(false);
    };

    // ---------------------------------------------------------
    // CLEAR PARTY
    // ---------------------------------------------------------
    const handleClearSS = () => {
        if (createdOrder) return;

        setSelectedSS(null);
        setSearchTerm("");
        setShowSuggestions(false);
    };

    // ---------------------------------------------------------
    // CREATE ORDER
    // ---------------------------------------------------------
    const handleCreateOrder = () => {
        if (!selectedSS) {
            alert("Please select Party / SS first.");
            return;
        }

        if (!user?.id) {
            alert("CRM user information not found.");
            return;
        }

        // Old sheet ko pehle unmount karo
        setCreatedOrder(null);

        // Previous order ke products clear
        localStorage.removeItem("crm_selected_products");

        createOrder.mutate(
            {
                ss_id: selectedSS.id,
                crm_id: user.id,
            },
            {
                onSuccess: (data) => {
                    console.log(
                        "Simple order created:",
                        data
                    );

                    if (!data?.order?.id) {
                        console.error(
                            "Created order ID missing:",
                            data
                        );

                        alert(
                            "Order created but order ID was not received."
                        );

                        return;
                    }

                    // New order = clean product storage
                    localStorage.removeItem(
                        "crm_selected_products"
                    );

                    // Current party save
                    localStorage.setItem(
                        "crm_selected_ss",
                        JSON.stringify(selectedSS.id)
                    );

                    localStorage.setItem(
                        "crm_selected_ss_name",
                        selectedSS.party_name || ""
                    );

                    // Defaults
                    setSelectedCity("Delhi");
                    setNotes("");

                    // Save newly created order
                    setCreatedOrder(data.order);
                },

                onError: (error) => {
                    console.error(
                        "Create order failed:",
                        error
                    );

                    alert(
                        error?.response?.data?.detail ||
                            error?.response?.data?.error ||
                            "Order create failed."
                    );
                },
            }
        );
    };

    // ---------------------------------------------------------
    // FINAL SUBMIT
    // ---------------------------------------------------------
    const handleSubmitOrder = async () => {
        if (isSubmitting) return;

        if (!createdOrder?.id) {
            alert("Order not found.");
            return;
        }

        // Get products from OrderGoogleSheet
        const savedProducts = localStorage.getItem(
            "crm_selected_products"
        );

        if (!savedProducts) {
            alert("Please add at least one product.");
            return;
        }

        let selectedProducts;

        try {
            selectedProducts = JSON.parse(savedProducts);
        } catch (error) {
            console.error(
                "Invalid selected products:",
                error
            );

            alert(
                "Unable to read selected products. Please refresh and try again."
            );

            return;
        }

        if (
            !Array.isArray(selectedProducts) ||
            selectedProducts.length === 0
        ) {
            alert("Please add at least one product.");
            return;
        }

        // -----------------------------------------------------
        // PREPARE ITEMS
        // -----------------------------------------------------
        const items = selectedProducts
            .map((item) => ({
                product:
                    item.product ??
                    item.id ??
                    item.product_id,
                quantity: Number(item.quantity) || 0,
            }))
            .filter(
                (item) =>
                    item.product &&
                    item.quantity > 0
            );

        if (items.length === 0) {
            alert(
                "Please enter valid product quantities."
            );

            return;
        }

        // -----------------------------------------------------
        // CONFIRM
        // -----------------------------------------------------
        const confirmed = window.confirm(
            `Are you sure you want to submit order ${createdOrder.order_id}?`
        );

        if (!confirmed) return;

        // -----------------------------------------------------
        // FINAL PAYLOAD
        // -----------------------------------------------------
        const payload = {
            status: "APPROVED",
            dispatch_location: selectedCity,
            notes: notes.trim(),
            items,
        };

        console.log(
            "FINAL CRM ORDER SUBMIT:",
            {
                orderId: createdOrder.id,
                order_id: createdOrder.order_id,
                payload,
            }
        );

        setIsSubmitting(true);

        try {
            // Actual API call
            const response = await verifyCRMOrder(
                createdOrder.id,
                payload
            );

            console.log(
                "CRM order submitted successfully:",
                response
            );

            // Refresh CRM orders cache
            await queryClient.invalidateQueries({
                queryKey: ["crmOrders"],
                exact: false,
            });

            // Clean local storage
            localStorage.removeItem(
                "crm_selected_products"
            );

            localStorage.removeItem(
                "crm_selected_ss"
            );

            localStorage.removeItem(
                "crm_selected_ss_name"
            );

            // Success
            alert(
                `Order ${createdOrder.order_id} submitted successfully.`
            );

            // Go to history
            navigate("/all/orders-history");
        } catch (error) {
            console.error(
                "CRM order submit failed:",
                error
            );

            console.error(
                "API response:",
                error?.response?.data
            );

            alert(
                error?.response?.data?.detail ||
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    "Order submit failed."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const orderCreated = Boolean(
        createdOrder?.id
    );

    return (
        <div className="min-h-screen bg-[#f5f7fb] pb-24">
            {/* =====================================================
                HEADER
            ===================================================== */}
            <div className="sticky top-0 z-40 border-b border-[#e7edf5] bg-white/95 backdrop-blur">
                <div className="flex min-h-[64px] items-center justify-between gap-3 px-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="
                                inline-flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-lg
                                border border-[#e2e8f0]
                                bg-white text-[#475569]
                                transition-all duration-200
                                hover:border-blue-200
                                hover:bg-blue-50
                                hover:text-[#1769ff]
                                active:scale-95
                            "
                            title="Back"
                        >
                            <ArrowLeft size={17} />
                        </button>

                        <div className="min-w-0">
                            <h1 className="truncate text-base font-bold text-[#0f172a] sm:text-lg">
                                Create New Order
                            </h1>

                            <p className="hidden text-xs text-[#94a3b8] sm:block">
                                Create CRM order for an SS / Party
                            </p>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 sm:flex">
                        <UserRound
                            size={15}
                            className="text-[#1769ff]"
                        />

                        <span className="max-w-[180px] truncate text-xs font-semibold text-[#1769ff]">
                            {user?.name ||
                                user?.user_id ||
                                "CRM"}
                        </span>
                    </div>
                </div>
            </div>

            {/* =====================================================
                PAGE CONTENT
            ===================================================== */}
            <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-5">
                {/* =================================================
                    PARTY SELECTION
                ================================================= */}
                <section className="rounded-2xl border border-[#e7edf5] bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-3">
                        <h2 className="text-sm font-bold text-[#0f172a]">
                            Select Party / SS
                        </h2>

                        <p className="mt-0.5 text-xs text-[#94a3b8]">
                            Select the party for which you want to
                            create the order.
                        </p>
                    </div>

                    <div className="relative max-w-xl">
                        {/* SEARCH */}
                        <div
                            className={`
                                flex h-11 items-center
                                rounded-xl border bg-white
                                transition-all duration-200
                                ${
                                    showSuggestions
                                        ? "border-[#1769ff] ring-2 ring-blue-100"
                                        : "border-[#dbe3ee]"
                                }
                            `}
                        >
                            <Search
                                size={17}
                                className="ml-3 shrink-0 text-[#94a3b8]"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                disabled={orderCreated}
                                placeholder={
                                    ssLoading
                                        ? "Loading parties..."
                                        : "Search Party Name..."
                                }
                                onChange={(e) => {
                                    if (orderCreated) return;

                                    setSearchTerm(
                                        e.target.value
                                    );

                                    setSelectedSS(null);

                                    setShowSuggestions(
                                        true
                                    );
                                }}
                                onFocus={() => {
                                    if (
                                        !orderCreated &&
                                        !selectedSS &&
                                        searchTerm.trim()
                                    ) {
                                        setShowSuggestions(
                                            true
                                        );
                                    }
                                }}
                                className="
                                    h-full min-w-0 flex-1
                                    bg-transparent px-3
                                    text-sm text-[#0f172a]
                                    outline-none
                                    placeholder:text-[#94a3b8]
                                    disabled:cursor-default
                                "
                            />

                            {selectedSS &&
                                !orderCreated && (
                                    <button
                                        type="button"
                                        onClick={
                                            handleClearSS
                                        }
                                        className="
                                            mr-2 inline-flex
                                            h-7 w-7
                                            items-center
                                            justify-center
                                            rounded-lg
                                            text-[#94a3b8]
                                            transition
                                            hover:bg-slate-100
                                            hover:text-[#475569]
                                        "
                                        title="Change party"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                        </div>

                        {/* SUGGESTIONS */}
                        {showSuggestions &&
                            !selectedSS &&
                            !orderCreated &&
                            filteredUsers.length > 0 && (
                                <div
                                    className="
                                        absolute left-0 right-0
                                        top-[calc(100%+6px)]
                                        z-50 max-h-64
                                        overflow-y-auto
                                        rounded-xl
                                        border border-[#e2e8f0]
                                        bg-white shadow-xl
                                    "
                                >
                                    {filteredUsers.map(
                                        (ss) => (
                                            <button
                                                key={ss.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectSS(
                                                        ss
                                                    )
                                                }
                                                className="
                                                    flex w-full
                                                    items-center
                                                    gap-3
                                                    border-b
                                                    border-[#f1f5f9]
                                                    px-4 py-3
                                                    text-left
                                                    last:border-b-0
                                                    transition-colors
                                                    duration-150
                                                    hover:bg-blue-50
                                                "
                                            >
                                                <div
                                                    className="
                                                        flex h-8 w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-blue-50
                                                        text-[#1769ff]
                                                    "
                                                >
                                                    <UserRound
                                                        size={15}
                                                    />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-[#0f172a]">
                                                        {ss.party_name ||
                                                            "Unnamed Party"}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-[11px] text-[#94a3b8]">
                                                        {ss.name ||
                                                            ss.user_id ||
                                                            ss.mobile ||
                                                            ""}
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    )}
                                </div>
                            )}

                        {/* NO PARTY */}
                        {showSuggestions &&
                            !selectedSS &&
                            !orderCreated &&
                            searchTerm.trim() &&
                            !ssLoading &&
                            filteredUsers.length ===
                                0 && (
                                <div
                                    className="
                                        absolute left-0 right-0
                                        top-[calc(100%+6px)]
                                        z-50 rounded-xl
                                        border border-[#e2e8f0]
                                        bg-white p-4
                                        text-center shadow-xl
                                    "
                                >
                                    <p className="text-sm font-medium text-[#475569]">
                                        No party found
                                    </p>
                                </div>
                            )}
                    </div>

                    {/* SELECTED PARTY */}
                    {selectedSS && (
                        <div
                            className="
                                mt-4 flex flex-wrap
                                items-center
                                justify-between gap-3
                                rounded-xl
                                border border-blue-100
                                bg-blue-50/60
                                px-4 py-3
                            "
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className="
                                        flex h-9 w-9 shrink-0
                                        items-center justify-center
                                        rounded-lg bg-white
                                        text-[#1769ff] shadow-sm
                                    "
                                >
                                    <UserRound size={17} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#64748b]">
                                        Selected Party
                                    </p>

                                    <p className="truncate text-sm font-bold text-[#0f172a]">
                                        {selectedSS.party_name ||
                                            "Unnamed Party"}
                                    </p>

                                    <p className="truncate text-[11px] text-[#64748b]">
                                        {selectedSS.name ||
                                            selectedSS.user_id ||
                                            ""}
                                    </p>
                                </div>
                            </div>

                            {orderCreated && (
                                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                                    <CheckCircle2
                                        size={15}
                                        className="text-emerald-600"
                                    />

                                    <span className="text-xs font-semibold text-emerald-700">
                                        Order Created
                                    </span>

                                    <span className="text-xs font-bold text-[#0f172a]">
                                        {
                                            createdOrder.order_id
                                        }
                                    </span>
                                </div>
                            )}

                            {!orderCreated && (
                                <button
                                    type="button"
                                    onClick={
                                        handleClearSS
                                    }
                                    className="
                                        rounded-lg
                                        border border-blue-200
                                        bg-white
                                        px-3 py-1.5
                                        text-xs font-semibold
                                        text-[#1769ff]
                                        transition-all duration-200
                                        hover:bg-blue-50
                                        active:scale-95
                                    "
                                >
                                    Change Party
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* =================================================
                    ORDER AREA
                ================================================= */}
                <section className="rounded-2xl border border-[#e7edf5] bg-white shadow-sm">
                    {!selectedSS ? (
                        <div className="flex min-h-[300px] items-center justify-center p-6">
                            <div className="max-w-sm text-center">
                                <div
                                    className="
                                        mx-auto mb-3 flex h-12 w-12
                                        items-center justify-center
                                        rounded-2xl bg-blue-50
                                        text-[#1769ff]
                                    "
                                >
                                    <Search size={21} />
                                </div>

                                <h3 className="text-sm font-bold text-[#0f172a]">
                                    Select a Party First
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-[#94a3b8]">
                                    Select an SS / Party above to start
                                    creating the order.
                                </p>
                            </div>
                        </div>
                    ) : !orderCreated ? (
                        <div className="flex min-h-[260px] items-center justify-center p-6">
                            <div className="max-w-md text-center">
                                <div
                                    className="
                                        mx-auto mb-4 flex h-14 w-14
                                        items-center justify-center
                                        rounded-2xl bg-blue-50
                                        text-[#1769ff]
                                    "
                                >
                                    <UserRound size={23} />
                                </div>

                                <h3 className="text-base font-bold text-[#0f172a]">
                                    Ready to Create Order
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-[#64748b]">
                                    Party selected:
                                    <span className="ml-1 font-semibold text-[#0f172a]">
                                        {
                                            selectedSS.party_name
                                        }
                                    </span>
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        handleCreateOrder
                                    }
                                    disabled={
                                        createOrder.isPending
                                    }
                                    className="
                                        mt-5 inline-flex
                                        items-center justify-center
                                        gap-2 rounded-xl
                                        bg-[#1769ff]
                                        px-6 py-2.5
                                        text-sm font-semibold
                                        text-white shadow-sm
                                        transition-all duration-200
                                        hover:bg-blue-700
                                        active:scale-[0.98]
                                        disabled:cursor-not-allowed
                                        disabled:bg-blue-300
                                    "
                                >
                                    {createOrder.isPending
                                        ? "Creating Order..."
                                        : "Start Order"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ORDER HEADER */}
                            <div
                                className="
                                    flex flex-wrap
                                    items-center
                                    justify-between gap-3
                                    border-b
                                    border-[#e7edf5]
                                    px-4 py-3 sm:px-5
                                "
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className="
                                            flex h-9 w-9 shrink-0
                                            items-center justify-center
                                            rounded-lg bg-blue-50
                                            text-[#1769ff]
                                        "
                                    >
                                        <CheckCircle2
                                            size={17}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="text-sm font-bold text-[#0f172a]">
                                            {
                                                createdOrder.order_id
                                            }
                                        </h2>

                                        <p className="truncate text-[11px] text-[#64748b]">
                                            {
                                                createdOrder.ss_party_name
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* DISPATCH */}
                                    <div className="flex items-center rounded-xl border border-[#e2e8f0] bg-white p-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedCity(
                                                    "Delhi"
                                                )
                                            }
                                            disabled={isSubmitting}
                                            className={`
                                                rounded-lg px-3 py-2
                                                text-xs font-semibold
                                                transition-all duration-200
                                                disabled:cursor-not-allowed
                                                ${
                                                    selectedCity ===
                                                    "Delhi"
                                                        ? "bg-[#1769ff] text-white shadow-sm"
                                                        : "text-[#64748b] hover:bg-blue-50 hover:text-[#1769ff]"
                                                }
                                            `}
                                        >
                                            Delhi
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedCity(
                                                    "Mumbai"
                                                )
                                            }
                                            disabled={isSubmitting}
                                            className={`
                                                rounded-lg px-3 py-2
                                                text-xs font-semibold
                                                transition-all duration-200
                                                disabled:cursor-not-allowed
                                                ${
                                                    selectedCity ===
                                                    "Mumbai"
                                                        ? "bg-[#1769ff] text-white shadow-sm"
                                                        : "text-[#64748b] hover:bg-blue-50 hover:text-[#1769ff]"
                                                }
                                            `}
                                        >
                                            Mumbai
                                        </button>
                                    </div>

                                    {/* ORDER ID */}
                                    <div className="hidden rounded-lg bg-slate-50 px-3 py-2 sm:block">
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-[#94a3b8]">
                                            Order ID
                                        </span>

                                        <p className="text-xs font-bold text-[#0f172a]">
                                            #{createdOrder.id}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ORDER NOTES */}
                            <div className="border-b border-[#e7edf5] px-3 py-3 sm:px-4">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1769ff]">
                                            <FileText size={14} />
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-bold text-[#0f172a]">
                                                Order Notes
                                            </h3>

                                            <p className="text-[10px] text-[#94a3b8]">
                                                Add any important note for
                                                this order
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-[10px] text-[#94a3b8]">
                                        Optional
                                    </span>
                                </div>

                                <textarea
                                    value={notes}
                                    onChange={(e) =>
                                        setNotes(
                                            e.target.value
                                        )
                                    }
                                    disabled={isSubmitting}
                                    placeholder="Enter order notes..."
                                    rows={2}
                                    className="
                                        w-full resize-none
                                        rounded-xl
                                        border border-[#dbe3ee]
                                        bg-white
                                        px-3 py-2.5
                                        text-xs text-[#0f172a]
                                        outline-none
                                        transition-all duration-200
                                        placeholder:text-[#94a3b8]
                                        focus:border-[#1769ff]
                                        focus:ring-2
                                        focus:ring-blue-100
                                        disabled:cursor-not-allowed
                                        disabled:bg-slate-50
                                    "
                                />
                            </div>

                            {/* =================================================
                                GOOGLE SHEET
                                Fresh sheet for every new order
                            ================================================= */}
                            <div className="p-2 sm:p-3">
                                <OrderGoogleSheet
                                    key={createdOrder.id}
                                    orderId={createdOrder.id}
                                />

                                {/* Fixed footer space */}
                                <div className="h-20" />
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* =====================================================
                FIXED SUBMIT FOOTER
            ===================================================== */}
            {orderCreated && (
                <div
                    className="
                        fixed bottom-0 right-0 left-0 z-[110]
                        flex h-[64px]
                        items-center justify-end
                        border-t border-[#e7edf5]
                        bg-white/95 px-4
                        shadow-[0_-4px_16px_rgba(15,23,42,0.08)]
                        backdrop-blur-sm
                        md:left-[220px] md:px-6
                    "
                >
                    <div className="mr-auto hidden items-center gap-2 sm:flex">
                        <MapPin
                            size={13}
                            className="text-[#94a3b8]"
                        />

                        <span className="text-xs text-[#94a3b8]">
                            Dispatch:
                        </span>

                        <span className="text-xs font-semibold text-[#0f172a]">
                            {selectedCity}
                        </span>

                        <span className="mx-1 text-[#cbd5e1]">
                            •
                        </span>

                        <span className="text-xs text-[#64748b]">
                            {createdOrder.order_id}
                        </span>

                        {notes.trim() && (
                            <>
                                <span className="mx-1 text-[#cbd5e1]">
                                    •
                                </span>

                                <span className="flex items-center gap-1 text-xs text-[#64748b]">
                                    <FileText size={12} />
                                    Note added
                                </span>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className={`
                            inline-flex min-w-[150px]
                            items-center justify-center
                            gap-2 rounded-xl
                            px-7 py-2.5
                            text-sm font-semibold
                            text-white shadow-sm
                            transition-all duration-200
                            active:scale-[0.98]
                            ${
                                isSubmitting
                                    ? "cursor-not-allowed bg-blue-400"
                                    : "cursor-pointer bg-[#1769ff] hover:bg-blue-700"
                            }
                        `}
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : "Submit Order"}
                    </button>
                </div>
            )}
        </div>
    );
}