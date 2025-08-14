import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaKey } from "react-icons/fa";

export default function UserTable({
  list,
  onEdit,
  onToggleStatus,
  onDelete,
  onChangePassword,
}) {
  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="hidden md:table w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Mobile</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2">{item.user_id}</td>
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.mobile}</td>
              <td className="p-2">{item.is_active ? "Active" : "Inactive"}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => onEdit(item)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded">
                  <FaEdit />
                </button>
                <button onClick={() => onDelete(item.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">
                  <FaTrash />
                </button>
                <button
                  onClick={() => onToggleStatus(item.id, item.is_active)}
                  className={`${item.is_active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white px-2 py-1 rounded`}
                >
                  {item.is_active ? <FaToggleOff /> : <FaToggleOn />}
                </button>
                <button onClick={() => onChangePassword(item)} className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded">
                  <FaKey />
                </button>
              </td>
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
            <div className="flex gap-2 mt-2 flex-wrap">
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
