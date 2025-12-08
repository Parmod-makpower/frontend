import React from "react";

export default function QuantitySelector({
    user,
    item,
    prod,
    cartoonSelection,
    updateQuantity,
    updateCartoon,
    isCartPage = false,
    isqty
}) {
    const quantity = item?.quantity ?? "";
    const isCartoon = item?.quantity_type === "CARTOON";
    const cartoonSize = item?.cartoon_size || prod?.cartoon_size || 1;

    // SS MOQ
    const moq = item?.moq || prod?.moq || 1;

    // DS MOQ (NEW)
    const ds_moq = item?.ds_moq || prod?.ds_moq || 1;

    const isDS = user?.role === "DS";
    const isSS = user?.role === "SS";

    return (
        <>
            {/* 🟧 SS ONLY — Cartoon dropdown */}
            {isCartoon && !isDS ? (
                <>
                    <select
                        value={cartoonSelection[item.id] || 1}
                        onChange={(e) =>
                            updateCartoon(item.id, parseInt(e.target.value))
                        }
                        className={`border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none ${
                            isCartPage ? "w-32" : "w-full mt-2"
                        }`}
                    >
                        {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                                {n} Carton = {n * cartoonSize} Pcs
                            </option>
                        ))}
                    </select>

                    {isqty && (
                        <input
                            type="number"
                            value={quantity}
                            readOnly
                            className={`border rounded px-2 py-1 text-sm bg-gray-100 ${
                                isCartPage ? "w-20" : "w-full mt-2"
                            }`}
                        />
                    )}
                </>
            ) : (
                <>
                    {/* 🟩 DS + SS Normal input */}
                    <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => {
                            const val = e.target.value;

                            // ⭐ Allow empty typing for both DS & SS
                            if (val === "") {
                                updateQuantity(item.id, "");
                                item.showMoqError = true;
                                return;
                            }

                            const parsed = parseInt(val);
                            if (isNaN(parsed)) return;

                            // **DS → check ds_moq**
                            if (isDS) {
                                updateQuantity(item.id, parsed);
                                item.showMoqError = parsed < ds_moq;
                                return;
                            }

                            // **SS → check moq**
                            updateQuantity(item.id, parsed);
                            item.showMoqError = parsed < moq;
                        }}
                        onBlur={(e) => {
                            const parsed = parseInt(e.target.value);

                            // ⭐ DS AUTO FIX → ds_moq
                            if (isDS) {
                                if (isNaN(parsed) || parsed < ds_moq) {
                                    updateQuantity(item.id, ds_moq);
                                }
                                item.showMoqError = false;
                                return;
                            }

                            // ⭐ SS AUTO FIX → moq
                            if (isNaN(parsed) || parsed < moq) {
                                updateQuantity(item.id, moq);
                            }
                            item.showMoqError = false;
                        }}
                        className={`border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none ${
                            isCartPage ? "w-20" : "w-full mt-2"
                        } ${
                            item.showMoqError
                                ? "border-red-400"
                                : ""
                        }`}
                    />

                    {/* ERROR MESSAGE */}
                    {item.showMoqError && (
                        <p className="text-xs text-red-500 mt-1">
                            Minimum quantity:{" "}
                            {isDS ? ds_moq : moq}
                        </p>
                    )}
                </>
            )}
        </>
    );
}
