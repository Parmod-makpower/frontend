// components/SSSearchInput.jsx
import { useState } from "react";

export default function SSSearchInput({
  ssList = [],
  value = "",
  onSelect = () => {},
  label = "Select Super Stockist",
}) {
  const [search, setSearch] = useState(value);
  const [show, setShow] = useState(false);

  const filtered = ssList.filter((ss) =>
    ss.party_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-sm font-semibold mb-1">{label}</label>

      <input
        type="text"
        value={search}
        placeholder="Search Super Stockist..."
        onChange={(e) => {
          setSearch(e.target.value);
          setShow(true);
        }}
        autoComplete="off"
        className="border rounded-md px-3 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {show && search.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto z-50">
          {filtered.length > 0 ? (
            filtered.map((ss) => (
              <div
                key={ss.id}
                className="px-3 py-2 cursor-pointer hover:bg-blue-50"
                onClick={() => {
                  setSearch(ss.party_name);
                  onSelect(ss);
                  setShow(false);
                }}
              >
                {ss.party_name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">No match found</div>
          )}
        </div>
      )}
    </div>
  );
}
