import API from "../../api/axios";
import { useQuery, useMutation } from "@tanstack/react-query";

// 🔍 Passport lookup (5 min cache)
export const usePassportLookup = (passportNumber) => {
  return useQuery({
    queryKey: ["passport", passportNumber],
    queryFn: async () => {
      const res = await API.get(
        `/passport-lookup/?passport_number=${passportNumber}`
      );
      return res.data;
    },
    enabled: !!passportNumber,
    staleTime: 1000 * 60 * 5, // ✅ 5 minutes
    gcTime: 1000 * 60 * 5,
  });
};

// 💾 Coupon submit
export const useCouponSubmit = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await API.post("/submit-coupon/", payload);
      return res.data;
    },
  });
};
