import { useQuery } from "@tanstack/react-query";
import API from "../../api/axios";

const getHROrders = async ({
  search = "",
  status = "",
  fromDate = "",
  toDate = "",
}) => {
  const params = {};

  // Search
  if (search) {
    params.search = search;
  }

  // Status
  if (status && status !== "ALL") {
    params.status = status;
  }

  // Date Filters
  if (fromDate) {
    params.from_date = fromDate;
  }

  if (toDate) {
    params.to_date = toDate;
  }

  const { data } = await API.get("/hr/orders/", {
    params,
  });

  return data;
};

export const useHROrders = ({
  search,
  status,
  fromDate,
  toDate,
}) => {
  return useQuery({
    queryKey: [
      "hr-orders",
      search,
      status,
      fromDate,
      toDate,
    ],

    queryFn: () =>
      getHROrders({
        search,
        status,
        fromDate,
        toDate,
      }),

    staleTime: 0,

    gcTime: 1000 * 60 * 60,

    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,

    keepPreviousData: true,
  });
};



