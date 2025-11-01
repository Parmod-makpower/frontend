import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";

// 📦 Get Paginated Orders
const getDeleteOrders = async (page = 1) => {
  const res = await API.get(`/delete/orders/?page=${page}`);
  return res.data;
};

// 🗑 Delete Single Order
const deleteOrder = async (orderId) => {
  await API.delete(`/delete/orders/${orderId}/`);
};

export const useDeleteOrders = (page) => {
  return useQuery({
    queryKey: ["deleteOrders", page],
    queryFn: () => getDeleteOrders(page),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["deleteOrders"]);
    },
  });
};
