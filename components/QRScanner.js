import React, { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const QRScanner = ({ setVisitorId }) => {
  const [scanning, setScanning] = useState(false);

  const startScanner = () => {
    setScanning(true);
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(
      (decodedText) => {
        setVisitorId(decodedText);
        scanner.clear();
        setScanning(false);
      },
      (error) => {
        console.warn("QR scan error:", error);
      }
    );
  };

  return (
    <div>
      <button onClick={startScanner} disabled={scanning}>
        {scanning ? "Scanning..." : "Scan QR Code"}
      </button>
      {scanning && <div id="qr-reader" style={{ width: "100%" }} />}
    </div>
  );
};

export default QRScanner;