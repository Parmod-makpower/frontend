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

    if (android) {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowAndroidButton(true);
      });
    }
  }, []);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("PWA installed");
      } else {
        console.log("PWA dismissed");
      }
      setDeferredPrompt(null);
      setShowAndroidButton(false);
    }
  };

  const handleIOSInstall = () => {
    alert(
      "iPhone में ऐप install करने के लिए:\n\n1. Safari में ऊपर या नीचे Share बटन दबाएं\n2. 'Add to Home Screen' चुनें\n3. फिर 'Add' दबाएं"
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
          Install on Android
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

       <button
          onClick={handleAndroidInstall}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          <FaAndroid className="text-xl" />
          Install on Android1
        </button>
    </div>
  );
}
