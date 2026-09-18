// // 📁 src/pages/ConfirmOrderPage.jsx
// import { useState } from "react";
// import { useSelectedProducts } from "../../hooks/useSelectedProducts";
// import { useSchemes } from "../../hooks/useSchemes";
// import { useAuth } from "../../context/AuthContext";
// import { usePlaceOrder } from "../../hooks/usePlaceOrder";
// import { useNavigate } from "react-router-dom";
// import { FaCheckCircle, FaShoppingCart, FaBoxOpen, FaBan } from "react-icons/fa";
// import { FaIndianRupeeSign } from "react-icons/fa6";
// import ConfirmOrderPDFButton from "../../components/ConfirmOrderPDFButton";

// import MobilePageHeader from "../../components/MobilePageHeader";

// export default function ConfirmOrderPage() {
//   const { selectedProducts, setSelectedProducts } = useSelectedProducts();
//   const { data: schemes = [] } = useSchemes();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const placeOrderMutation = usePlaceOrder();
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [isPlacingOrder, setIsPlacingOrder] = useState(false);

//   // 🔹 Helper: Get scheme multiplier
//   const getSchemeMultiplier = (scheme) => {
//     return Math.min(
//       ...scheme.conditions.map((cond) => {
//         const matched = selectedProducts.find(
//           (p) => p.id === cond.product || p.product_name === cond.product_name
//         );
//         if (!matched) return 0;
//         return Math.floor(matched.quantity / cond.min_quantity);
//       })
//     );
//   };

//   // 🔹 Merge all rewards before sending to backend
//   const mergeRewards = (eligibleSchemes) => {
//     const rewardMap = {};

//     eligibleSchemes.forEach((scheme) => {
//       const multiplier = getSchemeMultiplier(scheme);

//       scheme.rewards.forEach((r) => {
//         const productId =
//           typeof r.product === "object" ? r.product.id : r.product || r.product_id;
//         const productName = r.product_name || r.product;
//         const totalQty = r.quantity * multiplier;

//         if (rewardMap[productId]) {
//           rewardMap[productId].quantity += totalQty;
//         } else {
//           rewardMap[productId] = {
//             product: productId,
//             product_name: productName,
//             quantity: totalQty,
//           };
//         }
//       });
//     });

//     return Object.values(rewardMap);
//   };

//   // 🔹 Eligible schemes filter
//   const eligibleSchemes = schemes.filter((scheme) => getSchemeMultiplier(scheme) > 0);

//   // 🔹 Place order function
//   const handlePlaceOrder = () => {
//     setIsPlacingOrder(true);

//     const mergedRewards = mergeRewards(eligibleSchemes);

//     const order = {
//       user_id: user?.id,
//       crm_id: user?.crm,
//       items: selectedProducts.map((p) => ({
//         id: p.id,
//         quantity: p.quantity,
//         price: Number(p.price) || 0,
//         ss_virtual_stock: p.virtual_stock || 0, // ✅ Added: Send virtual stock
//       })),
//       // eligibleSchemes: mergedRewards,
//       total: selectedProducts.reduce(
//         (sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1),
//         0
//       ),
//     };

//     placeOrderMutation.mutate(order, {
//       onSuccess: (data) => {
//         setIsPlacingOrder(false);
//         setSelectedProducts([]);

//         // ✅ Multiple order support (new nested structure)
//         const tempered = data?.orders?.tempered_order;
//         const normal = data?.orders?.normal_order;

//         const ids = [
//           tempered?.order_id,
//           normal?.order_id,
//         ].filter(Boolean); // remove undefined

//         if (ids.length > 0) {
//           setShowSuccess(ids.join(", "));
//         } else {
//           alert("Order placed, but could not read order ID.");
//           console.warn("Unexpected response format:", data);
//         }
//       },

//     });

//   };

//   return (
//     <div className="max-w-4xl mx-auto px-3 pb-20">
//       {/* Header */}
//       <MobilePageHeader title="Order Confirmation" />

//       {/* Products Table */}
//       <div className="my-6 pt-[60px] sm:pt-0">
//         <div className="overflow-auto rounded-lg shadow">
//           {/* PDF Download Button */}
//           <div className="flex justify-center">
//             <ConfirmOrderPDFButton
//               selectedProducts={selectedProducts}
//               eligibleSchemes={eligibleSchemes}
//             />
//           </div>

//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">No</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Product</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Qty</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Price</th>
//                 <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Total</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 bg-white">
//               {selectedProducts.map((item, index) => (
//                 <tr key={item.id} className="hover:bg-gray-50 transition">
//                   <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
//                   <td className="px-4 py-2 text-sm text-gray-800">{item.product_name}</td>
//                   <td className="px-4 py-2 text-sm text-gray-700">{item.quantity}</td>
//                   <td className="px-4 py-2 text-sm text-gray-700">{item.price}</td>
//                   <td className="px-4 py-2 text-sm text-gray-700">
//                     {!isNaN(Number(item.price)) ? (
//                       <span className="flex items-center gap-1 text-gray-700">
//                         {((Number(item.price) || 0) * (item.quantity || 1)).toFixed(1)}
//                       </span>
//                     ) : (
//                       <span className="flex items-center gap-1 text-red-500 text-xs">
//                         <FaBan /> Price
//                       </span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Eligible Schemes */}
//       {eligibleSchemes.length > 0 && (
//         <div className="mb-6">
//           <div className="overflow-auto rounded-lg shadow">
//             <table className="min-w-full divide-y divide-green-200">
//               <thead className="bg-pink-100">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">Schemes</th>
//                   <th className="px-4 py-2 text-left text-sm font-semibold">Rewards</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-green-100 bg-white">
//                 {eligibleSchemes.map((scheme) => (
//                   <tr key={scheme.id} className="hover:bg-green-50 transition">
//                     <td className="px-4 py-2 text-sm text-gray-700">
//                       {scheme.conditions
//                         .map((c) => `${c.product_name || c.product}`)
//                         .join(", ")}
//                     </td>
//                     <td className="px-4 py-2 text-sm text-gray-700">
//                       {scheme.rewards
//                         .map((r) => {
//                           const multiplier = getSchemeMultiplier(scheme);
//                           const totalQty = r.quantity * multiplier;
//                           return `${totalQty} ${r.product_name || r.product} Free`;
//                         })
//                         .join(", ")}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Total */}
//       <div className="flex justify-end mb-6">
//         <div className="text-right">
//           <p className=" font-semibold">
//             Total: ₹
//             {selectedProducts
//               .reduce(
//                 (sum, p) => sum + (Number(p.price) || 0) * (p.quantity || 1),
//                 0
//               )
//               .toFixed(1)}
//           </p>
//         </div>
//       </div>

//       {/* Place Order Button */}
//       {/* Place Order Button */}
// <div className="text-center">
//   <button
//     onClick={() => {
//       if (user?.role !== "SS") return;
//       handlePlaceOrder();
//     }}
//     disabled={isPlacingOrder || user?.role !== "SS"}
//     className={`
//       px-6 py-3 rounded-md shadow-md font-semibold
//       transition-all duration-300 ease-in-out
//       ${
//         user?.role === "SS"
//           ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-green-500 hover:to-green-600 hover:shadow-lg"
//           : "bg-gray-300 text-gray-500 cursor-not-allowed"
//       }
//     `}
//   >
//     {isPlacingOrder ? "Placing Order..." : "Place Order"}
//   </button>

//   {/* Message for non SS users */}
//   {user?.role !== "SS" && (
//     <p className="text-xs text-red-500 mt-2">
//       Only SS can place orders
//     </p>
//   )}
// </div>
      
//       {/* Loading Animation */}
//       {isPlacingOrder && (
//         <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
//           <FaShoppingCart className="text-white text-6xl animate-bounce mb-4" />
//           <p className="text-white text-lg animate-pulse">
//             Placing your order, please wait...
//           </p>
//         </div>
//       )}

//       {/* Success Modal */}
//       {showSuccess && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center animate-fadeIn">
//             <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4 animate-bounce" />
//             <h3 className="text-xl font-bold text-green-600 mb-2">
//               Order Placed Successfully!
//             </h3>
//             <p className="text-gray-700 mb-2">
//               Order ID: <span className="font-mono">{showSuccess}</span>
//             </p>
//             <p className="text-gray-500 mb-6">
//               You can track your order in the history section.
//             </p>
//             <button
//               onClick={() => {
//                 setShowSuccess(false);
//                 navigate("/");
//               }}
//               className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
//             >
//               <FaBoxOpen /> Go to Orders
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





import { useState } from "react";
import { useSelectedProducts } from "../../hooks/useSelectedProducts";
import { useSchemes } from "../../hooks/useSchemes";
import { useAuth } from "../../context/AuthContext";
import { usePlaceOrder } from "../../hooks/usePlaceOrder";
import { useNavigate } from "react-router-dom";

import {
  FaCheckCircle,
  FaShoppingCart,
  FaBoxOpen,
  FaBan,
  FaGift,
  FaChevronRight,
  FaShieldAlt,
} from "react-icons/fa";

import { FaIndianRupeeSign } from "react-icons/fa6";

import ConfirmOrderPDFButton from "../../components/ConfirmOrderPDFButton";
import MobilePageHeader from "../../components/MobilePageHeader";

export default function ConfirmOrderPage() {
  const { selectedProducts, setSelectedProducts } = useSelectedProducts();
  const { data: schemes = [] } = useSchemes();
  const { user } = useAuth();
  const navigate = useNavigate();

  const placeOrderMutation = usePlaceOrder();

  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // =========================================================
  // SCHEME MULTIPLIER
  // Existing logic preserved
  // =========================================================
  const getSchemeMultiplier = (scheme) => {
    return Math.min(
      ...scheme.conditions.map((cond) => {
        const matched = selectedProducts.find(
          (p) =>
            p.id === cond.product ||
            p.product_name === cond.product_name
        );

        if (!matched) return 0;

        return Math.floor(matched.quantity / cond.min_quantity);
      })
    );
  };

  // =========================================================
  // MERGE REWARDS
  // Existing backend-related logic preserved
  // =========================================================
  const mergeRewards = (eligibleSchemes) => {
    const rewardMap = {};

    eligibleSchemes.forEach((scheme) => {
      const multiplier = getSchemeMultiplier(scheme);

      scheme.rewards.forEach((r) => {
        const productId =
          typeof r.product === "object"
            ? r.product.id
            : r.product || r.product_id;

        const productName = r.product_name || r.product;

        const totalQty = r.quantity * multiplier;

        if (rewardMap[productId]) {
          rewardMap[productId].quantity += totalQty;
        } else {
          rewardMap[productId] = {
            product: productId,
            product_name: productName,
            quantity: totalQty,
          };
        }
      });
    });

    return Object.values(rewardMap);
  };

  // =========================================================
  // ELIGIBLE SCHEMES
  // Existing logic preserved
  // =========================================================
  const eligibleSchemes = schemes.filter(
    (scheme) => getSchemeMultiplier(scheme) > 0
  );

  // =========================================================
  // TOTAL
  // Same calculation as original pa
  // =========================================================
  const orderTotal = selectedProducts
    .reduce(
      (sum, p) =>
        sum +
        (Number(p.price) || 0) * (p.quantity || 1),
      0
    )
    .toFixed(1);

  // =========================================================
  // PLACE ORDER
  // Existing payload + behavior preserved
  // =========================================================
  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);

    const mergedRewards = mergeRewards(eligibleSchemes);

    const order = {
      user_id: user?.id,
      crm_id: user?.crm,

      items: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: Number(p.price) || 0,
        ss_virtual_stock: p.virtual_stock || 0,
      })),

      // eligibleSchemes: mergedRewards,

      total: selectedProducts.reduce(
        (sum, p) =>
          sum +
          (Number(p.price) || 0) *
            (p.quantity || 1),
        0
      ),
    };

    placeOrderMutation.mutate(order, {
      onSuccess: (data) => {
        setIsPlacingOrder(false);
        setSelectedProducts([]);

        // Multiple order support
        const tempered = data?.orders?.tempered_order;
        const normal = data?.orders?.normal_order;

        const ids = [
          tempered?.order_id,
          normal?.order_id,
        ].filter(Boolean);

        if (ids.length > 0) {
          setShowSuccess(ids.join(", "));
        } else {
          alert("Order placed, but could not read order ID.");

          console.warn(
            "Unexpected response format:",
            data
          );
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-[#172033]">
      {/* =====================================================
          MAIN APP CONTAINER
      ====================================================== */}
      <div className="mx-auto w-full max-w-4xl px-3 pb-32 sm:px-5 sm:pb-20">
        {/* ===================================================
            HEADER
        ==================================================== */}
        <MobilePageHeader title="Order Confirmation" />

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}
        <div className="pt-[58px] sm:pt-4">

          {/* =================================================
              TOP ORDER SUMMARY HEADER
          ================================================== */}
          <section className="mb-4">
            <div className="relative overflow-hidden rounded-[22px] border border-[#eceff3] bg-white shadow-[0_8px_28px_rgba(15,23,42,0.055)]">

              {/* Brand line */}
              <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-[#fc250c] via-[#ff4b2b] to-[#ea580c]" />

              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">

                  {/* Cart icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#fff1ee] text-[#fc250c] ring-1 ring-[#ffe0db]">
                    <FaShoppingCart className="text-[18px]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-[#172033]">
                      Review Your Order
                    </p>

                    <p className="mt-0.5 text-[9px] font-medium text-[#94a3b8]">
                      Check products & quantity before placing
                    </p>
                  </div>
                </div>

                {/* Item count */}
                <div className="shrink-0 rounded-full border border-[#ffe0db] bg-[#fff7f5] px-2.5 py-1.5">
                  <span className="text-[9px] font-extrabold text-[#fc250c]">
                    {selectedProducts.length}
                  </span>

                  <span className="ml-1 text-[8px] font-bold text-[#94a3b8]">
                    {selectedProducts.length === 1
                      ? "ITEM"
                      : "ITEMS"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PDF BUTTON
          ================================================== */}
          {/* <section className="mb-4">
            <div className="rounded-[18px] border border-[#eceff3] bg-white p-2.5 shadow-[0_5px_18px_rgba(15,23,42,0.035)]">
              <div className="flex justify-center">
                <ConfirmOrderPDFButton
                  selectedProducts={selectedProducts}
                  eligibleSchemes={eligibleSchemes}
                />
              </div>
            </div>
          </section> */}

          {/* =================================================
              PRODUCTS
          ================================================== */}
          <section className="mb-5">

            {/* ------------------------------
                SECTION TITLE
            ------------------------------- */}
            <div className="mb-2.5 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-4 w-[3px] rounded-full bg-[#fc250c]" />

                <p className="text-[11px] font-extrabold uppercase tracking-[0.11em] text-[#172033]">
                  Order Items
                </p>
              </div>

              <span className="text-[9px] font-semibold text-[#94a3b8]">
                {selectedProducts.length} products
              </span>
            </div>

            {/* =================================================
                MOBILE PRODUCT CARDS
            ================================================== */}
            <div className="space-y-2.5 sm:hidden">
              {selectedProducts.map((item, index) => {
                const validPrice = !isNaN(Number(item.price));

                const itemTotal =
                  (Number(item.price) || 0) *
                  (item.quantity || 1);

                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-[19px] border border-[#e9edf1] bg-white p-3.5 shadow-[0_5px_18px_rgba(15,23,42,0.035)] transition-all duration-200 active:scale-[0.99]"
                  >
                    {/* Left brand indicator */}
                    <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-[#fc250c] to-[#ff765d]" />

                    <div className="flex items-start gap-3">

                      {/* Number */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#fff1ee] text-[10px] font-extrabold text-[#fc250c]">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      {/* Product */}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[11px] font-extrabold leading-[1.35] text-[#334155]">
                          {item.product_name}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {/* Quantity */}
                          <span className="rounded-full bg-[#f8fafc] px-2 py-1 text-[8px] font-bold text-[#64748b] ring-1 ring-[#eef1f4]">
                            Qty:{" "}
                            <span className="text-[#172033]">
                              {item.quantity}
                            </span>
                          </span>

                          {/* Price */}
                          <span className="flex items-center gap-0.5 rounded-full bg-[#fff7ed] px-2 py-1 text-[8px] font-bold text-[#ea580c]">
                            <FaIndianRupeeSign className="text-[7px]" />
                            {item.price}
                          </span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="shrink-0 text-right">
                        <p className="text-[8px] font-semibold uppercase tracking-wide text-[#94a3b8]">
                          Total
                        </p>

                        {validPrice ? (
                          <p className="mt-0.5 flex items-center justify-end gap-0.5 text-[12px] font-extrabold text-[#172033]">
                            <FaIndianRupeeSign className="text-[9px]" />
                            {itemTotal.toFixed(1)}
                          </p>
                        ) : (
                          <span className="mt-1 flex items-center justify-end gap-1 text-[9px] font-bold text-red-500">
                            <FaBan />
                            Price
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================== */}
            <div className="hidden overflow-hidden rounded-[20px] border border-[#e9edf1] bg-white shadow-[0_6px_22px_rgba(15,23,42,0.04)] sm:block">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#edf0f3] bg-[#fffaf9]">
                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
                        No
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
                        Qty
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
                        Price
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedProducts.map((item, index) => {
                      const validPrice = !isNaN(
                        Number(item.price)
                      );

                      const itemTotal =
                        (Number(item.price) || 0) *
                        (item.quantity || 1);

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-[#f1f3f5] last:border-0 transition-colors duration-150 hover:bg-[#fffaf8]"
                        >
                          <td className="px-4 py-3 text-[11px] font-bold text-[#94a3b8]">
                            {index + 1}
                          </td>

                          <td className="max-w-[360px] px-4 py-3 text-[11px] font-bold text-[#334155]">
                            {item.product_name}
                          </td>

                          <td className="px-4 py-3 text-[11px] font-bold text-[#475569]">
                            {item.quantity}
                          </td>

                          <td className="px-4 py-3 text-[11px] font-semibold text-[#475569]">
                            ₹{item.price}
                          </td>

                          <td className="px-4 py-3 text-[11px] font-extrabold text-[#172033]">
                            {validPrice ? (
                              <>₹{itemTotal.toFixed(1)}</>
                            ) : (
                              <span className="flex items-center gap-1 text-red-500">
                                <FaBan />
                                Price
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* =================================================
              ELIGIBLE SCHEMES
          ================================================== */}
          {eligibleSchemes.length > 0 && (
            <section className="mb-5">

              {/* Section title */}
              <div className="mb-2.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-[3px] rounded-full bg-[#f97316]" />

                  <p className="text-[11px] font-extrabold uppercase tracking-[0.11em] text-[#172033]">
                    Available Schemes
                  </p>
                </div>

                <span className="rounded-full bg-[#fff7ed] px-2 py-1 text-[8px] font-extrabold text-[#ea580c]">
                  {eligibleSchemes.length} ACTIVE
                </span>
              </div>

              {/* =================================================
                  MOBILE SCHEME CARDS
              ================================================== */}
              <div className="space-y-2.5 sm:hidden">
                {eligibleSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="relative overflow-hidden rounded-[19px] border border-[#ffeadf] bg-white p-3.5 shadow-[0_5px_18px_rgba(15,23,42,0.035)]"
                  >
                    <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-[#fff7ed] opacity-60 blur-2xl" />

                    <div className="relative">
                      {/* Scheme header */}
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#fff7ed] text-[#f97316]">
                          <FaGift className="text-[14px]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-extrabold text-[#334155]">
                            Special Scheme
                          </p>

                          <p className="text-[8px] font-medium text-[#94a3b8]">
                            Eligible reward
                          </p>
                        </div>

                        <FaCheckCircle className="shrink-0 text-[14px] text-emerald-500" />
                      </div>

                      {/* Conditions */}
                      <div className="mt-3 rounded-[12px] bg-[#f8fafc] px-3 py-2.5">
                        <p className="text-[8px] font-extrabold uppercase tracking-wide text-[#94a3b8]">
                          Based On
                        </p>

                        <p className="mt-1 text-[9px] font-bold leading-relaxed text-[#475569]">
                          {scheme.conditions
                            .map(
                              (c) =>
                                `${c.product_name || c.product}`
                            )
                            .join(", ")}
                        </p>
                      </div>

                      {/* Rewards */}
                      <div className="mt-2 rounded-[12px] border border-[#ffeadf] bg-[#fffaf8] px-3 py-2.5">
                        <p className="text-[8px] font-extrabold uppercase tracking-wide text-[#f97316]">
                          Free Reward
                        </p>

                        <p className="mt-1 text-[10px] font-extrabold leading-relaxed text-[#334155]">
                          {scheme.rewards
                            .map((r) => {
                              const multiplier =
                                getSchemeMultiplier(scheme);

                              const totalQty =
                                r.quantity * multiplier;

                              return `${totalQty} ${
                                r.product_name || r.product
                              } Free`;
                            })
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* =================================================
                  DESKTOP SCHEME TABLE
              ================================================== */}
              <div className="hidden overflow-hidden rounded-[20px] border border-[#ffeadf] bg-white shadow-[0_6px_22px_rgba(15,23,42,0.04)] sm:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-[#ffeadf] bg-[#fff7f5]">
                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
                        Schemes
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wide text-[#64748b]">
                        Rewards
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {eligibleSchemes.map((scheme) => (
                      <tr
                        key={scheme.id}
                        className="border-b border-[#f5f5f5] last:border-0 transition-colors hover:bg-[#fffaf8]"
                      >
                        <td className="px-4 py-3 text-[10px] font-semibold text-[#475569]">
                          {scheme.conditions
                            .map(
                              (c) =>
                                `${c.product_name || c.product}`
                            )
                            .join(", ")}
                        </td>

                        <td className="px-4 py-3 text-[10px] font-bold text-[#475569]">
                          {scheme.rewards
                            .map((r) => {
                              const multiplier =
                                getSchemeMultiplier(scheme);

                              const totalQty =
                                r.quantity * multiplier;

                              return `${totalQty} ${
                                r.product_name || r.product
                              } Free`;
                            })
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =================================================
              ORDER SUMMARY
          ================================================== */}
          <section className="mb-4">
            <div className="overflow-hidden rounded-[21px] border border-[#e9edf1] bg-white shadow-[0_6px_22px_rgba(15,23,42,0.045)]">

              {/* Summary top */}
              <div className="flex items-center justify-between border-b border-[#f0f2f4] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#fff1ee] text-[#fc250c]">
                    <FaShoppingCart className="text-[12px]" />
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold text-[#334155]">
                      Order Summary
                    </p>

                    <p className="text-[8px] text-[#94a3b8]">
                      Final payable amount
                    </p>
                  </div>
                </div>

                <FaChevronRight className="text-[10px] text-[#cbd5e1]" />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between bg-[#fffaf8] px-4 py-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">
                    Total Amount
                  </p>

                  <div className="mt-1 flex items-center gap-1">
                    <FaShieldAlt className="text-[10px] text-emerald-500" />

                    <span className="text-[8px] font-semibold text-[#64748b]">
                      Order ready for confirmation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[20px] font-black text-[#172033]">
                  <FaIndianRupeeSign className="text-[15px]" />
                  {orderTotal}
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PLACE ORDER
          ================================================== */}
          <section className="mb-3">
            <div className="rounded-[21px] border border-[#e9edf1] bg-white p-3 shadow-[0_6px_22px_rgba(15,23,42,0.045)]">

              <button
                type="button"
                onClick={() => {
                  if (user?.role !== "SS") return;

                  handlePlaceOrder();
                }}
                disabled={
                  isPlacingOrder ||
                  user?.role !== "SS"
                }
                className={`
                  relative flex w-full items-center justify-center gap-2
                  overflow-hidden rounded-[15px] px-5 py-3.5
                  text-[11px] font-extrabold
                  shadow-[0_8px_20px_rgba(252,37,12,0.16)]
                  transition-all duration-200
                  active:scale-[0.98]
                  disabled:shadow-none
                  ${
                    user?.role === "SS"
                      ? "bg-gradient-to-r from-[#fc250c] via-[#ff3d22] to-[#ea580c] text-white hover:shadow-[0_10px_25px_rgba(252,37,12,0.24)]"
                      : "cursor-not-allowed bg-[#e5e7eb] text-[#94a3b8]"
                  }
                `}
              >
                {/* Shine animation */}
                {user?.role === "SS" && !isPlacingOrder && (
                  <span className="absolute inset-y-0 -left-20 w-16 -skew-x-12 bg-white/20 animate-button-shine" />
                )}

                {isPlacingOrder ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    <span>
                      Placing Order...
                    </span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-[14px]" />

                    <span>
                      Place Order
                    </span>

                    <FaChevronRight className="text-[10px] opacity-80" />
                  </>
                )}
              </button>

              {/* Non SS message */}
              {user?.role !== "SS" && (
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <FaBan className="text-[9px] text-red-500" />

                  <p className="text-[8px] font-semibold text-red-500">
                    Only SS can place orders
                  </p>
                </div>
              )}

              {/* Security note */}
              {user?.role === "SS" && (
                <p className="mt-2.5 text-center text-[8px] font-medium text-[#94a3b8]">
                  Please verify your products and quantity before confirming.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* =====================================================
          ORDER PLACING OVERLAY
      ====================================================== */}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/70 px-5 backdrop-blur-[4px]">
          <div className="w-full max-w-[300px] animate-modal-pop rounded-[24px] border border-white/10 bg-[#172033] p-6 text-center shadow-[0_25px_70px_rgba(0,0,0,0.35)]">

            {/* Animated icon */}
            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#fc250c]/20 animate-ping" />

              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fc250c] to-[#ea580c] text-white shadow-[0_10px_30px_rgba(252,37,12,0.3)]">
                <FaShoppingCart className="text-[25px] animate-cart-pulse" />
              </div>
            </div>

            <h3 className="text-[15px] font-extrabold text-white">
              Placing Your Order
            </h3>

            <p className="mt-2 text-[10px] font-medium leading-relaxed text-slate-300">
              Please wait while we securely process your order...
            </p>

            {/* Loading dots */}
            <div className="mt-4 flex justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#fc250c] animate-loading-dot" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#fc250c] animate-loading-dot [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#fc250c] animate-loading-dot [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-[#111827]/70 px-3 pb-3 backdrop-blur-[4px] sm:items-center sm:px-5 sm:pb-0">
          <div className="w-full max-w-sm animate-success-sheet overflow-hidden rounded-[26px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)]">

            {/* Success top */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#ecfdf5] to-white px-5 pb-5 pt-7 text-center">

              {/* Decorative circles */}
              <span className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/70" />
              <span className="absolute -right-8 top-4 h-20 w-20 rounded-full bg-[#fff1ee]" />

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50/60">
                <FaCheckCircle className="text-[48px] animate-success-icon" />
              </div>

              <h3 className="relative mt-4 text-[17px] font-black text-emerald-600">
                Order Placed Successfully!
              </h3>

              <p className="relative mt-1 text-[9px] font-medium text-[#64748b]">
                Your order has been submitted successfully.
              </p>
            </div>

            {/* Order ID */}
            <div className="px-5 py-4">
              <div className="rounded-[15px] border border-[#e9edf1] bg-[#f8fafc] px-4 py-3 text-center">
                <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#94a3b8]">
                  Order ID
                </p>

                <p className="mt-1 break-all font-mono text-[12px] font-extrabold text-[#172033]">
                  {showSuccess}
                </p>
              </div>

              <p className="mt-3 text-center text-[9px] leading-relaxed text-[#94a3b8]">
                You can track your order in the history section.
              </p>
            </div>

            {/* Action */}
            <div className="border-t border-[#f0f2f4] p-4">
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false);
                  navigate("/");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[15px] bg-gradient-to-r from-[#fc250c] to-[#ea580c] px-5 py-3.5 text-[11px] font-extrabold text-white shadow-[0_8px_20px_rgba(252,37,12,0.18)] transition-all duration-200 active:scale-[0.98] hover:shadow-[0_10px_25px_rgba(252,37,12,0.25)]"
              >
                <FaBoxOpen className="text-[14px]" />

                <span>Go to Orders</span>

                <FaChevronRight className="text-[9px] opacity-80" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CUSTOM FAST ANIMATIONS
      ====================================================== */}
      <style>
        {`
          @keyframes buttonShine {
            0% {
              transform: translateX(-120px) skewX(-12deg);
            }

            100% {
              transform: translateX(520px) skewX(-12deg);
            }
          }

          @keyframes modalPop {
            0% {
              opacity: 0;
              transform: scale(0.94) translateY(8px);
            }

            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes successSheet {
            0% {
              opacity: 0;
              transform: translateY(25px) scale(0.98);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes successIcon {
            0% {
              opacity: 0;
              transform: scale(0.65);
            }

            70% {
              transform: scale(1.08);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes cartPulse {
            0%,
            100% {
              transform: translateY(0) scale(1);
            }

            50% {
              transform: translateY(-3px) scale(1.05);
            }
          }

          @keyframes loadingDot {
            0%,
            80%,
            100% {
              opacity: 0.35;
              transform: translateY(0);
            }

            40% {
              opacity: 1;
              transform: translateY(-4px);
            }
          }

          .animate-button-shine {
            animation: buttonShine 2.8s ease-in-out infinite;
          }

          .animate-modal-pop {
            animation: modalPop 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          .animate-success-sheet {
            animation: successSheet 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          .animate-success-icon {
            animation: successIcon 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
          }

          .animate-cart-pulse {
            animation: cartPulse 900ms ease-in-out infinite;
          }

          .animate-loading-dot {
            animation: loadingDot 900ms ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </div>
  );
}
