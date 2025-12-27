import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  usePassportLookup,
  useCouponSubmit,
} from "../hooks/other/usePassport";

export default function QRScanPage() {
  const [passportNumber, setPassportNumber] = useState("");
  const [coupon, setCoupon] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const qrRef = useRef(null);

  useEffect(() => {
    qrRef.current = new Html5Qrcode("qr-reader");
  }, []);

  const startScan = async () => {
    setIsScanning(true);

    await qrRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        setPassportNumber(decodedText.trim());

        qrRef.current.stop().then(() => {
          setIsScanning(false);
        });
      }
    );
  };

  const { data, isError, isLoading } =
    usePassportLookup(passportNumber);

  const couponMutation = useCouponSubmit();

  const submitCoupon = () => {
    couponMutation.mutate({
      passport_number: passportNumber,
      coupon_number: coupon,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          padding: 20,
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          QR Verification
        </h2>

        {/* Scan Button */}
        {!isScanning && (
          <button
            onClick={startScan}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Scan QR Code
          </button>
        )}

        {/* Camera */}
        <div
          id="qr-reader"
          style={{
            width: "100%",
            marginTop: 16,
            display: isScanning ? "block" : "none",
          }}
        />

        {/* Loading */}
        {isLoading && (
          <p style={{ marginTop: 16, color: "#555" }}>
            Verifying passport...
          </p>
        )}

        {/* Error */}
        {isError && (
          <p style={{ marginTop: 16, color: "red" }}>
            Passport not found
          </p>
        )}

        {/* User Info + Coupon */}
        {data && (
          <div
            style={{
              marginTop: 20,
              background: "#f9fafb",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <b>Name:</b>
              <div>{data.user_name}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <b>Passport No:</b>
              <div>{data.passport_number}</div>
            </div>

            <input
              placeholder="Enter Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 12,
              }}
            />

            <button
              onClick={submitCoupon}
              disabled={couponMutation.isLoading}
              style={{
                width: "100%",
                padding: "10px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Submit Coupon
            </button>

            {couponMutation.isSuccess && (
              <p
                style={{
                  marginTop: 10,
                  color: "green",
                  textAlign: "center",
                }}
              >
                Coupon saved successfully ✅
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
