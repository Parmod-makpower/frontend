import API from "../../api/axios";

export const fetchOrdersByRole = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.order_id) params.append("order_id", filters.order_id);
  if (filters.party_name) params.append("party_name", filters.party_name);
  if (filters.from_date) params.append("from_date", filters.from_date);
  if (filters.to_date) params.append("to_date", filters.to_date);

  const { data } = await API.get(`/ds/by-role/?${params.toString()}`);
  return data;
};
