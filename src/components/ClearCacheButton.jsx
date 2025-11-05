import React from "react";

const ClearCacheButton = () => {
  const handleClearCache = () => {
    // ✅ Clear browser caches
    if ('caches' in window) {
      caches.keys().then(names => {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }

    // ✅ Clear local storage + session storage
    localStorage.clear();
    sessionStorage.clear();

    // ✅ Reload app
    window.location.reload(true);
  };

  return (
    <button
      onClick={handleClearCache}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
    >
      🔄 Refresh App Cache
    </button>
  );
};

export default ClearCacheButton;
