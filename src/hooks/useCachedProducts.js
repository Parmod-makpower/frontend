// 📁 src/hooks/useCachedProducts.js
import { useQuery } from "@tanstack/react-query";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const getAllProducts = async () => {
  const res = await API.get("/all-products/");
  return res.data;
};

export const useCachedProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-products"],
    queryFn: getAllProducts,

    // ✅ केवल तभी चले जब user.role === "SS"
    enabled: user?.role === "SS",

    staleTime: 1000 * 60 * 5,          // 1 मिनट तक fresh
    gcTime: 1000 * 60 * 60 * 24 ,   // 5 दिन तक cache

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    keepPreviousData: true,
  });
};
