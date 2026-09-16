import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChevronRight,
  FaExclamationCircle,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaUsers,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import {
  useASMDashboard,
} from "../../auth/useASM";


/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();


const getInitial = (value) =>
  String(value || "?")
    .trim()
    .charAt(0)
    .toUpperCase() || "?";


/* =========================================================
   SS CARD
========================================================= */

function SSCard({ ss, index, onClick }) {
  const partyName =
    ss?.party_name ||
    ss?.name ||
    "Super Stockist";

  const personName =
    ss?.name ||
    "SS User";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        animationDelay: `${Math.min(index * 35, 280)}ms`,
      }}
      className="
        asm-ss-card
        group
        w-full
        rounded-2xl
        border border-slate-200
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
      <div className="flex items-center gap-3">

        {/* =================================================
            AVATAR
        ================================================= */}

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-red-50
            text-sm
            font-bold
            text-red-600
            transition-all
            duration-200
            group-hover:bg-red-100
            group-hover:scale-[1.03]
          "
        >
          {getInitial(partyName)}
        </div>


        {/* =================================================
            USER INFO
        ================================================= */}

        <div className="min-w-0 flex-1">

          <p
            className="
              truncate
              text-[13px]
              font-bold
              leading-5
              text-slate-900
              sm:text-sm
            "
          >
            {partyName}
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-[10px]
              font-medium
              text-slate-500
              sm:text-[11px]
            "
          >
            {personName}
          </p>

          {ss?.mobile && (
            <p
              className="
                mt-0.5
                truncate
                text-[10px]
                text-slate-400
              "
            >
              {ss.mobile}
            </p>
          )}

        </div>


        {/* =================================================
            ORDERS + ARROW
        ================================================= */}

        <div className="flex shrink-0 items-center gap-2">

          <span
            className="
              hidden
              items-center
              gap-1.5
              rounded-full
              bg-red-50
              px-2.5
              py-1.5
              text-[9px]
              font-bold
              text-red-600
              transition
              duration-200
              group-hover:bg-red-100
              sm:flex
            "
          >
            <FaFileAlt className="text-[9px]" />
            Orders
          </span>

          <FaChevronRight
            className="
              text-[10px]
              text-slate-300
              transition-all
              duration-200
              group-hover:translate-x-0.5
              group-hover:text-red-500
            "
          />

        </div>

      </div>


      {/* ===================================================
          MOBILE ORDERS ACTION
      =================================================== */}

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          border-t
          border-slate-100
          pt-2.5
          sm:hidden
        "
      >
        <span
          className="
            flex
            items-center
            gap-1.5
            rounded-full
            bg-red-50
            px-2.5
            py-1.5
            text-[9px]
            font-bold
            text-red-600
          "
        >
          <FaFileAlt className="text-[9px]" />
          View Orders
        </span>

        <span className="text-[9px] font-medium text-slate-400">
          Tap to open
        </span>
      </div>

    </button>
  );
}


/* =========================================================
   SKELETON
========================================================= */

function SSCardSkeleton() {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-100
        bg-white
        p-4
        shadow-sm
      "
    >
      <div className="flex items-center gap-3">

        <div
          className="
            h-11
            w-11
            shrink-0
            animate-pulse
            rounded-full
            bg-slate-100
          "
        />

        <div className="min-w-0 flex-1 space-y-2">

          <div className="h-3.5 w-3/5 animate-pulse rounded bg-slate-100" />

          <div className="h-2.5 w-2/5 animate-pulse rounded bg-slate-100" />

          <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />

        </div>

        <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />

      </div>
    </div>
  );
}


/* =========================================================
   MAIN
========================================================= */

export default function ASMDashboard() {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useASMDashboard();

  const [search, setSearch] = useState("");


  /* =======================================================
     ASSIGNED SS
  ======================================================= */

  const ssList = Array.isArray(data?.ss_list)
    ? data.ss_list
    : [];


  /* =======================================================
     LOCAL SEARCH
     NO API CALL
  ======================================================= */

  const filteredSS = useMemo(() => {
    const q = normalize(search);

    if (!q) {
      return ssList;
    }

    return ssList.filter((ss) =>
      [
        ss?.party_name,
        ss?.name,
        ss?.user_id,
        ss?.mobile,
      ]
        .map(normalize)
        .some((value) => value.includes(q))
    );
  }, [ssList, search]);


  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    if (isFetching) return;

    try {
      await refetch();
      toast.success("Latest SS list loaded");
    } catch {
      toast.error("Refresh failed");
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-50
          px-3
          pb-8
          pt-3
          sm:px-5
          sm:pt-5
        "
      >

        <div className="mx-auto max-w-5xl">

          {/* PAGE HEADER SKELETON */}

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

              <div className="flex-1 space-y-2">

                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

                <div className="h-2.5 w-40 animate-pulse rounded bg-slate-100" />

              </div>

            </div>


            {/* SEARCH SKELETON */}

            <div className="mt-4 h-11 animate-pulse rounded-xl bg-slate-100" />

          </div>


          {/* SS SKELETONS */}

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SSCardSkeleton key={item} />
            ))}

          </div>

        </div>

      </div>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (isError || !data) {
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

          <h2 className="mt-4 text-sm font-bold text-slate-900">
            Unable to load assigned parties
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Please refresh and try again.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
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
              font-semibold
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
     MAIN UI
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        px-3
        pb-8
        pt-3
        sm:px-5
        sm:pt-5
      "
    >

      <div className="mx-auto max-w-5xl">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_2px_10px_rgba(15,23,42,0.04)]
          "
        >

          <div className="p-4 sm:p-5">

            <div className="flex items-center gap-3">

              {/* ICON */}

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
                "
              >
                <FaUsers className="text-sm" />
              </div>


              {/* TITLE */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <h1
                    className="
                      text-base
                      font-bold
                      text-slate-900
                      sm:text-lg
                    "
                  >
                    My SS
                  </h1>

                  {isFetching && (
                    <FaSyncAlt
                      className="
                        animate-spin
                        text-[10px]
                        text-red-500
                      "
                    />
                  )}

                </div>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-slate-400
                    sm:text-xs
                  "
                >
                  Your assigned SS and party users
                </p>

              </div>


              {/* COUNT + REFRESH */}

              <div className="flex items-center gap-1.5">

                <span
                  className="
                    rounded-full
                    bg-slate-100
                    px-2.5
                    py-1
                    text-[9px]
                    font-bold
                    text-slate-500
                  "
                >
                  {ssList.length}
                </span>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  aria-label="Refresh SS list"
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    transition-all
                    duration-200
                    hover:bg-red-50
                    hover:text-red-600
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

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="relative mt-4">

              <FaSearch
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[11px]
                  text-slate-400
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by party name or person name..."
                autoComplete="off"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-10
                  text-[11px]
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
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="
                    absolute
                    right-3
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
                  <FaTimes className="text-[10px]" />
                </button>
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            SECTION TITLE
        ================================================= */}

        <div className="flex items-center justify-between px-1 pb-1 pt-4">

          <div>

            <h2
              className="
                text-xs
                font-bold
                text-slate-900
                sm:text-sm
              "
            >
              Assigned Users
            </h2>

            <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">
              Select a party to view orders
            </p>

          </div>

          <span
            className="
              text-[9px]
              font-semibold
              text-slate-400
            "
          >
            {filteredSS.length} shown
          </span>

        </div>


        {/* =================================================
            SS LIST
        ================================================= */}

        {filteredSS.length === 0 ? (

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
              <FaUsers />
            </div>

            <p
              className="
                mt-3
                text-xs
                font-semibold
                text-slate-500
              "
            >
              {search
                ? "No matching party found"
                : "No party assigned"}
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-slate-400
              "
            >
              {search
                ? "Try a different party or person name."
                : "No active SS is currently assigned to you."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
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

          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >

            {filteredSS.map((ss, index) => (

              <SSCard
                key={
                  ss?.ss_id ||
                  ss?.user_id ||
                  ss?.assignment_id
                }
                ss={ss}
                index={index}
                onClick={() =>
                  navigate(
                    `/asm/ss/${ss?.ss_id}`
                  )
                }
              />

            ))}

          </div>

        )}

      </div>


      {/* =====================================================
          CARD ENTRY ANIMATION
      ===================================================== */}

      <style>{`
        @keyframes asmCardEnter {
          from {
            opacity: 0;
            transform: translateY(7px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .asm-ss-card {
          animation: asmCardEnter 0.28s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .asm-ss-card {
            animation: none;
          }
        }
      `}</style>

    </div>
  );
}