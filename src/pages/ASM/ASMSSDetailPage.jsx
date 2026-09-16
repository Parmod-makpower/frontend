import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaBoxOpen,
  FaChevronRight,
  FaClock,
  FaExclamationCircle,
  FaSearch,
  FaSpinner,
  FaSyncAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import { useASMSSDetail } from "../../auth/useASM";


/* =========================================================
   HELPERS
========================================================= */

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};


const getInitial = (value) => {
  return (
    String(value || "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?"
  );
};


/* =========================================================
   ORDER STATUS
========================================================= */

const getStatus = (order) => {
  const status = String(
    order?.crm?.status ||
      order?.status ||
      ""
  ).toLowerCase();


  /* REJECTED */

  if (status.includes("reject")) {
    return {
      label: "Rejected",
      className: "bg-red-50 text-red-700",
      dot: "bg-red-500",
    };
  }


  /* HOLD */

  if (status.includes("hold")) {
    return {
      label: "On Hold",
      className: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    };
  }


  /* APPROVED / VERIFIED */

  if (
    status.includes("approved") ||
    status.includes("verified")
  ) {
    return {
      label: order?.crm?.punched
        ? "Punched"
        : "Approved",
      className: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }


  /* DISPATCH */

  if (status.includes("dispatch")) {
    return {
      label: "Dispatched",
      className: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    };
  }


  /* DEFAULT */

  return {
    label: "Pending",
    className: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
};


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ order }) {
  const status = getStatus(order);

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1.5
        text-[9px]
        font-bold
        ${status.className}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${status.dot}
        `}
      />

      {status.label}
    </span>
  );
}


/* =========================================================
   ORDER CARD
========================================================= */

function OrderCard({
  order,
  index,
  onClick,
}) {
  const crmName =
    order?.crm?.name ||
    order?.assigned_crm?.name ||
    "—";

  const dispatchLocation =
    order?.crm?.dispatch_location ||
    "—";


  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        animationDelay: `${Math.min(
          index * 35,
          280
        )}ms`,
      }}
      className="
        asm-order-card
        group
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-3.5
        text-left
        shadow-[0_2px_10px_rgba(15,23,42,0.04)]
        transition-all
        duration-200
        ease-out
        hover:-translate-y-[1px]
        hover:border-red-100
        hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]
        active:scale-[0.985]
        sm:p-4
      "
    >

      <div className="flex items-start gap-3">

        {/* =================================================
            ORDER ICON
        ================================================= */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-red-50
            text-red-600
            transition-all
            duration-200
            group-hover:bg-red-100
            group-hover:scale-[1.03]
          "
        >
          <FaBoxOpen className="text-sm" />
        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="min-w-0 flex-1">

          {/* TOP ROW */}

          <div
            className="
              flex
              items-start
              justify-between
              gap-2
            "
          >

            {/* ORDER ID + DATE */}

            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-[12px]
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  sm:text-sm
                "
              >
                {order?.order_id ||
                  `Order #${order?.id || "—"}`}
              </p>

              <p
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  truncate
                  text-[9px]
                  font-medium
                  text-slate-400
                  sm:text-[10px]
                "
              >
                <FaClock className="shrink-0 text-[8px]" />

                {formatDateTime(
                  order?.created_at
                )}
              </p>

            </div>


            {/* STATUS */}

            <StatusBadge order={order} />

          </div>


          {/* =================================================
              INFO GRID
          ================================================= */}

          <div
            className="
              mt-3
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
            "
          >

            {/* AMOUNT */}

            <div
              className="
                rounded-xl
                bg-slate-50
                px-2.5
                py-2
                transition
                duration-200
                group-hover:bg-red-50/40
              "
            >

              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Amount
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[11px]
                  font-extrabold
                  text-slate-800
                  sm:text-xs
                "
              >
                {formatMoney(
                  order?.total_amount
                )}
              </p>

            </div>


            {/* CRM */}

            <div
              className="
                rounded-xl
                bg-slate-50
                px-2.5
                py-2
              "
            >

              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                CRM
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[11px]
                  font-bold
                  text-slate-800
                  sm:text-xs
                "
              >
                {crmName}
              </p>

            </div>


            {/* DISPATCH */}

            <div
              className="
                hidden
                rounded-xl
                bg-slate-50
                px-2.5
                py-2
                sm:block
              "
            >

              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Dispatch
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[11px]
                  font-bold
                  text-slate-800
                  sm:text-xs
                "
              >
                {dispatchLocation}
              </p>

            </div>

          </div>


          {/* =================================================
              CRM / VERIFIED INFO
          ================================================= */}

          <div
            className="
              mt-2.5
              flex
              items-center
              justify-between
              gap-2
            "
          >

            {order?.crm?.verified_at ? (

              <p
                className="
                  min-w-0
                  truncate
                  text-[9px]
                  font-medium
                  text-slate-400
                "
              >
                CRM verified{" "}
                {formatDateTime(
                  order.crm.verified_at
                )}
              </p>

            ) : (

              <p
                className="
                  text-[9px]
                  font-medium
                  text-slate-400
                "
              >
                CRM not verified
              </p>

            )}


            {/* MOBILE DISPATCH */}

            {order?.crm?.dispatch_location && (
              <span
                className="
                  max-w-[42%]
                  truncate
                  text-[9px]
                  font-semibold
                  text-slate-400
                  sm:hidden
                "
              >
                {order.crm.dispatch_location}
              </span>
            )}

          </div>

        </div>


        {/* =================================================
            ARROW
        ================================================= */}

        <FaChevronRight
          className="
            mt-1
            shrink-0
            text-[10px]
            text-slate-300
            transition-all
            duration-200
            group-hover:translate-x-0.5
            group-hover:text-red-500
          "
        />

      </div>

    </button>
  );
}


/* =========================================================
   SKELETON
========================================================= */

function OrderCardSkeleton() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-100
        bg-white
        p-4
        shadow-sm
      "
    >

      <div className="flex gap-3">

        <div
          className="
            h-10
            w-10
            shrink-0
            animate-pulse
            rounded-xl
            bg-slate-100
          "
        />

        <div className="min-w-0 flex-1">

          <div className="flex justify-between gap-3">

            <div className="w-2/5 space-y-2">

              <div className="h-3 animate-pulse rounded bg-slate-100" />

              <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-100" />

            </div>

            <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />

          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">

            <div className="h-12 animate-pulse rounded-xl bg-slate-50" />

            <div className="h-12 animate-pulse rounded-xl bg-slate-50" />

            <div className="hidden h-12 animate-pulse rounded-xl bg-slate-50 sm:block" />

          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   INITIAL LOADING
========================================================= */

function LoadingState() {
  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        px-3
        pb-10
        pt-3
        sm:px-5
        sm:pt-5
      "
    >

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div
          className="
            rounded-2xl
            border
            border-slate-100
            bg-white
            p-4
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

            <div className="flex-1 space-y-2">

              <div className="h-3.5 w-28 animate-pulse rounded bg-slate-100" />

              <div className="h-2.5 w-40 animate-pulse rounded bg-slate-100" />

            </div>

          </div>

        </div>


        {/* SEARCH */}

        <div
          className="
            mt-3
            h-11
            animate-pulse
            rounded-xl
            bg-white
          "
        />


        {/* ORDERS */}

        <div className="mt-3 space-y-3">

          {[1, 2, 3, 4, 5].map((item) => (
            <OrderCardSkeleton key={item} />
          ))}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   MAIN
========================================================= */

export default function ASMSSDetailPage() {
  const navigate = useNavigate();

  const { ss_id } = useParams();

  const [search, setSearch] = useState("");

  const loadMoreRef = useRef(null);


  /* =======================================================
     DATA
  ======================================================= */

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useASMSSDetail(
    ss_id,
    true
  );


  /* =======================================================
     SS INFO
  ======================================================= */

  const ss =
    data?.pages?.[0]?.ss || null;


  /* =======================================================
     ORDERS
  ======================================================= */

  const orders = useMemo(() => {
    return (
      data?.pages?.flatMap(
        (page) =>
          Array.isArray(page?.orders)
            ? page.orders
            : []
      ) || []
    );
  }, [data]);


  /* =======================================================
     LOCAL SEARCH
     IMPORTANT:
     NO API REQUEST
  ======================================================= */

  const filteredOrders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {

      const values = [
        order?.order_id,
        order?.status,
        order?.crm?.status,
        order?.crm?.name,
        order?.assigned_crm?.name,
        order?.crm?.dispatch_location,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [orders, search]);


  /* =======================================================
     AUTO LOAD NEXT 15
  ======================================================= */

  useEffect(() => {
    const element =
      loadMoreRef.current;

    if (
      !element ||
      !hasNextPage
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {

          if (
            entries[0]?.isIntersecting &&
            !isFetchingNextPage
          ) {
            fetchNextPage();
          }

        },
        {
          rootMargin: "350px",
        }
      );

    observer.observe(element);

    return () =>
      observer.disconnect();

  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);


  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (isLoading) {
    return <LoadingState />;
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          px-4
        "
      >

        <div
          className="
            w-full
            max-w-sm
            rounded-2xl
            border
            border-red-100
            bg-white
            p-7
            text-center
            shadow-sm
          "
        >

          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-500
            "
          >
            <FaExclamationCircle />
          </div>

          <h2
            className="
              mt-4
              text-sm
              font-bold
              text-slate-900
            "
          >
            Unable to load orders
          </h2>

          <p
            className="
              mt-1
              text-[10px]
              text-slate-400
            "
          >
            Please refresh and try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-red-600
              px-5
              py-2.5
              text-xs
              font-bold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-red-700
              active:scale-95
            "
          >
            <FaSyncAlt />
            Try Again
          </button>

        </div>

      </div>
    );
  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        px-3
        pb-10
        pt-3
        sm:px-5
        sm:pt-5
      "
    >

      <div className="mx-auto max-w-5xl">


        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-[0_2px_10px_rgba(15,23,42,0.04)]
          "
        >

          <div className="flex items-center gap-3">

            {/* BACK */}

            <button
              type="button"
              onClick={() =>
                navigate("/asm")
              }
              aria-label="Back to My SS"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-slate-50
                text-slate-600
                transition-all
                duration-200
                hover:bg-slate-100
                active:scale-90
              "
            >
              <FaArrowLeft className="text-xs" />
            </button>


            {/* SS AVATAR */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-sm
                font-bold
                text-red-600
              "
            >
              {getInitial(
                ss?.party_name ||
                  ss?.name
              )}
            </div>


            {/* SS DETAILS */}

            <div className="min-w-0 flex-1">

              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-red-600
                "
              >
                SS Orders
              </p>

              <h1
                className="
                  truncate
                  text-[13px]
                  font-extrabold
                  text-slate-900
                  sm:text-base
                "
              >
                {ss?.party_name ||
                  ss?.name ||
                  "Super Stockist"}
              </h1>

              <p
                className="
                  truncate
                  text-[9px]
                  font-medium
                  text-slate-400
                  sm:text-[10px]
                "
              >
                {ss?.name &&
                  ss?.party_name &&
                  ss.name !== ss.party_name
                  ? ss.name
                  : ss?.user_id || ss_id}

                {ss?.mobile &&
                  ` • ${ss.mobile}`}
              </p>

            </div>


            {/* REFRESH */}

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh orders"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
                transition-all
                duration-200
                hover:bg-red-100
                active:scale-90
                disabled:opacity-40
              "
            >
              <FaSyncAlt
                className={
                  isFetching
                    ? "animate-spin text-[10px]"
                    : "text-[10px]"
                }
              />
            </button>

          </div>

        </header>


        {/* =================================================
            SEARCH
        ================================================= */}

        <section
          className="
            mt-3
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-3
            shadow-[0_2px_10px_rgba(15,23,42,0.04)]
          "
        >

          <div className="relative">

            <FaSearch
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[10px]
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search order ID, CRM or status..."
              autoComplete="off"
              className="
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-8
                pr-9
                text-[10px]
                font-medium
                text-slate-700
                outline-none
                placeholder:text-slate-400
                transition-all
                duration-200
                focus:border-red-300
                focus:bg-white
                focus:ring-2
                focus:ring-red-50
                sm:text-xs
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
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
                  rounded-full
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-600
                "
              >
                <FaTimes className="text-[9px]" />
              </button>
            )}

          </div>


          {/* SEARCH RESULT COUNT */}

          <div
            className="
              mt-2
              flex
              items-center
              justify-between
              px-0.5
            "
          >

            <p
              className="
                text-[9px]
                font-medium
                text-slate-400
              "
            >
              {search
                ? `${filteredOrders.length} matching loaded orders`
                : `${orders.length} orders loaded`}
            </p>

            {!search && (
              <span
                className="
                  rounded-full
                  bg-slate-50
                  px-2
                  py-0.5
                  text-[8px]
                  font-bold
                  text-slate-400
                "
              >
                Latest first
              </span>
            )}

          </div>

        </section>


        {/* =================================================
            ORDER SECTION HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            px-1
            pb-1
            pt-4
          "
        >

          <div>

            <h2
              className="
                text-xs
                font-bold
                text-slate-900
                sm:text-sm
              "
            >
              Orders
            </h2>

            <p
              className="
                mt-0.5
                text-[9px]
                text-slate-400
              "
            >
              Tap an order to track
            </p>

          </div>

          <span
            className="
              text-[9px]
              font-semibold
              text-slate-400
            "
          >
            {orders.length}
          </span>

        </div>


        {/* =================================================
            ORDER LIST
        ================================================= */}

        {filteredOrders.length === 0 ? (

          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-5
              py-12
              text-center
              shadow-sm
            "
          >

            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-slate-50
                text-slate-300
              "
            >
              <FaBoxOpen />
            </div>

            <p
              className="
                mt-3
                text-xs
                font-bold
                text-slate-500
              "
            >
              No orders found
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-slate-400
              "
            >
              {search
                ? "Try another order ID, CRM or status."
                : "This SS has no orders yet."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  mt-4
                  rounded-lg
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  text-red-600
                  transition
                  hover:bg-red-50
                "
              >
                Clear Search
              </button>
            )}

          </div>

        ) : (

          <div className="space-y-3">

            {filteredOrders.map(
              (order, index) => (
                <OrderCard
                  key={
                    order?.id ||
                    order?.order_id ||
                    index
                  }
                  order={order}
                  index={index}
                  onClick={() =>
                    navigate(
                      `/orders-tracking/${order.order_id}`
                    )
                  }
                />
              )
            )}

          </div>

        )}


        {/* =================================================
            LOAD MORE SENTINEL
        ================================================= */}

        <div
          ref={loadMoreRef}
          className="
            flex
            min-h-16
            items-center
            justify-center
          "
        >

          {isFetchingNextPage && (
            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-white
                px-4
                py-2
                text-[10px]
                font-bold
                text-red-600
                shadow-sm
              "
            >
              <FaSpinner className="animate-spin" />

              Loading more orders...
            </div>
          )}


          {!hasNextPage &&
            orders.length > 0 && (
              <p
                className="
                  text-[9px]
                  font-medium
                  text-slate-400
                "
              >
                All orders loaded
              </p>
            )}

        </div>

      </div>


      {/* =====================================================
          SMOOTH CARD ANIMATION
      ===================================================== */}

      <style>{`
        @keyframes asmOrderCardEnter {
          from {
            opacity: 0;
            transform: translateY(7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .asm-order-card {
          animation:
            asmOrderCardEnter
            0.28s
            ease-out
            both;
        }

        @media (prefers-reduced-motion: reduce) {
          .asm-order-card {
            animation: none;
          }
        }
      `}</style>

    </div>
  );
}