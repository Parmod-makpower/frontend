
import React, { useEffect, useState } from "react";

export default function QuantitySelector({
  user,
  item,
  prod,
  cartoonSelection,
  updateQuantity,
  updateCartoon,
  isCartPage = false,
  isqty,
}) {
  // =========================================================
  // QUANTITY
  // =========================================================

  const quantity =
    item?.quantity ?? "";

  // =========================================================
  // PRODUCT TYPE
  // =========================================================

  const isCartoon =
    item?.quantity_type === "CARTOON";

  const cartoonSize =
    Number(
      item?.cartoon_size ||
      prod?.cartoon_size ||
      1
    );

  // =========================================================
  // MOQ
  // =========================================================

  // SS MOQ
  const moq =
    Number(
      item?.moq ||
      prod?.moq ||
      1
    );

  // DS MOQ
  const ds_moq =
    Number(
      item?.ds_moq ||
      prod?.ds_moq ||
      1
    );

  // =========================================================
  // ROLE
  // =========================================================

  const isDS =
    user?.role === "DS";

  const isSS =
    user?.role === "SS";

  // =========================================================
  // MOQ ERROR
  // =========================================================

  const [showMoqError, setShowMoqError] =
    useState(false);

  // Keep UI synchronized if quantity changes
  // from outside this component.

  useEffect(() => {
    const currentQty =
      Number(quantity);

    const minimum =
      isDS ? ds_moq : moq;

    if (
      quantity !== "" &&
      !isNaN(currentQty) &&
      currentQty >= minimum
    ) {
      setShowMoqError(false);
    }
  }, [
    quantity,
    isDS,
    ds_moq,
    moq,
  ]);

  // =========================================================
  // MINIMUM QUANTITY
  // =========================================================

  const minimumQuantity =
    isDS ? ds_moq : moq;

  // =========================================================
  // CARTON VALUE
  // =========================================================

  const selectedCartons =
    Number(
      cartoonSelection?.[item?.id] || 1
    );

  // =========================================================
  // CARTON PRODUCT
  // =========================================================

  if (isCartoon && !isDS) {
    return (
      <div
        className={`
          w-full
          ${
            isCartPage
              ? "flex items-center gap-1.5"
              : "flex flex-col gap-1.5"
          }
        `}
      >
        {/* ===================================================
            CARTON SELECT
        =================================================== */}

        <div className="relative flex-1 min-w-0">
          <select
            value={selectedCartons}
            onChange={(e) => {
              updateCartoon(
                item.id,
                parseInt(
                  e.target.value,
                  10
                )
              );
            }}
            className="
              appearance-none
              w-full
              h-8
              sm:h-9
              rounded-lg
              border
              border-gray-200
              bg-gray-50
              hover:bg-white
              px-2
              pr-7
              text-[9px]
              sm:text-[10px]
              font-medium
              text-gray-700
              outline-none
              cursor-pointer
              focus:border-gray-300
              focus:ring-2
              focus:ring-gray-100
              transition
            "
          >
            {Array.from(
              {
                length: 100,
              },
              (_, i) => i + 1
            ).map((n) => (
              <option
                key={n}
                value={n}
              >
                {n} Carton ={" "}
                {n * cartoonSize} Pcs
              </option>
            ))}
          </select>

          {/* Custom arrow */}

          <span
            className="
              pointer-events-none
              absolute
              right-2
              top-1/2
              -translate-y-1/2
              text-[8px]
              text-gray-400
            "
          >
            ▼
          </span>
        </div>

        {/* ===================================================
            PIECES
        =================================================== */}

        {isqty && (
          <input
            type="number"
            value={quantity}
            readOnly
            className="
              w-[55px]
              sm:w-[62px]
              h-8
              sm:h-9
              rounded-lg
              border
              border-gray-200
              bg-gray-100
              px-1
              text-center
              text-[9px]
              sm:text-[10px]
              font-semibold
              text-gray-600
              outline-none
              flex-shrink-0
            "
          />
        )}
      </div>
    );
  }

  // =========================================================
  // NORMAL PRODUCT
  // =========================================================

  const handleQuantityChange = (
    e
  ) => {
    const value =
      e.target.value;

    // -------------------------------------------------------
    // Allow empty input
    // -------------------------------------------------------

    if (value === "") {
      updateQuantity(
        item.id,
        ""
      );

      setShowMoqError(true);

      return;
    }

    const parsed =
      parseInt(value, 10);

    if (isNaN(parsed)) {
      return;
    }

    // -------------------------------------------------------
    // DS
    // -------------------------------------------------------

    if (isDS) {
      updateQuantity(
        item.id,
        parsed
      );

      setShowMoqError(
        parsed < ds_moq
      );

      return;
    }

    // -------------------------------------------------------
    // SS
    // -------------------------------------------------------

    updateQuantity(
      item.id,
      parsed
    );

    setShowMoqError(
      parsed < moq
    );
  };

  // =========================================================
  // BLUR
  // =========================================================

  const handleQuantityBlur = (
    e
  ) => {
    const parsed =
      parseInt(
        e.target.value,
        10
      );

    // -------------------------------------------------------
    // DS AUTO FIX
    // -------------------------------------------------------

    if (isDS) {
      if (
        isNaN(parsed) ||
        parsed < ds_moq
      ) {
        updateQuantity(
          item.id,
          ds_moq
        );
      }

      setShowMoqError(false);

      return;
    }

    // -------------------------------------------------------
    // SS AUTO FIX
    // -------------------------------------------------------

    if (
      isNaN(parsed) ||
      parsed < moq
    ) {
      updateQuantity(
        item.id,
        moq
      );
    }

    setShowMoqError(false);
  };

  // =========================================================
  // NORMAL QUANTITY UI
  // =========================================================

  return (
    <div
      className={`
        w-full
        ${
          isCartPage
            ? ""
            : ""
        }
      `}
    >
      {/* ===================================================
          INPUT AREA
      =================================================== */}

      <div
        className="
          flex
          items-center
          gap-1.5
          w-full
        "
      >
        {/* Quantity Input */}

        <div className="flex-1 min-w-0">
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={
              handleQuantityChange
            }
            onBlur={
              handleQuantityBlur
            }
            className={`
              w-full
              h-8
              sm:h-9
              rounded-lg
              border
              px-2
              text-center
              text-[10px]
              sm:text-[11px]
              font-semibold
              outline-none
              transition

              ${
                showMoqError
                  ? "border-red-300 bg-red-50 text-red-600 focus:border-red-400"
                  : "border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
              }
            `}
          />
        </div>

        {/* Unit */}

        <span
          className="
            text-[9px]
            sm:text-[10px]
            text-gray-400
            font-medium
            whitespace-nowrap
          "
        >
          
        </span>
      </div>

      {/* ===================================================
          MOQ ERROR
      =================================================== */}

      {showMoqError && (
        <p
          className="
            mt-1
            px-0.5
            text-[8px]
            sm:text-[9px]
            leading-tight
            text-red-500
            font-medium
          "
        >
          Minimum quantity:{" "}
          {minimumQuantity}
        </p>
      )}
    </div>
  );
}