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





// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import API from "../api/axios";

// /* =========================================================
//    DISPATCH LIST
// ========================================================= */

// export const useDispatchOrdersList = (filters = {}) => {
//   return useQuery({
//     queryKey: ["dispatchOrders", filters],

//     queryFn: async () => {
//       const { data } = await API.get(
//         "/dispatch-orders/",
//         {
//           params: filters,
//         }
//       );

//       return data;
//     },

//     staleTime: 1000 * 30,
//   });
// };


// /* =========================================================
//    NEW DISPATCH EXCEL UPLOAD
// ========================================================= */

// export const uploadDispatchExcel = async (file) => {
//   if (!file) {
//     throw new Error("Please select an Excel file.");
//   }

//   const formData = new FormData();

//   formData.append("file", file);

//   const { data } = await API.post(
//     "/dispatch/upload-excel/",
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },

//       // Useful for large Excel uploads
//       timeout: 0,
//     }
//   );

//   return data;
// };


// /* =========================================================
//    DELETE ALL
// ========================================================= */

// const deleteAllDispatchOrders = async () => {
//   const response = await API.delete(
//     "/dispatch-orders/delete-all/"
//   );

//   return response.data;
// };


// export const useDeleteAllDispatchOrders = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: deleteAllDispatchOrders,

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["dispatchOrders"],
//       });

//       queryClient.invalidateQueries({
//         queryKey: ["crmOrders"],
//       });
//     },
//   });
// };


// /* =========================================================
//    DELETE SELECTED
// ========================================================= */

// export const deleteSelectedDispatchOrders = async (ids) => {
//   const response = await API.post(
//     "/dispatch-orders/delete-selected/",
//     {
//       ids,
//     }
//   );

//   return response.data;
// };


// /* =========================================================
//    OLD DISPATCH EXCEL DOWNLOAD
// ========================================================= */

// export const downloadDispatchExcel = async () => {
//   const response = await API.get(
//     "/dispatch-orders/excel/download/",
//     {
//       responseType: "blob",
//     }
//   );

//   const url = window.URL.createObjectURL(
//     new Blob([response.data])
//   );

//   const link = document.createElement("a");

//   link.href = url;

//   link.setAttribute(
//     "download",
//     "dispatch_orders.xlsx"
//   );

//   document.body.appendChild(link);

//   link.click();

//   link.remove();

//   window.URL.revokeObjectURL(url);
// };