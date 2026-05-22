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
      <table className=" md:table w-full text-left border min-w-full text-xs text-left text-gray-700">
        <thead className="bg-gray-200 text-gray-900 text-sm font-semibold text-xs text-center">
          <tr className="bg-gray-200">
            <th className="p-2 border">#</th>
            <th className="p-2 border">ID</th>
            {user?.role === "ADMIN" && (<th className="p-2 border">CRM</th>)}
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Party Name</th>
            {user?.role === "ADMIN" && (<th className="p-2 border">Created_By</th>)}
            <th className="p-2 border">Mobile</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Wharehouse</th>
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Action</th>
            {(user?.role === "ADMIN" && <th className="p-2 border">Update</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-xs text-center">
          {list.map((item, index) => (
            <tr key={item.id} className="border-t">
              <td className="p-2 border text-center">{index + 1}</td>
              <td className="p-2 border bg-gray-200 font-bold">{item.user_id}</td>
              {user?.role === "ADMIN" && (<td className="p-2 border">{item.crm_name}</td>)}
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border bg-yellow-100">{item.party_name}</td>
              {user?.role === "ADMIN" && (<td className="p-2 border">{item.created_by}</td>)}
              <td className="p-2 border">{item.mobile}</td>
              <td className="p-2 border text-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${item.is_active
                    ? "bg-green-100 text-green-700 border border-green-400"
                    : "bg-red-100 text-red-700 border border-red-400"
                    }`}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-2 border text-center">
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


              <td className="p-2 border">
                <button onClick={() => onChangePassword(item)} className="cursor-pointer  bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded ms-3">
                  <FaKey />
                </button>
              </td>

              <td className="p-2 border">
                <button
                  onClick={() => onToggleStatus(item.id, item.is_active)}
                  className={`cursor-pointer ms-3 ${item.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white px-2 py-1 rounded`}
                >
                  {item.is_active ? <FaToggleOff /> : <FaToggleOn />}
                </button>

              </td>
              {!(user?.role === "CRM" && item.role === "SS") && (
                <td className="p-2 border">
                  <button onClick={() => onEdit(item)} className="cursor-pointer ms-3 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">
                    <FaEdit />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

     

    </div>
  );
}
