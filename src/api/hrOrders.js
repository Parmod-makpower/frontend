import API from "./axios";

export const updateOrderRemarks = async (id, notes) => {
  const { data } = await API.patch(
    `/hr/orders/${id}/notes/`,
    {
      notes,
    }
  );

  return data;
};