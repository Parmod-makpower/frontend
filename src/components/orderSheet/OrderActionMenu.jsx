import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FaEllipsisV, FaPauseCircle, FaTimesCircle } from "react-icons/fa";
import SSPDF from "../pdf/SSPDF";

export default function OrderActionMenu({
  order,
  notes,
  navigate,
  holdCRMOrder,
  RejectCRMOrder,
  manualAvailabilityMap,
  selectedCity,
  allProducts,
  items,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();

  // ✅ Outside click close
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* 3-dot button */}
      <button
        onClick={() => setMenuOpen((p) => !p)}
        className="p-2 rounded hover:bg-gray-200 cursor-pointer"
      >
        <FaEllipsisV size={18} />
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-xl z-50">
          <ul className=" text-sm">

            {/* PDF */}
            <li className="px-3 py-2 hover:bg-gray-100 border-b">
              <SSPDF
                order={order}
                manualAvailabilityMap={manualAvailabilityMap}
                selectedCity={selectedCity}
                allProducts={allProducts}
                items={items}
              />
            </li>

            {/* Hold */}
            <li  className="border-b">
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  const ok = window.confirm(
                    "Are you sure you want to place this order on HOLD?"
                  );
                  if (!ok) return;

                  await holdCRMOrder(order.id, { notes });
                  queryClient.invalidateQueries({
                    queryKey: ["crmOrders"],
                    exact: false,
                  });
                  navigate("/crm/orders");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100"
              >
                <FaPauseCircle className="text-yellow-500" />
                Hold Order
              </button>
            </li>

            {/* Reject */}
            <li>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  const ok = window.confirm(
                    "Are you sure you want to Reject this order?"
                  );
                  if (!ok) return;

                  await RejectCRMOrder(order.id, { notes });
                  queryClient.invalidateQueries({
                    queryKey: ["crmOrders"],
                    exact: false,
                  });
                  navigate("/crm/orders");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100"
              >
                <FaTimesCircle className="text-red-500" />
                Reject Order
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
