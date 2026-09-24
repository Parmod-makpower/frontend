// import {
//   keepPreviousData,
//   useQuery,
// } from "@tanstack/react-query";

// import API from "../api/axios";

// /* ============================================================================
//    LIST
// ============================================================================ */

// export const useOrderRecords = (filters = {}) => {
//   const {
//     q = "",
//     party = "",
//     status = "",
//     punched = null,
//     fromDate = "",
//     toDate = "",
//     page = 1,
//     pageSize = 50,
//   } = filters;

//   return useQuery({
//     queryKey: [
//       "orderRecords",
//       q,
//       party,
//       status,
//       punched,
//       fromDate,
//       toDate,
//       page,
//       pageSize,
//     ],

//     queryFn: async () => {
//       const params = {
//         page,
//         page_size: pageSize,
//       };

//       if (q?.trim()) {
//         params.q = q.trim();
//       }

//       if (party?.trim()) {
//         params.party = party.trim();
//       }

//       if (status?.trim()) {
//         params.status = status;
//       }

//       if (punched !== null && punched !== "") {
//         params.punched = punched;
//       }

//       if (fromDate) {
//         params.from_date = fromDate;
//       }

//       if (toDate) {
//         params.to_date = toDate;
//       }

//       const { data } = await API.get(
//         "/order-records/",
//         {
//           params,
//         }
//       );

//       return data;
//     },

//     placeholderData: keepPreviousData,

//     staleTime: 1000 * 30,

//     refetchOnWindowFocus: false,
//   });
// };


// /* ============================================================================
//    DETAIL
// ============================================================================ */

// export const useOrderRecordDetail = (
//   orderId,
//   options = {}
// ) => {
//   return useQuery({
//     queryKey: [
//       "orderRecordDetail",
//       orderId,
//     ],

//     queryFn: async () => {
//       const { data } = await API.get(
//         `/order-records/${encodeURIComponent(orderId)}/`
//       );

//       return data;
//     },

//     enabled: Boolean(
//       orderId
//     ),

//     staleTime: 1000 * 30,

//     refetchOnWindowFocus: false,

//     ...options,
//   });
// };


// /* ============================================================================
//    DEBOUNCE
// ============================================================================ */

// export const useDebounce = (
//   value,
//   delay = 400
// ) => {
//   const [state, setState] = React.useState(value);

//   React.useEffect(() => {
//     const timer = setTimeout(() => {
//       setState(value);
//     }, delay);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [value, delay]);

//   return state;
// };


import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

/* ============================================================================
   ORDER RECORDS LIST
============================================================================ */

export const useOrderRecords = ({
  page = 1,
  pageSize = 50,
  q = "",
  party = "",
  status = "",
  punched = "",
  dispatch = "",
  fromDate = "",
  toDate = "",
} = {}) => {
  return useQuery({
    queryKey: [
      "orderRecords",
      page,
      pageSize,
      q,
      party,
      status,
      punched,
      dispatch,
      fromDate,
      toDate,
    ],

    queryFn: async () => {
      const params = {
        page,
        page_size: pageSize,
      };

      const cleanQ = String(q || "").trim();
      const cleanParty = String(party || "").trim();

      if (cleanQ) {
        params.search  = cleanQ;
      }

      if (cleanParty) {
        params.party = cleanParty;
      }

      if (status) {
        params.status = status;
      }

      if (punched === true || punched === false) {
        params.punched = punched;
      }

      if (dispatch) {
        params.dispatch = dispatch;
      }

      if (fromDate) {
        params.from_date = fromDate;
      }

      if (toDate) {
        params.to_date = toDate;
      }

      const response = await API.get("/order-records/", {
        params,
      });

      return response.data;
    },

    /*
      React Query v5:
      Previous page remains visible while next page is loading.
      This prevents table flickering.
    */
    placeholderData: (previousData) => previousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,
  });
};


/* ============================================================================
   ORDER RECORD DETAIL
============================================================================ */

export const useOrderRecordDetail = (
  orderId,
  options = {}
) => {
  return useQuery({
    queryKey: [
      "orderRecordDetail",
      orderId,
    ],

    queryFn: async () => {
      const response = await API.get(
        `/order-records/${encodeURIComponent(orderId)}/`
      );

      return response.data;
    },

    enabled: Boolean(orderId),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,

    ...options,
  });
};


/* ============================================================================
   DEBOUNCE
============================================================================ */

export const useDebounce = (
  value,
  delay = 400
) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};