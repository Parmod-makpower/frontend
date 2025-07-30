import API from "../api/axios";

export const loginUser = async (mobile_or_id, password) => {
  const response = await API.post('/accounts/login/', { mobile_or_id, password });
  return response.data;
};
