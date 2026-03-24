import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import { useEffect, useState } from "react";

export const useVerifiedOrders = ({ q, punched, party, fromDate, toDate }) => {
  return useQuery({
    queryKey: ["verifiedOrders", q, punched, party, fromDate, toDate],
    queryFn: async () => {
      const params = {};

      if (q && q.length >= 3) params.q = q;
      if (punched !== null) params.punched = punched;
      if (party && party.length >= 2) params.party = party;

      if (fromDate && toDate) {
        params.from_date = fromDate;
        params.to_date = toDate;
      }

      const { data } = await API.get("/crm/orders-history/", { params });
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};




export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
