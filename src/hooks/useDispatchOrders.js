import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";

export const useDispatchOrdersList = (filters) => {
  return useQuery({
    queryKey: ["dispatchOrders", filters],
    queryFn: async () => {
      const { data } = await API.get("/dispatch-orders/", {
        params: filters,
      });
      return data;
    },
    staleTime: 1000 * 30,
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";


// 🔥 Delete ALL dispatch orders
const deleteAllDispatchOrders = async () => {
  const res = await API.delete("/dispatch-orders/delete-all/");
  return res.data;
};

export const useDeleteAllDispatchOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllDispatchOrders,

    onSuccess: () => {
      // ✅ related cache clear / refetch
      queryClient.invalidateQueries(["dispatchOrders"]);
      queryClient.invalidateQueries(["crmOrders"]);
    },
  });
};

export const deleteSelectedDispatchOrders = async (ids) => {
  const res = await API.post(
    "/dispatch-orders/delete-selected/",
    { ids }
  );
  return res.data;
};



export const downloadDispatchExcel = async () => {
  const response = await API.get(
    "/dispatch-orders/excel/download/",
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "dispatch_orders.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
};


export const uploadDispatchExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await API.post(
    "/dispatch-orders/excel/upload/",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
};
