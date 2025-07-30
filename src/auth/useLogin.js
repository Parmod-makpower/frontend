import API from "../api/axios";

export const loginUser = async (mobileOrId, password) => {
  const response = await API.post('/accounts/login/', {
    mobile_or_id: mobileOrId,
    password: password,
  });
  return response.data;
};
