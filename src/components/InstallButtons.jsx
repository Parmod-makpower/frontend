import { useEffect, useState } from "react";
import { FaAndroid, FaApple } from "react-icons/fa";

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent.toLowerCase());
}

function isAndroid() {
  return /android/i.test(window.navigator.userAgent.toLowerCase());
}

export default function InstallButtons() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidButton, setShowAndroidButton] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    const iOS = isIOS();
    const android = isAndroid();
    setIsIOSDevice(iOS);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidButton(true);
    };

    if (android) {
      window.addEventListener("beforeinstallprompt", handler);
    }

    // cleanup to avoid multiple listeners
    return () => {
      if (android) {
        window.removeEventListener("beforeinstallprompt", handler);
      }
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        alert("✅ App successfully installed!");
      } else {
        alert("❌ Installation cancelled.");
      }

      setDeferredPrompt(null);
      setShowAndroidButton(false);
    }
  };

  const handleIOSInstall = () => {
    alert(
      "📱 To install the app on iPhone:\n\n1. In Safari, tap the Share button (top or bottom)\n2. Select 'Add to Home Screen'\n3. Confirm installation"
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
      {showAndroidButton && (
        <button
          onClick={handleAndroidInstall}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          <FaAndroid className="text-xl" />
          Install on Android.
        </button>
      )}

      {isIOSDevice && (
        <button
          onClick={handleIOSInstall}
          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-900 transition"
        >
          <FaApple className="text-xl" />
          Install on iPhone
        </button>
      )}
    </div>
  );
}
