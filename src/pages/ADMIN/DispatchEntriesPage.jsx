import {
  useRef,
  useState,
} from "react";

import {
  useDispatchOrdersList,
  uploadDispatchExcel,
  deleteSelectedDispatchOrders,
  deleteAllDispatchOrders,
} from "../../hooks/useDispatchOrders";

import { useQueryClient } from "@tanstack/react-query";

import * as XLSX from "xlsx";


/* =========================================================
   SMALL RESULT MODAL
========================================================= */

function UploadResultModal({
  result,
  onClose,
}) {
  if (!result) {
    return null;
  }

  const summary =
    result.summary || {};

  const invalidRows =
    Array.isArray(result.invalid_rows)
      ? result.invalid_rows
      : [];

  const invalidCRMItems =
    Array.isArray(
      result.invalid_crm_item_ids
    )
      ? result.invalid_crm_item_ids
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-5 py-4">

          <div>

            <h2 className="text-base font-semibold text-gray-900">
              Dispatch Excel Upload
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Import completed successfully
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>

        </div>


        {/* SUMMARY */}

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">

          <div className="rounded-lg border bg-gray-50 p-3">

            <div className="text-[11px] text-gray-500">
              Excel Rows
            </div>

            <div className="mt-1 text-xl font-bold text-gray-900">
              {summary.total_excel_rows ?? 0}
            </div>

          </div>


          <div className="rounded-lg border bg-green-50 p-3">

            <div className="text-[11px] text-green-700">
              Created
            </div>

            <div className="mt-1 text-xl font-bold text-green-700">
              {summary.created ?? 0}
            </div>

          </div>


          <div className="rounded-lg border bg-blue-50 p-3">

            <div className="text-[11px] text-blue-700">
              Updated
            </div>

            <div className="mt-1 text-xl font-bold text-blue-700">
              {summary.updated ?? 0}
            </div>

          </div>


          <div className="rounded-lg border bg-orange-50 p-3">

            <div className="text-[11px] text-orange-700">
              Batches
            </div>

            <div className="mt-1 text-xl font-bold text-orange-700">
              {summary.processed_batches ?? 0}
            </div>

          </div>

        </div>


        {/* INVALID SUMMARY */}

        {(
          summary.invalid_crm_items > 0 ||
          summary.invalid_rows > 0
        ) && (

          <div className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 p-3">

            <div className="text-sm font-semibold text-red-700">
              Some entries could not be imported
            </div>

            <div className="mt-1 text-xs text-red-600">

              Invalid CRM Items:
              {" "}
              {summary.invalid_crm_items ?? 0}

              {" • "}

              Invalid Excel Rows:
              {" "}
              {summary.invalid_rows ?? 0}

            </div>

          </div>

        )}


        {/* INVALID CRM ITEMS */}

        {invalidCRMItems.length > 0 && (

          <div className="mx-5 mb-4">

            <div className="mb-2 text-xs font-semibold text-gray-700">
              Invalid CRM Item IDs
            </div>

            <div className="max-h-24 overflow-auto rounded-lg border bg-gray-50 p-3 text-xs text-gray-600">
              {invalidCRMItems.join(", ")}
            </div>

          </div>

        )}


        {/* INVALID ROWS */}

        {invalidRows.length > 0 && (

          <div className="mx-5 mb-5 min-h-0 flex-1">

            <div className="mb-2 text-xs font-semibold text-gray-700">
              Invalid Excel Rows
            </div>

            <div className="max-h-48 overflow-auto rounded-lg border">

              <table className="w-full text-xs">

                <thead className="sticky top-0 bg-gray-100">

                  <tr>

                    <th className="border-b px-3 py-2 text-left">
                      Excel Row
                    </th>

                    <th className="border-b px-3 py-2 text-left">
                      CRM Item
                    </th>

                    <th className="border-b px-3 py-2 text-left">
                      Reason
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {invalidRows.map(
                    (item, index) => (

                      <tr
                        key={`${item.row}-${index}`}
                        className="hover:bg-gray-50"
                      >

                        <td className="border-b px-3 py-2">
                          {item.row ?? "-"}
                        </td>

                        <td className="border-b px-3 py-2">
                          {item.crm_item_id ?? "-"}
                        </td>

                        <td className="border-b px-3 py-2 text-red-600">
                          {item.reason ?? "Invalid row"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}


        {/* FOOTER */}

        <div className="flex justify-end border-t bg-gray-50 px-5 py-3">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2 text-xs font-medium text-white hover:bg-black"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function DispatchEntriesPage() {

  const fileInputRef =
    useRef(null);


  const [tempFrom, setTempFrom] =
    useState("");

  const [tempTo, setTempTo] =
    useState("");


  const [uploading, setUploading] =
    useState(false);


  const [uploadResult, setUploadResult] =
    useState(null);


  const [appliedFilters, setAppliedFilters] =
    useState({
      from: undefined,
      to: undefined,
    });


  const [selectedIds, setSelectedIds] =
    useState([]);


  const [deleting, setDeleting] =
    useState(false);


  const queryClient =
    useQueryClient();


  /* =======================================================
     QUERY
  ======================================================= */

  const {
    data,
    isLoading,
    isFetching,
  } = useDispatchOrdersList(
    appliedFilters
  );


  /* =======================================================
     NORMALIZE PAGINATED DATA
  ======================================================= */

  const rows =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : [];


  const totalCount =
    typeof data?.count === "number"
      ? data.count
      : rows.length;


  /* =======================================================
     TOGGLE ROW
  ======================================================= */

  const toggleRow = (id) => {

    setSelectedIds((prev) => {

      if (prev.includes(id)) {

        return prev.filter(
          (x) => x !== id
        );

      }

      return [
        ...prev,
        id,
      ];

    });

  };


  /* =======================================================
     SELECT ALL CURRENT PAGE
  ======================================================= */

  const allSelected =
    rows.length > 0 &&
    rows.every(
      (row) =>
        selectedIds.includes(
          row.id
        )
    );


  const toggleAll = () => {

    if (allSelected) {

      setSelectedIds([]);

      return;
    }

    setSelectedIds(
      rows.map(
        (row) => row.id
      )
    );

  };


  /* =======================================================
     OPEN FILE SELECTOR
  ======================================================= */

  const openFileSelector = () => {

    if (uploading) {
      return;
    }

    fileInputRef.current?.click();

  };


  /* =======================================================
     DOWNLOAD EMPTY EXCEL TEMPLATE
  ======================================================= */

  const downloadExcelTemplate = () => {

    const worksheet =
      XLSX.utils.aoa_to_sheet([
        [
          "CRM ID",
          "Quantity",
          "Order Packed Time",
        ],
      ]);


    worksheet["!cols"] = [
      { wch: 16 },
      { wch: 14 },
      { wch: 24 },
    ];


    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Dispatch"
    );


    XLSX.writeFile(
      workbook,
      "dispatch_upload_template.xlsx"
    );

  };


  /* =======================================================
     HANDLE EXCEL UPLOAD
  ======================================================= */

  const handleExcelUpload = async (
    event
  ) => {

    const file =
      event.target.files?.[0];


    event.target.value = "";


    if (!file) {
      return;
    }


    const fileName =
      file.name.toLowerCase();


    if (
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xlsm")
    ) {

      alert(
        "Please select an .xlsx or .xlsm Excel file."
      );

      return;
    }


    setUploading(true);
    setUploadResult(null);


    try {

      const result =
        await uploadDispatchExcel(
          file
        );


      setUploadResult(
        result
      );


      await queryClient.invalidateQueries({
        queryKey: [
          "dispatchOrders",
        ],
      });


      setSelectedIds([]);


    } catch (error) {

      console.error(
        "Dispatch Excel Upload Error:",
        error
      );


      const backendData =
        error?.response?.data;


      let message =
        backendData?.message ||
        backendData?.error ||
        error?.message ||
        "Upload failed.";


      if (
        backendData?.invalid_rows?.length
      ) {

        message +=
          `\n\nInvalid rows: ${
            backendData.invalid_rows.length
          }`;

      }


      if (
        backendData?.invalid_crm_item_ids?.length
      ) {

        message +=
          `\nInvalid CRM Items: ${
            backendData.invalid_crm_item_ids.length
          }`;

      }


      alert(
        `❌ Dispatch Upload Failed\n\n${message}`
      );


    } finally {

      setUploading(false);

    }

  };


  /* =======================================================
     DELETE SELECTED
  ======================================================= */

  const handleDeleteSelected =
    async () => {

      if (
        !selectedIds.length ||
        deleting
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          `Selected ${selectedIds.length} dispatch ${
            selectedIds.length === 1
              ? "row"
              : "rows"
          } delete करें?`
        );


      if (!confirmed) {
        return;
      }


      setDeleting(true);


      try {

        await deleteSelectedDispatchOrders(
          selectedIds
        );


        setSelectedIds([]);


        await queryClient.invalidateQueries({
          queryKey: [
            "dispatchOrders",
          ],
        });


      } catch (error) {

        console.error(
          "Delete Selected Error:",
          error
        );


        alert(
          error?.response?.data?.message ||
          error?.message ||
          "Delete failed."
        );


      } finally {

        setDeleting(false);

      }

    };


  /* =======================================================
     DELETE ALL
  ======================================================= */

  const handleDeleteAll =
    async () => {

      if (deleting) {
        return;
      }


      const confirmed =
        window.confirm(
          "⚠️ ALL dispatch records permanently delete ho jayenge. Confirm?"
        );


      if (!confirmed) {
        return;
      }


      setDeleting(true);


      try {

        await deleteAllDispatchOrders();


        setSelectedIds([]);


        await queryClient.invalidateQueries({
          queryKey: [
            "dispatchOrders",
          ],
        });


      } catch (error) {

        console.error(
          "Delete All Error:",
          error
        );


        alert(
          error?.response?.data?.message ||
          error?.message ||
          "Delete failed."
        );


      } finally {

        setDeleting(false);

      }

    };


  /* =======================================================
     APPLY FILTER
  ======================================================= */

  const applyFilters = () => {

    setSelectedIds([]);

    setAppliedFilters({
      from:
        tempFrom ||
        undefined,

      to:
        tempTo ||
        undefined,
    });

  };


  /* =======================================================
     CLEAR FILTER
  ======================================================= */

  const clearFilters = () => {

    setTempFrom("");
    setTempTo("");

    setSelectedIds([]);

    setAppliedFilters({
      from: undefined,
      to: undefined,
    });

  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="mx-auto p-5 text-sm">

      {/* =================================================
          FILTER + ACTIONS
      ================================================= */}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-gray-50 p-3">

        {/* FROM */}

        <div>

          <label className="mb-1 block text-xs text-gray-600">
            From
          </label>

          <input
            type="date"
            value={tempFrom}
            onChange={(event) =>
              setTempFrom(
                event.target.value
              )
            }
            className="rounded-lg border bg-white px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
          />

        </div>


        {/* TO */}

        <div>

          <label className="mb-1 block text-xs text-gray-600">
            To
          </label>

          <input
            type="date"
            value={tempTo}
            onChange={(event) =>
              setTempTo(
                event.target.value
              )
            }
            className="rounded-lg border bg-white px-2.5 py-1.5 text-xs outline-none focus:border-gray-400"
          />

        </div>


        {/* APPLY */}

        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-gray-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-black"
        >
          Apply
        </button>


        {/* CLEAR */}

        {(tempFrom || tempTo) && (

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>

        )}


        <div className="flex-1" />


        {/* =================================================
            DOWNLOAD TEMPLATE
        ================================================= */}

        <button
          type="button"
          onClick={
            downloadExcelTemplate
          }
          className="rounded-lg bg-gray-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
        >
          Excel Template
        </button>


        {/* =================================================
            HIDDEN FILE INPUT
        ================================================= */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          hidden
          onChange={
            handleExcelUpload
          }
        />


        {/* UPLOAD */}

        <button
          type="button"
          disabled={uploading}
          onClick={
            openFileSelector
          }
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {uploading
            ? "Uploading..."
            : "Upload Excel"}

        </button>


        {/* DELETE SELECTED */}

        <button
          type="button"
          disabled={
            !selectedIds.length ||
            deleting
          }
          onClick={
            handleDeleteSelected
          }
          className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {deleting
            ? "Deleting..."
            : `Delete Selected${
                selectedIds.length
                  ? ` (${selectedIds.length})`
                  : ""
              }`}

        </button>


        {/* DELETE ALL */}

        <button
          type="button"
          disabled={deleting}
          onClick={
            handleDeleteAll
          }
          className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {deleting
            ? "Deleting..."
            : "Delete All"}

        </button>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-x-auto rounded-xl border bg-white">

        <table className="min-w-full text-xs">

          <thead className="bg-gray-100 text-gray-700">

            <tr>

              <th className="border-b p-2">

                <input
                  type="checkbox"
                  checked={
                    allSelected
                  }
                  onChange={
                    toggleAll
                  }
                />

              </th>


              <th className="border-b p-2 text-left">
                Order ID
              </th>


              <th className="border-b p-2 text-left">
                Product
              </th>


              <th className="border-b p-2 text-center">
                Qty
              </th>


              <th className="border-b p-2 text-left">
                Packed Time
              </th>


              <th className="border-b p-2 text-left">
                Location
              </th>

            </tr>

          </thead>


          <tbody>

            {/* LOADING */}

            {isLoading ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-500"
                >
                  Loading...
                </td>

              </tr>

            ) : rows.length ? (

              rows.map(
                (row) => (

                  <tr
                    key={row.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border-b p-2 text-center">

                      <input
                        type="checkbox"
                        checked={
                          selectedIds.includes(
                            row.id
                          )
                        }
                        onChange={() =>
                          toggleRow(
                            row.id
                          )
                        }
                      />

                    </td>


                    <td className="border-b p-2 font-medium">

                      {row.order_id ??
                        "-"}

                    </td>


                    <td className="border-b p-2">

                      {row.product ??
                        "-"}

                    </td>


                    <td className="border-b p-2 text-center font-medium">

                      {row.quantity ??
                        "-"}

                    </td>


                    <td className="border-b p-2 text-gray-500">

                      {row.order_packed_time
                        ? new Date(
                            row.order_packed_time
                          ).toLocaleString()
                        : "-"}

                    </td>


                    <td className="border-b p-2 text-gray-500">

                      {row.dispatch_location ??
                        "-"}

                    </td>

                  </tr>

                )
              )

            ) : (

              <tr>

                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-500"
                >
                  No records found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">

        <span>

          {appliedFilters.from ||
          appliedFilters.to

            ? `Showing ${rows.length} of ${totalCount} filtered records`

            : `Showing ${rows.length} of ${totalCount} records`}

        </span>


        {isFetching &&
          !isLoading && (

            <span>
              Updating...
            </span>

          )}

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      {data?.count > 20 && (

        <div className="mt-4 flex items-center justify-center gap-3">

          <button
            type="button"
            disabled={!data?.previous}
            onClick={() => {
              if (!data?.previous) {
                return;
              }

              const url =
                new URL(
                  data.previous
                );

              const page =
                url.searchParams.get(
                  "page"
                );

              const nextFilters = {
                ...appliedFilters,
                page:
                  page || 1,
              };

              queryClient.invalidateQueries({
                queryKey: [
                  "dispatchOrders",
                  nextFilters,
                ],
              });
            }}
            className="rounded-lg border bg-white px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-xs text-gray-500">
            Total: {data.count}
          </span>

          <button
            type="button"
            disabled={!data?.next}
            onClick={() => {
              if (!data?.next) {
                return;
              }

              const url =
                new URL(
                  data.next
                );

              const page =
                url.searchParams.get(
                  "page"
                );

              const nextFilters = {
                ...appliedFilters,
                page:
                  page || 1,
              };

              queryClient.invalidateQueries({
                queryKey: [
                  "dispatchOrders",
                  nextFilters,
                ],
              });
            }}
            className="rounded-lg border bg-white px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>

        </div>

      )}


      {/* =================================================
          UPLOAD RESULT
      ================================================= */}

      <UploadResultModal
        result={uploadResult}
        onClose={() =>
          setUploadResult(null)
        }
      />

    </div>
  );
}