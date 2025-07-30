// components/UserTable.jsx

import React from "react";

export default function UserTable({
  list,
  onEdit,
  onToggleStatus,
  columns,
  idKey = "id",
  userIdKey = "user_id",
  isActiveKey = "is_active",
}) {
  return (
    <table className="w-full text-left border max-w-5xl">
      <thead>
        <tr className="bg-gray-100">
          {columns.map(({ label, key }) => (
            <th key={key} className="p-2">
              {label}
            </th>
          ))}
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {list.map((item) => (
          <tr key={item[idKey]} className="border-t">
            {columns.map(({ key }) => (
              <td key={key} className="p-2">
                {item[key] ?? "-"}
              </td>
            ))}
            <td className="p-2 flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="bg-yellow-500 text-white px-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleStatus(item[idKey], item[isActiveKey])}
                className={`px-2 rounded text-white ${
                  item[isActiveKey] ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {item[isActiveKey] ? "Deactivate" : "Activate"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
