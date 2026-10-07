import { useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  X,
  Package,
} from "lucide-react";
import { useCRMOrders } from "../../hooks/useCRMOrders";

export default function MoveItemsModal({
  isOpen,
  onClose,
  currentOrderId,
  selectedCount = 0,
  onMove,
}) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedOrderId, setSelectedOrderId] =
    useState(null);

  const {
    data: orders = [],
    isLoading,
  } = useCRMOrders("PENDING");

  const pendingOrders = useMemo(() => {
    const currentId =
      String(
        currentOrderId ?? ""
      );

    const term =
      searchTerm
        .trim()
        .toLowerCase();

    return (
      Array.isArray(orders)
        ? orders
        : []
    )
      .filter(
        (order) =>
          String(
            order?.id ?? ""
          ) !== currentId
      )
      .filter((order) => {
        if (!term) return true;

        return (
          String(
            order?.order_id ?? ""
          )
            .toLowerCase()
            .includes(term) ||
          String(
            order?.ss_party_name ??
              ""
          )
            .toLowerCase()
            .includes(term)
        );
      });
  }, [
    orders,
    currentOrderId,
    searchTerm,
  ]);

  if (!isOpen) return null;

  const handleMove = () => {
    if (!selectedOrderId) return;

    const destinationOrder =
      orders.find(
        (order) =>
          String(
            order?.id ?? ""
          ) ===
          String(
            selectedOrderId
          )
      );

    if (!destinationOrder) return;

    onMove(destinationOrder);
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[10000]
        flex
        items-center
        justify-center
        bg-slate-900/45
        p-3
        backdrop-blur-[2px]
      "
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowRight size={17} />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800">
                Move Selected Items
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-400">
                {selectedCount}{" "}
                {selectedCount === 1
                  ? "item"
                  : "items"}{" "}
                selected
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={17} />
          </button>

        </div>

        {/* SEARCH */}

        <div className="border-b border-slate-100 p-3">

          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 focus-within:bg-white">

            <Search
              size={15}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search pending order or party..."
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={13} />
              </button>
            )}

          </div>

        </div>

        {/* ORDERS */}

        <div className="max-h-[55vh] overflow-y-auto p-3">

          {isLoading ? (
            <div className="flex min-h-[180px] items-center justify-center text-xs text-slate-400">
              Loading pending orders...
            </div>
          ) : pendingOrders.length ===
            0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 text-center">

              <Package
                size={25}
                className="text-slate-300"
              />

              <p className="text-xs font-semibold text-slate-700">
                No pending orders found
              </p>

              <p className="text-[10px] text-slate-400">
                Try another order ID or party name.
              </p>

            </div>
          ) : (
            <div className="space-y-2">

              {pendingOrders.map(
                (order) => {
                  const id =
                    String(
                      order?.id ?? ""
                    );

                  const selected =
                    id ===
                    String(
                      selectedOrderId
                    );

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setSelectedOrderId(
                          order.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                      }`}
                    >

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Package size={15} />
                      </span>

                      <span className="min-w-0 flex-1">

                        <span className="block truncate text-xs font-bold text-slate-800">
                          {order?.order_id ||
                            `Order #${order?.id}`}
                        </span>

                        <span className="mt-0.5 block truncate text-[10px] text-slate-700">
                          {order?.ss_party_name ||
                            "Unknown party"}
                        </span>

                      </span>

                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                          selected
                            ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_3px_white]"
                            : "border-slate-300"
                        }`}
                      />

                    </button>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg cursor-pointer border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleMove}
            disabled={
              !selectedOrderId ||
              isLoading
            }
            className="inline-flex items-center gap-2 rounded-lg cursor-pointer bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ArrowRight size={14} />
            Move Items
          </button>

        </div>

      </div>
    </div>
  );
}