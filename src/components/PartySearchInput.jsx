import { useState, useRef, useEffect } from "react";
import { useCachedSSUsers } from "../auth/useSS";

export default function PartySearchInput({
  value,
  setValue,
  onSelect,
  placeholder = "Search party..."
}) {
  const { data: users = [] } = useCachedSSUsers();

  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef(null);

  const filteredUsers = users.filter((u) =>
    u.party_name?.toLowerCase().includes(value.toLowerCase())
  );

  const handleSelect = (user) => {
    setValue(user.party_name);
    setIsOpen(false);
    onSelect?.(user);
  };

  // ⌨️ keyboard support
  const handleKeyDown = (e) => {
    if (!isOpen || !filteredUsers.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredUsers.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredUsers.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filteredUsers[highlightIndex]);
    }
  };

  // click outside close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setIsOpen(true);
          setHighlightIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border px-2 py-1 text-sm rounded"
      />

      {isOpen && value && (
        <div className="absolute z-50 bg-white border shadow w-full max-h-40 overflow-y-auto">
          {filteredUsers.length ? (
            filteredUsers.map((user, i) => (
              <div
                key={user.id}
                onClick={() => handleSelect(user)}
                className={`px-2 py-1 cursor-pointer text-sm ${
                  i === highlightIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {user.party_name}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-400 text-sm">
              No results
            </div>
          )}
        </div>
      )}
    </div>
  );
}