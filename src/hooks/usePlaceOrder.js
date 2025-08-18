import { useMutation, useQueryClient } from "@tanstack/react-query";
import API from '../api/axios';

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order) => {
      const res = await API.post("/ss-orders/create/", order);
      return res.data;
    },
    onSuccess: (newOrder) => {
      // ✅ Correct queryKey
      queryClient.invalidateQueries(["ssOrderHistory"]);

      // ✅ Optional: तुरंत दिखाने के लिए local cache update
      queryClient.setQueryData(["ssOrderHistory"], (oldData) => {
        if (!oldData?.pages) {
          return {
            pages: [
              {
                results: [newOrder],
                next: null,
              },
            ],
            pageParams: [1],
          };
        }

        // पहले page को update करो और 20 तक limit रखो
        const firstPage = oldData.pages[0];
        const updatedFirstPage = {
          ...firstPage,
          results: [newOrder, ...firstPage.results].slice(0, 20),
        };

        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
        };
      });
    },
  });
};
