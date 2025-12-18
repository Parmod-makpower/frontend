const STORAGE_KEY = "crm_order_filter_status";

export default function CRMOrderListFilterMenu({ filterStatus, setFilterStatus }) {

  const handleChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  return (
    <div>
      <select
        value={filterStatus}
        onChange={handleChange}
        className="
          w-full p-1 border rounded text-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
        "
      >
        <option value="PENDING">⏳ Pending</option>
        <option value="HOLD">⏸️ Hold</option>
        <option value="REJECTED">❌ Rejected</option>
      </select>
    </div>
  );
}
