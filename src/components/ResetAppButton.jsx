import React from "react";

const ResetAppButton = () => {
  const handleReset = async () => {
    // 1. Service Workers unregister
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let reg of registrations) {
        await reg.unregister();
      }
    }

    // 2. Clear Caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      for (let name of cacheNames) {
        await caches.delete(name);
      }
    }

    // 3. Reload the page
    window.location.reload(true);
  };

  return (
    <button
      onClick={handleReset}
      className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
    >
      🔄 Reset App
    </button>
  );
};

export default ResetAppButton;
