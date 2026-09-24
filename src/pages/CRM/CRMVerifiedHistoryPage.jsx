// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDebounce, useVerifiedOrders } from "../../hooks/useVerifiedOrders";
// import CustomLoader from "../../components/CustomLoader";
// import VerifiedOrdersFilter from "../../components/AfterVerified/VerifiedOrdersFilter";
// import { FaCheckCircle, FaClock, FaFilter } from "react-icons/fa";
// import BackButton from "../../Layout/BackButton";


// export default function CRMVerifiedHistoryPage() {
//   const navigate = useNavigate();

//   const [drawerOpen, setDrawerOpen] = useState(false);

//   // ✅ SINGLE SOURCE OF TRUTH
//   const STORAGE_KEY = "verified_orders_filters";

//   // ✅ INIT from localStorage
//   const [filters, setFilters] = useState(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     return saved
//       ? JSON.parse(saved)
//       : {
//         q: "",
//         party: "",
//         fromDate: "",
//         toDate: "",
//         punched: false,
//       };
//   });

//   // 🔥 API ke liye separate state
//   const [appliedFilters, setAppliedFilters] = useState(filters);

//   const debouncedQ = useDebounce(appliedFilters.q, 500);
//   const finalQ = debouncedQ.length >= 3 ? debouncedQ : "";

//   const { data, isLoading, isError, isFetching } =
//     useVerifiedOrders({
//       ...appliedFilters,
//       q: finalQ,
//     });

//   const results = data || [];

//   const handleApply = (customFilters) => {
//     const finalFilters = customFilters || filters;

//     setAppliedFilters(finalFilters);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(finalFilters));
//   };

//   const crmMapping = {
//     "Ankita Dhingra": "AD-AP",
//     "Prince Gupta": "PG-AP",
//     "Ajit Mishra": "AM-AP",
//     "Harish Sharma": "HS-AP",
//     "Simran Khanna": "SK-AP",
//     "Rahul Kumar": "RK-AP",
//     "Vivek Sharma": "VS-AP",
//     "Aarti Singh": "AS-AP",
//     "Kanak Maurya": "KM-AP",
//   };

//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
//   }, [filters]);

//   if (isLoading) {
//     return <CustomLoader fullScreen text="Loading orders..." />;
//   }

//   return (
//     <div>
//         {/* ✅ DESKTOP HEADER */}
//     <div className="hidden sm:flex items-center gap-3 mb-3">
//       <BackButton fallback="/" />

//       <h2 className="text-sm font-semibold text-gray-700">
//         Orders ({results.length})
//       </h2>
//     </div>

//       {/* ✅ MOBILE HEADER */}
//       <div className="fixed sm:hidden top-0 left-0 right-0 z-50 bg-white p-3 border-b shadow flex justify-between">
//         <h2 className="text-sm font-semibold">
//           Orders ({results.length})
//         </h2>

//         <button
//           onClick={() => setDrawerOpen(true)}
//           className="flex items-center gap-2 text-blue-600"
//         >
//           <FaFilter /> Filter
//         </button>
//       </div>

//       <div className="grid grid-cols-12 gap-4 pt-[60px] sm:pt-0">

//         {/* ✅ TABLE */}
//         <div className="col-span-12 md:col-span-10">
//           <div className="h-[75vh] overflow-y-auto">
//             <table className="w-full border-t text-xs text-center">
//               <thead className="bg-gray-200 sticky top-0">
//                 <tr>
//                   <th className="border-b border-x border-gray-400 p-2">#</th>
//                   <th className="border-b border-x border-gray-400 p-2">Order ID</th>
//                   <th className="border-b border-x border-gray-400 p-2">Code</th>
//                   <th className="border-b border-x border-gray-400 p-2">Party</th>
//                   <th className="border-b border-x border-gray-400 p-2">CRM</th>
//                   <th className="border-b border-x border-gray-400 p-2">Order</th>
//                   <th className="border-b border-x border-gray-400 p-2">Verified</th>
//                   <th className="border-b border-x border-gray-400 p-2">
//                     <label className="flex items-center justify-center gap-1 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={filters.punched === true}
//                         onChange={(e) => {
//                           const updated = {
//                             ...filters,
//                             punched: e.target.checked ? true : false,
//                           };

//                           setFilters(updated);
//                           setAppliedFilters(updated); // 🔥 instant API call
//                         }}
//                       />
//                     </label>
//                   </th>
//                   <th className="border-b border-x border-gray-400 p-2">Track</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {isFetching ? (
//                   <tr>
//                     <td colSpan={7}>
//                       <CustomLoader text="Searching..." />
//                     </td>
//                   </tr>
//                 ) : results.length === 0 ? (
//                   <tr>
//                     <td colSpan={7} className="p-4 text-gray-500">
//                       No orders found
//                     </td>
//                   </tr>
//                 ) : (
//                   results.map((row, i) => {
//                     const orderCode = crmMapping[row.crm_name]
//                       ? `${crmMapping[row.crm_name]}${row.id}`
//                       : `${row.crm_name}-${row.id}`;

//                     return (
//                       <tr
//                         key={row.id}
//                         onClick={() =>
//                           navigate(`/order/${row.id}/details`)
//                         }
//                         className={`cursor-pointer`}
//                       >
//                         <td className="border-b border-x border-gray-400 p-2">{i + 1}</td>
//                         <td className="border-b border-x border-gray-400 p-2">{row.order_id}</td>
//                         <td className="border-b border-x border-gray-400 p-2 font-semibold">
//                           {orderCode}
//                         </td>
//                         <td className="border-b border-x border-gray-400 p-2">
//                           {row.ss_party_name}
//                         </td>
//                         <td className="border-b border-x border-gray-400 p-2">{row.crm_name}</td>

//                         <td className="border-b border-x border-gray-400 p-2 text-xs">
//                           {new Date(
//                             row.ss_order_created_at
//                           ).toLocaleString("en-IN")}
//                         </td>

//                         <td className="border-b border-x border-gray-400 p-2 text-xs">
//                           {new Date(row.verified_at).toLocaleString(
//                             "en-IN"
//                           )}
//                         </td>


//                         <td className="border-b border-x border-gray-400 p-2 text-center">
//                           {row.punched ? (
//                             <span className="inline-flex items-center gap-1 px-2 py-[2px] text-xs rounded-full bg-green-50 text-green-600">
//                               <FaCheckCircle className="text-xs" />
//                               Punched
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1 px-2 py-[2px] text-xs rounded-full bg-gray-100 text-gray-500">
//                               <FaClock className="text-xs" />
//                               Pending
//                             </span>
//                           )}
//                         </td>
//                         <td
//                           className="border-b border-x border-gray-400 p-2 text-blue-600 underline"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             navigate(
//                               `/orders-tracking/${row.order_id}`
//                             );
//                           }}
//                         >
//                           Track
//                         </td>

//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* ✅ DESKTOP FILTER */}
//         <div className="hidden md:block col-span-2">
//           <VerifiedOrdersFilter
//             inline={true}
//             filters={filters}
//             setFilters={setFilters}
//             onApply={handleApply}
//           />

//         </div>
//       </div>

//       {/* ✅ MOBILE DRAWER */}
//       <VerifiedOrdersFilter
//         open={drawerOpen}
//         setOpen={setDrawerOpen}
//         filters={filters}
//         setFilters={setFilters}
//         onApply={handleApply}
//       />
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaExternalLinkAlt,
  FaFilter,
  FaLink,
  FaSearch,
} from "react-icons/fa";

import {
  useDebounce,
  useVerifiedOrders,
} from "../../hooks/useVerifiedOrders";

import { useCachedSSUsers } from "../../auth/useSS";

import CustomLoader from "../../components/CustomLoader";
import VerifiedOrdersFilter from "../../components/AfterVerified/VerifiedOrdersFilter";

/* ============================================================================
   CONSTANTS
============================================================================ */

const STORAGE_KEY = "verified_orders_filters";

const DEFAULT_FILTERS = {
  q: "",
  party: "",
  fromDate: "",
  toDate: "",
  punched: false,
};

/* ============================================================================
   CRM MAPPING
============================================================================ */

const CRM_MAPPING = {
  "Ankita Dhingra": "AD-AP",
  "Prince Gupta": "PG-AP",
  "Ajit Mishra": "AM-AP",
  "Harish Sharma": "HS-AP",
  "Simran Khanna": "SK-AP",
  "Rahul Kumar": "RK-AP",
  "Vivek Sharma": "VS-AP",
  "Aarti Singh": "AS-AP",
  "Kanak Maurya": "KM-AP",
};

/* ============================================================================
   DATE FORMAT
============================================================================ */

const formatDateTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* ============================================================================
   STORED FILTERS
============================================================================ */

const getStoredFilters = () => {
  try {
    const saved = localStorage.getItem(
      STORAGE_KEY
    );

    if (!saved) {
      return {
        ...DEFAULT_FILTERS,
      };
    }

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_FILTERS,
      ...parsed,
    };
  } catch {
    return {
      ...DEFAULT_FILTERS,
    };
  }
};

/* ============================================================================
   PAGE
============================================================================ */

export default function CRMVerifiedHistoryPage() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  /* ==========================================================================
     FILTER STATE
  ========================================================================== */

  const [filters, setFilters] = useState(
    getStoredFilters
  );

  const [appliedFilters, setAppliedFilters] =
    useState(getStoredFilters);

  /* ==========================================================================
     ALL SS USERS / PARTIES

     IMPORTANT:
     This replaces results-based partyOptions.

     Old PartySearchInput was effectively working from all SS users,
     so party dropdown now gets the same full source again.
  ========================================================================== */

  const { data: ssUsers = [] } =
    useCachedSSUsers();

  /* ==========================================================================
     ALL PARTY NAMES
  ========================================================================== */

  const partyOptions = useMemo(() => {
    const unique = new Set();

    for (const user of ssUsers || []) {
      const partyName = user?.party_name;

      if (
        partyName !== null &&
        partyName !== undefined
      ) {
        const name = String(
          partyName
        ).trim();

        if (name) {
          unique.add(name);
        }
      }
    }

    return Array.from(unique).sort(
      (a, b) =>
        a.localeCompare(b, undefined, {
          sensitivity: "base",
        })
    );
  }, [ssUsers]);

  /* ==========================================================================
     DEBOUNCE SEARCH
  ========================================================================== */

  const debouncedQ = useDebounce(
    appliedFilters.q,
    500
  );

  const finalQ =
    debouncedQ.length >= 3
      ? debouncedQ
      : "";

  /* ==========================================================================
     API
  ========================================================================== */

  const {
    data,
    isLoading,
    isError,
    isFetching,
  } = useVerifiedOrders({
    ...appliedFilters,
    q: finalQ,
  });

  const results = Array.isArray(data)
    ? data
    : [];

  /* ==========================================================================
     SAVE FILTERS
  ========================================================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(filters)
      );
    } catch {
      // Ignore storage errors
    }
  }, [filters]);

  /* ==========================================================================
     APPLY FILTERS
  ========================================================================== */

  const handleApply = (customFilters) => {
    const finalFilters = {
      ...DEFAULT_FILTERS,
      ...(customFilters || filters),
    };

    setFilters(finalFilters);
    setAppliedFilters(finalFilters);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(finalFilters)
      );
    } catch {
      // Ignore storage errors
    }
  };

  /* ==========================================================================
     PUNCHED TOGGLE
  ========================================================================== */

  const handlePunchedChange = (checked) => {
    const updated = {
      ...filters,
      punched: checked,
    };

    setFilters(updated);
    setAppliedFilters(updated);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore storage errors
    }
  };

  /* ==========================================================================
     OPEN ORDER
  ========================================================================== */

  const handleOpenOrder = (event, id) => {
    event.stopPropagation();

    if (!id) return;

    navigate(`/order/${id}/details`);
  };

  /* ==========================================================================
     TRACK ORDER
  ========================================================================== */

  const handleTrackOrder = (
    event,
    orderId
  ) => {
    event.stopPropagation();

    if (!orderId) return;

    navigate(
      `/orders-tracking/${orderId}`
    );
  };

  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (isLoading) {
    return (
      <CustomLoader
        fullScreen
        text="Loading orders..."
      />
    );
  }

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="w-full min-w-0">

      {/* ======================================================================
          HEADER
      ====================================================================== */}

      <header
        className="
          sticky
          top-0
          z-30
          mb-3
          border-b
          border-gray-400
          bg-white/95
          px-2
          py-2
          backdrop-blur
          sm:px-3
        "
      >
        <div className="flex min-h-[48px] flex-wrap items-center gap-2">

          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex
              h-9
              shrink-0
              cursor-pointer
              items-center
              gap-1.5
              rounded-lg
              border
              border-gray-400
              bg-white
              px-3
              text-xs
              font-semibold
              text-gray-800
              shadow-sm
              transition
              hover:bg-gray-100
              active:scale-[0.98]
            "
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Back</span>
          </button>

          {/* TITLE */}

          <div className="mr-auto flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-sm
                  font-bold
                  text-gray-900
                  sm:text-base
                "
              >
                Verified Orders
              </h1>

              <p className="hidden text-[10px] font-medium text-gray-500 sm:block">
                Order verification history
              </p>
            </div>

            <span
              className="
                inline-flex
                h-6
                min-w-6
                items-center
                justify-center
                rounded-full
                border
                border-gray-400
                bg-gray-100
                px-2
                text-[10px]
                font-bold
                text-gray-700
              "
            >
              {results.length}
            </span>
          </div>

          {/* DESKTOP FILTER */}

          <div className="hidden w-full lg:block lg:w-auto lg:flex-1">
            <VerifiedOrdersFilter
              inline
              filters={filters}
              setFilters={setFilters}
              onApply={handleApply}
              partyOptions={partyOptions}
            />
          </div>

          {/* MOBILE FILTER BUTTON */}

          <button
            type="button"
            onClick={() =>
              setDrawerOpen(true)
            }
            className="
              inline-flex
              h-9
              shrink-0
              cursor-pointer
              items-center
              gap-1.5
              rounded-lg
              bg-blue-600
              px-3
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              active:scale-[0.98]
              lg:hidden
            "
          >
            <FaFilter className="text-[10px]" />
            Filter
          </button>
        </div>

        {/* TABLET FILTER */}

        <div className="mt-2 hidden md:block lg:hidden">
          <VerifiedOrdersFilter
            inline
            filters={filters}
            setFilters={setFilters}
            onApply={handleApply}
            partyOptions={partyOptions}
          />
        </div>
      </header>

      {/* ======================================================================
          TABLE
      ====================================================================== */}

      <section
        className="
          overflow-hidden
          rounded
          border
          border-gray-400
          bg-white
          shadow-sm
        "
      >
        {/* TABLE TOOLBAR */}

        <div
          className="
            flex
            min-h-[38px]
            items-center
            justify-between
            border-b
            border-gray-400
            bg-gray-50
            px-3
          "
        >
          <div className="flex items-center gap-2">
            <FaSearch className="text-[10px] text-gray-600" />

            <span className="text-[11px] font-semibold text-gray-700">
              Verified Orders
            </span>
          </div>

          {isFetching && (
            <span className="text-[10px] font-semibold text-blue-600">
              Searching...
            </span>
          )}
        </div>

        {/* TABLE SCROLL */}

        <div
          className="
            verified-orders-scroll
            h-[calc(94vh-190px)]
            min-h-[320px]
            max-h-[680px]
            overflow-auto
          "
        >
          <table
            className="
              w-full
              min-w-[1050px]
              table-fixed
              border-collapse
              text-center
              text-xs
            "
          >
            {/* HEADER */}

            <thead className="sticky top-0 z-20 bg-gray-100">
              <tr>
                <th className="w-[50px] border-b border-r border-gray-400 px-2 py-2.5 font-bold text-gray-700">
                  #
                </th>

                <th className="w-[110px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  Order ID
                </th>

                <th className="w-[110px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  Code
                </th>

                <th className="w-[210px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  Party
                </th>

                <th className="w-[110px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  CRM
                </th>

                <th className="w-[110px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  Order
                </th>

                <th className="w-[110px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  Verified
                </th>

                <th className="w-[110px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  <label className="flex cursor-pointer items-center justify-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={
                        filters.punched === true
                      }
                      onChange={(event) =>
                        handlePunchedChange(
                          event.target.checked
                        )
                      }
                      className="
                        h-3.5
                        w-3.5
                        cursor-pointer
                        accent-blue-600
                      "
                    />

                    <span>Punched</span>
                  </label>
                </th>

                <th className="w-[95px] border-b border-r border-gray-400 px-2 py-1 font-bold text-gray-700">
                  Open
                </th>

                <th className="w-[95px] border-b border-gray-400 px-2 py-1 font-bold text-gray-700">
                  Track
                </th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {isFetching &&
              results.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="h-40 border-b border-gray-400"
                  >
                    <CustomLoader text="Searching..." />
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={10}
                    className="
                      h-40
                      border-b
                      border-gray-400
                      px-4
                      text-center
                      text-xs
                      font-medium
                      text-red-600
                    "
                  >
                    Unable to load orders.
                    Please try again.
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="
                      h-40
                      border-
                      border-gray-400
                      px-4
                      text-center
                      text-sm
                      font-medium
                      text-gray-500
                    "
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                results.map(
                  (row, index) => {
                    const crmPrefix =
                      CRM_MAPPING[
                        row.crm_name
                      ];

                    const orderCode =
                      crmPrefix
                        ? `${crmPrefix}${row.id}`
                        : `${
                            row.crm_name ||
                            "--"
                          }-${row.id}`;

                    return (
                      <tr
                        key={row.id}
                        className="
                          group
                          bg-white
                          transition-colors
                          hover:bg-blue-50/40
                        "
                      >
                        {/* # */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                            text-gray-600
                          "
                        >
                          {index + 1}
                        </td>

                        {/* ORDER ID */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                            font-semibold
                            text-gray-800
                          "
                        >
                          <span className="block truncate">
                            {row.order_id || "--"}
                          </span>
                        </td>

                        {/* CODE */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                          "
                        >
                          <span className="font-bold text-gray-800">
                            {orderCode}
                          </span>
                        </td>

                        {/* PARTY */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                          "
                        >
                          <span
                            className="
                              block
                              truncate
                              font-semibold
                              text-gray-800
                            "
                            title={
                              row.ss_party_name ||
                              ""
                            }
                          >
                            {row.ss_party_name ||
                              "--"}
                          </span>
                        </td>

                        {/* CRM */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                          "
                        >
                          <span className="block truncate font-medium text-gray-700">
                            {row.crm_name || "--"}
                          </span>
                        </td>

                        {/* ORDER DATE */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                            text-[11px]
                            font-medium
                            text-gray-700
                          "
                        >
                          {formatDateTime(
                            row.ss_order_created_at
                          )}
                        </td>

                        {/* VERIFIED DATE */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                            text-[11px]
                            font-medium
                            text-gray-700
                          "
                        >
                          {formatDateTime(
                            row.verified_at
                          )}
                        </td>

                        {/* PUNCHED */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                          "
                        >
                          {row.punched ? (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-green-50
                                px-2
                                py-1
                                text-[10px]
                                font-bold
                                text-green-700
                              "
                            >
                              <FaCheckCircle className="text-[10px]" />
                              Punched
                            </span>
                          ) : (
                            <span
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                bg-gray-100
                                px-2
                                py-1
                                text-[10px]
                                font-semibold
                                text-gray-600
                              "
                            >
                              <FaClock className="text-[10px]" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* OPEN */}

                        <td
                          className="
                            border-b
                            border-r
                            border-gray-400
                            px-2
                            py-1
                          "
                        >
                          <button
                            type="button"
                            onClick={(event) =>
                              handleOpenOrder(
                                event,
                                row.id
                              )
                            }
                            className="
                              inline-flex
                              h-7
                              cursor-pointer
                              items-center
                              justify-center
                              gap-1.5
                              rounded-md
                              border
                              border-blue-300
                              bg-blue-50
                              px-2.5
                              text-[10px]
                              font-bold
                              text-blue-700
                              transition
                              hover:bg-blue-100
                              active:scale-[0.97]
                            "
                          >
                            <FaExternalLinkAlt className="text-[9px]" />
                            Open
                          </button>
                        </td>

                        {/* TRACK */}

                        <td
                          className="
                            border-b
                            border-gray-400
                            px-2
                            py-1
                          "
                        >
                          <button
                            type="button"
                            onClick={(event) =>
                              handleTrackOrder(
                                event,
                                row.order_id
                              )
                            }
                            className="
                              inline-flex
                              h-7
                              cursor-pointer
                              items-center
                              justify-center
                              gap-1.5
                              rounded-md
                              border
                              border-gray-400
                              bg-white
                              px-2.5
                              text-[10px]
                              font-bold
                              text-gray-700
                              transition
                              hover:bg-gray-100
                              active:scale-[0.97]
                            "
                          >
                            <FaLink className="text-[9px]" />
                            Track
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================================
          MOBILE FILTER
      ====================================================================== */}

      <VerifiedOrdersFilter
        open={drawerOpen}
        setOpen={setDrawerOpen}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApply}
        partyOptions={partyOptions}
      />

      {/* ======================================================================
          SCROLLBAR
      ====================================================================== */}

      <style>{`
        .verified-orders-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 transparent;
        }

        .verified-orders-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .verified-orders-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .verified-orders-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 999px;
        }

        .verified-orders-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}