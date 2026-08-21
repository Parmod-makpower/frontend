import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import toast from "react-hot-toast";

import {
  FaSyncAlt,
  FaTimes,
  FaRocket,
} from "react-icons/fa";

export default function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,

      onNeedRefresh() {
        setShowUpdate(true);
      },

      onOfflineReady() {
        console.log("PWA ready for offline use.");
      },

      onRegisteredSW(swUrl, registration) {
        console.log(
          "Service Worker registered:",
          swUrl
        );

        if (!registration) return;

        // Check for new version periodically
        const interval = setInterval(() => {
          registration.update();
        }, 60 * 1000);

        return () => clearInterval(interval);
      },

      onRegisterError(error) {
        console.error(
          "Service Worker registration error:",
          error
        );
      },
    });

    window.__updateSW = updateSW;

    return () => {
      delete window.__updateSW;
    };
  }, []);

  const handleUpdate = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      /*
       * ==========================================
       * 1. Clear React Query memory cache
       * ==========================================
       */

      if (window.__queryClient) {
        window.__queryClient.clear();
      }

      /*
       * ==========================================
       * 2. Remove persisted React Query cache
       * ==========================================
       */

      try {
        localStorage.removeItem(
          "REACT_QUERY_OFFLINE_CACHE"
        );
      } catch (error) {
        console.warn(
          "React Query cache clear failed:",
          error
        );
      }

      /*
       * ==========================================
       * 3. Clear browser Cache Storage
       * ==========================================
       */

      if ("caches" in window) {
        const cacheNames =
          await caches.keys();

        await Promise.all(
          cacheNames.map((cacheName) =>
            caches.delete(cacheName)
          )
        );
      }

      /*
       * ==========================================
       * 4. Tell Service Worker to update
       * ==========================================
       */

      if (window.__updateSW) {
        await window.__updateSW(true);

        return;
      }

      /*
       * ==========================================
       * 5. Fallback hard reload
       * ==========================================
       */

      window.location.reload();
    } catch (error) {
      console.error(
        "Application update failed:",
        error
      );

      window.location.reload();
    }
  };

  const handleClose = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <>
      {/* =========================================
          MOBILE / DESKTOP UPDATE CARD
      ========================================= */}

      <div
        className="
          fixed
          z-[99999]

          left-3
          right-3
          bottom-4

          sm:left-auto
          sm:right-5
          sm:bottom-5

          sm:w-[390px]

          bg-white
          border
          border-slate-200

          rounded-2xl

          shadow-[0_15px_50px_rgba(0,0,0,0.18)]

          overflow-hidden

          animate-[slideUp_0.25s_ease-out]
        "
      >

        {/* TOP COLOR BAR */}

        <div
          className="
            h-1
            bg-gradient-to-r
            from-blue-600
            via-indigo-600
            to-purple-600
          "
        />

        <div className="p-4">

          {/* HEADER */}

          <div className="flex items-start gap-3">

            {/* ICON */}

            <div
              className="
                flex-shrink-0

                w-11
                h-11

                rounded-xl

                bg-gradient-to-br
                from-blue-50
                to-indigo-100

                text-indigo-600

                flex
                items-center
                justify-center
              "
            >
              <FaRocket className="text-lg" />
            </div>

            {/* TEXT */}

            <div className="flex-1 min-w-0">

              <div className="flex items-center justify-between">

                <h3
                  className="
                    text-sm
                    sm:text-base
                    font-bold
                    text-slate-800
                  "
                >
                  New Version Available
                </h3>

                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    w-7
                    h-7
                    rounded-full

                    flex
                    items-center
                    justify-center

                    text-slate-400
                    hover:text-slate-600
                    hover:bg-slate-100

                    transition
                  "
                >
                  <FaTimes className="text-xs" />
                </button>

              </div>

              <p
                className="
                  text-[11px]
                  sm:text-xs

                  text-slate-500

                  mt-1
                  leading-relaxed
                "
              >
                A new version of Makpower is
                available. Update now to see
                the latest changes.
              </p>

            </div>

          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-2

              mt-4
            "
          >

            {/* LATER */}

            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="
                flex-1

                py-2.5

                rounded-xl

                border
                border-slate-200

                bg-white

                text-slate-600

                text-xs
                sm:text-sm

                font-semibold

                hover:bg-slate-50

                transition
              "
            >
              Later
            </button>

            {/* UPDATE */}

            <button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="
                flex-[1.5]

                py-2.5

                rounded-xl

                bg-gradient-to-r
                from-blue-600
                to-indigo-600

                text-white

                text-xs
                sm:text-sm

                font-bold

                flex
                items-center
                justify-center
                gap-2

                shadow-sm

                hover:from-blue-700
                hover:to-indigo-700

                disabled:opacity-60
                disabled:cursor-not-allowed

                active:scale-[0.98]

                transition
              "
            >

              {isUpdating ? (
                <>
                  <FaSyncAlt
                    className="animate-spin"
                  />

                  Updating...
                </>
              ) : (
                <>
                  <FaSyncAlt />

                  Update Now
                </>
              )}

            </button>

          </div>

        </div>
      </div>
    </>
  );
}