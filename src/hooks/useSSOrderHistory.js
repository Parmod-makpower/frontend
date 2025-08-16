// useSSOrderHistory.jsx
import { useInfiniteQuery } from "@tanstack/react-query";
import API from "../api/axios";

const fetchSSOrderHistory = async ({ pageParam = 1 }) => {
  const res = await API.get(`/ss-orders/history/?page=${pageParam}`);
  return res.data;
};

export const useSSOrderHistory = () => {
  return useInfiniteQuery({
    queryKey: ["ssOrderHistory"],
    queryFn: fetchSSOrderHistory,
    getNextPageParam: (lastPage, pages) => lastPage.next_page ?? undefined,
  });
};
