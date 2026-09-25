// import { useState } from "react";

// import {
//   useDispatchOrdersList,
//   uploadDispatchExcel,
//   downloadDispatchExcel,
// } from "../../hooks/useDispatchOrders";

// import {
//   useDeleteAllDispatchOrders,
//   deleteSelectedDispatchOrders,
// } from "../../hooks/useDispatchOrders";

// import { useQueryClient } from "@tanstack/react-query";

// export default function DispatchEntriesPage() {
//   const [tempFrom, setTempFrom] = useState("");
//   const [tempTo, setTempTo] = useState("");

//   const [uploading, setUploading] = useState(false);

//   const [appliedFilters, setAppliedFilters] = useState({
//     from: undefined,
//     to: undefined,
//   });

//   const [selectedIds, setSelectedIds] = useState([]);

//   const {
//     data,
//     isLoading,
//   } = useDispatchOrdersList(appliedFilters);

//   const {
//     mutate,
//     isPending,
//   } = useDeleteAllDispatchOrders();

//   const queryClient = useQueryClient();

//   const toggleRow = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id]
//     );
//   };

//   return (
//     <div className="mx-auto p-5 text-sm">

//       {/* FILTER + ACTIONS */}
//       <div className="mb-4 flex flex-wrap items-end gap-3 rounded border bg-gray-50 p-3">

//         <div>
//           <label className="mb-1 block text-xs text-gray-600">
//             From
//           </label>

//           <input
//             type="date"
//             value={tempFrom}
//             onChange={(e) =>
//               setTempFrom(e.target.value)
//             }
//             className="rounded border px-2 py-1 text-xs"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block text-xs text-gray-600">
//             To
//           </label>

//           <input
//             type="date"
//             value={tempTo}
//             onChange={(e) =>
//               setTempTo(e.target.value)
//             }
//             className="rounded border px-2 py-1 text-xs"
//           />
//         </div>

//         <button
//           onClick={() => {
//             setAppliedFilters({
//               from:
//                 tempFrom || undefined,
//               to:
//                 tempTo || undefined,
//             });
//           }}
//           className="rounded bg-gray-800 px-4 py-1.5 text-xs text-white hover:bg-black"
//         >
//           Apply
//         </button>

//         <div className="flex-1" />

//         {/* DOWNLOAD */}
//         <button
//           onClick={downloadDispatchExcel}
//           className="rounded bg-green-600 px-4 py-1.5 text-xs text-white"
//         >
//           Download
//         </button>

//         {/* =====================================================
//             EXCEL UPLOAD
//         ====================================================== */}
//         <input
//           type="file"
//           accept=".xlsx"
//           hidden
//           id="excelUpload"
//           onChange={async (e) => {
//             const file =
//               e.target.files?.[0];

//             // Allow same file to be selected again
//             e.target.value = "";

//             if (!file) return;

//             setUploading(true);

//             try {
//               const res =
//                 await uploadDispatchExcel(
//                   file
//                 );

//               const created = Number(
//                 res?.created || 0
//               );

//               const failed = Number(
//                 res?.failed || 0
//               );

//               const totalRows = Number(
//                 res?.total_rows ||
//                   created + failed
//               );

//               const blankRows = Number(
//                 res?.blank_rows || 0
//               );

//               // ------------------------------------------------
//               // SUCCESS MESSAGE
//               // ------------------------------------------------
//               let message =
//                 `📦 DISPATCH EXCEL UPLOAD\n\n` +
//                 `Total Rows: ${totalRows}\n` +
//                 `✅ Uploaded: ${created}\n` +
//                 `❌ Failed: ${failed}`;

//               if (blankRows > 0) {
//                 message +=
//                   `\n⬜ Blank Rows: ${blankRows}`;
//               }

//               // ------------------------------------------------
//               // FAILED ROWS
//               // ------------------------------------------------
//               if (
//                 Array.isArray(
//                   res?.errors
//                 ) &&
//                 res.errors.length
//               ) {
//                 message +=
//                   `\n\n❌ ENTRIES NOT UPLOADED:\n\n`;

//                 message +=
//                   res.errors.join("\n");
//               }

//               alert(message);

//               // ------------------------------------------------
//               // REFRESH TABLE
//               // ------------------------------------------------
//               queryClient.invalidateQueries(
//                 {
//                   queryKey: [
//                     "dispatchOrders",
//                   ],
//                 }
//               );

//             } catch (err) {
//               console.error(
//                 "Dispatch Excel Upload Error:",
//                 err
//               );

//               const backendMessage =
//                 err?.response?.data
//                   ?.message ||
//                 err?.response?.data
//                   ?.error ||
//                 err?.message ||
//                 "Upload failed";

//               alert(
//                 `❌ Upload Failed\n\n${backendMessage}`
//               );

//             } finally {
//               setUploading(false);
//             }
//           }}
//         />

//         {/* UPLOAD BUTTON */}
//         <button
//           disabled={uploading}
//           onClick={() =>
//             document
//               .getElementById(
//                 "excelUpload"
//               )
//               ?.click()
//           }
//           className="rounded bg-blue-600 px-4 py-1.5 text-xs text-white disabled:opacity-50"
//         >
//           {uploading
//             ? "Uploading..."
//             : "Upload"}
//         </button>

//         {/* DELETE SELECTED */}
//         <button
//           disabled={!selectedIds.length}
//           onClick={async () => {
//             if (
//               window.confirm(
//                 "Selected rows delete करें?"
//               )
//             ) {
//               await deleteSelectedDispatchOrders(
//                 selectedIds
//               );

//               setSelectedIds([]);

//               queryClient.invalidateQueries(
//                 {
//                   queryKey: [
//                     "dispatchOrders",
//                   ],
//                 }
//               );
//             }
//           }}
//           className="rounded bg-red-500 px-4 py-1.5 text-xs text-white disabled:opacity-50"
//         >
//           Delete Selected
//         </button>

//         {/* DELETE ALL */}
//         <button
//           disabled={isPending}
//           onClick={() => {
//             if (
//               window.confirm(
//                 "⚠️ ALL dispatch orders delete हो जाएंगे. Confirm?"
//               )
//             ) {
//               mutate();
//             }
//           }}
//           className="rounded bg-red-600 px-4 py-1.5 text-xs text-white disabled:opacity-50"
//         >
//           Delete All
//         </button>
//       </div>

//       {/* =======================================================
//           TABLE
//       ======================================================== */}
//       <div className="overflow-x-auto rounded border">
//         <table className="min-w-full text-xs">

//           <thead className="bg-gray-100 text-gray-700">
//             <tr>

//               <th className="border p-2">
//                 <input
//                   type="checkbox"
//                   checked={
//                     data?.length > 0 &&
//                     selectedIds.length ===
//                       data.length
//                   }
//                   onChange={(e) =>
//                     setSelectedIds(
//                       e.target.checked
//                         ? data.map(
//                             (d) => d.id
//                           )
//                         : []
//                     )
//                   }
//                 />
//               </th>

//               <th className="border p-2">
//                 Order ID
//               </th>

//               <th className="border p-2">
//                 Product
//               </th>

//               <th className="border p-2">
//                 Qty
//               </th>

//               <th className="border p-2">
//                 Packed Time
//               </th>

//             </tr>
//           </thead>

//           <tbody>

//             {isLoading ? (
//               <tr>
//                 <td
//                   colSpan={5}
//                   className="p-4 text-center"
//                 >
//                   Loading...
//                 </td>
//               </tr>

//             ) : data?.length ? (

//               data.map((row) => (
//                 <tr
//                   key={row.id}
//                   className="hover:bg-gray-50"
//                 >

//                   <td className="border p-2 text-center">
//                     <input
//                       type="checkbox"
//                       checked={selectedIds.includes(
//                         row.id
//                       )}
//                       onChange={() =>
//                         toggleRow(row.id)
//                       }
//                     />
//                   </td>

//                   <td className="border p-2">
//                     {row.order_id}
//                   </td>

//                   <td className="border p-2">
//                     {row.product}
//                   </td>

//                   <td className="border p-2 text-center">
//                     {row.quantity}
//                   </td>

//                   <td className="border p-2 text-gray-500">
//                     {row.order_packed_time
//                       ? new Date(
//                           row.order_packed_time
//                         ).toLocaleString()
//                       : "-"}
//                   </td>

//                 </tr>
//               ))

//             ) : (

//               <tr>
//                 <td
//                   colSpan={5}
//                   className="p-4 text-center text-gray-500"
//                 >
//                   No records found
//                 </td>
//               </tr>

//             )}

//           </tbody>

//         </table>
//       </div>

//       {/* FOOTER */}
//       <p className="mt-2 text-[11px] text-gray-400">
//         {appliedFilters.from ||
//         appliedFilters.to
//           ? `Showing ${
//               data?.length || 0
//             } filtered records`
//           : "Showing latest 10 records"}
//       </p>

//     </div>
//   );
// }










import { useRef, useState } from "react";

import {
  useDispatchOrdersList,
  uploadDispatchExcel,
  downloadDispatchExcel,
  useDeleteAllDispatchOrders,
  deleteSelectedDispatchOrders,
} from "../../hooks/useDispatchOrders";

import { useQueryClient } from "@tanstack/react-query";


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

  const summary = result.summary || {};

  const invalidRows =
    Array.isArray(result.invalid_rows)
      ? result.invalid_rows
      : [];

  const invalidCRMItems =
    Array.isArray(result.invalid_crm_item_ids)
      ? result.invalid_crm_item_ids
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

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


        {/* =================================================
            SUMMARY
        ================================================= */}

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


        {/* =================================================
            INVALID SUMMARY
        ================================================= */}

        {(summary.invalid_crm_items > 0 ||
          summary.invalid_rows > 0) && (

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


        {/* =================================================
            INVALID CRM ITEMS
        ================================================= */}

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


        {/* =================================================
            INVALID ROWS
        ================================================= */}

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


        {/* =================================================
            FOOTER
        ================================================= */}

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

  const fileInputRef = useRef(null);

  const [tempFrom, setTempFrom] = useState("");
  const [tempTo, setTempTo] = useState("");

  const [uploading, setUploading] = useState(false);

  const [uploadResult, setUploadResult] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState({
    from: undefined,
    to: undefined,
  });

  const [selectedIds, setSelectedIds] = useState([]);


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
     DELETE ALL
  ======================================================= */

  const {
    mutate,
    isPending,
  } = useDeleteAllDispatchOrders();


  const queryClient = useQueryClient();


  /* =======================================================
     NORMALIZE TABLE DATA
  ======================================================= */

  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];


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
     SELECT ALL
  ======================================================= */

  const allSelected =
    rows.length > 0 &&
    rows.every(
      (row) =>
        selectedIds.includes(row.id)
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
     HANDLE EXCEL UPLOAD
  ======================================================= */

  const handleExcelUpload = async (
    event
  ) => {

    const file =
      event.target.files?.[0];

    // Allow same file to be selected again
    event.target.value = "";

    if (!file) {
      return;
    }


    /* =====================================================
       FILE VALIDATION
    ===================================================== */

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


    /* =====================================================
       START UPLOAD
    ===================================================== */

    setUploading(true);

    setUploadResult(null);


    try {

      const result =
        await uploadDispatchExcel(
          file
        );


      /* ===================================================
         STORE RESULT
      =================================================== */

      setUploadResult(result);


      /* ===================================================
         REFRESH TABLE
      =================================================== */

      await queryClient.invalidateQueries({
        queryKey: [
          "dispatchOrders",
        ],
      });


      /* ===================================================
         CLEAR SELECTION
      =================================================== */

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


      /* ===================================================
         DJANGO VALIDATION ERRORS
      =================================================== */

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

      if (!selectedIds.length) {
        return;
      }


      const confirmed =
        window.confirm(
          "Selected dispatch rows delete करें?"
        );


      if (!confirmed) {
        return;
      }


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
      }
    };


  /* =======================================================
     DELETE ALL
  ======================================================= */

  const handleDeleteAll = () => {

    const confirmed =
      window.confirm(
        "⚠️ ALL dispatch orders delete हो जाएंगे. Confirm?"
      );

    if (!confirmed) {
      return;
    }

    mutate();
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

        {/* -----------------------------------------------
            FROM
        ------------------------------------------------ */}

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


        {/* -----------------------------------------------
            TO
        ------------------------------------------------ */}

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


        {/* -----------------------------------------------
            APPLY
        ------------------------------------------------ */}

        <button
          type="button"
          onClick={() => {

            setAppliedFilters({
              from:
                tempFrom ||
                undefined,

              to:
                tempTo ||
                undefined,
            });

          }}
          className="rounded-lg bg-gray-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-black"
        >
          Apply
        </button>


        <div className="flex-1" />


        {/* -----------------------------------------------
            DOWNLOAD
        ------------------------------------------------ */}

        <button
          type="button"
          onClick={downloadDispatchExcel}
          className="rounded-lg bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700"
        >
          Download
        </button>


        {/* -----------------------------------------------
            HIDDEN FILE INPUT
        ------------------------------------------------ */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          hidden
          onChange={
            handleExcelUpload
          }
        />


        {/* -----------------------------------------------
            UPLOAD
        ------------------------------------------------ */}

        <button
          type="button"
          disabled={uploading}
          onClick={openFileSelector}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {uploading
            ? "Uploading..."
            : "Upload Excel"}

        </button>


        {/* -----------------------------------------------
            DELETE SELECTED
        ------------------------------------------------ */}

        <button
          type="button"
          disabled={
            !selectedIds.length
          }
          onClick={
            handleDeleteSelected
          }
          className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete Selected
        </button>


        {/* -----------------------------------------------
            DELETE ALL
        ------------------------------------------------ */}

        <button
          type="button"
          disabled={isPending}
          onClick={
            handleDeleteAll
          }
          className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
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

            </tr>

          </thead>


          <tbody>

            {/* -------------------------------------------
                LOADING
            -------------------------------------------- */}

            {isLoading ? (

              <tr>

                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-500"
                >
                  Loading...
                </td>

              </tr>

            ) : rows.length ? (

              /* -----------------------------------------
                 DATA
              ------------------------------------------ */

              rows.map(
                (row) => (

                  <tr
                    key={row.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="border-b p-2 text-center">

                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          row.id
                        )}
                        onChange={() =>
                          toggleRow(
                            row.id
                          )
                        }
                      />

                    </td>


                    <td className="border-b p-2">
                      {row.order_id ?? "-"}
                    </td>


                    <td className="border-b p-2">
                      {row.product ?? "-"}
                    </td>


                    <td className="border-b p-2 text-center font-medium">
                      {row.quantity ?? "-"}
                    </td>


                    <td className="border-b p-2 text-gray-500">

                      {row.order_packed_time
                        ? new Date(
                            row.order_packed_time
                          ).toLocaleString()
                        : "-"}

                    </td>

                  </tr>

                )
              )

            ) : (

              /* -----------------------------------------
                 EMPTY
              ------------------------------------------ */

              <tr>

                <td
                  colSpan={5}
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

            ? `Showing ${rows.length} filtered records`

            : `Showing ${rows.length} records`}

        </span>


        {isFetching &&
          !isLoading && (
            <span>
              Updating...
            </span>
          )}

      </div>


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