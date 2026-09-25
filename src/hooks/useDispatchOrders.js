import { useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../api/axios";


/* =========================================================
   DISPATCH RECORD LIST
========================================================= */

export const useDispatchOrdersList = (filters = {}) => {
  return useQuery({
    queryKey: ["dispatchOrders", filters],

    queryFn: async () => {
      const { data } = await API.get(
        "/dispatch/records/",
        {
          params: filters,
        }
      );

      return data;
    },

    staleTime: 1000 * 30,

    placeholderData: (previousData) => previousData,
  });
};


/* =========================================================
   DISPATCH EXCEL UPLOAD
   KEEP THIS FLOW
========================================================= */

export const uploadDispatchExcel = async (file) => {
  if (!file) {
    throw new Error(
      "Please select an Excel file."
    );
  }

  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  const { data } = await API.post(
    "/dispatch/upload-excel/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },

      timeout: 0,
    }
  );

  return data;
};


/* =========================================================
   DELETE SELECTED
========================================================= */

export const deleteSelectedDispatchOrders = async (
  ids
) => {
  const response = await API.post(
    "/dispatch/records/delete-selected/",
    {
      ids,
    }
  );

  return response.data;
};


/* =========================================================
   DELETE ALL
========================================================= */

export const deleteAllDispatchOrders = async () => {
  const response = await API.delete(
    "/dispatch/records/delete-all/"
  );

  return response.data;
};


/* =========================================================
   DELETE SINGLE
========================================================= */

export const deleteDispatchRecord = async (
  id
) => {
  const response = await API.delete(
    `/dispatch/records/${id}/`
  );

  return response.data;
};


/* =========================================================
   INVALIDATE DISPATCH CACHE
========================================================= */

export const invalidateDispatchQueries = (
  queryClient
) => {
  queryClient.invalidateQueries({
    queryKey: ["dispatchOrders"],
  });
};