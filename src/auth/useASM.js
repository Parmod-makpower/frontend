import API from "../api/axios";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";


/* =========================================================
   CACHE KEYS
   ========================================================= */

export const ASM_QUERY_KEYS = {
  dashboard: ["asm-dashboard"],

  ssDetail: (ssId) => ["asm-ss-detail", ssId],

  assignments: ["asm-assignments"],
};


/* =========================================================
   API
   ========================================================= */

const getASMDashboard = async () => {
  const res = await API.get("/asm/dashboard/");
  return res.data;
};


const getASMSSDetail = async ({ ssId, pageParam = 1 }) => {
  const res = await API.get(`/asm/ss/${ssId}/`, {
    params: {
      page: pageParam,
    },
  });

  return res.data;
};


const getASMAssignments = async () => {
  const res = await API.get("/asm/assignments/");
  return res.data;
};


/* =========================================================
   ASM DASHBOARD
   ONLY ASSIGNED SS
   ========================================================= */

export const useASMDashboard = () => {
  return useQuery({
    queryKey: ASM_QUERY_KEYS.dashboard,
    queryFn: getASMDashboard,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    retry: 1,

    placeholderData: (previousData) => previousData,
  });
};


/* =========================================================
   ASM → SS ORDERS
   15 ORDERS PER API CALL
   ========================================================= */

export const useASMSSDetail = (ssId, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ASM_QUERY_KEYS.ssDetail(ssId),

    queryFn: ({ pageParam = 1 }) =>
      getASMSSDetail({
        ssId,
        pageParam,
      }),

    enabled: Boolean(ssId) && enabled,

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.has_next) {
        return undefined;
      }

      return lastPage.pagination.next_page;
    },

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    retry: 1,
  });
};


/* =========================================================
   CRM / ADMIN → ASM ASSIGNMENTS
   ========================================================= */

export const useASMAssignments = () => {
  return useQuery({
    queryKey: ASM_QUERY_KEYS.assignments,
    queryFn: getASMAssignments,

    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    retry: 1,

    placeholderData: (previousData) => previousData,
  });
};


/* =========================================================
   REFRESH
   ========================================================= */

export const useASMRefresh = () => {
  const queryClient = useQueryClient();

  const refreshDashboard = () => {
    return queryClient.refetchQueries({
      queryKey: ASM_QUERY_KEYS.dashboard,
      type: "active",
    });
  };


  const refreshSSDetail = (ssId) => {
    if (!ssId) return;

    return queryClient.refetchQueries({
      queryKey: ASM_QUERY_KEYS.ssDetail(ssId),
      type: "active",
    });
  };


  const refreshAssignments = () => {
    return queryClient.refetchQueries({
      queryKey: ASM_QUERY_KEYS.assignments,
      type: "active",
    });
  };


  return {
    refreshDashboard,
    refreshSSDetail,
    refreshAssignments,
  };
};


/* =========================================================
   CREATE ASSIGNMENT
   ========================================================= */

const createASMAssignment = async (data) => {
  const res = await API.post(
    "/asm/assignments/create/",
    data
  );

  return res.data;
};


export const useCreateASMAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createASMAssignment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ASM_QUERY_KEYS.assignments,
        }),

        queryClient.invalidateQueries({
          queryKey: ASM_QUERY_KEYS.dashboard,
        }),

        queryClient.invalidateQueries({
          queryKey: ["ss-users"],
        }),
      ]);
    },
  });
};


/* =========================================================
   DEACTIVATE ASSIGNMENT
   ========================================================= */

const deactivateASMAssignment = async (id) => {
  const res = await API.patch(
    `/asm/assignments/${id}/deactivate/`
  );

  return res.data;
};


export const useDeactivateASMAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateASMAssignment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ASM_QUERY_KEYS.assignments,
        }),

        queryClient.invalidateQueries({
          queryKey: ASM_QUERY_KEYS.dashboard,
        }),

        queryClient.invalidateQueries({
          queryKey: ["ss-users"],
        }),
      ]);
    },
  });
};


/* =========================================================
   HARD REFRESH
   ========================================================= */

export const useASMHardRefresh = () => {
  const queryClient = useQueryClient();

  const hardRefreshDashboard = () => {
    return queryClient.invalidateQueries({
      queryKey: ASM_QUERY_KEYS.dashboard,
      refetchType: "active",
    });
  };


  const hardRefreshSSDetail = (ssId) => {
    if (!ssId) return;

    return queryClient.invalidateQueries({
      queryKey: ASM_QUERY_KEYS.ssDetail(ssId),
      refetchType: "active",
    });
  };


  const hardRefreshAssignments = () => {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: ASM_QUERY_KEYS.assignments,
        refetchType: "active",
      }),

      queryClient.invalidateQueries({
        queryKey: ["ss-users"],
        refetchType: "active",
      }),
    ]);
  };


  return {
    hardRefreshDashboard,
    hardRefreshSSDetail,
    hardRefreshAssignments,
  };
};