// import { useSelectedProducts } from "../hooks/useSelectedProducts";
// import { Link, useNavigate } from "react-router-dom";
// import { useSchemes } from "../hooks/useSchemes";
// import { useAuth } from "../context/AuthContext";
// import {
//   FaGift,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaTrashAlt,
//   FaBan,
//   FaShoppingCart,
// } from "react-icons/fa";
// import MobilePageHeader from "../components/MobilePageHeader";
// import makpower_image from "../assets/images/makpower_image.webp";
// import { useEffect } from "react";
// import QuantitySelector from "../components/QuantitySelector";


// export default function CartPage() {
//   const {
//     selectedProducts,
//     updateQuantity,
//     setSelectedProducts,
//     cartoonSelection,
//     updateCartoon,
//   } = useSelectedProducts();

//   const { data: schemes = [] } = useSchemes();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   // ✅ Initialize only missing cartoon selections on mount
//   useEffect(() => {
//     selectedProducts.forEach((p) => {

//       // ⭐ DS user — unlock everything, no MOQ, no auto correction
//       if (user?.role === "DS") {
//         return; // do nothing
//       }

//       // ⭐ SS user — Cartoon products
//       if (p.quantity_type === "CARTOON" && p.cartoon_size > 1) {
//         if (!cartoonSelection[p.id]) {
//           updateCartoon(p.id, 1);
//           updateQuantity(p.id, p.cartoon_size);
//         } else {
//           updateQuantity(p.id, cartoonSelection[p.id] * p.cartoon_size);
//         }
//         return;
//       }

//       // ⭐ SS user — Normal products with MOQ
//       const moq = p.moq || 1;
//       const qty = parseInt(p.quantity);

//       if (isNaN(qty) || qty < moq) {
//         updateQuantity(p.id, moq);
//       }
//     });
//   }, []);




//   const total = selectedProducts.reduce((sum, p) => {
//     const price = parseFloat(p.price);
//     if (!isNaN(price)) return sum + price * (p.quantity || 1);
//     return sum;
//   }, 0);

//   const handleRemove = (id) => {
//     const updated = selectedProducts.filter((p) => p.id !== id);
//     setSelectedProducts(updated);
//   };

//   const handleProceed = () => {
//     if (user.role == "DS") {
//       navigate("/confirm-order-ds");
//     }else{
//       navigate("/confirm-order");
//     }
//   };

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

//   if (selectedProducts.length === 0) {
//     return (
//       <div className="p-8 text-center text-gray-500">
//         <p className="text-2xl mb-3">🛒 Your cart is empty</p>
//         <Link to="/" className="text-blue-600 hover:underline">
//           ← Continue Shopping
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto py-2 sm:px-6 space-y-6 mb-35">
//       <MobilePageHeader title="Cart" />

//       {/* Cart Items */}
//       <div className="space-y-4 pt-[60px] sm:pt-0">
//         {selectedProducts.map((item) => {
//           const relatedSchemes = schemes.filter(
//             (scheme) =>
//               scheme.conditions.some(
//                 (c) => c.product === item.id || c.product_name === item.product_name
//               ) ||
//               scheme.rewards.some(
//                 (r) => r.product === item.id || r.product_name === item.product_name
//               )
//           );

//           const price = parseFloat(item.price);
//           const hasCartoon = item.quantity_type == "CARTOON";

//           return (
//             <div className="border-b p-4" key={item.id}>
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex flex-row flex-wrap gap-4 items-start">
//                   {/* Product Image */}
//                   <img
//                     src={
//                       item?.image
//                         ? `https://res.cloudinary.com/djyr368zj/${item.image}`
//                         : makpower_image
//                     }
//                     alt={item.product_name}
//                     className="w-20 h-20 object-contain bg-gray-50 rounded-lg border self-center"
//                   />

//                   <div className="flex-1">
//                     <h3 className="font-semibold text-lg">{item.product_name}</h3>
//                     <p className="text-xs text-gray-400 mb-2">{item.sub_category}</p>

//                     <p className="text-gray-600 flex items-center gap-1">
//                       {!isNaN(price) ? (
//                         <>&#8377;{item.price}</>
//                       ) : (
//                         <span className="flex items-center gap-1 text-red-500 text-xs">
//                           <FaBan /> Price
//                         </span>
//                       )}
//                     </p>

//                   </div>
//                   <div className="flex flex-col justify-between items-end mt-2 sm:mt-0">
//                     <button
//                       onClick={() => handleRemove(item.id)}
//                       className="text-red-500 text-sm flex items-center gap-1 me-2 hover:text-red-700"
//                     >
//                       <FaTrashAlt />
//                     </button>
//                   </div>
//                 </div>

//                 {/* Product Details  const hasCartoon = item.quantity_type == "CARTOON";*/}
//                 <div className="flex flex-row items-center justify-between">
//                   <div className="flex flex-row items-center gap-2">
//                     <QuantitySelector
//                       user={user}
//                       item={item}
//                       prod={item}
//                       cartoonSelection={cartoonSelection}
//                       updateQuantity={updateQuantity}
//                       updateCartoon={updateCartoon}
//                       isCartPage={true}
//                       isqty={true}
//                     />

//                   </div>


//                   <div className="font-bold">
//                     {!isNaN(price)
//                       ? `₹${(price * (item.quantity || 1)).toFixed(1)}`
//                       : "—"}
//                   </div>
//                 </div>

//               </div>

//               {/* Schemes */}
//               {relatedSchemes.map((scheme) => {
//                 const multiplier = getSchemeMultiplier(scheme);
//                 const eligible = multiplier > 0;
//                 return (
//                   <div
//                     key={scheme.id}
//                     className="flex items-center gap-2 mt-4 flex-wrap"
//                   >
//                     {eligible ? (
//                       <FaGift className="text-pink-600" />
//                     ) : (
//                       <FaGift className="text-gray-600" />
//                     )}
//                     <span className="text-xs flex-1">
//                       {scheme.conditions
//                         .map(
//                           (c) =>
//                             `Buy ${c.min_quantity} ${c.product_name || c.product}`
//                         )
//                         .join(", ")}{" "}
//                       →{" "}
//                       {scheme.rewards
//                         .map(
//                           (r) =>
//                             `Get ${r.quantity} ${r.product_name || r.product}`
//                         )
//                         .join(", ")}
//                     </span>
//                     {eligible && (
//                       <span className="ml-2 px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700 font-semibold">
//                         x
//                         {scheme.rewards.reduce(
//                           (sum, r) => sum + r.quantity * multiplier,
//                           0
//                         )}
//                       </span>
//                     )}
//                     {eligible ? (
//                       <FaCheckCircle className="text-green-600" />
//                     ) : (
//                       <FaTimesCircle className="text-yellow-600" />
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           );
//         })}
//       </div>

//       {/* Total & Proceed */}
//       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4">
//         <p className="text-xl font-bold text-gray-800">
//           <u className="text-red-600">₹ {total.toFixed(1)}</u>
//         </p>

//         <button
//           onClick={handleProceed}
//           className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-semibold px-6 py-3 rounded-md shadow-md hover:from-green-500 hover:to-green-600 hover:shadow-lg transition-all duration-300 ease-in-out"
//         >
//           <FaShoppingCart className="text-lg" />
//           Buy Now
//         </button>
//       </div>
//     </div>
//   );
// }



import { useSelectedProducts } from "../hooks/useSelectedProducts";
import { Link, useNavigate } from "react-router-dom";
import { useSchemes } from "../hooks/useSchemes";
import { useAuth } from "../context/AuthContext";
import {
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaBan,
  FaShoppingCart,
} from "react-icons/fa";
import MobilePageHeader from "../components/MobilePageHeader";
import makpower_image from "../assets/images/makpower_image.webp";
import { useEffect } from "react";
import QuantitySelector from "../components/QuantitySelector";

export default function CartPage() {
  const {
    selectedProducts,
    updateQuantity,
    setSelectedProducts,
    cartoonSelection,
    updateCartoon,
  } = useSelectedProducts();

  const { data: schemes = [] } = useSchemes();
  const navigate = useNavigate();
  const { user } = useAuth();

  // =========================================================
  // INITIALIZE CART QUANTITY
  // =========================================================

  useEffect(() => {
    selectedProducts.forEach((p) => {
      // ⭐ DS user — unlock everything, no MOQ, no auto correction
      if (user?.role === "DS") {
        return;
      }

      // ⭐ SS user — Cartoon products
      if (
        p.quantity_type === "CARTOON" &&
        p.cartoon_size > 1
      ) {
        if (!cartoonSelection[p.id]) {
          updateCartoon(p.id, 1);
          updateQuantity(p.id, p.cartoon_size);
        } else {
          updateQuantity(
            p.id,
            cartoonSelection[p.id] * p.cartoon_size
          );
        }

        return;
      }

      // ⭐ SS user — Normal products with MOQ
      const moq = p.moq || 1;
      const qty = parseInt(p.quantity);

      if (isNaN(qty) || qty < moq) {
        updateQuantity(p.id, moq);
      }
    });
  }, []);

  // =========================================================
  // TOTAL
  // =========================================================

  const total = selectedProducts.reduce((sum, p) => {
    const price = parseFloat(p.price);

    if (!isNaN(price)) {
      return sum + price * (p.quantity || 1);
    }

    return sum;
  }, 0);

  // =========================================================
  // REMOVE PRODUCT
  // =========================================================

  const handleRemove = (id) => {
    const updated = selectedProducts.filter(
      (p) => p.id !== id
    );

    setSelectedProducts(updated);
  };

  // =========================================================
  // PROCEED
  // =========================================================

  const handleProceed = () => {
    if (user.role === "DS") {
      navigate("/confirm-order-ds");
    } else {
      navigate("/confirm-order");
    }
  };

  // =========================================================
  // SCHEME MULTIPLIER
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

        return Math.floor(
          matched.quantity / cond.min_quantity
        );
      })
    );
  };

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (selectedProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🛒</div>

          <p className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">
            Your cart is empty
          </p>

          <Link
            to="/"
            className="
              inline-flex
              items-center
              justify-center
              px-4
              py-2
              rounded-lg
              bg-gray-900
              text-white
              text-sm
              font-medium
              hover:bg-gray-800
              transition
            "
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        w-full
        max-w-[1500px]
        mx-auto

        px-1
        sm:px-2
        

        py-2

        mb-32
        md:mb-20
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <MobilePageHeader title="Cart" />

      {/* =====================================================
          CART ITEMS
      ===================================================== */}

      <div
        className="
          pt-[58px]
          sm:pt-0

          grid

          grid-cols-1

          sm:grid-cols-2

          md:grid-cols-2

          lg:grid-cols-3

          xl:grid-cols-4

          gap-3
          sm:gap-4
          md:gap-5
          lg:gap-5
          xl:gap-6
        "
      >
        {selectedProducts.map((item) => {
          const relatedSchemes = schemes.filter(
            (scheme) =>
              scheme.conditions.some(
                (c) =>
                  c.product === item.id ||
                  c.product_name === item.product_name
              ) ||
              scheme.rewards.some(
                (r) =>
                  r.product === item.id ||
                  r.product_name === item.product_name
              )
          );

          const price = parseFloat(item.price);

          return (
            <div
              key={item.id}
              className="
                group
                w-full
                min-w-0

                rounded-xl
                sm:rounded-2xl

                border
                border-gray-200

                bg-white

                shadow-[0_1px_3px_rgba(0,0,0,0.04)]

                hover:shadow-[0_8px_25px_rgba(0,0,0,0.07)]

                transition-all
                duration-200

                p-3
                sm:p-4
                md:p-4
                lg:p-4
                xl:p-5
              "
            >
              {/* =================================================
                  PRODUCT HEADER
              ================================================= */}

              <div
                className="
                  flex
                  items-start
                  gap-3

                  sm:gap-3

                  md:gap-3

                  lg:gap-3

                  xl:gap-4
                "
              >
                {/* PRODUCT IMAGE */}

                <div
                  className="
                    flex-shrink-0

                    w-16
                    h-16

                    sm:w-[68px]
                    sm:h-[68px]

                    md:w-[72px]
                    md:h-[72px]

                    lg:w-[76px]
                    lg:h-[76px]

                    xl:w-[82px]
                    xl:h-[82px]

                    rounded-xl

                    border
                    border-gray-100

                    bg-gray-50

                    flex
                    items-center
                    justify-center

                    overflow-hidden
                  "
                >
                  <img
                    src={
                      item?.image
                        ? `https://res.cloudinary.com/djyr368zj/${item.image}`
                        : makpower_image
                    }
                    alt={item.product_name}
                    className="
                      w-full
                      h-full
                      object-contain
                    "
                  />
                </div>

                {/* PRODUCT DETAILS */}

                <div className="flex-1 min-w-0 pr-1">
                  <h3
                    className="
                      font-semibold

                      text-sm
                      sm:text-sm
                      md:text-sm
                      lg:text-sm
                      xl:text-base

                      text-gray-800

                      leading-snug

                      line-clamp-2
                    "
                  >
                    {item.product_name}
                  </h3>

                  <p
                    className="
                      text-[9px]
                      sm:text-[10px]
                      md:text-[10px]
                      lg:text-[10px]
                      xl:text-[11px]

                      text-gray-400

                      mt-1

                      truncate
                    "
                  >
                    {item.sub_category}
                  </p>

                  {/* PRICE */}

                  <div
                    className="
                      mt-1.5

                      text-xs
                      sm:text-xs
                      md:text-xs
                      lg:text-xs

                      font-semibold

                      text-gray-600
                    "
                  >
                    {!isNaN(price) ? (
                      <>₹{item.price}</>
                    ) : (
                      <span
                        className="
                          flex
                          items-center
                          gap-1

                          text-red-500

                          text-[10px]
                        "
                      >
                        <FaBan />
                        Price unavailable
                      </span>
                    )}
                  </div>
                </div>

                {/* REMOVE */}

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="
                    flex-shrink-0

                    w-7
                    h-7

                    sm:w-7
                    sm:h-7

                    md:w-7
                    md:h-7

                    lg:w-8
                    lg:h-8

                    rounded-lg

                    flex
                    items-center
                    justify-center

                    text-gray-400

                    hover:text-red-600
                    hover:bg-red-50

                    active:scale-95

                    transition-all
                  "
                  title="Remove product"
                >
                  <FaTrashAlt className="text-[11px] sm:text-xs" />
                </button>
              </div>

              {/* =================================================
                  QUANTITY + SUBTOTAL
              ================================================= */}

              <div
                className="
                  mt-3
                  sm:mt-4

                  pt-3
                  sm:pt-3

                  border-t
                  border-gray-100

                  flex
                  items-center
                  justify-between

                  gap-2
                "
              >
                {/* QUANTITY */}

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      text-[8px]
                      sm:text-[9px]
                      md:text-[9px]

                      uppercase
                      tracking-wide

                      font-semibold

                      text-gray-400

                      mb-1
                    "
                  >
                    Quantity
                  </p>

                  <QuantitySelector
                    user={user}
                    item={item}
                    prod={item}
                    cartoonSelection={cartoonSelection}
                    updateQuantity={updateQuantity}
                    updateCartoon={updateCartoon}
                    isCartPage={true}
                    isqty={true}
                  />
                </div>

                {/* SUBTOTAL */}

                <div
                  className="
                    flex-shrink-0
                    text-right
                  "
                >
                  <p
                    className="
                      text-[8px]
                      sm:text-[9px]
                      md:text-[9px]

                      uppercase
                      tracking-wide

                      font-semibold

                      text-gray-400

                      mb-1
                    "
                  >
                    Subtotal
                  </p>

                  <p
                    className="
                      text-sm
                      sm:text-sm
                      md:text-sm
                      lg:text-sm
                      xl:text-base

                      font-bold

                      text-gray-800
                    "
                  >
                    {!isNaN(price)
                      ? `₹${(
                          price *
                          (item.quantity || 1)
                        ).toFixed(1)}`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* =================================================
                  SCHEMES
              ================================================= */}

              {relatedSchemes.length > 0 && (
                <div
                  className="
                    mt-3
                    sm:mt-4

                    pt-2.5
                    sm:pt-3

                    border-t
                    border-gray-100
                  "
                >
                  {relatedSchemes.map((scheme) => {
                    const multiplier =
                      getSchemeMultiplier(scheme);

                    const eligible =
                      multiplier > 0;

                    return (
                      <div
                        key={scheme.id}
                        className="
                          flex
                          items-start
                          gap-1.5

                          mt-2

                          first:mt-0
                        "
                      >
                        {/* GIFT */}

                        <div className="pt-0.5 flex-shrink-0">
                          <FaGift
                            className={
                              eligible
                                ? "text-pink-500 text-[10px]"
                                : "text-gray-400 text-[10px]"
                            }
                          />
                        </div>

                        {/* SCHEME TEXT */}

                        <span
                          className="
                            flex-1
                            min-w-0

                            text-[8px]
                            sm:text-[9px]
                            md:text-[9px]
                            lg:text-[9px]
                            xl:text-[10px]

                            leading-relaxed

                            text-gray-500
                          "
                        >
                          {scheme.conditions
                            .map(
                              (c) =>
                                `Buy ${c.min_quantity} ${
                                  c.product_name ||
                                  c.product
                                }`
                            )
                            .join(", ")}{" "}
                          →{" "}
                          {scheme.rewards
                            .map(
                              (r) =>
                                `Get ${r.quantity} ${
                                  r.product_name ||
                                  r.product
                                }`
                            )
                            .join(", ")}
                        </span>

                        {/* MULTIPLIER */}

                        {eligible && (
                          <span
                            className="
                              flex-shrink-0

                              px-1.5
                              py-0.5

                              rounded-md

                              bg-green-50
                              text-green-700

                              text-[8px]

                              font-bold
                            "
                          >
                            x
                            {scheme.rewards.reduce(
                              (sum, r) =>
                                sum +
                                r.quantity *
                                  multiplier,
                              0
                            )}
                          </span>
                        )}

                        {/* STATUS */}

                        <div className="flex-shrink-0 pt-0.5">
                          {eligible ? (
                            <FaCheckCircle className="text-green-500 text-[10px]" />
                          ) : (
                            <FaTimesCircle className="text-yellow-500 text-[10px]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =====================================================
          ORDER SUMMARY
      ===================================================== */}

      <div
        className="
          mt-5
          sm:mt-6
          md:mt-6
          lg:mt-7

          rounded-xl
          sm:rounded-2xl

          border
          border-gray-200

          bg-white

          shadow-sm

          px-3
          sm:px-5
          md:px-6
          lg:px-7

          py-3
          sm:py-4
          md:py-4
          lg:py-5

          flex
          flex-row

          items-center
          justify-between

          gap-3

          sticky
          bottom-2

          z-30
        "
      >
        {/* TOTAL */}

        <div className="min-w-0">
          <p
            className="
              text-[9px]
              sm:text-[10px]
              md:text-[10px]
              lg:text-xs

              text-gray-400

              font-semibold

              uppercase
              tracking-wide
            "
          >
            Cart Total
          </p>

          <p
            className="
              mt-0.5

              text-lg
              sm:text-xl
              md:text-xl
              lg:text-2xl

              font-bold

              text-gray-900

              leading-tight
            "
          >
            ₹ {total.toFixed(1)}
          </p>
        </div>

        {/* BUY NOW */}

        <button
          type="button"
          onClick={handleProceed}
          className="
            flex
            items-center
            justify-center
            gap-1.5
            sm:gap-2

            flex-shrink-0

            px-4
            sm:px-5
            md:px-6
            lg:px-7
            xl:px-8

            py-2.5
            sm:py-2.5
            md:py-3
            lg:py-3

            rounded-lg
            sm:rounded-xl

            bg-gray-900
            hover:bg-gray-800

            text-white

            text-[11px]
            sm:text-xs
            md:text-sm
            lg:text-sm

            font-semibold

            shadow-sm

            hover:shadow-md

            active:scale-[0.98]

            transition-all
            duration-200
          "
        >
          <FaShoppingCart
            className="
              text-xs
              sm:text-sm
            "
          />

          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}