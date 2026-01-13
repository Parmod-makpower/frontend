import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import { useEffect, useState } from "react";

export const useVerifiedOrders = ({ q, punched }) => {
  return useQuery({
    queryKey: ["verifiedOrders", q, punched],
    queryFn: async () => {
      const params = {};

      if (q && q.length >= 3) params.q = q;

      if (punched !== null) params.punched = punched;

      const { data } = await API.get("/crm/verified/", { params });
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
