import API from "../api/axios";

export const loginUser = async (mobileOrId, password) => {
  const response = await API.post("/accounts/login/", {
    mobile: mobileOrId, // ✅ match backend expectation
    password: password,
  });
  return response.data;
};
