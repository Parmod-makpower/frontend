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
  FaRoute,
  FaCircle,
  FaFileAlt,
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

const formatShortDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
   TRACKING HELPERS
============================================================================ */

const getDispatchDate = (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  const dates = items
    .map((item) => item?.order_packed_time)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (!dates.length) {
    return null;
  }

  /*
   * Latest packed/dispatch timestamp.
   */
  return new Date(
    Math.max(...dates.map((date) => date.getTime()))
  ).toISOString();
};

const getTrackingState = (data) => {
  const verification = data?.verification;
  const dispatchStatus = String(
    data?.summary?.dispatch_status || ""
  ).toUpperCase();

  const isVerified = Boolean(verification);

  const isDispatched =
    dispatchStatus === "DISPATCHED";

  const isPartial =
    dispatchStatus === "PARTIAL";

  const dispatchDate = getDispatchDate(
    data?.items || []
  );

  let progress = 33;

  if (isVerified) {
    progress = 66;
  }

  if (isPartial) {
    progress = 82;
  }

  if (isDispatched) {
    progress = 100;
  }

  return {
    isVerified,
    isDispatched,
    isPartial,
    progress,
    dispatchDate,
  };
};

/* ============================================================================
   STATUS BADGE
============================================================================ */

const StatusBadge = memo(({ value }) => {
  const status = String(
    value || "UNKNOWN"
  ).toUpperCase();

  let className =
    "bg-gray-100 ";

  if (
    status === "APPROVED" ||
    status === "ACTIVE"
  ) {
    className =
      "bg-emerald-50 text-emerald-700";
  } else if (status === "PENDING") {
    className =
      "bg-amber-50 text-amber-700";
  } else if (status === "HOLD") {
    className =
      "bg-orange-50 text-orange-700";
  } else if (status === "REJECTED") {
    className =
      "bg-red-50 text-red-700";
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
  const status = String(
    value || ""
  ).toUpperCase();

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
          
          whitespace-nowrap
        "
      >
        <FaExclamationCircle className="text-[9px]" />
        Not Verified
      </span>
    );
  }

  if (
    status === "NO_DISPATCH_REQUIRED"
  ) {
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
        
      "
    >
      -
    </span>
  );
});

DispatchBadge.displayName =
  "DispatchBadge";

/* ============================================================================
   LOADING ROWS
============================================================================ */

const LoadingRows = memo(() => {
  return (
    <>
      {Array.from({ length: 8 }).map(
        (_, rowIndex) => (
          <tr
            key={rowIndex}
            className="border-b border-gray-500"
          >
            {Array.from({
              length: 10,
            }).map((_, cellIndex) => (
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
        )
      )}
    </>
  );
});

LoadingRows.displayName =
  "LoadingRows";

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
          rounded
          bg-gray-100
          text-gray-500
        "
      >
        <FaClipboardList className="text-xl" />
      </div>

      <div
        className="
          mt-4
          text-sm
          font-extrabold
          
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
          text-gray-500
        "
      >
        Try changing your search or filters.
      </div>
    </div>
  );
});

EmptyState.displayName =
  "EmptyState";

/* ============================================================================
   MOBILE ORDER CARD
============================================================================ */

const MobileOrderCard = memo(
  ({ order, onOpen }) => {
    return (
      <button
        type="button"
        onClick={() => onOpen(order.id)}
        className="
          block
          w-full
          border-b
          border-gray-500
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
                  
                "
              >
                {order.order_id || "-"}
              </div>

              <span
                className="
                  shrink-0
                  text-[9px]
                  font-semibold
                  text-gray-500
                "
              >
                #{order.id}
              </span>
            </div>

            <div
              className="
                mt-1
                truncate
                text-[11px]
                font-semibold
                
              "
            >
              {order.ss_party_name ||
                order.ss_user_name ||
                "-"}
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge
              value={order.status}
            />
          </div>
        </div>

        {/* AMOUNT */}

        <div className="mt-3 flex items-end justify-between">
          <div>
            <div
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-gray-500
              "
            >
              Amount
            </div>

            <div
              className="
                mt-0.5
                text-base
                font-extrabold
                
              "
            >
              ₹
              {formatAmount(
                order.total_amount
              )}
            </div>
          </div>

          <div className="text-right">
            <div
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-gray-500
              "
            >
              CRM
            </div>

            <div
              className="
                mt-0.5
                max-w-[130px]
                truncate
                text-[11px]
                font-bold
                
              "
            >
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
              
            "
          >
            {order.verified_items_count ??
              0}{" "}
            verified
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
              
            "
          >
            {order.dispatched_quantity ??
              0}{" "}
            dispatched
          </span>

          <DispatchBadge
            value={order.dispatch_status}
          />
        </div>

        {/* BOTTOM */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div className="min-w-0">
            {order.verification_status ? (
              <div className="flex min-w-0 items-center gap-2">
                <StatusBadge
                  value={
                    order.verification_status
                  }
                />

                <span
                  className="
                    truncate
                    text-[9px]
                    font-semibold
                    text-gray-500
                  "
                >
                  {order.punched
                    ? "Punched"
                    : "Not punched"}
                </span>
              </div>
            ) : (
              <span
                className="
                  text-[10px]
                  font-semibold
                  text-gray-500
                "
              >
                Not verified
              </span>
            )}
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1
              text-[9px]
              font-semibold
              text-gray-500
            "
          >
            <FaCalendarAlt className="text-[8px]" />

            {formatDate(order.created_at)}

            <FaChevronRight className="ml-1 text-[8px]" />
          </div>
        </div>
      </button>
    );
  }
);

MobileOrderCard.displayName =
  "MobileOrderCard";

/* ============================================================================
   TRACKING COMPONENT
============================================================================ */

const TrackingTimeline = memo(
  ({ data }) => {
    const tracking =
      getTrackingState(data);

    const orderDate =
      data?.created_at || null;

    const verifiedDate =
      data?.verification?.verified_at ||
      null;

    const dispatchDate =
      tracking.dispatchDate;

    const verified =
      tracking.isVerified;

    const dispatched =
      tracking.isDispatched;

    const partial =
      tracking.isPartial;

    return (
      <div
        className="
          overflow-hidden
          rounded
          border
          border-gray-400
          bg-white
        "
      >
        {/* TRACKING HEADER */}

        <div
          className="
            border-b
            border-gray-400
            bg-gray-50
            px-4
            py-4
            sm:px-5
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-extrabold
                  
                "
              >
                <FaRoute className="" />

                Order Tracking
              </div>

              <div
                className="
                  mt-1
                  text-[10px]
                  font-medium
                  text-gray-500
                "
              >
                Complete order journey
              </div>
            </div>

            <div className="shrink-0">
              <DispatchBadge
                value={
                  data?.summary
                    ?.dispatch_status
                }
              />
            </div>
          </div>
        </div>

        {/* PROGRESS */}

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {/* PROGRESS LINE */}

          <div className="relative px-2 sm:px-5">
            <div
              className="
                absolute
                left-[8%]
                right-[8%]
                top-[16px]
                h-1
                rounded-full
                bg-gray-100
              "
            />

            <div
              className="
                absolute
                left-[8%]
                top-[16px]
                h-1
                rounded-full
                bg-gray-900
                transition-all
                duration-500
              "
              style={{
                width: `calc(${Math.max(
                  0,
                  tracking.progress - 16
                )}% * 0.92)`,
              }}
            />

            <div
              className="
                relative
                grid
                grid-cols-3
                gap-2
              "
            >
              {/* STEP 1 */}

              <TrackingStep
                number="1"
                icon={<FaClipboardList />}
                title="Order Placed"
                date={orderDate}
                active
                complete
              />

              {/* STEP 2 */}

              <TrackingStep
                number="2"
                icon={<FaCheckCircle />}
                title="Verified"
                date={verifiedDate}
                active={verified}
                complete={verified}
              />

              {/* STEP 3 */}

              <TrackingStep
                number="3"
                icon={<FaTruck />}
                title={
                  partial
                    ? "Partially Dispatched"
                    : "Dispatched"
                }
                date={dispatchDate}
                active={
                  dispatched || partial
                }
                complete={dispatched}
                partial={partial}
              />
            </div>
          </div>

          {/* STATUS MESSAGE */}

          <div
            className="
              mt-5
              rounded
              border
              border-gray-500
              bg-gray-50
              px-3.5
              py-3
              sm:px-4
            "
          >
            <div className="flex items-start gap-2.5">
              <div
                className="
                  mt-0.5
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  
                  shadow-sm
                "
              >
                {dispatched ? (
                  <FaCheckCircle className="text-[11px] text-emerald-500" />
                ) : partial ? (
                  <FaTruck className="text-[11px] text-blue-500" />
                ) : verified ? (
                  <FaClock className="text-[11px] text-amber-500" />
                ) : (
                  <FaClipboardList className="text-[11px]" />
                )}
              </div>

              <div className="min-w-0">
                <div
                  className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-wide
                    text-gray-500
                  "
                >
                  Current Stage
                </div>

                <div
                  className="
                    mt-0.5
                    text-xs
                    font-bold
                    
                  "
                >
                  {dispatched
                    ? "Order fully dispatched"
                    : partial
                    ? "Order partially dispatched"
                    : verified
                    ? "Order verified and waiting for dispatch"
                    : "Order placed and waiting for verification"}
                </div>
              </div>
            </div>
          </div>

          {/* THREE DATE CARDS */}

          <div
            className="
              mt-3
              grid
              grid-cols-1
              gap-2
              sm:grid-cols-3
            "
          >
            <TrackingDateCard
              icon={<FaClipboardList />}
              label="Order Date"
              value={orderDate}
            />

            <TrackingDateCard
              icon={<FaCheckCircle />}
              label="Verified Date"
              value={verifiedDate}
              muted={!verifiedDate}
            />

            <TrackingDateCard
              icon={<FaTruck />}
              label="Dispatch Date"
              value={dispatchDate}
              muted={!dispatchDate}
            />
          </div>
        </div>
      </div>
    );
  }
);

TrackingTimeline.displayName =
  "TrackingTimeline";

/* ============================================================================
   TRACKING STEP
============================================================================ */

const TrackingStep = memo(
  ({
    icon,
    title,
    date,
    active,
    complete,
    partial,
  }) => {
    return (
      <div className="relative flex flex-col items-center text-center">
        <div
          className={`
            relative
            z-10
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border-4
            border-white
            text-[10px]
            shadow-sm
            transition-all
            duration-300
            ${
              complete
                ? "bg-gray-900 text-white"
                : partial
                ? "bg-blue-500 text-white"
                : active
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-500"
            }
          `}
        >
          {icon}
        </div>

        <div
          className={`
            mt-2
            text-[10px]
            font-extrabold
            ${
              active
                ? ""
                : "text-gray-500"
            }
          `}
        >
          {title}
        </div>

        <div
          className="
            mt-1
            min-h-[26px]
            text-[8px]
            font-semibold
            leading-3
            text-gray-500
          "
        >
          {date
            ? formatShortDate(date)
            : "Pending"}
        </div>
      </div>
    );
  }
);

TrackingStep.displayName =
  "TrackingStep";

/* ============================================================================
   TRACKING DATE CARD
============================================================================ */

const TrackingDateCard = memo(
  ({
    icon,
    label,
    value,
    muted = false,
  }) => {
    return (
      <div
        className={`
          rounded
          border
          p-3
          ${
            muted
              ? "border-gray-500 bg-gray-50"
              : "border-gray-400 bg-white"
          }
        `}
      >
        <div
          className="
            flex
            items-center
            gap-1.5
            text-[9px]
            font-bold
            uppercase
            tracking-wide
            text-gray-500
          "
        >
          {icon}

          {label}
        </div>

        <div
          className={`
            mt-1.5
            text-[10px]
            font-bold
            ${
              muted
                ? "text-gray-300"
                : ""
            }
          `}
        >
          {value
            ? formatDate(value)
            : "Not available"}
        </div>
      </div>
    );
  }
);

TrackingDateCard.displayName =
  "TrackingDateCard";

/* ============================================================================
   DETAIL DRAWER
============================================================================ */

const OrderDetailDrawer = memo(
  ({ orderId, onClose }) => {
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
            bg-[#f7f8fa]
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
              border-gray-400
              bg-white
              px-4
              py-1
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
                  text-gray-500
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
                  
                  sm:text-lg
                "
              >
                <span className="truncate">
                  {data?.order_id ||
                    "Loading..."}
                </span>

                {isFetching &&
                  !isLoading && (
                    <FaSyncAlt
                      className="
                        shrink-0
                        animate-spin
                        text-[10px]
                        text-gray-500
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
                rounded
                bg-gray-50
                
                transition
                hover:bg-gray-100
                hover:
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

            {!isLoading &&
              !isError &&
              data && (
                <div className="p-3 sm:p-5">
                  {/* ========================================================
                      TRACKING
                  ======================================================== */}

                  <TrackingTimeline
                    data={data}
                  />

                  {/* ========================================================
                      SUMMARY
                  ======================================================== */}

                  <div
                    className="
                      mt-3
                      grid
                      grid-cols-2
                      gap-2.5
                      sm:mt-4
                      sm:grid-cols-4
                      sm:gap-3
                    "
                  >
                    {/* AMOUNT */}

                    <div
                      className="
                        rounded
                        border
                        border-gray-400
                        bg-white
                        p-3.5
                        sm:p-4
                      "
                    >
                      <div
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Amount
                      </div>

                      <div
                        className="
                          mt-1
                          text-base
                          font-extrabold
                          
                          sm:text-lg
                        "
                      >
                        ₹
                        {formatAmount(
                          data.total_amount
                        )}
                      </div>
                    </div>

                    {/* STATUS */}

                    <div
                      className="
                        rounded
                        border
                        border-gray-400
                        bg-white
                        p-3.5
                        sm:p-4
                      "
                    >
                      <div
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Status
                      </div>

                      <div className="mt-2">
                        <StatusBadge
                          value={
                            data.status
                          }
                        />
                      </div>
                    </div>

                    {/* DISPATCH */}

                    <div
                      className="
                        rounded
                        border
                        border-gray-400
                        bg-white
                        p-3.5
                        sm:p-4
                      "
                    >
                      <div
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Dispatch
                      </div>

                      <div className="mt-2">
                        <DispatchBadge
                          value={
                            data.summary
                              ?.dispatch_status
                          }
                        />
                      </div>
                    </div>

                    {/* DISPATCH QTY */}

                    <div
                      className="
                        rounded
                        border
                        border-gray-400
                        bg-white
                        p-3.5
                        sm:p-4
                      "
                    >
                      <div
                        className="
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        Dispatch Qty
                      </div>

                      <div
                        className="
                          mt-1
                          text-base
                          font-extrabold
                          
                          sm:text-lg
                        "
                      >
                        {data.summary
                          ?.dispatched_quantity ??
                          0}
                      </div>
                    </div>
                  </div>

                  {/* ========================================================
                      PEOPLE
                  ======================================================== */}

                  <div
                    className="
                      mt-3
                      grid
                      gap-3
                      sm:mt-4
                      sm:grid-cols-2
                      sm:gap-4
                    "
                  >
                    {/* SS */}

                    <div
                      className="
                        rounded
                        border
                        border-gray-400
                        bg-white
                        p-4
                      "
                    >
                      <div className="flex items-center gap-2">
                        <FaUser className="text-[10px] text-gray-500" />

                        <div
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-gray-500
                          "
                        >
                          Super Stockist
                        </div>
                      </div>

                      <div
                        className="
                          mt-2
                          text-sm
                          font-bold
                          
                        "
                      >
                        {data.ss_user
                          ?.party_name ||
                          data.ss_user?.name ||
                          "-"}
                      </div>

                      {data.ss_user?.name &&
                        data.ss_user
                          ?.party_name && (
                          <div
                            className="
                              mt-1
                              text-xs
                              
                            "
                          >
                            {data.ss_user.name}
                          </div>
                        )}

                      {data.ss_user
                        ?.mobile && (
                        <div
                          className="
                            mt-1
                            text-xs
                            
                          "
                        >
                          {data.ss_user.mobile}
                        </div>
                      )}
                    </div>

                    {/* CRM */}

                    <div
                      className="
                        rounded
                        border
                        border-gray-400
                        bg-white
                        p-4
                      "
                    >
                      <div className="flex items-center gap-2">
                        <FaUser className="text-[10px] text-gray-500" />

                        <div
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-gray-500
                          "
                        >
                          Assigned CRM
                        </div>
                      </div>

                      <div
                        className="
                          mt-2
                          text-sm
                          font-bold
                          
                        "
                      >
                        {data.crm_user
                          ?.name || "-"}
                      </div>

                      {data.crm_user
                        ?.mobile && (
                        <div
                          className="
                            mt-1
                            text-xs
                            
                          "
                        >
                          {
                            data.crm_user
                              .mobile
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ========================================================
                      VERIFICATION
                  ======================================================== */}

                  <div
                    className="
                      mt-3
                      rounded
                      border
                      border-gray-400
                      bg-white
                      p-4
                      sm:mt-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-extrabold
                        
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
                        {/* STATUS */}

                        <div>
                          <div className="text-[10px] text-gray-500">
                            Status
                          </div>

                          <div className="mt-1">
                            <StatusBadge
                              value={
                                data
                                  .verification
                                  .status
                              }
                            />
                          </div>
                        </div>

                        {/* PUNCHED */}

                        <div>
                          <div className="text-[10px] text-gray-500">
                            Punched
                          </div>

                          <div
                            className="
                              mt-1
                              text-sm
                              font-bold
                              
                            "
                          >
                            {data
                              .verification
                              .punched
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>

                        {/* VERIFIED BY */}

                        <div>
                          <div className="text-[10px] text-gray-500">
                            Verified By
                          </div>

                          <div
                            className="
                              mt-1
                              truncate
                              text-sm
                              font-bold
                              
                            "
                          >
                            {data
                              .verification
                              .crm_name ||
                              "-"}
                          </div>
                        </div>

                        {/* VERIFIED AT */}

                        <div>
                          <div className="text-[10px] text-gray-500">
                            Verified At
                          </div>

                          <div
                            className="
                              mt-1
                              text-xs
                              font-semibold
                              
                            "
                          >
                            {formatDate(
                              data
                                .verification
                                .verified_at
                            )}
                          </div>
                        </div>

                        {/* LOCATION */}

                        {data
                          .verification
                          .dispatch_location && (
                          <div className="col-span-2 sm:col-span-1">
                            <div
                              className="
                                flex
                                items-center
                                gap-1.5
                                text-[10px]
                                text-gray-500
                              "
                            >
                              <FaMapMarkerAlt className="text-[8px]" />

                              Dispatch Location
                            </div>

                            <div
                              className="
                                mt-1
                                text-sm
                                font-bold
                                
                              "
                            >
                              {
                                data
                                  .verification
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
                          text-gray-500
                        "
                      >
                        This order has not
                        been verified yet.
                      </div>
                    )}
                  </div>

                  {/* ========================================================
                      ITEMS
                  ======================================================== */}

                  <div
                    className="
                      mt-3
                      overflow-hidden
                      rounded
                      border
                      border-gray-400
                      bg-white
                      sm:mt-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-gray-400
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
                          
                        "
                      >
                        <FaBoxOpen />

                        Order Items
                      </div>

                      <div
                        className="
                          shrink-0
                          text-[10px]
                          font-semibold
                          
                        "
                      >
                        {data.items?.length ||
                          0}{" "}
                        items
                      </div>
                    </div>

                    {/* MOBILE ITEMS */}

                    <div className="divide-y divide-gray-100 sm:hidden">
                      {data.items?.length ? (
                        data.items.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                item.crm_item_id ||
                                `${item.product_id}-${index}`
                              }
                              className="p-4"
                            >
                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-3
                                "
                              >
                                <div className="min-w-0">
                                  <div
                                    className="
                                      text-sm
                                      font-bold
                                      
                                    "
                                  >
                                    {item.product_name ||
                                      "-"}
                                  </div>

                                  {item.crm_item_id && (
                                    <div
                                      className="
                                        mt-0.5
                                        text-[9px]
                                        text-gray-500
                                      "
                                    >
                                      CRM Item #
                                      {
                                        item.crm_item_id
                                      }
                                    </div>
                                  )}
                                </div>

                                {item.rejected && (
                                  <span
                                    className="
                                      shrink-0
                                      rounded-full
                                      bg-red-50
                                      px-2
                                      py-1
                                      text-[9px]
                                      font-bold
                                      text-red-600
                                    "
                                  >
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
                                  <div className="text-[9px] text-gray-500">
                                    Ordered
                                  </div>

                                  <div
                                    className="
                                      mt-0.5
                                      text-sm
                                      font-bold
                                      
                                    "
                                  >
                                    {item.ordered_quantity ??
                                      "-"}
                                  </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-2.5">
                                  <div className="text-[9px] text-gray-500">
                                    Verified
                                  </div>

                                  <div
                                    className="
                                      mt-0.5
                                      text-sm
                                      font-bold
                                      
                                    "
                                  >
                                    {item.verified_quantity ??
                                      "-"}
                                  </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-2.5">
                                  <div className="text-[9px] text-gray-500">
                                    Dispatch
                                  </div>

                                  <div
                                    className="
                                      mt-0.5
                                      text-sm
                                      font-bold
                                      
                                    "
                                  >
                                    {item.dispatch_quantity ??
                                      0}
                                  </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 p-2.5">
                                  <div className="text-[9px] text-gray-500">
                                    Location
                                  </div>

                                  <div
                                    className="
                                      mt-0.5
                                      truncate
                                      text-sm
                                      font-bold
                                      
                                    "
                                  >
                                    {item.dispatch_location ||
                                      "-"}
                                  </div>
                                </div>
                              </div>

                              <div
                                className="
                                  mt-3
                                  flex
                                  items-center
                                  justify-between
                                  text-[9px]
                                  text-gray-500
                                "
                              >
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
                          )
                        )
                      ) : (
                        <div
                          className="
                            px-4
                            py-10
                            text-center
                            text-xs
                            text-gray-500
                          "
                        >
                          No items found.
                        </div>
                      )}
                    </div>

                    {/* DESKTOP ITEMS */}

                    <div className="hidden overflow-x-auto sm:block">
                      <table className="min-w-[850px] w-full text-left">
                        <thead
                          className="
                            border-b
                            border-gray-400
                            bg-white
                          "
                        >
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Product
                            </th>

                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Ordered
                            </th>

                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Verified
                            </th>

                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Rejected
                            </th>

                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Dispatch
                            </th>

                            {/* <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Location
                            </th> */}

                            <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Packed
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {data.items?.length ? (
                            data.items.map(
                              (
                                item,
                                index
                              ) => (
                                <tr
                                  key={
                                    item.crm_item_id ||
                                    `${item.product_id}-${index}`
                                  }
                                  className="
                                    border-b
                                    border-gray-500
                                    last:border-0
                                  "
                                >
                                  <td className="px-4 py-3">
                                    <div className="text-sm font-bold ">
                                      {item.product_name ||
                                        "-"}
                                    </div>

                                   
                                  </td>

                                  <td className="px-4 py-3 text-sm font-semibold ">
                                    {item.ordered_quantity ??
                                      "-"}
                                  </td>

                                  <td className="px-4 py-3 text-sm font-semibold ">
                                    {item.verified_quantity ??
                                      "-"}
                                  </td>

                                  <td className="px-4 py-3">
                                    {item.rejected ? (
                                      <span className="text-xs font-bold text-red-600">
                                        Yes
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold text-gray-500">
                                        No
                                      </span>
                                    )}
                                  </td>

                                  {/* <td className="px-4 py-3 text-sm font-bold ">
                                    {item.dispatch_quantity ??
                                      0}
                                  </td> */}

                                  <td className="px-4 py-3 text-xs font-semibold ">
                                    {item.dispatch_location ||
                                      "-"}
                                  </td>

                                  <td className="px-4 py-3 text-xs ">
                                    {formatDate(
                                      item.order_packed_time
                                    )}
                                  </td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="
                                  px-4
                                  py-10
                                  text-center
                                  text-xs
                                  text-gray-500
                                "
                              >
                                No items found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ========================================================
                      NOTES
                  ======================================================== */}

                  {(data.note ||
                    data.notes) && (
                    <div
                      className="
                        mt-3
                        rounded
                        border
                        border-gray-400
                        bg-white
                        p-4
                        sm:mt-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-gray-500
                        "
                      >
                        <FaFileAlt />

                        Notes
                      </div>

                      <div
                        className="
                          mt-2
                          whitespace-pre-wrap
                          text-sm
                          leading-6
                          
                        "
                      >
                        {data.note ||
                          data.notes}
                      </div>
                    </div>
                  )}

                  {/* CREATED */}

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      text-[10px]
                      text-gray-500
                    "
                  >
                    <span>
                      Order #{data.order_id}
                    </span>

                    <span>
                      Created{" "}
                      {formatDate(
                        data.created_at
                      )}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
);

OrderDetailDrawer.displayName =
  "OrderDetailDrawer";

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
            setStatus(
              event.target.value
            );
          }}
          className="
            h-10
            w-full
            rounded
            border
            border-gray-400
            bg-white
            px-3
            text-xs
            font-semibold
            
            outline-none
            transition
            focus:border-gray-400
          "
        >
          <option value="">
            All Status
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="APPROVED">
            Approved
          </option>

          <option value="HOLD">
            Hold
          </option>

          <option value="REJECTED">
            Rejected
          </option>
        </select>

        {/* PUNCH */}

        <select
          value={
            punched === ""
              ? ""
              : String(punched)
          }
          onChange={(event) => {
            const value =
              event.target.value;

            setPunched(
              value === ""
                ? ""
                : value === "true"
            );
          }}
          className="
            h-10
            w-full
            rounded
            border
            border-gray-400
            bg-white
            px-3
            text-xs
            font-semibold
            
            outline-none
            transition
            focus:border-gray-400
          "
        >
          <option value="">
            Punch: All
          </option>

          <option value="true">
            Punched
          </option>

          <option value="false">
            Not Punched
          </option>
        </select>

        {/* DISPATCH */}

        <select
          value={dispatch}
          onChange={(event) => {
            setDispatch(
              event.target.value
            );
          }}
          className="
            h-10
            w-full
            rounded
            border
            border-gray-400
            bg-white
            px-3
            text-xs
            font-semibold
            
            outline-none
            transition
            focus:border-gray-400
          "
        >
          <option value="">
            Dispatch: All
          </option>

          <option value="PENDING">
            Pending
          </option>

          <option value="PARTIAL">
            Partial
          </option>

          <option value="DISPATCHED">
            Dispatched
          </option>

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
              text-gray-500
            "
          />

          <input
            type="date"
            value={fromDate}
            onChange={(event) => {
              setFromDate(
                event.target.value
              );
            }}
            className="
              h-10
              w-full
              rounded
              border
              border-gray-400
              bg-white
              pl-8
              pr-3
              text-xs
              font-semibold
              
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
              text-gray-500
            "
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => {
              setToDate(
                event.target.value
              );
            }}
            className="
              h-10
              w-full
              rounded
              border
              border-gray-400
              bg-white
              pl-8
              pr-3
              text-xs
              font-semibold
              
              outline-none
              focus:border-gray-400
            "
          />
        </div>
      </div>
    );
  }
);

FilterPanel.displayName =
  "FilterPanel";

/* ============================================================================
   MOBILE FILTER OFFCANVAS
============================================================================ */

const MobileFilterDrawer = memo(
  ({
    open,
    onClose,
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
    activeFilters,
    clearFilters,
  }) => {
    if (!open) {
      return null;
    }

    return (
      <div
        className="
          fixed
          inset-0
          z-[90]
          lg:hidden
        "
      >
        {/* OVERLAY */}

        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className="
            absolute
            inset-0
            bg-black/30
            backdrop-blur-[1px]
          "
        />

        {/* DRAWER */}

        <div
          className="
            absolute
            right-0
            top-0
            flex
            h-full
            w-[min(88vw,380px)]
            flex-col
            bg-white
            shadow-2xl
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
              border-gray-400
              px-4
              py-4
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-extrabold
                  
                "
              >
                <FaFilter className="" />

                Filters
              </div>

              <div
                className="
                  mt-0.5
                  text-[10px]
                  text-gray-500
                "
              >
                Refine order records
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded
                bg-gray-50
                
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
              p-4
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
          </div>

          {/* FOOTER */}

          <div
            className="
              shrink-0
              border-t
              border-gray-400
              bg-white
              p-3
            "
          >
            <div className="flex gap-2">
              {activeFilters && (
                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    onClose();
                  }}
                  className="
                    flex
                    h-10
                    flex-1
                    items-center
                    justify-center
                    gap-1.5
                    rounded
                    bg-red-50
                    text-[10px]
                    font-extrabold
                    text-red-600
                  "
                >
                  <FaTimes />

                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="
                  flex
                  h-10
                  flex-1
                  items-center
                  justify-center
                  rounded
                  bg-gray-900
                  text-[10px]
                  font-extrabold
                  text-white
                "
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MobileFilterDrawer.displayName =
  "MobileFilterDrawer";

/* ============================================================================
   MAIN PAGE
============================================================================ */

export default function OrderRecordsPage() {
  /* --------------------------------------------------------------------------
     SEARCH
  -------------------------------------------------------------------------- */

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* --------------------------------------------------------------------------
     FILTERS
  -------------------------------------------------------------------------- */

  const [party, setParty] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [punched, setPunched] =
    useState("");

  const [dispatch, setDispatch] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  /* --------------------------------------------------------------------------
     PAGINATION
  -------------------------------------------------------------------------- */

  const [page, setPage] =
    useState(1);

  const pageSize = 50;

  /* --------------------------------------------------------------------------
     DETAIL
  -------------------------------------------------------------------------- */

  const [
    selectedOrderId,
    setSelectedOrderId,
  ] = useState(null);

  /* --------------------------------------------------------------------------
     MOBILE FILTER DRAWER
  -------------------------------------------------------------------------- */

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  /* ==========================================================================
     SEARCH DEBOUNCE
  ========================================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setSearch(
          searchInput.trim()
        );
      }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  /* ==========================================================================
     RESET PAGE
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
     DERIVED
  ========================================================================== */

  const orders =
    data?.results || [];

  const totalCount = Number(
    data?.count || 0
  );

  const hasPrevious =
    Boolean(data?.previous);

  const hasNext =
    Boolean(data?.next);

  /* ==========================================================================
     ACTIVE FILTERS
  ========================================================================== */

  const activeFilters =
    useMemo(() => {
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

  const handleOpenOrder =
    useCallback((id) => {
      setSelectedOrderId(id);
    }, []);

  const handleCloseOrder =
    useCallback(() => {
      setSelectedOrderId(null);
    }, []);

  const handlePrevious =
    useCallback(() => {
      setPage((current) =>
        Math.max(
          1,
          current - 1
        )
      );
    }, []);

  const handleNext =
    useCallback(() => {
      setPage((current) =>
        current + 1
      );
    }, []);

  const clearFilters =
    useCallback(() => {
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
          border-gray-400
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
                  rounded
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
                    text-gray-500
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
                    text-gray-500
                  "
                />

                <input
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(
                      event.target.value
                    );
                  }}
                  placeholder="Search order, party, CRM..."
                  className="
                    h-10
                    w-full
                    rounded
                    border
                    border-gray-400
                    bg-gray-50
                    pl-9
                    pr-9
                    text-xs
                    font-medium
                    
                    outline-none
                    transition
                    placeholder:text-gray-500
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
                      text-gray-500
                      hover:bg-gray-100
                      hover:
                    "
                  >
                    <FaTimes className="text-[10px]" />
                  </button>
                )}
              </div>

              {/* PARTY DESKTOP */}

              <input
                value={party}
                onChange={(event) => {
                  setParty(
                    event.target.value
                  );
                }}
                placeholder="Party name..."
                className="
                  hidden
                  h-10
                  w-40
                  shrink-0
                  rounded
                  border
                  border-gray-400
                  bg-gray-50
                  px-3
                  text-xs
                  font-medium
                  
                  outline-none
                  placeholder:text-gray-500
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
                setParty(
                  event.target.value
                );
              }}
              placeholder="Search party..."
              className="
                h-9
                w-full
                rounded
                border
                border-gray-400
                bg-gray-50
                px-3
                text-xs
                font-medium
                
                outline-none
                placeholder:text-gray-500
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
                      rounded
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
                  onClick={() =>
                    refetch()
                  }
                  className="
                    flex
                    h-10
                    items-center
                    gap-1.5
                    rounded
                    border
                    border-gray-400
                    bg-white
                    px-3
                    text-[10px]
                    font-extrabold
                    
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

          <div
            className="
              mt-2.5
              flex
              items-center
              gap-2
              lg:hidden
            "
          >
            <button
              type="button"
              onClick={() => {
                setMobileFiltersOpen(
                  true
                );
              }}
              className="
                flex
                h-9
                items-center
                gap-2
                rounded
                border
                border-gray-400
                bg-white
                px-3
                text-[10px]
                font-extrabold
                
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

              <FaChevronDown className="ml-1 rotate-[-90deg] text-[8px]" />
            </button>

            <div className="min-w-0 flex-1">
              {activeFilters && (
                <div
                  className="
                    truncate
                    text-[9px]
                    font-semibold
                    text-gray-500
                  "
                >
                  Filters applied
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={isFetching}
              onClick={() =>
                refetch()
              }
              className="
                flex
                h-9
                items-center
                gap-1.5
                rounded
                border
                border-gray-400
                bg-white
                px-3
                text-[10px]
                font-extrabold
                
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
        </div>
      </div>

      {/* =====================================================================
          CONTENT
      ===================================================================== */}

     
        <div
          className="
            mx-auto
            flex
            h-full
            max-h-[68vh]
            w-full
            max-w-[1800px]
            flex-col
            overflow-hidden
            rounded
            border
            border-gray-400
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
              border-gray-400
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
                  
                "
              >
                {isFetching &&
                !isLoading
                  ? "Updating..."
                  : `${totalCount.toLocaleString(
                      "en-IN"
                    )} orders found`}
              </div>

              {activeFilters &&
                !isFetching && (
                  <div
                    className="
                      mt-0.5
                      text-[9px]
                      font-medium
                      text-gray-500
                    "
                  >
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

          <div
            className="
              hidden
              min-h-0
              flex-1
              overflow-auto
              lg:block
            "
          >
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
                  border-gray-400
                  bg-gray-50
                "
              >
                <tr>
                  <th className="w-[15%]  px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="w-[21%]  px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Party
                  </th>

                  <th className="w-[10%]  px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    CRM
                  </th>

                  <th className="w-[9%]  px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>

                  <th className="w-[9%]  px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  {/* <th className="w-[10%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Verified
                  </th> */}

                  {/* <th className="w-[9%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Items
                  </th> */}

                  <th className="w-[7%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Dispatch
                  </th>

                  <th className="w-[10%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Delivery
                  </th>

                  <th className="w-[10%] px-4 py-3 text-[9px] font-extrabold uppercase tracking-wide text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <LoadingRows />
                ) : orders.length ===
                  0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  orders.map(
                    (order) => (
                      <tr
                        key={order.id}
                        onClick={() =>
                          handleOpenOrder(
                            order.id
                          )
                        }
                        className="
                          cursor-pointer
                          border-b
                          border-gray-500
                          transition
                          hover:bg-gray-50
                        "
                      >
                        {/* ORDER */}

                        <td className="px-4 py-1">
                          <div
                            className="
                              text-[12px]
                              font-extrabold
                              
                            "
                          >
                            {order.order_id ||
                              "-"}
                          </div>

                          <div
                            className="
                              mt-0.5
                              text-[9px]
                              font-semibold
                              text-gray-500
                            "
                          >
                            #{order.id}
                          </div>
                        </td>

                        {/* PARTY */}

                        <td className="px-4 py-1">
                          <div
                            className="
                              max-w-[240px]
                              text-[12px]
                              font-extrabold
                              leading-5
                              
                            "
                          >
                            {order.ss_party_name ||
                              order.ss_user_name ||
                              "-"}
                          </div>

                         
                        </td>

                        {/* CRM */}

                        <td className="px-4 py-1">
                          <div
                            className="
                              text-[11px]
                              font-bold
                              
                            "
                          >
                            {order.crm_name ||
                              "-"}
                          </div>
                        </td>

                        {/* AMOUNT */}

                        <td className="whitespace-nowrap px-4 py-1">
                          <div
                            className="
                              text-[12px]
                              font-extrabold
                              
                            "
                          >
                            ₹
                            {formatAmount(
                              order.total_amount
                            )}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-1">
                          <StatusBadge
                            value={
                              order.status
                            }
                          />
                        </td>

                        {/* VERIFIED */}

                        {/* <td className="px-4 py-1">
                          {order.verification_status ? (
                            <div>
                              <StatusBadge
                                value={
                                  order.verification_status
                                }
                              />

                              <div
                                className="
                                  mt-1
                                  text-[9px]
                                  font-semibold
                                  text-gray-500
                                "
                              >
                                {order.punched
                                  ? "Punched"
                                  : "Not punched"}
                              </div>
                            </div>
                          ) : (
                            <span
                              className="
                                text-[10px]
                                font-semibold
                                text-gray-500
                              "
                            >
                              Not verified
                            </span>
                          )}
                        </td> */}

                        {/* ITEMS */}

                        <td className="px-4 py-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="
                                text-[12px]
                                font-extrabold
                                
                              "
                            >
                              {order.items_count ??
                                0}
                            </span>

                            <span
                              className="
                                text-[9px]
                                font-semibold
                                text-gray-500
                              "
                            >
                              /
                              {order.dispatched_items_count ??
                                0}
                            </span>
                          </div>

                          {order.verified_items_count !=
                            null && (
                            <div
                              className="
                                mt-0.5
                                text-[9px]
                                font-semibold
                                text-gray-500
                              "
                            >
                              {
                                order.verified_items_count
                              }{" "}
                              verified
                            </div>
                          )}
                        </td>

                        {/* DISPATCH QTY */}

                        {/* <td className="px-4 py-1">
                          <div
                            className="
                              text-[12px]
                              font-extrabold
                              
                            "
                          >
                            {order.dispatched_quantity ??
                              0}
                          </div>
                        </td> */}

                        {/* DELIVERY */}

                        <td className="px-4 py-1">
                          <DispatchBadge
                            value={
                              order.dispatch_status
                            }
                          />
                        </td>

                        {/* CREATED */}

                        <td className="whitespace-nowrap px-4 py-1">
                          <div
                            className="
                              text-[10px]
                              font-semibold
                              
                            "
                          >
                            {formatDate(
                              order.created_at
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================================
              MOBILE CARDS
          ================================================================= */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              lg:hidden
            "
          >
            {isLoading ? (
              <div className="space-y-2 bg-gray-50 p-2.5">
                {Array.from({
                  length: 6,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="
                        h-[175px]
                        animate-pulse
                        rounded
                        bg-white
                      "
                    />
                  )
                )}
              </div>
            ) : orders.length ===
              0 ? (
              <EmptyState />
            ) : (
              <div className="bg-gray-50">
                {orders.map(
                  (order) => (
                    <MobileOrderCard
                      key={order.id}
                      order={order}
                      onOpen={
                        handleOpenOrder
                      }
                    />
                  )
                )}
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
              border-gray-400
              bg-white
              px-4
              py-2.5
              sm:px-5
              sm:py-3
            "
          >
            <div
              className="
                text-[10px]
                font-bold
                text-gray-500
              "
            >
              Page {page}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={
                  !hasPrevious ||
                  isFetching
                }
                onClick={
                  handlePrevious
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-gray-400
                  bg-white
                  
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
                disabled={
                  !hasNext ||
                  isFetching
                }
                onClick={handleNext}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-gray-400
                  bg-white
                  
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
      

      {/* =====================================================================
          MOBILE FILTER OFFCANVAS
      ===================================================================== */}

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() =>
          setMobileFiltersOpen(false)
        }
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
        activeFilters={
          activeFilters
        }
        clearFilters={clearFilters}
      />

      {/* =====================================================================
          DETAIL DRAWER
      ===================================================================== */}

      {selectedOrderId && (
        <OrderDetailDrawer
          orderId={selectedOrderId}
          onClose={
            handleCloseOrder
          }
        />
      )}
    </div>
  );
}