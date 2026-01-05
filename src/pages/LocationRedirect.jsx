import { useEffect, useState } from "react";

const LocationRedirect = () => {
    const [status, setStatus] = useState("Waiting for permission...");

    // ===============================
    // CONFIGURATION
    // ===============================
    const formBaseURL =
        "https://docs.google.com/forms/d/e/1FAIpQLSeHolSKu47kuTkecLNLFhEedhm-oys-ERj7p6Y1j5RsHM4XNw/viewform";

    const latEntryID = "1131391592";
    const longEntryID = "1142733076";
    // ===============================

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setStatus("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            redirectToForm,
            showError
        );
    };

    const redirectToForm = (position) => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;

        const finalURL = `${formBaseURL}?usp=pp_url&entry.${latEntryID}=${lat}&entry.${longEntryID}=${long}`;

        window.location.href = finalURL;
    };

    const showError = (error) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setStatus(
                    "User denied the request for Geolocation. Please refresh and allow location."
                );
                break;
            case error.POSITION_UNAVAILABLE:
                setStatus("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                setStatus("The request to get user location timed out.");
                break;
            default:
                setStatus("An unknown error occurred.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen font-sans text-center">
            <h2 className="text-xl font-semibold mb-2">
                Please Allow Location Access
            </h2>
            <p className="text-gray-600 mb-4">
                We need your location to proceed to the form.
            </p>

            {/* Loader */}
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>

            <p className="text-sm text-gray-700">{status}</p>
        </div>
    );
};

export default LocationRedirect;
