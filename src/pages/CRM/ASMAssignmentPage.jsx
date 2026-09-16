import React, { useMemo, useState } from "react";
import {
  FaUserTie,
  FaUsers,
  FaUserCheck,
  FaUserPlus,
  FaSearch,
  FaSyncAlt,
  FaBolt,
  FaUserMinus,
  FaPhone,
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import {
  useCachedSSUsers,
} from "../../auth/useSS";

import {
  useASMAssignments,
  useCreateASMAssignment,
  useDeactivateASMAssignment,
  useASMHardRefresh,
} from "../../auth/useASM";


const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();


const getUserDisplayName = (user) => {
  return (
    user?.name ||
    user?.party_name ||
    user?.user_id ||
    `User #${user?.id}`
  );
};


const getSSDisplayName = (ss) => {
  return (
    ss?.party_name ||
    ss?.name ||
    ss?.user_id ||
    `SS #${ss?.id}`
  );
};


const getASMDisplayName = (asm) => {
  return (
    asm?.name ||
    asm?.user_id ||
    `ASM #${asm?.id}`
  );
};


/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
};


const StatusBadge = ({ active = true }) => {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <FaCheckCircle className="text-[10px]" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
      Inactive
    </span>
  );
};


const InitialAvatar = ({ name, type = "ss" }) => {
  const firstLetter =
    String(name || "?")
      .trim()
      .charAt(0)
      .toUpperCase() || "?";

  return (
    <div
      className={[
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
        type === "asm"
          ? "bg-violet-50 text-violet-700"
          : "bg-blue-50 text-blue-700",
      ].join(" ")}
    >
      {firstLetter}
    </div>
  );
};


const EmptyState = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon || <FaUsers />}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
};


/* =========================================================
   MAIN PAGE
========================================================= */

export default function ASMAssignmentPage() {
  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
    refetch: refetchUsers,
  } = useCachedSSUsers();

  const {
    data: assignmentsData,
    isLoading: assignmentsLoading,
    isFetching: assignmentsFetching,
    refetch: refetchAssignments,
  } = useASMAssignments();

  const createAssignment = useCreateASMAssignment();
  const deactivateAssignment = useDeactivateASMAssignment();

  const {
    hardRefreshAssignments,
  } = useASMHardRefresh();

  const [selectedASM, setSelectedASM] = useState("");
  const [selectedSS, setSelectedSS] = useState("");

  const [search, setSearch] = useState("");
  const [asmSearch, setAsmSearch] = useState("");
  const [ssSearch, setSsSearch] = useState("");

  const [showASMOptions, setShowASMOptions] = useState(false);
  const [showSSOptions, setShowSSOptions] = useState(false);

  const [activeTab, setActiveTab] = useState("assigned");

  const [refreshing, setRefreshing] = useState(false);
  const [hardRefreshing, setHardRefreshing] = useState(false);

  /* =======================================================
     USERS
  ======================================================= */

  const users = useMemo(() => {
    if (Array.isArray(usersData)) return usersData;

    if (Array.isArray(usersData?.results)) {
      return usersData.results;
    }

    if (Array.isArray(usersData?.users)) {
      return usersData.users;
    }

    return [];
  }, [usersData]);


  const asmUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          user?.role === "ASM" &&
          user?.is_active !== false
      )
      .sort((a, b) =>
        getASMDisplayName(a).localeCompare(
          getASMDisplayName(b)
        )
      );
  }, [users]);


  const ssUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          user?.role === "SS" &&
          user?.is_active !== false
      )
      .sort((a, b) =>
        getSSDisplayName(a).localeCompare(
          getSSDisplayName(b)
        )
      );
  }, [users]);


  /* =======================================================
     ASSIGNMENTS
  ======================================================= */

  const assignments = useMemo(() => {
    if (Array.isArray(assignmentsData)) {
      return assignmentsData;
    }

    if (Array.isArray(assignmentsData?.results)) {
      return assignmentsData.results;
    }

    if (Array.isArray(assignmentsData?.assignments)) {
      return assignmentsData.assignments;
    }

    return [];
  }, [assignmentsData]);


  const activeAssignments = useMemo(() => {
    return assignments.filter(
      (assignment) =>
        assignment?.is_active !== false
    );
  }, [assignments]);


  const assignedSSIds = useMemo(() => {
    return new Set(
      activeAssignments.map((item) =>
        Number(item.ss)
      )
    );
  }, [activeAssignments]);


  const availableSS = useMemo(() => {
    return ssUsers.filter(
      (ss) => !assignedSSIds.has(Number(ss.id))
    );
  }, [ssUsers, assignedSSIds]);


  /* =======================================================
     FILTERED ASM / SS OPTIONS
  ======================================================= */

  const filteredASMOptions = useMemo(() => {
    const q = normalize(asmSearch);

    if (!q) return asmUsers;

    return asmUsers.filter((asm) => {
      return [
        asm.name,
        asm.user_id,
        asm.mobile,
        asm.party_name,
      ]
        .map(normalize)
        .some((value) => value.includes(q));
    });
  }, [asmUsers, asmSearch]);


  const filteredSSOptions = useMemo(() => {
    const q = normalize(ssSearch);

    if (!q) return availableSS;

    return availableSS.filter((ss) => {
      return [
        ss.name,
        ss.party_name,
        ss.user_id,
        ss.mobile,
      ]
        .map(normalize)
        .some((value) => value.includes(q));
    });
  }, [availableSS, ssSearch]);


  const selectedASMObject = useMemo(() => {
    return asmUsers.find(
      (asm) => Number(asm.id) === Number(selectedASM)
    );
  }, [asmUsers, selectedASM]);


  const selectedSSObject = useMemo(() => {
    return availableSS.find(
      (ss) => Number(ss.id) === Number(selectedSS)
    );
  }, [availableSS, selectedSS]);


  /* =======================================================
     ASSIGNMENT SEARCH
  ======================================================= */

  const filteredAssignments = useMemo(() => {
    const q = normalize(search);

    let list = activeAssignments;

    if (activeTab === "selected" && selectedASM) {
      list = list.filter(
        (item) =>
          Number(item.asm) === Number(selectedASM)
      );
    }

    if (!q) return list;

    return list.filter((item) => {
      return [
        item.ss_name,
        item.ss_party_name,
        item.ss_user_id,
        item.ss_mobile,
        item.asm_name,
        item.asm_user_id,
      ]
        .map(normalize)
        .some((value) => value.includes(q));
    });
  }, [
    activeAssignments,
    search,
    activeTab,
    selectedASM,
  ]);


  /* =======================================================
     COUNTS
  ======================================================= */

  const selectedASMCount = useMemo(() => {
    if (!selectedASM) return 0;

    return activeAssignments.filter(
      (item) =>
        Number(item.asm) === Number(selectedASM)
    ).length;
  }, [activeAssignments, selectedASM]);


  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    if (refreshing || hardRefreshing) return;

    try {
      setRefreshing(true);

      await Promise.all([
        refetchUsers(),
        refetchAssignments(),
      ]);

      toast.success("Assignment data refreshed");
    } catch (error) {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };


  const handleHardRefresh = async () => {
    if (refreshing || hardRefreshing) return;

    try {
      setHardRefreshing(true);

      await hardRefreshAssignments();

      toast.success("Latest data loaded");
    } catch (error) {
      toast.error("Hard refresh failed");
    } finally {
      setHardRefreshing(false);
    }
  };


  /* =======================================================
     ASSIGN
  ======================================================= */

  const handleAssign = async () => {
    if (!selectedASM) {
      toast.error("Please select an ASM");
      return;
    }

    if (!selectedSS) {
      toast.error("Please select an SS");
      return;
    }

    try {
      await createAssignment.mutateAsync({
        asm: Number(selectedASM),
        ss: Number(selectedSS),
      });

      toast.success(
        `${getSSDisplayName(selectedSSObject)} assigned successfully`
      );

      setSelectedSS("");
      setSSSearch("");

      setActiveTab("assigned");
    } catch (error) {
      const message =
        error?.response?.data?.ss?.[0] ||
        error?.response?.data?.asm?.[0] ||
        error?.response?.data?.detail ||
        "Unable to assign SS";

      toast.error(message);
    }
  };


  /* =======================================================
     DEACTIVATE
  ======================================================= */

  const handleDeactivate = async (assignment) => {
    const ssName =
      assignment?.ss_party_name ||
      assignment?.ss_name ||
      assignment?.ss_user_id ||
      "this SS";

    const confirmed = window.confirm(
      `Remove ${ssName} from this ASM?`
    );

    if (!confirmed) return;

    try {
      await deactivateAssignment.mutateAsync(
        assignment.id
      );

      toast.success("SS assignment removed");
    } catch (error) {
      toast.error(
        error?.response?.data?.detail ||
          "Unable to remove assignment"
      );
    }
  };


  const loading =
    usersLoading ||
    assignmentsLoading;


  const fetching =
    usersFetching ||
    assignmentsFetching ||
    createAssignment.isPending ||
    deactivateAssignment.isPending;


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 lg:px-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mx-auto max-w-[1500px]">

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <FaUserTie />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  ASM Management
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Assign and manage Super Stockists under Area Sales Managers
                </p>
              </div>

            </div>


            {/* REFRESH BUTTONS */}

            <div className="flex w-full gap-2 sm:w-auto">

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || hardRefreshing}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <FaSyncAlt
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>


              <button
                type="button"
                onClick={handleHardRefresh}
                disabled={refreshing || hardRefreshing}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <FaBolt
                  className={
                    hardRefreshing
                      ? "animate-pulse"
                      : ""
                  }
                />

                <span>
                  {hardRefreshing
                    ? "Loading..."
                    : "Hard Refresh"}
                </span>
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            icon={<FaUserTie />}
            label="Active ASM"
            value={asmUsers.length}
            description="Available managers"
          />

          <StatCard
            icon={<FaUsers />}
            label="Total SS"
            value={ssUsers.length}
            description="Active Super Stockists"
          />

          <StatCard
            icon={<FaUserCheck />}
            label="Assigned SS"
            value={activeAssignments.length}
            description="Currently mapped"
          />

          <StatCard
            icon={<FaUserPlus />}
            label="Unassigned"
            value={availableSS.length}
            description="Ready to assign"
          />

        </div>


        {/* =================================================
            ASSIGNMENT CREATOR
        ================================================= */}

        <div className="mb-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FaUserPlus />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Assign SS to ASM
                </h2>

                <p className="text-xs text-slate-500">
                  Select a manager and an unassigned SS
                </p>
              </div>

            </div>

          </div>


          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">

            {/* ASM */}

            <div className="relative">

              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Area Sales Manager
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowASMOptions((prev) => !prev);
                  setShowSSOptions(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >

                {selectedASMObject ? (
                  <div className="flex min-w-0 items-center gap-2">

                    <InitialAvatar
                      name={getASMDisplayName(
                        selectedASMObject
                      )}
                      type="asm"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {getASMDisplayName(
                          selectedASMObject
                        )}
                      </p>

                      <p className="truncate text-[11px] text-slate-500">
                        {selectedASMObject.user_id}
                        {selectedASMCount > 0 &&
                          ` • ${selectedASMCount} SS`}
                      </p>
                    </div>

                  </div>
                ) : (
                  <span className="text-slate-400">
                    Select ASM
                  </span>
                )}

                <FaChevronDown className="ml-2 shrink-0 text-xs text-slate-400" />

              </button>


              {showASMOptions && (
                <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                  <div className="border-b border-slate-100 p-2">

                    <div className="relative">

                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                      <input
                        autoFocus
                        value={asmSearch}
                        onChange={(e) =>
                          setAsmSearch(e.target.value)
                        }
                        placeholder="Search ASM..."
                        className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-400"
                      />

                    </div>

                  </div>


                  <div className="max-h-60 overflow-y-auto">

                    {filteredASMOptions.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-500">
                        No ASM found
                      </div>
                    ) : (
                      filteredASMOptions.map((asm) => (
                        <button
                          key={asm.id}
                          type="button"
                          onClick={() => {
                            setSelectedASM(asm.id);
                            setSelectedSS("");
                            setSSSearch("");
                            setShowASMOptions(false);
                            setAsmSearch("");
                          }}
                          className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-slate-50"
                        >

                          <InitialAvatar
                            name={getASMDisplayName(asm)}
                            type="asm"
                          />

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-slate-800">
                              {getASMDisplayName(asm)}
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                              {asm.user_id}
                              {asm.mobile &&
                                ` • ${asm.mobile}`}
                            </p>

                          </div>

                        </button>
                      ))
                    )}

                  </div>

                </div>
              )}

            </div>


            {/* SS */}

            <div className="relative">

              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Super Stockist
              </label>

              <button
                type="button"
                disabled={!selectedASM}
                onClick={() => {
                  if (!selectedASM) return;

                  setShowSSOptions((prev) => !prev);
                  setShowASMOptions(false);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm transition hover:border-blue-300 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >

                {selectedSSObject ? (
                  <div className="flex min-w-0 items-center gap-2">

                    <InitialAvatar
                      name={getSSDisplayName(
                        selectedSSObject
                      )}
                    />

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800">
                        {getSSDisplayName(
                          selectedSSObject
                        )}
                      </p>

                      <p className="truncate text-[11px] text-slate-500">
                        {selectedSSObject.user_id}
                      </p>

                    </div>

                  </div>
                ) : (
                  <span>
                    {selectedASM
                      ? "Select SS"
                      : "Select ASM first"}
                  </span>
                )}

                <FaChevronDown className="ml-2 shrink-0 text-xs text-slate-400" />

              </button>


              {showSSOptions && selectedASM && (
                <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                  <div className="border-b border-slate-100 p-2">

                    <div className="relative">

                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

                      <input
                        autoFocus
                        value={ssSearch}
                        onChange={(e) =>
                          setSsSearch(e.target.value)
                        }
                        placeholder="Search SS..."
                        className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-400"
                      />

                    </div>

                  </div>


                  <div className="max-h-60 overflow-y-auto">

                    {filteredSSOptions.length === 0 ? (
                      <div className="p-5 text-center">

                        <FaCheckCircle className="mx-auto text-lg text-emerald-500" />

                        <p className="mt-2 text-xs font-semibold text-slate-700">
                          All SS are assigned
                        </p>

                        <p className="mt-1 text-[11px] text-slate-500">
                          No unassigned active SS found.
                        </p>

                      </div>
                    ) : (
                      filteredSSOptions.map((ss) => (
                        <button
                          key={ss.id}
                          type="button"
                          onClick={() => {
                            setSelectedSS(ss.id);
                            setShowSSOptions(false);
                            setSsSearch("");
                          }}
                          className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-slate-50"
                        >

                          <InitialAvatar
                            name={getSSDisplayName(ss)}
                          />

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-slate-800">
                              {getSSDisplayName(ss)}
                            </p>

                            <p className="truncate text-[11px] text-slate-500">
                              {ss.user_id}
                              {ss.mobile &&
                                ` • ${ss.mobile}`}
                            </p>

                          </div>

                        </button>
                      ))
                    )}

                  </div>

                </div>
              )}

            </div>


            {/* ASSIGN BUTTON */}

            <button
              type="button"
              onClick={handleAssign}
              disabled={
                !selectedASM ||
                !selectedSS ||
                createAssignment.isPending
              }
              className="flex h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {createAssignment.isPending ? (
                <>
                  <FaSyncAlt className="animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Assign SS
                </>
              )}

            </button>

          </div>

        </div>


        {/* =================================================
            ASSIGNMENT LIST
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* LIST HEADER */}

          <div className="border-b border-slate-100 p-4 sm:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-sm font-bold text-slate-900">
                    Current Assignments
                  </h2>

                  {fetching && (
                    <FaSyncAlt className="animate-spin text-xs text-blue-500" />
                  )}

                </div>

                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredAssignments.length} active assignment
                  {filteredAssignments.length !== 1
                    ? "s"
                    : ""}
                </p>

              </div>


              {/* TABS */}

              <div className="flex rounded-xl bg-slate-100 p-1">

                <button
                  type="button"
                  onClick={() => setActiveTab("assigned")}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition",
                    activeTab === "assigned"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  All Assigned
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("selected")
                  }
                  disabled={!selectedASM}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                    activeTab === "selected"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  Selected ASM
                </button>

              </div>

            </div>


            {/* SEARCH */}

            <div className="mt-4 relative">

              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search ASM, SS, party name, user ID or mobile..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-10 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FaTimes />
                </button>
              )}

            </div>

          </div>


          {/* =================================================
              CONTENT
          ================================================= */}

          {loading ? (
            <div className="p-4 sm:p-5">

              <div className="hidden lg:block">

                <div className="space-y-3">

                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}

                </div>

              </div>


              <div className="space-y-3 lg:hidden">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}

              </div>

            </div>
          ) : filteredAssignments.length === 0 ? (

            <EmptyState
              icon={
                search ? (
                  <FaSearch />
                ) : (
                  <FaUserTie />
                )
              }
              title={
                search
                  ? "No matching assignments"
                  : activeAssignments.length === 0
                    ? "No assignments yet"
                    : "No assignments for this ASM"
              }
              description={
                search
                  ? "Try searching with another ASM name, SS name, party name or user ID."
                  : "Select an ASM and an available SS above to create an assignment."
              }
            />

          ) : (

            <>

              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full min-w-[850px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        ASM
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Super Stockist
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Contact
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Assigned
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                    </tr>
                  </thead>


                  <tbody className="divide-y divide-slate-100">

                    {filteredAssignments.map(
                      (assignment) => (
                        <tr
                          key={assignment.id}
                          className="transition hover:bg-slate-50/70"
                        >

                          {/* ASM */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <InitialAvatar
                                name={
                                  assignment.asm_name ||
                                  assignment.asm_user_id
                                }
                                type="asm"
                              />

                              <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {assignment.asm_name ||
                                    assignment.asm_user_id ||
                                    "—"}
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  {assignment.asm_user_id ||
                                    "—"}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* SS */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <InitialAvatar
                                name={
                                  assignment.ss_party_name ||
                                  assignment.ss_name ||
                                  assignment.ss_user_id
                                }
                              />

                              <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {assignment.ss_party_name ||
                                    assignment.ss_name ||
                                    assignment.ss_user_id ||
                                    "—"}
                                </p>

                                <p className="text-[11px] text-slate-500">
                                  {assignment.ss_user_id ||
                                    "—"}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* CONTACT */}

                          <td className="px-5 py-4">

                            {assignment.ss_mobile ? (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <FaPhone className="text-[10px] text-slate-400" />
                                {assignment.ss_mobile}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                —
                              </span>
                            )}

                          </td>


                          {/* DATE */}

                          <td className="px-5 py-4">

                            <div className="text-xs text-slate-600">

                              {assignment.created_at
                                ? new Date(
                                    assignment.created_at
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "—"}

                            </div>

                            {assignment.created_at && (
                              <div className="mt-0.5 text-[10px] text-slate-400">
                                {new Date(
                                  assignment.created_at
                                ).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                            )}

                          </td>


                          {/* STATUS */}

                          <td className="px-5 py-4">
                            <StatusBadge
                              active={
                                assignment.is_active !==
                                false
                              }
                            />
                          </td>


                          {/* ACTION */}

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                handleDeactivate(
                                  assignment
                                )
                              }
                              disabled={
                                deactivateAssignment.isPending
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              <FaUserMinus />
                              Remove
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>


              {/* =================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="space-y-3 p-3 lg:hidden">

                {filteredAssignments.map(
                  (assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >

                      {/* TOP */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <InitialAvatar
                            name={
                              assignment.ss_party_name ||
                              assignment.ss_name ||
                              assignment.ss_user_id
                            }
                          />

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-900">
                              {assignment.ss_party_name ||
                                assignment.ss_name ||
                                assignment.ss_user_id ||
                                "Unknown SS"}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {assignment.ss_user_id ||
                                "No user ID"}
                            </p>

                          </div>

                        </div>

                        <StatusBadge
                          active={
                            assignment.is_active !==
                            false
                          }
                        />

                      </div>


                      {/* ASM */}

                      <div className="mt-4 rounded-xl bg-slate-50 p-3">

                        <div className="flex items-center gap-2">

                          <FaUserTie className="text-xs text-violet-500" />

                          <div className="min-w-0">

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Assigned ASM
                            </p>

                            <p className="truncate text-xs font-semibold text-slate-700">
                              {assignment.asm_name ||
                                assignment.asm_user_id ||
                                "—"}
                            </p>

                          </div>

                        </div>

                      </div>


                      {/* DETAILS */}

                      <div className="mt-3 grid grid-cols-2 gap-2">

                        <div className="rounded-xl border border-slate-100 p-2.5">

                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Contact
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                            {assignment.ss_mobile ||
                              "—"}
                          </p>

                        </div>


                        <div className="rounded-xl border border-slate-100 p-2.5">

                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Assigned On
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-700">

                            {assignment.created_at
                              ? new Date(
                                  assignment.created_at
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}

                          </p>

                        </div>

                      </div>


                      {/* ACTION */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDeactivate(
                            assignment
                          )
                        }
                        disabled={
                          deactivateAssignment.isPending
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <FaUserMinus />
                        Remove Assignment
                      </button>

                    </div>
                  )
                )}

              </div>

            </>

          )}

        </div>


        {/* =================================================
            MOBILE BOTTOM INFO
        ================================================= */}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">

            <div className="flex gap-3">

              <FaUserCheck className="mt-0.5 shrink-0 text-blue-600" />

              <div>

                <p className="text-xs font-bold text-blue-900">
                  One SS → One Active ASM
                </p>

                <p className="mt-1 text-[11px] leading-5 text-blue-700">
                  An active SS can be assigned to only one ASM
                  at a time.
                </p>

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">

            <div className="flex gap-3">

              <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-600" />

              <div>

                <p className="text-xs font-bold text-amber-900">
                  Removing is safe
                </p>

                <p className="mt-1 text-[11px] leading-5 text-amber-700">
                  Removing an assignment does not delete the
                  SS or its order history.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}