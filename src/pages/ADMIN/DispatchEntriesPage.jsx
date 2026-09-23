import { useState } from "react";

import {
  useDispatchOrdersList,
  uploadDispatchExcel,
  downloadDispatchExcel,
} from "../../hooks/useDispatchOrders";

import {
  useDeleteAllDispatchOrders,
  deleteSelectedDispatchOrders,
} from "../../hooks/useDispatchOrders";

import { useQueryClient } from "@tanstack/react-query";

export default function DispatchEntriesPage() {
  const [tempFrom, setTempFrom] = useState("");
  const [tempTo, setTempTo] = useState("");

  const [uploading, setUploading] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    from: undefined,
    to: undefined,
  });

  const [selectedIds, setSelectedIds] = useState([]);

  const {
    data,
    isLoading,
  } = useDispatchOrdersList(appliedFilters);

  const {
    mutate,
    isPending,
  } = useDeleteAllDispatchOrders();

  const queryClient = useQueryClient();

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="mx-auto p-5 text-sm">

      {/* FILTER + ACTIONS */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded border bg-gray-50 p-3">

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            From
          </label>

          <input
            type="date"
            value={tempFrom}
            onChange={(e) =>
              setTempFrom(e.target.value)
            }
            className="rounded border px-2 py-1 text-xs"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            To
          </label>

          <input
            type="date"
            value={tempTo}
            onChange={(e) =>
              setTempTo(e.target.value)
            }
            className="rounded border px-2 py-1 text-xs"
          />
        </div>

        <button
          onClick={() => {
            setAppliedFilters({
              from:
                tempFrom || undefined,
              to:
                tempTo || undefined,
            });
          }}
          className="rounded bg-gray-800 px-4 py-1.5 text-xs text-white hover:bg-black"
        >
          Apply
        </button>

        <div className="flex-1" />

        {/* DOWNLOAD */}
        <button
          onClick={downloadDispatchExcel}
          className="rounded bg-green-600 px-4 py-1.5 text-xs text-white"
        >
          Download
        </button>

        {/* =====================================================
            EXCEL UPLOAD
        ====================================================== */}
        <input
          type="file"
          accept=".xlsx"
          hidden
          id="excelUpload"
          onChange={async (e) => {
            const file =
              e.target.files?.[0];

            // Allow same file to be selected again
            e.target.value = "";

            if (!file) return;

            setUploading(true);

            try {
              const res =
                await uploadDispatchExcel(
                  file
                );

              const created = Number(
                res?.created || 0
              );

              const failed = Number(
                res?.failed || 0
              );

              const totalRows = Number(
                res?.total_rows ||
                  created + failed
              );

              const blankRows = Number(
                res?.blank_rows || 0
              );

              // ------------------------------------------------
              // SUCCESS MESSAGE
              // ------------------------------------------------
              let message =
                `📦 DISPATCH EXCEL UPLOAD\n\n` +
                `Total Rows: ${totalRows}\n` +
                `✅ Uploaded: ${created}\n` +
                `❌ Failed: ${failed}`;

              if (blankRows > 0) {
                message +=
                  `\n⬜ Blank Rows: ${blankRows}`;
              }

              // ------------------------------------------------
              // FAILED ROWS
              // ------------------------------------------------
              if (
                Array.isArray(
                  res?.errors
                ) &&
                res.errors.length
              ) {
                message +=
                  `\n\n❌ ENTRIES NOT UPLOADED:\n\n`;

                message +=
                  res.errors.join("\n");
              }

              alert(message);

              // ------------------------------------------------
              // REFRESH TABLE
              // ------------------------------------------------
              queryClient.invalidateQueries(
                {
                  queryKey: [
                    "dispatchOrders",
                  ],
                }
              );

            } catch (err) {
              console.error(
                "Dispatch Excel Upload Error:",
                err
              );

              const backendMessage =
                err?.response?.data
                  ?.message ||
                err?.response?.data
                  ?.error ||
                err?.message ||
                "Upload failed";

              alert(
                `❌ Upload Failed\n\n${backendMessage}`
              );

            } finally {
              setUploading(false);
            }
          }}
        />

        {/* UPLOAD BUTTON */}
        <button
          disabled={uploading}
          onClick={() =>
            document
              .getElementById(
                "excelUpload"
              )
              ?.click()
          }
          className="rounded bg-blue-600 px-4 py-1.5 text-xs text-white disabled:opacity-50"
        >
          {uploading
            ? "Uploading..."
            : "Upload"}
        </button>

        {/* DELETE SELECTED */}
        <button
          disabled={!selectedIds.length}
          onClick={async () => {
            if (
              window.confirm(
                "Selected rows delete करें?"
              )
            ) {
              await deleteSelectedDispatchOrders(
                selectedIds
              );

              setSelectedIds([]);

              queryClient.invalidateQueries(
                {
                  queryKey: [
                    "dispatchOrders",
                  ],
                }
              );
            }
          }}
          className="rounded bg-red-500 px-4 py-1.5 text-xs text-white disabled:opacity-50"
        >
          Delete Selected
        </button>

        {/* DELETE ALL */}
        <button
          disabled={isPending}
          onClick={() => {
            if (
              window.confirm(
                "⚠️ ALL dispatch orders delete हो जाएंगे. Confirm?"
              )
            ) {
              mutate();
            }
          }}
          className="rounded bg-red-600 px-4 py-1.5 text-xs text-white disabled:opacity-50"
        >
          Delete All
        </button>
      </div>

      {/* =======================================================
          TABLE
      ======================================================== */}
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-xs">

          <thead className="bg-gray-100 text-gray-700">
            <tr>

              <th className="border p-2">
                <input
                  type="checkbox"
                  checked={
                    data?.length > 0 &&
                    selectedIds.length ===
                      data.length
                  }
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked
                        ? data.map(
                            (d) => d.id
                          )
                        : []
                    )
                  }
                />
              </th>

              <th className="border p-2">
                Order ID
              </th>

              <th className="border p-2">
                Product
              </th>

              <th className="border p-2">
                Qty
              </th>

              <th className="border p-2">
                Packed Time
              </th>

            </tr>
          </thead>

          <tbody>

            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center"
                >
                  Loading...
                </td>
              </tr>

            ) : data?.length ? (

              data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50"
                >

                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(
                        row.id
                      )}
                      onChange={() =>
                        toggleRow(row.id)
                      }
                    />
                  </td>

                  <td className="border p-2">
                    {row.order_id}
                  </td>

                  <td className="border p-2">
                    {row.product}
                  </td>

                  <td className="border p-2 text-center">
                    {row.quantity}
                  </td>

                  <td className="border p-2 text-gray-500">
                    {row.order_packed_time
                      ? new Date(
                          row.order_packed_time
                        ).toLocaleString()
                      : "-"}
                  </td>

                </tr>
              ))

            ) : (

              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-gray-500"
                >
                  No records found
                </td>
              </tr>

            )}

          </tbody>

        </table>
      </div>

      {/* FOOTER */}
      <p className="mt-2 text-[11px] text-gray-400">
        {appliedFilters.from ||
        appliedFilters.to
          ? `Showing ${
              data?.length || 0
            } filtered records`
          : "Showing latest 10 records"}
      </p>

    </div>
  );
}