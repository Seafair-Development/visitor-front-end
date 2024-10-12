// components/VisitorCheckIn.js
import React, { useState } from "react";
import QRScanner from "./QRScanner";
import ZapierResponse from "./ZapierResponse";

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("signin_after");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitted(false);

    try {
      const res = await fetch("/api/proxyToZapier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          visitor_information_visitor_id: visitorId,
          event_information_event_type: eventType
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to send request to Zapier. Status: ${res.status}`);
      }

      const data = await res.json();

      if (data.status === "success") {
        setIsSubmitted(true);
      } else {
        throw new Error("Unexpected response from Zapier.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    }
  };

  const handleDataReceived = (data) => {
    // Handle the received data, e.g., update UI or state
    console.log("Data received from Zapier:", data);
    // You might want to do something with this data
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* ... form fields ... */}
        <button type="submit">Submit</button>
      </form>
      <QRScanner setVisitorId={setVisitorId} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ZapierResponse 
        isSubmitted={isSubmitted} 
        onDataReceived={handleDataReceived}
      />
    </div>
  );
};

export default VisitorCheckIn;