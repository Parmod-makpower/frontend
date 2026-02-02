import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaKey } from "react-icons/fa";

export default function UserTable({
  user,
  list,
  onEdit,
  onToggleStatus,
  onDelete,
  onChangePassword,
  onChangeStock,
}) {
  return (
    <div className="overflow-x-auto mb-25">
      {/* Desktop Table */}
      <table className="hidden md:table w-full text-left border min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-200 text-gray-900 text-sm font-semibold text-sm text-center">
          <tr className="bg-gray-200">
            <th className="p-3 border">S.NO</th>
            <th className="p-3 border">Role</th>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">CRM</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Party Name</th>
            <th className="p-3 border">Created_By</th>
            <th className="p-3 border">Mobile</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Wharehouse</th>
            <th className="p-3 border">Action</th>
            <th className="p-3 border">Action</th>
            {(user?.role === "ADMIN" && <th className="p-3 border">Update</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-xs text-center">
          {list.map((item, index) => (
            <tr key={item.id} className="border-t">
              <td className="p-3 border text-center">{index + 1}</td>
              <td className="p-3 border">{item.role}</td>
              <td className="p-3 border bg-gray-200">{item.user_id}</td>
              <td className="p-3 border">{item.crm_name}</td>
              <td className="p-3 border">{item.name}</td>
              <td className="p-3 border bg-yellow-100">{item.party_name}</td>
              <td className="p-3 border">{item.created_by}</td>
              <td className="p-3 border">{item.mobile}</td>
              <td className="p-3 border text-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${item.is_active
                    ? "bg-green-100 text-green-700 border border-green-400"
                    : "bg-red-100 text-red-700 border border-red-400"
                    }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-3 border text-center">
  {user?.role === "ADMIN" || user?.role === "CRM" ? (
    <select
      value={item.stock_location}
      onChange={(e) =>
        onChangeStock(item.id, e.target.value)
      }
      className="
        border px-2 py-1 rounded text-xs
        bg-white cursor-pointer
        focus:outline-none focus:ring-1 focus:ring-blue-500
      "
    >
      <option value="DELHI">Delhi</option>
      <option value="MUMBAI">Mumbai</option>
    </select>
  ) : (
    <span className="font-medium text-gray-700">
      {item.stock_location}
    </span>
  )}
</td>


              <td className="p-3 border">
                <button onClick={() => onChangePassword(item)} className="cursor-pointer  bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded ms-3">
                  <FaKey />
                </button>
              </td>

              <td className="p-3 border">
                <button
                  onClick={() => onToggleStatus(item.id, item.is_active)}
                  className={`cursor-pointer ms-3 ${item.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white px-2 py-1 rounded`}
                >
                  {item.is_active ? <FaToggleOff /> : <FaToggleOn />}
                </button>

              </td>
                {!(user?.role === "CRM" && item.role === "SS") && (
              <td className="p-3 border">
                  <button onClick={() => onEdit(item)} className="cursor-pointer ms-3 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">
                    <FaEdit />
                  </button>
              </td>
                )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden grid gap-3">
        {list.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-3 bg-white shadow-sm"
          >
            {/* Top Row */}
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-800">{item.user_id}</span>
              </p>

              <span
                className={`text-[11px] px-2 py-[2px] rounded-full font-medium
            ${item.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {item.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Details */}
            <p className="text-xs font-semibold text-gray-900 truncate">
              {item.party_name}
            </p>
            <p className="text-xs text-gray-600">
              {item.name}
            </p>
            <p className="text-xs text-gray-600">
               {item.mobile}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {!(user?.role === "CRM" && item.role === "SS") && (
                <button
                  onClick={() => onEdit(item)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  <FaEdit className="text-xs" />
                  Edit
                </button>
              )}
              <button
                onClick={() => onDelete(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <FaTrash className="text-xs" />
                Delete
              </button>

              <button
                onClick={() => onToggleStatus(item.id, item.is_active)}
                className={`${item.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                  } text-white text-xs px-2 py-1 rounded flex items-center gap-1`}
              >
                {item.is_active ? (
                  <FaToggleOff className="text-xs" />
                ) : (
                  <FaToggleOn className="text-xs" />
                )}
                {item.is_active ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => onChangePassword(item)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <FaKey className="text-xs" />
                Pass
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
