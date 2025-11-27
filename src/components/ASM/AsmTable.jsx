import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaKey } from "react-icons/fa";

export default function AsmTable({
  user,
  list,
  onEdit,
  onToggleStatus,
  onDelete,
  onChangePassword,
}) {
  return (
    <div className="overflow-x-auto mb-25">
      {/* Desktop Table */}
      <table className="hidden md:table w-full text-left border    min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-200 text-gray-900 text-sm font-semibold">
          <tr className="bg-gray-200">
            <th className="p-3 border">S.NO..</th>
            <th className="p-3 border">ID</th>
            {user?.role === "ADMIN" && (<th className="p-3 border">CRM</th>)}
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Mobile</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Password</th>
            <th className="p-3 border">Action</th>
            <th className="p-3 border">Edit</th>
           
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {list.map((item, index) => (
            <tr key={item.id} className="border-t">
              <td className="p-3 border text-center">{index + 1}</td>
              <td className="p-3 border">{item.user_id}</td>
              {user?.role === "ADMIN" && (<td className="p-3 border">{item.crm_name}</td>)}
              <td className="p-3 border">{item.name}</td>
              <td className="p-3 border">{item.email}</td>
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
              {user?.role === "CRM" && (<td className="p-3 border">

                <button onClick={() => onEdit(item)} className="cursor-pointer ms-3 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">
                  <FaEdit />
                </button>
                {/* <button onClick={() => onDelete(item.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">
                  <FaTrash />
                </button> */}
                

              </td>)}

            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden grid gap-4">
        {list.map((item) => (
          <div key={item.id} className="border p-4 rounded shadow-sm bg-white">
            <p><strong>ID:</strong> {item.user_id}</p>
            <p><strong>Name:</strong> {item.name}</p>
            <p><strong>Mobile:</strong> {item.mobile}</p>
            <p><strong>Status:</strong> {item.is_active ? "Active" : "Inactive"}</p>
            {user?.role === "ADMIN" && (<div className="flex gap-2 mt-2 flex-wrap">
              <button onClick={() => onEdit(item)} className="bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1">
                <FaEdit /> Edit
              </button>
              <button onClick={() => onDelete(item.id)} className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1">
                <FaTrash /> Delete
              </button>
              <button
                onClick={() => onToggleStatus(item.id, item.is_active)}
                className={`${item.is_active ? "bg-red-600" : "bg-green-600"} text-white px-3 py-1 rounded flex items-center gap-1`}
              >
                {item.is_active ? <FaToggleOff /> : <FaToggleOn />} {item.is_active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => onChangePassword(item)} className="bg-purple-600 text-white px-3 py-1 rounded flex items-center gap-1">
                <FaKey /> Password
              </button>
            </div>)}

          </div>
        ))}
      </div>
    </div>
  );
}
