import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRScanPage() {
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setQrData(decodedText);
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <h2>QR Code Scanner</h2>

      {/* Scanner */}
      <div
        id="qr-reader"
        style={{ width: 300, marginTop: 20 }}
      />

      {/* Result */}
      <div
        style={{
          marginTop: 30,
          padding: 15,
          border: "1px solid #ccc",
          borderRadius: 8,
          width: 350,
          textAlign: "center",
          wordBreak: "break-word",
          background: "#f9f9f9",
        }}
      >
        <h4>Scanned Data</h4>
        {qrData ? (
          <p>{qrData}</p>
        ) : (
          <p style={{ color: "#999" }}>Abhi koi QR scan nahi hua</p>
        )}
      </div>
    </div>
  );
}
