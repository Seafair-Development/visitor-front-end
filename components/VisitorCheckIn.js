// components/VisitorCheckIn.js
import React, { useState } from "react";
import QRScanner from "./QRScanner";

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("signin_after");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setResponse(null);
    setLoading(true); // Set loading state to true while submitting

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
        const errorText = await res.text();
        throw new Error(`Failed to send request to Zapier. Status: ${res.status}, Details: ${errorText}`);
      }

      const data = await res.json();

      if (data.status === "success") {
        setResponse({ status: "Request to Zapier was successful." });
        setError(null);
      } else {
        throw new Error("Unexpected response from Zapier.");
      }
    } catch (err) {
      console.error("Fetch error:", err); // Log error for debugging
      setError(err.message); // Display the error message to the user
    } finally {
      setLoading(false); // Reset loading state after completion
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Visitor ID:
          <input
            type="text"
            value={visitorId}
            onChange={(e) => setVisitorId(e.target.value)}
            required
          />
        </label>
        <label>
          Event Type:
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            <option value="signin_after">Check-In</option>
            <option value="signout_after">Check-Out</option>
          </select>
        </label>
        <button type="submit">{loading ? "Scanning..." : "Submit"}</button>
      </form>
      <QRScanner setVisitorId={setVisitorId} />

      {response && (
        <div>
          <p>{response.status}</p>
        </div>
      )}
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default VisitorCheckIn;
