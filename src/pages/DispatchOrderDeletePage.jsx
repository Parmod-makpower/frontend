import { useState } from "react";
import {
  useDispatchOrdersList,
  uploadDispatchExcel,
  downloadDispatchExcel,
} from "../hooks/useDispatchOrders";
import { useDeleteAllDispatchOrders, deleteSelectedDispatchOrders } from "../hooks/useDispatchOrders";
import { useQueryClient } from "@tanstack/react-query";

export default function DispatchOrderDeletePage() {
  const [tempFrom, setTempFrom] = useState("");
const [tempTo, setTempTo] = useState("");

const [appliedFilters, setAppliedFilters] = useState({
  from: undefined,
  to: undefined,
});

  const [selectedIds, setSelectedIds] = useState([]);


  const { data, isLoading } = useDispatchOrdersList(appliedFilters);


  const { mutate, isPending } = useDeleteAllDispatchOrders();
  const queryClient = useQueryClient();
  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };


  return (
    <div className=" mx-auto p-5 text-sm">

      {/* HEADER */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Dispatch Orders Management
      </h2>

      {/* FILTER + ACTIONS */}
      <div className="flex flex-wrap items-end gap-3 mb-4 bg-gray-50 p-3 rounded border">

        <div>
          <label className="block text-xs text-gray-600 mb-1">From</label>
         <input
  type="date"
  value={tempFrom}
  onChange={(e) => setTempFrom(e.target.value)}
  className="border rounded px-2 py-1 text-xs"
/>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">To</label>
      <input
  type="date"
  value={tempTo}
  onChange={(e) => setTempTo(e.target.value)}
  className="border rounded px-2 py-1 text-xs"
/>
        </div>
<button
  onClick={() => {
    setAppliedFilters({
      from: tempFrom || undefined,
      to: tempTo || undefined,
    });
  }}
  className="bg-gray-800 text-white px-4 py-1.5 rounded text-xs hover:bg-black"
>
  Apply
</button>


        <div className="flex-1" />

        <button
          onClick={downloadDispatchExcel}
          className="bg-green-600 text-white px-4 py-1.5 rounded text-xs"
        >
          Download
        </button>

        <input
          type="file"
          accept=".xlsx"
          hidden
          id="excelUpload"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const res = await uploadDispatchExcel(file);
            alert(`${res.created} rows uploaded`);
            queryClient.invalidateQueries(["dispatchOrders"]);
          }}
        />

        <button
          onClick={() => document.getElementById("excelUpload").click()}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs"
        >
          Upload
        </button>
<button
  disabled={!selectedIds.length}
  onClick={async () => {
    if (window.confirm("Selected rows delete करें?")) {
      await deleteSelectedDispatchOrders(selectedIds);
      setSelectedIds([]);
      queryClient.invalidateQueries(["dispatchOrders"]);
    }
  }}
  className="bg-red-500 text-white px-4 py-1.5 rounded text-xs disabled:opacity-50"
>
  Delete Selected
</button>

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
          className="bg-red-600 text-white px-4 py-1.5 rounded text-xs disabled:opacity-50"
        >
          Delete All
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked ? data.map((d) => d.id) : []
                    )
                  }
                />
              </th>

              <th className="p-2 border">Order ID</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Packed Time</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : data?.length ? (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td className="p-2 border">{row.order_id}</td>
                  <td className="p-2 border">{row.product}</td>
                  <td className="p-2 border text-center">{row.quantity}</td>
                  <td className="p-2 border text-gray-500">
                    {new Date(row.order_packed_time).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     <p className="mt-2 text-[11px] text-gray-400">
  {appliedFilters.from || appliedFilters.to
    ? `Showing ${data?.length || 0} filtered records`
    : "Showing latest 10 records"}
</p>


    </div>
  );
}
