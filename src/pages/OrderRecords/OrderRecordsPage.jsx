import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaExclamationCircle,
  FaClipboardList,
  FaSyncAlt,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaChevronDown,
} from "react-icons/fa";

import {
  useOrderRecords,
  useOrderRecordDetail,
} from "../../hooks/useOrderRecords";

/* ============================================================================
   HELPERS
============================================================================ */

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAmount = (value) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* ============================================================================
   STATUS BADGE
============================================================================ */

const StatusBadge = memo(({ value }) => {
  const status = String(value || "UNKNOWN").toUpperCase();

  let className = "bg-gray-100 text-gray-600";

  if (status === "APPROVED" || status === "ACTIVE") {
    className = "bg-emerald-50 text-emerald-700";
  } else if (status === "PENDING") {
    className = "bg-amber-50 text-amber-700";
  } else if (status === "HOLD") {
    className = "bg-orange-50 text-orange-700";
  } else if (status === "REJECTED") {
    className = "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`
        inline-flex
        max-w-full
        items-center
        justify-center
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-extrabold
        leading-none
        whitespace-nowrap
        ${className}
      `}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

/* ============================================================================
   DISPATCH BADGE
============================================================================ */

const DispatchBadge = memo(({ value }) => {
  const status = String(value || "").toUpperCase();

  if (status === "DISPATCHED") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-emerald-50
          px-2.5
          py-1
          text-[10px]
          font-extrabold
          text-emerald-700
          whitespace-nowrap
        "
      >
        <FaTruck className="text-[9px]" />
        Dispatched
      </span>
    );
  }

  if (status === "PARTIAL") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-blue-50
          px-2.5
          py-1
          text-[10px]
          font-extrabold
          text-blue-700
          whitespace-nowrap
        "
      >
        <FaTruck className="text-[9px]" />
        Partial
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-amber-50
          px-2.5
          py-1
          text-[10px]
          font-extrabold
          text-amber-700
          whitespace-nowrap
        "
      >
        <FaClock className="text-[9px]" />
        Pending
      </span>
    );
  }

  if (status === "NOT_VERIFIED") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-gray-100
          px-2.5
          py-1
          text-[10px]
          font-extrabold
          text-gray-600
          whitespace-nowrap
        "
      >
        <FaExclamationCircle className="text-[9px]" />
        Not Verified
      </span>
    );
  }

  if (status === "NO_DISPATCH_REQUIRED") {
    return (
      <span
        className="
          inline-flex
          items-center
          rounded-full
          bg-gray-100
          px-2.5
          py-1
          text-[10px]
          font-extrabold
          text-gray-600
          whitespace-nowrap
        "
      >
        No Dispatch
      </span>
    );
  }

  return (
    <span
      className="
        inline-flex
        items-center
        rounded-full
        bg-gray-100
        px-2.5
        py-1
        text-[10px]
        font-extrabold
        text-gray-500
      "
    >
      -
    </span>
  );
});

DispatchBadge.displayName = "DispatchBadge";

/* ============================================================================
   LOADING ROWS
============================================================================ */

const LoadingRows = memo(() => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-b border-gray-100"
        >
          {Array.from({ length: 10 }).map((_, cellIndex) => (
            <td
              key={cellIndex}
              className="px-4 py-4"
            >
              <div
                className="
                  h-4
                  animate-pulse
                  rounded
                  bg-gray-100
                "
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
});

LoadingRows.displayName = "LoadingRows";

/* ============================================================================
   EMPTY STATE
============================================================================ */

const EmptyState = memo(() => {
  return (
    <div
      className="
        flex
        min-h-[360px]
        flex-col
        items-center
        justify-center
        px-5
        text-center
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-gray-100
          text-gray-400
        "
      >
        <FaClipboardList className="text-xl" />
      </div>

      <div
        className="
          mt-4
          text-sm
          font-extrabold
          text-gray-700
        "
      >
        No orders found
      </div>

      <div
        className="
          mt-1
          max-w-xs
          text-xs
          leading-5
          text-gray-400
        "
      >
        Try changing your search or filters.
      </div>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

/* ============================================================================
   MOBILE ORDER CARD
============================================================================ */

const MobileOrderCard = memo(({ order, onOpen }) => {
  return (
    <button
      type="button"
      onClick={() => onOpen(order.id)}
      className="
        block
        w-full
        border-b
        border-gray-100
        bg-white
        px-4
        py-4
        text-left
        transition
        active:bg-gray-50
      "
    >
      {/* TOP */}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="
                truncate
                text-[13px]
                font-extrabold
                text-gray-900
              "
            >
              {order.order_id || "-"}
            </div>

            <span className="shrink-0 text-[9px] font-semibold text-gray-400">
              #{order.id}
            </span>
          </div>

          <div
            className="
              mt-1
              truncate
              text-[11px]
              font-semibold
              text-gray-500
            "
          >
            {order.ss_party_name ||
              order.ss_user_name ||
              "-"}
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge value={order.status} />
        </div>
      </div>

      {/* AMOUNT */}

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
            Amount
          </div>

          <div className="mt-0.5 text-base font-extrabold text-gray-900">
            ₹{formatAmount(order.total_amount)}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
            CRM
          </div>

          <div className="mt-0.5 max-w-[130px] truncate text-[11px] font-bold text-gray-700">
            {order.crm_name || "-"}
          </div>
        </div>
      </div>

      {/* META */}

      <div
        className="
          mt-3
          flex
          flex-wrap
          items-center
          gap-1.5
        "
      >
        <span
          className="
            inline-flex
            items-center
            gap-1
            rounded-full
            bg-gray-50
            px-2
            py-1
            text-[9px]
            font-bold
            text-gray-500
          "
        >
          <FaBoxOpen className="text-[8px]" />
          {order.items_count ?? 0} items
        </span>

        <span
          className="
            inline-flex
            items-center
            gap-1
            rounded-full
            bg-gray-50
            px-2
            py-1
            text-[9px]
            font-bold
            text-gray-500
          "
        >
          {order.verified_items_count ?? 0} verified
        </span>

        <span
          className="
            inline-flex
            items-center
            gap-1
            rounded-full
            bg-gray-50
            px-2
            py-1
            text-[9px]
            font-bold
            text-gray-500
          "
        >
          {order.dispatched_quantity ?? 0} dispatched
        </span>

        <DispatchBadge value={order.dispatch_status} />
      </div>

      {/* VERIFIED */}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {order.verification_status ? (
            <div className="flex min-w-0 items-center gap-2">
              <StatusBadge value={order.verification_status} />

              <span className="truncate text-[9px] font-semibold text-gray-400">
                {order.punched
                  ? "Punched"
                  : "Not punched"}
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-gray-400">
              Not verified
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 text-[9px] font-semibold text-gray-400">
          <FaCalendarAlt className="text-[8px]" />
          {formatDate(order.created_at)}
          <FaChevronRight className="ml-1 text-[8px]" />
        </div>
      </div>
    </button>
  );
});

MobileOrderCard.displayName = "MobileOrderCard";

/* ============================================================================
   DETAIL DRAWER
============================================================================ */

const OrderDetailDrawer = memo(({ orderId, onClose }) => {
  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useOrderRecordDetail(orderId);

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        justify-end
      "
    >
      {/* OVERLAY */}

      <button
        type="button"
        aria-label="Close order details"
        onClick={onClose}
        className="
          absolute
          inset-0
          cursor-default
          bg-black/30
          backdrop-blur-[1px]
        "
      />

      {/* DRAWER */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          w-full
          max-w-[920px]
          flex-col
          bg-white
          shadow-2xl
          sm:max-w-[760px]
          lg:max-w-[900px]
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-200
            bg-white
            px-4
            py-3.5
            sm:px-5
          "
        >
          <div className="min-w-0">
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-gray-400
              "
            >
              Order Details
            </div>

            <div
              className="
                mt-1
                flex
                items-center
                gap-2
                text-base
                font-extrabold
                text-gray-900
                sm:text-lg
              "
            >
              <span className="truncate">
                {data?.order_id || "Loading..."}
              </span>

              {isFetching && !isLoading && (
                <FaSyncAlt
                  className="
                    shrink-0
                    animate-spin
                    text-[10px]
                    text-gray-400
                  "
                />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              ml-3
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gray-50
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
            "
          >
            <FaTimes />
          </button>
        </div>

        {/* BODY */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
          "
        >
          {isLoading && (
            <div
              className="
                flex
                min-h-[400px]
                items-center
                justify-center
                text-sm
                text-gray-500
              "
            >
              Loading order...
            </div>
          )}

          {isError && (
            <div
              className="
                flex
                min-h-[400px]
                flex-col
                items-center
                justify-center
                px-5
                text-center
                text-sm
                font-semibold
                text-red-600
              "
            >
              <FaExclamationCircle className="mb-2 text-xl" />

              Failed to load order details.
            </div>
          )}

          {!isLoading && !isError && data && (
            <div className="p-4 sm:p-5">

              {/* ============================================================
                  SUMMARY
              ============================================================ */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2.5
                  sm:grid-cols-4
                  sm:gap-3
                "
              >
                {/* AMOUNT */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-3.5
                    sm:p-4
                  "
                >
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    Amount
                  </div>

                  <div className="mt-1 text-base font-extrabold text-gray-900 sm:text-lg">
                    ₹{formatAmount(data.total_amount)}
                  </div>
                </div>

                {/* STATUS */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-3.5
                    sm:p-4
                  "
                >
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    Status
                  </div>

                  <div className="mt-2">
                    <StatusBadge value={data.status} />
                  </div>
                </div>

                {/* DISPATCH */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-3.5
                    sm:p-4
                  "
                >
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    Dispatch
                  </div>

                  <div className="mt-2">
                    <DispatchBadge
                      value={
                        data.summary?.dispatch_status
                      }
                    />
                  </div>
                </div>

                {/* DISPATCH QTY */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-3.5
                    sm:p-4
                  "
                >
                  <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    Dispatch Qty
                  </div>

                  <div className="mt-1 text-base font-extrabold text-gray-900 sm:text-lg">
                    {data.summary?.dispatched_quantity ?? 0}
                  </div>
                </div>
              </div>

              {/* ============================================================
                  PEOPLE
              ============================================================ */}

              <div
                className="
                  mt-4
                  grid
                  gap-3
                  sm:mt-5
                  sm:grid-cols-2
                  sm:gap-4
                "
              >
                {/* SS */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    p-4
                  "
                >
                  <div className="flex items-center gap-2">
                    <FaUser className="text-[10px] text-gray-400" />

                    <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                      Super Stockist
                    </div>
                  </div>

                  <div className="mt-2 text-sm font-bold text-gray-900">
                    {data.ss_user?.party_name ||
                      data.ss_user?.name ||
                      "-"}
                  </div>

                  {data.ss_user?.name &&
                    data.ss_user?.party_name && (
                      <div className="mt-1 text-xs text-gray-500">
                        {data.ss_user.name}
                      </div>
                    )}

                  {data.ss_user?.mobile && (
                    <div className="mt-1 text-xs text-gray-500">
                      {data.ss_user.mobile}
                    </div>
                  )}
                </div>

                {/* CRM */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    p-4
                  "
                >
                  <div className="flex items-center gap-2">
                    <FaUser className="text-[10px] text-gray-400" />

                    <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                      Assigned CRM
                    </div>
                  </div>

                  <div className="mt-2 text-sm font-bold text-gray-900">
                    {data.crm_user?.name || "-"}
                  </div>

                  {data.crm_user?.mobile && (
                    <div className="mt-1 text-xs text-gray-500">
                      {data.crm_user.mobile}
                    </div>
                  )}
                </div>
              </div>

              {/* ============================================================
                  VERIFICATION
              ============================================================ */}

              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-gray-200
                  p-4
                  sm:mt-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-extrabold
                    text-gray-900
                  "
                >
                  <FaCheckCircle className="text-emerald-500" />

                  Verification
                </div>

                {data.verification ? (
                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-x-4
                      gap-y-4
                      sm:grid-cols-4
                    "
                  >
                    <div>
                      <div className="text-[10px] text-gray-400">
                        Status
                      </div>

                      <div className="mt-1">
                        <StatusBadge
                          value={
                            data.verification.status
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-400">
                        Punched
                      </div>

                      <div className="mt-1 text-sm font-bold text-gray-800">
                        {data.verification.punched
                          ? "Yes"
                          : "No"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-400">
                        Verified By
                      </div>

                      <div className="mt-1 truncate text-sm font-bold text-gray-800">
                        {data.verification.crm_name ||
                          "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-gray-400">
                        Verified At
                      </div>

                      <div className="mt-1 text-xs font-semibold text-gray-700">
                        {formatDate(
                          data.verification.verified_at
                        )}
                      </div>
                    </div>

                    {data.verification
                      .dispatch_location && (
                      <div className="col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <FaMapMarkerAlt className="text-[8px]" />
                          Dispatch Location
                        </div>

                        <div className="mt-1 text-sm font-bold text-gray-800">
                          {
                            data.verification
                              .dispatch_location
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      mt-3
                      text-xs
                      text-gray-400
                    "
                  >
                    This order has not been verified yet.
                  </div>
                )}
              </div>

              {/* ============================================================
                  ITEMS
              ============================================================ */}

              <div
                className="
                  mt-4
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  sm:mt-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-gray-200
                    bg-gray-50
                    px-4
                    py-3
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-extrabold
                      text-gray-900
                    "
                  >
                    <FaBoxOpen />

                    Order Items
                  </div>

                  <div className="shrink-0 text-[10px] font-semibold text-gray-500">
                    {data.items?.length || 0} items
                  </div>
                </div>

                {/* MOBILE ITEMS */}

                <div className="divide-y divide-gray-100 sm:hidden">
                  {data.items?.length ? (
                    data.items.map((item, index) => (
                      <div
                        key={
                          item.crm_item_id ||
                          `${item.product_id}-${index}`
                        }
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-800">
                              {item.product_name || "-"}
                            </div>

                            {item.crm_item_id && (
                              <div className="mt-0.5 text-[9px] text-gray-400">
                                CRM Item #{item.crm_item_id}
                              </div>
                            )}
                          </div>

                          {item.rejected && (
                            <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
                              Rejected
                            </span>
                          )}
                        </div>

                        <div
                          className="
                            mt-3
                            grid
                            grid-cols-2
                            gap-2
                          "
                        >
                          <div className="rounded-lg bg-gray-50 p-2.5">
                            <div className="text-[9px] text-gray-400">
                              Ordered
                            </div>

                            <div className="mt-0.5 text-sm font-bold text-gray-800">
                              {item.ordered_quantity ?? "-"}
                            </div>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-2.5">
                            <div className="text-[9px] text-gray-400">
                              Verified
                            </div>

                            <div className="mt-0.5 text-sm font-bold text-gray-800">
                              {item.verified_quantity ?? "-"}
                            </div>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-2.5">
                            <div className="text-[9px] text-gray-400">
                              Dispatch
                            </div>

                            <div className="mt-0.5 text-sm font-bold text-gray-800">
                              {item.dispatch_quantity ?? 0}
                            </div>
                          </div>

                          <div className="rounded-lg bg-gray-50 p-2.5">
                            <div className="text-[9px] text-gray-400">
                              Location
                            </div>

                            <div className="mt-0.5 truncate text-sm font-bold text-gray-800">
                              {item.dispatch_location ||
                                "-"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[9px] text-gray-400">
                          <span>
                            Packed:{" "}
                            {formatDate(
                              item.order_packed_time
                            )}
                          </span>

                          <span>
                            {item.rejected
                              ? "Rejected"
                              : "Active"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-10 text-center text-xs text-gray-400">
                      No items found.
                    </div>
                  )}
                </div>

                {/* DESKTOP ITEMS TABLE */}

                <div className="hidden overflow-x-auto sm:block">
                  <table className="min-w-[850px] w-full text-left">
                    <thead className="border-b border-gray-200 bg-white">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Product
                        </th>

                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Ordered
                        </th>

                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Verified
                        </th>

                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Rejected
                        </th>

                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Dispatch
                        </th>

                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Location
                        </th>

                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                          Packed
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.items?.length ? (
                        data.items.map((item, index) => (
                          <tr
                            key={
                              item.crm_item_id ||
                              `${item.product_id}-${index}`
                            }
                            className="
                              border-b
                              border-gray-100
                              last:border-0
                            "
                          >
                            <td className="px-4 py-3">
                              <div className="text-sm font-bold text-gray-800">
                                {item.product_name || "-"}
                              </div>

                              {item.crm_item_id && (
                                <div className="mt-0.5 text-[9px] text-gray-400">
                                  CRM Item #
                                  {item.crm_item_id}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                              {item.ordered_quantity ?? "-"}
                            </td>

                            <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                              {item.verified_quantity ?? "-"}
                            </td>

                            <td className="px-4 py-3">
                              {item.rejected ? (
                                <span className="text-xs font-bold text-red-600">
                                  Yes
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-gray-400">
                                  No
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm font-bold text-gray-800">
                              {item.dispatch_quantity ?? 0}
                            </td>

                            <td className="px-4 py-3 text-xs font-semibold text-gray-600">
                              {item.dispatch_location ||
                                "-"}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-500">
                              {formatDate(
                                item.order_packed_time
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-xs text-gray-400"
                          >
                            No items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ============================================================
                  NOTES
              ============================================================ */}

              {(data.note || data.notes) && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-4
                    sm:mt-5
                  "
                >
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Notes
                  </div>

                  <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {data.note || data.notes}
                  </div>
                </div>
              )}

              {/* CREATED */}

              <div
                className="
                  mt-4
                  text-right
                  text-[10px]
                  text-gray-400
                  sm:mt-5
                "
              >
                Created {formatDate(data.created_at)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

OrderDetailDrawer.displayName = "OrderDetailDrawer";

/* ============================================================================
   FILTER PANEL
============================================================================ */

const FilterPanel = memo(
  ({
    status,
    setStatus,
    punched,
    setPunched,
    dispatch,
    setDispatch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
  }) => {
    return (
      <div
        className="
          grid
          grid-cols-1
          gap-2
          sm:grid-cols-2
          lg:grid-cols-5
        "
      >
        {/* STATUS */}

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
          }}
          className="
            h-10
            w-full
            rounded-xl
            border
            border-gray-200
            bg-white
            px-3
            text-xs
            font-semibold
            text-gray-600
            outline-none
            transition
            focus:border-gray-400
          "
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="HOLD">Hold</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* PUNCH */}

        <select
          value={
            punched === ""
              ? ""
              : String(punched)
          }
          onChange={(event) => {
            const value = event.target.value;

            setPunched(
              value === ""
                ? ""
                : value === "true"
            );
          }}
          className="
            h-10
            w-full
            rounded-xl
            border
            border-gray-200
            bg-white
            px-3
            text-xs
            font-semibold
            text-gray-600
            outline-none
            transition
            focus:border-gray-400
          "
        >
          <option value="">Punch: All</option>
          <option value="true">Punched</option>
          <option value="false">Not Punched</option>
        </select>

        {/* DISPATCH */}

        <select
          value={dispatch}
          onChange={(event) => {
            setDispatch(event.target.value);
          }}
          className="
            h-10
            w-full
            rounded-xl
            border
            border-gray-200
            bg-white
            px-3
            text-xs
            font-semibold
            text-gray-600
            outline-none
            transition
            focus:border-gray-400
          "
        >
          <option value="">Dispatch: All</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIAL">Partial</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="NOT_VERIFIED">
            Not Verified
          </option>
          <option value="NO_DISPATCH_REQUIRED">
            No Dispatch
          </option>
        </select>

        {/* FROM DATE */}

        <div className="relative">
          <FaCalendarAlt
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[10px]
              text-gray-400
            "
          />

          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(event.target.value);
            }}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-gray-200
              bg-white
              pl-8
              pr-3
              text-xs
              font-semibold
              text-gray-600
              outline-none
              focus:border-gray-400
            "
          />
        </div>

        {/* TO DATE */}

        <div className="relative">
          <FaCalendarAlt
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[10px]
              text-gray-400
            "
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(event.target.value);
            }}
            className="
              h-10
              w-full
              rounded-xl
              border
              border-gray-200
              bg-white
              pl-8
              pr-3
              text-xs
              font-semibold
              text-gray-600
              outline-none
              focus:border-gray-400
            "
          />
        </div>
      </div>
    );
  }
);

FilterPanel.displayName = "FilterPanel";

/* ============================================================================
   MAIN PAGE
============================================================================ */

export default function OrderRecordsPage() {
  /* --------------------------------------------------------------------------
     SEARCH
  -------------------------------------------------------------------------- */

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  /* --------------------------------------------------------------------------
     FILTERS
  -------------------------------------------------------------------------- */

  const [party, setParty] = useState("");
  const [status, setStatus] = useState("");
  const [punched, setPunched] = useState("");
  const [dispatch, setDispatch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* --------------------------------------------------------------------------
     PAGINATION
  -------------------------------------------------------------------------- */

  const [page, setPage] = useState(1);

  const pageSize = 50;

  /* --------------------------------------------------------------------------
     DETAIL
  -------------------------------------------------------------------------- */

  const [selectedOrderId, setSelectedOrderId] =
    useState(null);

  /* --------------------------------------------------------------------------
     MOBILE FILTER
  -------------------------------------------------------------------------- */

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  /* ==========================================================================
     SEARCH DEBOUNCE
  ========================================================================== */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  /* ==========================================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================================== */

  useEffect(() => {
    setPage(1);
  }, [
    search,
    party,
    status,
    punched,
    dispatch,
    fromDate,
    toDate,
  ]);

  /* ==========================================================================
     FETCH
  ========================================================================== */

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useOrderRecords({
    page,
    pageSize,
    q: search,
    party,
    status,
    punched,
    dispatch,
    fromDate,
    toDate,
  });

  /* ==========================================================================
     DERIVED DATA
  ========================================================================== */

  const orders = data?.results || [];

  const totalCount = Number(data?.count || 0);

  const hasPrevious = Boolean(data?.previous);

  const hasNext = Boolean(data?.next);

  /* ==========================================================================
     ACTIVE FILTERS
  ========================================================================== */

  const activeFilters = useMemo(() => {
    return Boolean(
      search ||
      party ||
      status ||
      punched !== "" ||
      dispatch ||
      fromDate ||
      toDate
    );
  }, [
    search,
    party,
    status,
    punched,
    dispatch,
    fromDate,
    toDate,
  ]);

  /* ==========================================================================
     CALLBACKS
  ========================================================================== */

  const handleOpenOrder = useCallback((id) => {
    setSelectedOrderId(id);
  }, []);

  const handleCloseOrder = useCallback(() => {
    setSelectedOrderId(null);
  }, []);

  const handlePrevious = useCallback(() => {
    setPage((current) =>
      Math.max(1, current - 1)
    );
  }, []);

  const handleNext = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");

    setParty("");
    setStatus("");
    setPunched("");
    setDispatch("");

    setFromDate("");
    setToDate("");

    setPage(1);
  }, []);

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-[#f7f8fa]
      "
    >
      {/* =====================================================================
          PAGE HEADER
      ===================================================================== */}

      <div
        className="
          shrink-0
          border-b
          border-gray-200
          bg-white
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1800px]
            px-3
            py-3
            sm:px-4
            sm:py-4
            lg:px-6
          "
        >
          {/* HEADER ROW */}

          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            {/* TITLE */}

            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-900
                  text-white
                  shadow-sm
                "
              >
                <FaClipboardList className="text-sm" />
              </div>

              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-base
                    font-extrabold
                    text-gray-900
                    sm:text-lg
                  "
                >
                  Order Records
                </h1>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[10px]
                    font-medium
                    text-gray-400
                    sm:text-[11px]
                  "
                >
                  Complete order and dispatch history
                </p>
              </div>
            </div>

            {/* SEARCH AREA */}

            <div
              className="
                flex
                w-full
                min-w-0
                gap-2
                lg:max-w-[650px]
              "
            >
              {/* MAIN SEARCH */}

              <div className="relative min-w-0 flex-1">
                <FaSearch
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[11px]
                    text-gray-400
                  "
                />

                <input
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                  }}
                  placeholder="Search order, party, CRM..."
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    pl-9
                    pr-9
                    text-xs
                    font-medium
                    text-gray-700
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-gray-300
                    focus:bg-white
                  "
                />

                {searchInput && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearchInput("");
                    }}
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      flex
                      h-6
                      w-6
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-md
                      text-gray-400
                      hover:bg-gray-100
                      hover:text-gray-700
                    "
                  >
                    <FaTimes className="text-[10px]" />
                  </button>
                )}
              </div>

              {/* PARTY */}

              <input
                value={party}
                onChange={(event) => {
                  setParty(event.target.value);
                }}
                placeholder="Party name..."
                className="
                  hidden
                  h-10
                  w-40
                  shrink-0
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-3
                  text-xs
                  font-medium
                  text-gray-700
                  outline-none
                  placeholder:text-gray-400
                  focus:border-gray-300
                  focus:bg-white
                  sm:block
                "
              />
            </div>
          </div>

          {/* MOBILE PARTY */}

          <div className="mt-2 sm:hidden">
            <input
              value={party}
              onChange={(event) => {
                setParty(event.target.value);
              }}
              placeholder="Search party..."
              className="
                h-9
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-3
                text-xs
                font-medium
                text-gray-700
                outline-none
                placeholder:text-gray-400
                focus:border-gray-300
                focus:bg-white
              "
            />
          </div>

          {/* DESKTOP FILTERS */}

          <div className="mt-3 hidden lg:block">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <FilterPanel
                  status={status}
                  setStatus={setStatus}
                  punched={punched}
                  setPunched={setPunched}
                  dispatch={dispatch}
                  setDispatch={setDispatch}
                  fromDate={fromDate}
                  setFromDate={setFromDate}
                  toDate={toDate}
                  setToDate={setToDate}
                />
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {activeFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      flex
                      h-10
                      items-center
                      gap-1.5
                      rounded-xl
                      px-3
                      text-[10px]
                      font-extrabold
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    <FaTimes />
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => refetch()}
                  className="
                    flex
                    h-10
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-3
                    text-[10px]
                    font-extrabold
                    text-gray-600
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <FaSyncAlt
                    className={
                      isFetching
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE FILTER BAR */}

          <div className="mt-2.5 flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileFiltersOpen(
                  (value) => !value
                );
              }}
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-3
                text-[10px]
                font-extrabold
                text-gray-600
                shadow-sm
              "
            >
              <FaFilter />

              Filter

              {activeFilters && (
                <span
                  className="
                    flex
                    h-4
                    min-w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-900
                    px-1
                    text-[8px]
                    text-white
                  "
                >
                  !
                </span>
              )}

              <FaChevronDown
                className={`
                  ml-1
                  text-[8px]
                  transition-transform
                  ${
                    mobileFiltersOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            <button
              type="button"
              disabled={isFetching}
              onClick={() => refetch()}
              className="
                ml-auto
                flex
                h-9
                items-center
                gap-1.5
                rounded-xl
                border
                border-gray-200
                bg-white
                px-3
                text-[10px]
                font-extrabold
                text-gray-600
                shadow-sm
                disabled:opacity-50
              "
            >
              <FaSyncAlt
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* MOBILE FILTER PANEL */}

          {mobileFiltersOpen && (
            <div
              className="
                mt-2.5
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                p-3
                lg:hidden
              "
            >
              <FilterPanel
                status={status}
                setStatus={setStatus}
                punched={punched}
                setPunched={setPunched}
                dispatch={dispatch}
                setDispatch={setDispatch}
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
              />

              {activeFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-2
                    flex
                    h-9
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    rounded-xl
                    bg-red-50
                    text-[10px]
                    font-extrabold
                    text-red-600
                  "
                >
                  <FaTimes />
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          CONTENT
      ===================================================================== */}

      <div
        className="
          min-h-0
          flex-1
          p-2.5
          sm:p-3
          lg:p-4
        "
      >
        <div
          className="
            mx-auto
            flex
            h-full
            min-h-0
            w-full
            max-w-[1800px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          {/* CONTENT HEADER */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              gap-3
              border-b
              border-gray-200
              bg-white
              px-4
              py-3
              sm:px-5
            "
          >
            <div className="min-w-0">
              <div
                className="
                  text-xs
                  font-extrabold
                  text-gray-600
                "
              >
                {isFetching && !isLoading
                  ? "Updating..."
                  : `${totalCount.toLocaleString(
                      "en-IN"
                    )} orders found`}
              </div>

              {activeFilters && !isFetching && (
                <div className="mt-0.5 text-[9px] font-medium text-gray-400">
                  Filtered results
                </div>
              )}
            </div>

            {isError && (
              <div
                className="
                  shrink-0
                  rounded-lg
                  bg-red-50
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-bold
                  text-red-600
                "
              >
                Failed to load orders
              </div>
            )}
          </div>

          {/* =================================================================
              DESKTOP TABLE
          ================================================================= */}

          <div className="hidden min-h-0 flex-1 overflow-auto lg:block">
            <table
              className="
                min-w-[1200px]
                w-full
                text-left
              "
            >
              <thead
                className="
                  sticky
                  top-0
                  z-10
                  border-b
                  border-gray-200
                  bg-gray-50
                "
              >
                <tr>
                  <th className="w-[15%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Order
                  </th>

                  <th className="w-[21%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Party
                  </th>

                  <th className="w-[10%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    CRM
                  </th>

                  <th className="w-[9%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Amount
                  </th>

                  <th className="w-[9%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Status
                  </th>

                  <th className="w-[10%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Verified
                  </th>

                  <th className="w-[9%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Items
                  </th>

                  <th className="w-[7%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Dispatch
                  </th>

                  <th className="w-[10%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Delivery
                  </th>

                  <th className="w-[10%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-400">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <LoadingRows />
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        handleOpenOrder(order.id);
                      }}
                      className="
                        cursor-pointer
                        border-b
                        border-gray-100
                        transition
                        hover:bg-gray-50
                      "
                    >
                      {/* ORDER */}

                      <td className="px-4 py-3.5">
                        <div
                          className="
                            text-[12px]
                            font-extrabold
                            text-gray-900
                          "
                        >
                          {order.order_id || "-"}
                        </div>

                        <div className="mt-0.5 text-[9px] font-semibold text-gray-400">
                          #{order.id}
                        </div>
                      </td>

                      {/* PARTY */}

                      <td className="px-4 py-3.5">
                        <div
                          className="
                            max-w-[240px]
                            text-[12px]
                            font-extrabold
                            leading-5
                            text-gray-800
                          "
                        >
                          {order.ss_party_name ||
                            order.ss_user_name ||
                            "-"}
                        </div>

                        {order.ss_party_name &&
                          order.ss_user_name && (
                            <div className="mt-0.5 max-w-[240px] truncate text-[9px] font-medium text-gray-400">
                              {order.ss_user_name}
                            </div>
                          )}
                      </td>

                      {/* CRM */}

                      <td className="px-4 py-3.5">
                        <div className="text-[11px] font-bold text-gray-700">
                          {order.crm_name || "-"}
                        </div>
                      </td>

                      {/* AMOUNT */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="text-[12px] font-extrabold text-gray-900">
                          ₹
                          {formatAmount(
                            order.total_amount
                          )}
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-3.5">
                        <StatusBadge
                          value={order.status}
                        />
                      </td>

                      {/* VERIFIED */}

                      <td className="px-4 py-3.5">
                        {order.verification_status ? (
                          <div>
                            <StatusBadge
                              value={
                                order.verification_status
                              }
                            />

                            <div className="mt-1 text-[9px] font-semibold text-gray-400">
                              {order.punched
                                ? "Punched"
                                : "Not punched"}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-400">
                            Not verified
                          </span>
                        )}
                      </td>

                      {/* ITEMS */}

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-extrabold text-gray-800">
                            {order.items_count ?? 0}
                          </span>

                          <span className="text-[9px] font-semibold text-gray-400">
                            /
                            {order.dispatched_items_count ??
                              0}
                          </span>
                        </div>

                        {order.verified_items_count !=
                          null && (
                          <div className="mt-0.5 text-[9px] font-semibold text-gray-400">
                            {
                              order.verified_items_count
                            }{" "}
                            verified
                          </div>
                        )}
                      </td>

                      {/* DISPATCH QTY */}

                      <td className="px-4 py-3.5">
                        <div className="text-[12px] font-extrabold text-gray-800">
                          {order.dispatched_quantity ??
                            0}
                        </div>
                      </td>

                      {/* DISPATCH */}

                      <td className="px-4 py-3.5">
                        <DispatchBadge
                          value={
                            order.dispatch_status
                          }
                        />
                      </td>

                      {/* CREATED */}

                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="text-[10px] font-semibold text-gray-500">
                          {formatDate(
                            order.created_at
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================================
              MOBILE CARDS
          ================================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto lg:hidden">
            {isLoading ? (
              <div className="space-y-2 bg-gray-50 p-2.5">
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="
                        h-[175px]
                        animate-pulse
                        rounded-xl
                        bg-white
                      "
                    />
                  )
                )}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="bg-gray-50">
                {orders.map((order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onOpen={handleOpenOrder}
                  />
                ))}
              </div>
            )}
          </div>

          {/* =================================================================
              PAGINATION
          ================================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-t
              border-gray-200
              bg-white
              px-4
              py-2.5
              sm:px-5
              sm:py-3
            "
          >
            <div className="text-[10px] font-bold text-gray-400">
              Page {page}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={
                  !hasPrevious || isFetching
                }
                onClick={handlePrevious}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  text-gray-600
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                <FaChevronLeft className="text-[9px]" />
              </button>

              <div
                className="
                  flex
                  h-8
                  min-w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-gray-900
                  px-2
                  text-[10px]
                  font-extrabold
                  text-white
                "
              >
                {page}
              </div>

              <button
                type="button"
                disabled={!hasNext || isFetching}
                onClick={handleNext}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  text-gray-600
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                <FaChevronRight className="text-[9px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          DETAIL DRAWER
      ===================================================================== */}

      {selectedOrderId && (
        <OrderDetailDrawer
          orderId={selectedOrderId}
          onClose={handleCloseOrder}
        />
      )}
    </div>
  );
}