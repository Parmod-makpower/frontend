// import API from "../api/axios";
// import { useQuery } from "@tanstack/react-query";

// // ✅ API call function
// const getSSUsers = async () => {
//   const res = await API.get("/accounts/ss-users/");
//   return res.data;
// };

// // ✅ Custom hook with caching
// export const useCachedSSUsers = () => {
//   return useQuery({
//     queryKey: ["ss-users"],      // unique key for cache
//     queryFn: getSSUsers,

//     staleTime: 1000 * 60 * 60 * 3,   
//     gcTime: 1000 * 60 * 60 * 24, 

//     refetchInterval: false,
//     refetchOnWindowFocus: true,
//     refetchOnReconnect: true,

//     keepPreviousData: true,
//   });
// };

// export const createSSUser = async (data) => {
//   const res = await API.post("/accounts/ss-users/", data);
//   return res.data;
// };

// export const updateSSUser = async (id, data) => {
//   const res = await API.put(`/accounts/ss-users/${id}/`, data);
//   return res.data;
// };

// export const updateStockLocation = async (id, stock_location) => {
//   const res = await API.patch(`/accounts/ss-users/${id}/`, {
//     stock_location,
//   });
//   return res.data;
// };


// export const toggleSSStatus = async (id, is_active) => {
//   const res = await API.patch(`/accounts/ss-users/${id}/`, { is_active });
//   return res.data;
// };


import API from "../api/axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

/* =========================================================
   GET ALL SS USERS
   ========================================================= */

const getSSUsers = async () => {
  const res = await API.get("/accounts/ss-users/");
  return res.data;
};

export const useCachedSSUsers = () => {
  return useQuery({
    queryKey: ["ss-users"],
    queryFn: getSSUsers,

    // SS list frequently change nahi hoti
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
    gcTime: 1000 * 60 * 60 * 24,   // 24 hours

    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    // React Query v5 compatible
    placeholderData: (previousData) => previousData,

    retry: 1,
  });
};


/* =========================================================
   CREATE SS USER
   Existing function preserved
   ========================================================= */

export const createSSUser = async (data) => {
  const res = await API.post("/accounts/ss-users/", data);
  return res.data;
};


/* =========================================================
   UPDATE SS USER
   Existing function preserved
   ========================================================= */

export const updateSSUser = async (id, data) => {
  const res = await API.put(`/accounts/ss-users/${id}/`, data);
  return res.data;
};


/* =========================================================
   UPDATE STOCK LOCATION
   ========================================================= */

export const updateStockLocation = async (
  id,
  stock_location
) => {
  const res = await API.patch(
    `/accounts/ss-users/${id}/`,
    {
      stock_location,
    }
  );

  return res.data;
};


/* =========================================================
   TOGGLE SS ACTIVE / INACTIVE
   ========================================================= */

export const toggleSSStatus = async (
  id,
  is_active
) => {
  const res = await API.patch(
    `/accounts/ss-users/${id}/`,
    {
      is_active,
    }
  );

  return res.data;
};


/* =========================================================
   REACT QUERY MUTATION HOOKS
   Optional helpers for future/current pages
   ========================================================= */

export const useCreateSSUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSSUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ss-users"],
      });
    },
  });
};


export const useUpdateSSUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      updateSSUser(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ss-users"],
      });
    },
  });
};


export const useUpdateStockLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stock_location }) =>
      updateStockLocation(id, stock_location),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ss-users"],
      });
    },
  });
};


export const useToggleSSStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_active }) =>
      toggleSSStatus(id, is_active),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ss-users"],
      });
    },
  });
};