// import { FaFilter } from "react-icons/fa";
// import PartySearchInput from "../PartySearchInput";

// export default function VerifiedOrdersFilter({
//     open,
//     setOpen,
//     filters,
//     setFilters,
//     onApply,
//     inline = false,
// }) {
//     const handleChange = (key, value) => {
//         setFilters((prev) => ({
//             ...prev,
//             [key]: value,
//         }));
//     };

//     const handleClear = () => {
//         const cleared = {
//             q: "",
//             party: "",
//             fromDate: "",
//             toDate: "",
//             punched: filters.punched, // preserve
//         };

//         setFilters(cleared);
//         onApply(cleared); // 🔥 direct apply
//     };

//     return (
//         <div
//             className={`${inline
//                 ? "bg-white border shadow p-1"
//                 : `fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-lg z-50 transform ${open ? "translate-x-0" : "translate-x-full"
//                 } transition-transform`
//                 }`}
//         >
//             {!inline && (
//                 <div className="flex justify-between items-center p-3 border-b">
//                     <h2 className="font-semibold flex items-center gap-2">
//                         Filters
//                     </h2>
//                     <button onClick={() => setOpen(false)}>✕</button>
//                 </div>
//             )}

//             <div className="p-3 space-y-3">
//                 <div className="flex items-center justify-between border-b pb-2">
//                     <h2 className="font-semibold text-sm flex items-center gap-1 ">
//                         <FaFilter /> Filters
//                     </h2>

//                 </div>
//                 {/* 🔎 Order */}
//                 <label className="text-xs">Order ID</label>
//                 <input
//                     value={filters.q}
//                     onChange={(e) => handleChange("q", e.target.value)}
//                     placeholder=" Order ID / Code"
//                     className="w-full border px-2 py-1 text-sm rounded"
//                 />


//                 {/* 🏢 Party */}
//                 <label className="text-xs">Party name</label>

//                 <PartySearchInput
//                     value={filters.party}
//                     setValue={(val) => handleChange("party", val)}
//                     onSelect={(user) => {
//                         handleChange("party", user.party_name); // 🔥 filter apply
//                     }}
//                     placeholder="Search Party"
//                 />

//                 {/* 📅 Date */}
//                 <label className="text-xs">From Date</label>
//                 <input
//                     type="date"
//                     value={filters.fromDate}
//                     onChange={(e) => handleChange("fromDate", e.target.value)}
//                     className="w-full border px-2 py-1 text-sm rounded"
//                 />

//                 <label className="text-xs">To Date</label>
//                 <input
//                     type="date"
//                     value={filters.toDate}
//                     onChange={(e) => handleChange("toDate", e.target.value)}
//                     className="w-full border px-2 py-1 text-sm rounded"
//                 />

//                 <div className="pt-4 border-t flex gap-2">
//                     <button
//                         onClick={handleClear}
//                         className="w-full bg-gray-500 text-white text-sm py-1 rounded"
//                     >
//                         Clear
//                     </button>

//                     <button
//                         onClick={() => {
//                             onApply();
//                             setOpen(false);
//                         }}
//                         className="w-full bg-red-500 text-white text-sm py-1 rounded"
//                     >
//                         Apply
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }



import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaFilter,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

/* ============================================================================
   VERIFIED ORDERS FILTER

   - Lightweight
   - No separate PartySearchInput
   - All party options supplied from parent
   - Dark text / dark borders
   - Keyboard friendly
   - Click outside closes dropdown
============================================================================ */

export default function VerifiedOrdersFilter({
  open = false,
  setOpen = () => {},
  filters = {},
  setFilters,
  onApply,
  partyOptions = [],
  inline = false,
}) {
  const [partyTerm, setPartyTerm] = useState(
    filters?.party || ""
  );

  const [partyOpen, setPartyOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] =
    useState(-1);

  const partyWrapperRef = useRef(null);
  const partyInputRef = useRef(null);

  /* ==========================================================================
     SYNC PARTY VALUE
  ========================================================================== */

  useEffect(() => {
    setPartyTerm(filters?.party || "");
  }, [filters?.party]);

  /* ==========================================================================
     NORMALIZE PARTY OPTIONS

     - Removes empty values
     - Removes duplicates
     - Trims spaces
     - Sorts alphabetically
  ========================================================================== */

  const normalizedParties = useMemo(() => {
    if (!Array.isArray(partyOptions)) {
      return [];
    }

    const unique = new Set();

    for (const value of partyOptions) {
      if (
        value === null ||
        value === undefined
      ) {
        continue;
      }

      const name = String(value).trim();

      if (name) {
        unique.add(name);
      }
    }

    return Array.from(unique).sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: "base",
      })
    );
  }, [partyOptions]);

  /* ==========================================================================
     FILTER PARTIES

     IMPORTANT:
     NO 10 ITEM LIMIT.
     All matching parties are available.
  ========================================================================== */

  const filteredParties = useMemo(() => {
    const search = partyTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return normalizedParties;
    }

    return normalizedParties.filter((party) =>
      party.toLowerCase().includes(search)
    );
  }, [normalizedParties, partyTerm]);

  /* ==========================================================================
     GENERIC FILTER CHANGE
  ========================================================================== */

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ==========================================================================
     OPEN PARTY DROPDOWN
  ========================================================================== */

  const openPartyDropdown = () => {
    setPartyOpen(true);
    setHighlightIndex(-1);
  };

  /* ==========================================================================
     PARTY CHANGE
  ========================================================================== */

  const handlePartyChange = (value) => {
    setPartyTerm(value);

    setFilters((prev) => ({
      ...prev,
      party: value,
    }));

    setHighlightIndex(-1);
    setPartyOpen(true);
  };

  /* ==========================================================================
     SELECT PARTY
  ========================================================================== */

  const selectParty = (party) => {
    if (!party) return;

    setPartyTerm(party);

    setFilters((prev) => ({
      ...prev,
      party,
    }));

    setHighlightIndex(-1);
    setPartyOpen(false);

    requestAnimationFrame(() => {
      partyInputRef.current?.focus();
    });
  };

  /* ==========================================================================
     PARTY KEYBOARD
  ========================================================================== */

  const handlePartyKeyDown = (event) => {
    const { key } = event;

    /* ------------------------------------------------------------------------
       ESC
    ------------------------------------------------------------------------ */

    if (key === "Escape") {
      event.preventDefault();

      if (partyOpen) {
        setPartyOpen(false);
        setHighlightIndex(-1);
        return;
      }

      if (!inline) {
        setOpen(false);
      }

      return;
    }

    /* ------------------------------------------------------------------------
       ARROW DOWN
    ------------------------------------------------------------------------ */

    if (key === "ArrowDown") {
      if (!filteredParties.length) {
        openPartyDropdown();
        return;
      }

      event.preventDefault();

      setPartyOpen(true);

      setHighlightIndex((current) => {
        if (current < 0) {
          return 0;
        }

        return (
          (current + 1) %
          filteredParties.length
        );
      });

      return;
    }

    /* ------------------------------------------------------------------------
       ARROW UP
    ------------------------------------------------------------------------ */

    if (key === "ArrowUp") {
      if (!filteredParties.length) {
        openPartyDropdown();
        return;
      }

      event.preventDefault();

      setPartyOpen(true);

      setHighlightIndex((current) => {
        if (current <= 0) {
          return filteredParties.length - 1;
        }

        return current - 1;
      });

      return;
    }

    /* ------------------------------------------------------------------------
       ENTER
    ------------------------------------------------------------------------ */

    if (key === "Enter") {
      event.preventDefault();

      /*
       * If dropdown is closed:
       * first Enter opens it.
       */
      if (!partyOpen) {
        openPartyDropdown();
        return;
      }

      /*
       * Highlighted option selected.
       */
      if (
        highlightIndex >= 0 &&
        filteredParties[highlightIndex]
      ) {
        selectParty(
          filteredParties[highlightIndex]
        );

        return;
      }

      /*
       * If only one matching party exists,
       * Enter selects it.
       */
      if (filteredParties.length === 1) {
        selectParty(filteredParties[0]);
        return;
      }

      /*
       * Otherwise apply typed value.
       */
      handleApply();
    }
  };

  /* ==========================================================================
     CLEAR
  ========================================================================== */

  const handleClear = () => {
    const cleared = {
      q: "",
      party: "",
      fromDate: "",
      toDate: "",
      punched: filters?.punched === true,
    };

    setPartyTerm("");
    setPartyOpen(false);
    setHighlightIndex(-1);

    setFilters(cleared);
    onApply?.(cleared);

    if (!inline) {
      setOpen(false);
    }
  };

  /* ==========================================================================
     APPLY
  ========================================================================== */

  const handleApply = () => {
    const updated = {
      ...filters,
      party: partyTerm.trim(),
    };

    setFilters(updated);
    onApply?.(updated);

    setPartyOpen(false);
    setHighlightIndex(-1);

    if (!inline) {
      setOpen(false);
    }
  };

  /* ==========================================================================
     OUTSIDE CLICK
  ========================================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        partyWrapperRef.current &&
        !partyWrapperRef.current.contains(
          event.target
        )
      ) {
        setPartyOpen(false);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* ==========================================================================
     PARTY FIELD
  ========================================================================== */

  const partyField = (
    <div
      ref={partyWrapperRef}
      className="relative w-full"
    >
      {/* SEARCH ICON */}

      <FaSearch
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          z-10
          -translate-y-1/2
          text-[11px]
          text-gray-600
        "
      />

      {/* INPUT */}

      <input
        ref={partyInputRef}
        type="text"
        value={partyTerm}
        onClick={() => {
          if (!partyOpen) {
            openPartyDropdown();
          }
        }}
        onChange={(event) =>
          handlePartyChange(
            event.target.value
          )
        }
        onKeyDown={handlePartyKeyDown}
        placeholder="Search party..."
        autoComplete="off"
        className="
          h-9
          w-full
          rounded-md
          border
          border-gray-400
          bg-white
          pl-8
          pr-9
          text-xs
          font-medium
          text-gray-900
          placeholder:text-gray-500
          outline-none
          transition
          focus:border-blue-600
          focus:ring-2
          focus:ring-blue-100
        "
      />

      {/* CHEVRON */}

      <FaChevronDown
        className={`
          pointer-events-none
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-[9px]
          text-gray-600
          transition-transform
          duration-150
          ${
            partyOpen
              ? "rotate-180"
              : "rotate-0"
          }
        `}
      />

      {/* ======================================================================
          DROPDOWN
      ====================================================================== */}

      {partyOpen && (
        <div
          className="
            absolute
            left-0
            right-0
            top-full
            z-[9999]
            mt-1
            overflow-hidden
            rounded-md
            border
            border-gray-400
            bg-white
            shadow-[0_5px_16px_rgba(0,0,0,0.14)]
          "
        >
          {/* DROPDOWN HEADER */}

          <div
            className="
              flex
              h-7
              items-center
              justify-between
              border-b
              border-gray-300
              bg-gray-50
              px-3
            "
          >
            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-gray-700
              "
            >
              Parties
            </span>

            <span
              className="
                rounded
                bg-gray-200
                px-1.5
                py-[1px]
                text-[9px]
                font-semibold
                text-gray-600
              "
            >
              {filteredParties.length}
            </span>
          </div>

          {/* PARTY LIST */}

          <div className="max-h-64 overflow-y-auto">
            {filteredParties.length > 0 ? (
              filteredParties.map(
                (party, index) => {
                  const active =
                    highlightIndex === index;

                  return (
                    <button
                      key={party}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectParty(party);
                      }}
                      className={`
                        flex
                        min-h-[34px]
                        w-full
                        cursor-pointer
                        items-center
                        border-b
                        border-gray-200
                        px-3
                        text-left
                        text-xs
                        font-medium
                        transition
                        last:border-b-0
                        ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-800 hover:bg-gray-100"
                        }
                      `}
                    >
                      <span
                        className="
                          mr-2
                          w-5
                          shrink-0
                          text-center
                          text-[9px]
                          font-bold
                          text-gray-500
                        "
                      >
                        {index + 1}
                      </span>

                      <span className="truncate">
                        {party}
                      </span>
                    </button>
                  );
                }
              )
            ) : (
              <div
                className="
                  px-3
                  py-4
                  text-center
                  text-xs
                  font-medium
                  text-gray-600
                "
              >
                No party found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* ==========================================================================
     DESKTOP FILTER
  ========================================================================== */

  const desktopFilter = (
    <div className="flex flex-wrap items-end gap-2">
      {/* ORDER */}

      <div className="min-w-[190px] flex-1">
        <label
          className="
            mb-1
            block
            text-[11px]
            font-semibold
            text-gray-800
          "
        >
          Order ID / Code
        </label>

        <div className="relative">
          <FaSearch
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[11px]
              text-gray-600
            "
          />

          <input
            type="text"
            value={filters.q || ""}
            onChange={(event) =>
              handleChange(
                "q",
                event.target.value
              )
            }
            placeholder="Search order..."
            className="
              h-9
              w-full
              rounded-md
              border
              border-gray-400
              bg-white
              pl-8
              pr-3
              text-xs
              font-medium
              text-gray-900
              placeholder:text-gray-500
              outline-none
              transition
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
          />
        </div>
      </div>

      {/* PARTY */}

      <div className="min-w-[210px] flex-1">
        <label
          className="
            mb-1
            block
            text-[11px]
            font-semibold
            text-gray-800
          "
        >
          Party
        </label>

        {partyField}
      </div>

      {/* FROM */}

      <div className="w-[135px]">
        <label
          className="
            mb-1
            block
            text-[11px]
            font-semibold
            text-gray-800
          "
        >
          From
        </label>

        <div className="relative">
          <FaCalendarAlt
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[10px]
              text-gray-600
            "
          />

          <input
            type="date"
            value={filters.fromDate || ""}
            onChange={(event) =>
              handleChange(
                "fromDate",
                event.target.value
              )
            }
            className="
              h-9
              w-full
              rounded-md
              border
              border-gray-400
              bg-white
              pl-8
              pr-2
              text-xs
              font-medium
              text-gray-900
              outline-none
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
          />
        </div>
      </div>

      {/* TO */}

      <div className="w-[135px]">
        <label
          className="
            mb-1
            block
            text-[11px]
            font-semibold
            text-gray-800
          "
        >
          To
        </label>

        <div className="relative">
          <FaCalendarAlt
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[10px]
              text-gray-600
            "
          />

          <input
            type="date"
            value={filters.toDate || ""}
            onChange={(event) =>
              handleChange(
                "toDate",
                event.target.value
              )
            }
            className="
              h-9
              w-full
              rounded-md
              border
              border-gray-400
              bg-white
              pl-8
              pr-2
              text-xs
              font-medium
              text-gray-900
              outline-none
              focus:border-blue-600
              focus:ring-2
              focus:ring-blue-100
            "
          />
        </div>
      </div>

      {/* CLEAR */}

      <button
        type="button"
        onClick={handleClear}
        className="
          inline-flex
          h-9
          cursor-pointer
          items-center
          justify-center
          gap-1.5
          rounded-md
          border
          border-gray-400
          bg-white
          px-3
          text-xs
          font-semibold
          text-gray-800
          transition
          hover:bg-gray-100
          active:scale-[0.98]
        "
      >
        <FaTimes className="text-[10px]" />
        Clear
      </button>

      {/* APPLY */}

      <button
        type="button"
        onClick={handleApply}
        className="
          inline-flex
          h-9
          cursor-pointer
          items-center
          justify-center
          gap-1.5
          rounded-md
          bg-blue-600
          px-4
          text-xs
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-blue-700
          active:scale-[0.98]
        "
      >
        <FaCheck className="text-[10px]" />
        Apply
      </button>
    </div>
  );

  /* ==========================================================================
     INLINE DESKTOP
  ========================================================================== */

  if (inline) {
    return (
      <div className="w-full">
        {desktopFilter}
      </div>
    );
  }

  /* ==========================================================================
     MOBILE DRAWER
  ========================================================================== */

  return (
    <>
      {/* OVERLAY */}

      {open && (
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-[60]
            cursor-pointer
            bg-black/30
            md:hidden
          "
        />
      )}

      {/* DRAWER */}

      <aside
        className={`
          fixed
          right-0
          top-0
          z-[70]
          flex
          h-full
          w-[88%]
          max-w-[380px]
          flex-col
          border-l
          border-gray-300
          bg-white
          shadow-2xl
          transition-transform
          duration-200
          md:hidden
          ${
            open
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* HEADER */}

        <div
          className="
            flex
            h-14
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-300
            px-4
          "
        >
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-blue-50
                text-blue-600
              "
            >
              <FaFilter className="text-xs" />
            </span>

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Filters
              </h2>

              <p className="text-[10px] font-medium text-gray-500">
                Search verified orders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              flex
              h-8
              w-8
              cursor-pointer
              items-center
              justify-center
              rounded-full
              text-gray-700
              transition
              hover:bg-gray-100
            "
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* ORDER */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-gray-800
                "
              >
                Order ID / Code
              </label>

              <div className="relative">
                <FaSearch
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    text-gray-600
                  "
                />

                <input
                  type="text"
                  value={filters.q || ""}
                  onChange={(event) =>
                    handleChange(
                      "q",
                      event.target.value
                    )
                  }
                  placeholder="Search order..."
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-gray-400
                    bg-white
                    pl-9
                    pr-3
                    text-sm
                    font-medium
                    text-gray-900
                    placeholder:text-gray-500
                    outline-none
                    focus:border-blue-600
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </div>

            {/* PARTY */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-gray-800
                "
              >
                Party
              </label>

              {partyField}
            </div>

            {/* FROM */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-gray-800
                "
              >
                From Date
              </label>

              <div className="relative">
                <FaCalendarAlt
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    text-gray-600
                  "
                />

                <input
                  type="date"
                  value={filters.fromDate || ""}
                  onChange={(event) =>
                    handleChange(
                      "fromDate",
                      event.target.value
                    )
                  }
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-gray-400
                    bg-white
                    pl-9
                    pr-3
                    text-sm
                    font-medium
                    text-gray-900
                    outline-none
                    focus:border-blue-600
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </div>

            {/* TO */}

            <div>
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-gray-800
                "
              >
                To Date
              </label>

              <div className="relative">
                <FaCalendarAlt
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    text-gray-600
                  "
                />

                <input
                  type="date"
                  value={filters.toDate || ""}
                  onChange={(event) =>
                    handleChange(
                      "toDate",
                      event.target.value
                    )
                  }
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-gray-400
                    bg-white
                    pl-9
                    pr-3
                    text-sm
                    font-medium
                    text-gray-900
                    outline-none
                    focus:border-blue-600
                    focus:ring-2
                    focus:ring-blue-100
                  "
                />
              </div>
            </div>

            {/* PUNCHED */}

            <div
              className="
                rounded-lg
                border
                border-gray-300
                bg-gray-50
                px-3
                py-2.5
              "
            >
              <div className="flex items-center gap-2">
                <span
                  className={`
                    h-2
                    w-2
                    rounded-full
                    ${
                      filters.punched
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }
                  `}
                />

                <span className="text-xs font-medium text-gray-800">
                  {filters.punched
                    ? "Showing punched orders"
                    : "Showing all punched status"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            shrink-0
            gap-2
            border-t
            border-gray-300
            bg-white
            p-3
          "
        >
          <button
            type="button"
            onClick={handleClear}
            className="
              flex
              h-10
              flex-1
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-gray-400
              bg-white
              text-xs
              font-semibold
              text-gray-800
              transition
              hover:bg-gray-100
            "
          >
            <FaTimes className="text-[10px]" />
            Clear
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="
              flex
              h-10
              flex-1
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <FaCheck className="text-[10px]" />
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}