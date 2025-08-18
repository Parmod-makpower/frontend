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
    getNextPageParam: (lastPage) => {
      if (lastPage.next) {
        const url = new URL(lastPage.next);
        return url.searchParams.get("page");
      }
      return undefined;
    },
    select: (data) => {
      // सिर्फ first page (latest orders) की first 20 entries रखें
      if (!data?.pages) return data;

      const firstPage = data.pages[0];
      const trimmed = {
        ...firstPage,
        results: firstPage.results.slice(0, 20),
      };

      return { pages: [trimmed], pageParams: [1] };
    },
  });
};
