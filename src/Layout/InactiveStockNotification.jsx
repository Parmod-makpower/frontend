import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiBell,
  FiCheck,
  FiChevronRight,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiX,
  FiZap,
} from "react-icons/fi";
import { useInactiveProducts } from "../hooks/useProducts";

/* =========================================================
   CONFIG
========================================================= */

const THRESHOLD = 100;
const POLL_TIME = 30000;

const ALERTS_KEY = "inactive_stock_notifications_v5";
const SNAPSHOT_KEY = "inactive_stock_snapshot_v5";

/* =========================================================
   HELPERS
========================================================= */

const idOf = (p) =>
  String(p?.product_id ?? p?.id ?? "");

const nameOf = (p) =>
  p?.product_name ||
  p?.name ||
  `Product ${idOf(p)}`;

const categoryOf = (p) =>
  p?.sub_category ||
  p?.category ||
  "Product";

const delhiStock = (p) => {
  const n = Number(p?.live_stock ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const mumbaiStock = (p) => {
  const n = Number(p?.mumbai_stock ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const readStore = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key, value) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const timeAgo = (time) => {
  const diff = Math.max(0, Date.now() - Number(time || 0));
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function InactiveStockNotification({
  inactiveRoute = "#",
}) {
  const navigate = useNavigate();

  const {
    data: products = [],
    isFetching,
    refetch,
  } = useInactiveProducts();

  const [alerts, setAlerts] = useState(() =>
    readStore(ALERTS_KEY, [])
  );

  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const wrapperRef = useRef(null);

  /* =======================================================
     SYNC PRODUCTS -> ALERTS
  ======================================================= */

  const syncAlerts = useCallback((list) => {
    if (!Array.isArray(list)) return;

    const previousSnapshot = readStore(
      SNAPSHOT_KEY,
      {}
    );

    const previousAlerts = readStore(
      ALERTS_KEY,
      []
    );

    const snapshot = {
      ...previousSnapshot,
    };

    const map = new Map();

    previousAlerts.forEach((item) => {
      if (item?.productId) {
        map.set(String(item.productId), item);
      }
    });

    const currentIds = new Set();

    list.forEach((product) => {
      const productId = idOf(product);

      if (!productId) return;

      currentIds.add(productId);

      /* Active product = never show */
      if (product?.is_active !== false) {
        delete snapshot[productId];
        map.delete(productId);
        return;
      }

      const delhi = delhiStock(product);
      const mumbai = mumbaiStock(product);

      /*
       * Alert only when either location individually
       * reaches 100+.
       */
      const qualifies =
        delhi >= THRESHOLD ||
        mumbai >= THRESHOLD;

      /* Below threshold = remove alert */
      if (!qualifies) {
        snapshot[productId] = {
          delhi,
          mumbai,
        };

        map.delete(productId);
        return;
      }

      const previous = snapshot[productId];

      const oldDelhi = Number(
        previous?.delhi ?? 0
      );

      const oldMumbai = Number(
        previous?.mumbai ?? 0
      );

      const existing = map.get(productId);

      const crossedDelhi =
        oldDelhi < THRESHOLD &&
        delhi >= THRESHOLD;

      const crossedMumbai =
        oldMumbai < THRESHOLD &&
        mumbai >= THRESHOLD;

      const increasedDelhi =
        delhi > oldDelhi &&
        delhi >= THRESHOLD;

      const increasedMumbai =
        mumbai > oldMumbai &&
        mumbai >= THRESHOLD;

      const stockChanged =
        crossedDelhi ||
        crossedMumbai ||
        increasedDelhi ||
        increasedMumbai;

      /* First appearance */
      if (!existing) {
        map.set(productId, {
          id: `${productId}-${Date.now()}`,
          productId,
          productName: nameOf(product),
          category: categoryOf(product),
          delhiStock: delhi,
          mumbaiStock: mumbai,
          totalStock: delhi + mumbai,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          unread: true,
        });
      } else {
        map.set(productId, {
          ...existing,
          productName: nameOf(product),
          category: categoryOf(product),
          delhiStock: delhi,
          mumbaiStock: mumbai,
          totalStock: delhi + mumbai,

          /*
           * New stock increase -> unread again.
           * Same stock -> keep current read state.
           */
          unread: stockChanged
            ? true
            : Boolean(existing.unread),

          updatedAt: stockChanged
            ? Date.now()
            : existing.updatedAt,
        });
      }

      snapshot[productId] = {
        delhi,
        mumbai,
      };
    });

    /* Remove products no longer returned */
    map.forEach((_, productId) => {
      if (!currentIds.has(productId)) {
        map.delete(productId);
        delete snapshot[productId];
      }
    });

    /*
     * Important:
     * unread first
     * read after that
     */
    const next = Array.from(map.values())
      .filter(
        (item) =>
          Number(item.delhiStock) >= THRESHOLD ||
          Number(item.mumbaiStock) >= THRESHOLD
      )
      .sort((a, b) => {
        if (a.unread !== b.unread) {
          return a.unread ? -1 : 1;
        }

        return (
          Number(b.updatedAt || b.createdAt) -
          Number(a.updatedAt || a.createdAt)
        );
      })
      .slice(0, 50);

    writeStore(SNAPSHOT_KEY, snapshot);
    writeStore(ALERTS_KEY, next);

    setAlerts(next);
  }, []);

  /* =======================================================
     INITIAL / QUERY UPDATE
  ======================================================= */

  useEffect(() => {
    syncAlerts(products);
  }, [products, syncAlerts]);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    if (typeof refetch !== "function") return;

    const timer = setInterval(() => {
      refetch();
    }, POLL_TIME);

    return () => clearInterval(timer);
  }, [refetch]);

  /* =======================================================
     CROSS TAB SYNC
  ======================================================= */

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== ALERTS_KEY) return;

      const latest = readStore(
        ALERTS_KEY,
        []
      );

      setAlerts(
        Array.isArray(latest) ? latest : []
      );
    };

    window.addEventListener(
      "storage",
      onStorage
    );

    return () =>
      window.removeEventListener(
        "storage",
        onStorage
      );
  }, []);

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    if (!open) return;

    const close = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      close
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        close
      );
  }, [open]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const unread = useMemo(
    () =>
      alerts.filter(
        (item) => item.unread
      ),
    [alerts]
  );

  const read = useMemo(
    () =>
      alerts.filter(
        (item) => !item.unread
      ),
    [alerts]
  );

  /* =======================================================
     MARK READ
  ======================================================= */

  const markRead = (productId) => {
    const next = alerts.map((item) =>
      String(item.productId) ===
      String(productId)
        ? {
            ...item,
            unread: false,
          }
        : item
    );

    /*
     * Sorting happens immediately:
     * unread -> read
     */
    next.sort((a, b) => {
      if (a.unread !== b.unread) {
        return a.unread ? -1 : 1;
      }

      return (
        Number(b.updatedAt || b.createdAt) -
        Number(a.updatedAt || a.createdAt)
      );
    });

    setAlerts(next);
    writeStore(ALERTS_KEY, next);
  };

  /* =======================================================
     MARK ALL READ
  ======================================================= */

  const markAllRead = () => {
    const next = alerts.map((item) => ({
      ...item,
      unread: false,
    }));

    next.sort(
      (a, b) =>
        Number(b.updatedAt || b.createdAt) -
        Number(a.updatedAt || a.createdAt)
    );

    setAlerts(next);
    writeStore(ALERTS_KEY, next);
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const refresh = async () => {
    if (typeof refetch !== "function") return;

    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setTimeout(
        () => setRefreshing(false),
        300
      );
    }
  };

  /* =======================================================
     OPEN PRODUCT
  ======================================================= */

  const openProduct = (productId) => {
    markRead(productId);
    setOpen(false);
    navigate(inactiveRoute);
  };

  /* =======================================================
     CARD
  ======================================================= */

  const AlertCard = ({
    item,
    index,
    readCard = false,
  }) => {
    const delhi = Number(
      item.delhiStock || 0
    );

    const mumbai = Number(
      item.mumbaiStock || 0
    );

    const delhiAlert =
      delhi >= THRESHOLD;

    const mumbaiAlert =
      mumbai >= THRESHOLD;

    return (
      <button
        type="button"
        onClick={() =>
          openProduct(item.productId)
        }
        style={{
          animationDelay: `${Math.min(
            index * 35,
            250
          )}ms`,
        }}
        className={`
          alert-card
          group
          relative
          w-full
          overflow-hidden
          rounded-[17px]
          border
          p-3
          text-left
          transition-all
          duration-200
          hover:-translate-y-[1px]
          hover:shadow-md
          ${
            readCard
              ? "border-slate-200 bg-white/80 hover:border-slate-300"
              : "border-red-200 bg-gradient-to-br from-red-50/80 via-white to-orange-50/60 hover:border-red-300"
          }
        `}
      >
        {!readCard && (
          <span className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-red-500 to-orange-400" />
        )}

        <div className="flex gap-3">
          {/* ICON */}

          <div
            className={`
              mt-0.5
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${
                readCard
                  ? "bg-slate-100 text-slate-500"
                  : "bg-red-100 text-red-600"
              }
            `}
          >
            <FiPackage size={17} />
          </div>

          <div className="min-w-0 flex-1">
            {/* TITLE */}

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-black text-slate-800">
                  {item.productName}
                </p>

                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[9px] font-semibold text-slate-400">
                    ID: {item.productId}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="text-[9px] font-semibold text-slate-400">
                    {delhiAlert
                      ? "Delhi Stock Alert"
                      : "Mumbai Stock Alert"}
                  </span>
                </div>
              </div>

              {!readCard ? (
                <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,.10)]" />
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-black uppercase text-slate-400">
                  Read
                </span>
              )}
            </div>

            {/* STOCK */}

            <div className="mt-3 grid grid-cols-2 gap-2">
              {/* DELHI */}

              <div
                className={`
                  rounded-xl
                  border
                  px-2.5
                  py-2
                  ${
                    delhiAlert
                      ? "border-blue-200 bg-blue-50/80"
                      : "border-slate-200 bg-slate-50"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-wider
                      ${
                        delhiAlert
                          ? "text-blue-600"
                          : "text-slate-400"
                      }
                    `}
                  >
                    <FiMapPin size={10} />
                    Delhi
                  </span>

                  {delhiAlert && (
                    <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[7px] font-black text-blue-700">
                      ALERT
                    </span>
                  )}
                </div>

                <p
                  className={`
                    mt-1
                    text-[17px]
                    font-black
                    leading-none
                    ${
                      delhiAlert
                        ? "text-blue-700"
                        : "text-slate-600"
                    }
                  `}
                >
                  {delhi}
                </p>

                <p className="mt-1 text-[7px] font-semibold text-slate-400">
                  live_stock
                </p>
              </div>

              {/* MUMBAI */}

              <div
                className={`
                  rounded-xl
                  border
                  px-2.5
                  py-2
                  ${
                    mumbaiAlert
                      ? "border-orange-200 bg-orange-50/80"
                      : "border-slate-200 bg-slate-50"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-wider
                      ${
                        mumbaiAlert
                          ? "text-orange-600"
                          : "text-slate-400"
                      }
                    `}
                  >
                    <FiMapPin size={10} />
                    Mumbai
                  </span>

                  {mumbaiAlert && (
                    <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[7px] font-black text-orange-700">
                      ALERT
                    </span>
                  )}
                </div>

                <p
                  className={`
                    mt-1
                    text-[17px]
                    font-black
                    leading-none
                    ${
                      mumbaiAlert
                        ? "text-orange-700"
                        : "text-slate-600"
                    }
                  `}
                >
                  {mumbai}
                </p>

                <p className="mt-1 text-[7px] font-semibold text-slate-400">
                  mumbai_stock
                </p>
              </div>
            </div>

            {/* META */}

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="rounded-md bg-red-100 px-1.5 py-1 text-[7px] font-black uppercase text-red-600">
                  Inactive
                </span>

                <span className="max-w-[90px] truncate rounded-md bg-slate-100 px-1.5 py-1 text-[7px] font-bold text-slate-500">
                  {item.category}
                </span>

                <span className="rounded-md bg-emerald-100 px-1.5 py-1 text-[7px] font-black text-emerald-700">
                  TOTAL {item.totalStock}
                </span>
              </div>

              <span className="shrink-0 text-[8px] font-semibold text-slate-400">
                {timeAgo(
                  item.updatedAt ||
                    item.createdAt
                )}
              </span>
            </div>

            {/* VIEW */}

            <div className="mt-2 flex justify-end">
              <span className="flex items-center gap-1 text-[9px] font-black text-indigo-600 transition-all group-hover:gap-1.5">
                View product
                <FiChevronRight size={11} />
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <style>{`
        @keyframes bellRing {
          0%,100% { transform: rotate(0); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-14deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(0); }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(.85);
            opacity: .7;
          }
          70% {
            transform: scale(1.55);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(7px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stock-bell {
          animation: bellRing 1.8s ease-in-out infinite;
          transform-origin: 50% 10%;
        }

        .stock-ring {
          animation: pulseRing 1.5s ease-out infinite;
        }

        .stock-dropdown {
          animation: dropdownIn 170ms cubic-bezier(.2,.8,.2,1);
        }

        .alert-card {
          animation: cardIn 220ms cubic-bezier(.2,.8,.2,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .stock-bell,
          .stock-ring,
          .stock-dropdown,
          .alert-card {
            animation: none !important;
          }
        }
      `}</style>

      <div
        ref={wrapperRef}
        className="relative z-[100]"
      >
        {/* =================================================
            BELL
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setOpen((v) => !v)
          }
          className={`
            relative
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            transition-all
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-red-200
            ${
              unread.length
                ? "border-red-200 bg-red-50 text-red-600 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }
          `}
        >
          {unread.length > 0 && (
            <span className="stock-ring pointer-events-none absolute inset-0 rounded-2xl border border-red-400/50" />
          )}

          <FiBell
            size={19}
            className={
              unread.length
                ? "stock-bell"
                : ""
            }
          />

          {unread.length > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[9px] font-black text-white shadow-lg">
              {unread.length > 99
                ? "99+"
                : unread.length}
            </span>
          )}

          {!unread.length &&
            alerts.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            )}
        </button>

        {/* =================================================
            DROPDOWN
        ================================================= */}

        {open && (
          <div
            className="
              stock-dropdown
              fixed
              right-3
              top-[68px]
              z-[999]
              w-[calc(100vw-24px)]
              max-w-[410px]
              overflow-hidden
              rounded-[22px]
              border
              border-slate-200
              bg-white/95
              shadow-[0_25px_70px_rgba(15,23,42,.20)]
              backdrop-blur-xl
              sm:absolute
              sm:right-0
              sm:top-[calc(100%+10px)]
              sm:w-[410px]
            "
          >
            {/* HEADER */}

            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-4">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-200/30 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-200">
                    <FiZap
                      size={18}
                      fill="currentColor"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-black tracking-tight text-slate-800">
                        Inactive Stock Alerts
                      </h3>

                      {unread.length > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-semibold text-slate-500">
                        Delhi / Mumbai stock ≥ 100
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={refresh}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                  >
                    <FiRefreshCw
                      size={14}
                      className={
                        refreshing ||
                        isFetching
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOpen(false)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>

              {/* SUMMARY */}

              <div className="relative mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-white px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                    {alerts.length} active alert
                    {alerts.length !== 1
                      ? "s"
                      : ""}
                  </span>

                  {unread.length > 0 && (
                    <span className="rounded-lg bg-red-100 px-2 py-1 text-[9px] font-black text-red-600">
                      {unread.length} unread
                    </span>
                  )}
                </div>

                {unread.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black text-indigo-600 transition hover:bg-white"
                  >
                    <FiCheck size={11} />
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            {/* BODY */}

            <div
              className="max-h-[500px] overflow-y-auto overscroll-contain p-2.5"
              style={{
                scrollbarWidth: "thin",
              }}
            >
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FiBell size={22} />
                  </div>

                  <p className="text-sm font-black text-slate-700">
                    All clear
                  </p>

                  <p className="mt-1 max-w-[260px] text-[10px] font-medium leading-5 text-slate-400">
                    No inactive product currently has 100+ stock in Delhi or Mumbai.
                  </p>
                </div>
              ) : (
                <>
                  {/* =========================================
                      UNREAD
                  ========================================= */}

                  {unread.length > 0 && (
                    <>
                     

                      <div className="space-y-2">
                        {unread.map(
                          (item, index) => (
                            <AlertCard
                              key={item.id}
                              item={item}
                              index={index}
                            />
                          )
                        )}
                      </div>
                    </>
                  )}

                  {/* =========================================
                      READ
                  ========================================= */}

                  {read.length > 0 && (
                    <div
                      className={
                        unread.length > 0
                          ? "mt-4"
                          : ""
                      }
                    >
                      <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <FiCheck size={11} />
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                          Read Alerts
                        </span>

                        <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[8px] font-black text-slate-500">
                          {read.length}
                        </span>
                      </div>

                      <div className="space-y-2 opacity-[0.82]">
                        {read.map(
                          (item, index) => (
                            <AlertCard
                              key={item.id}
                              item={item}
                              index={index}
                              readCard
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* FOOTER */}

            {alerts.length > 0 && (
              <div className="border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white p-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(
                      inactiveRoute
                    );
                  }}
                  className="group flex w-full items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[10px] font-black text-indigo-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-indigo-50 hover:ring-indigo-100"
                >
                  View all inactive products
                  <FiArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}