// components/VisitorCheckIn.js
import React, { useState } from "react";
import QRScanner from "./QRScanner";

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("signin_after");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null); // Error state for Zapier request

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Reset error before new request

    try {
      const res = await fetch("https://hooks.zapier.com/hooks/catch/13907609/2m737mn/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          visitor_information_visitor_id: visitorId,
          event_information_event_type: eventType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error processing the request to Zapier.");
      
      setResponse(data);  // Success response
    } catch (err) {
      setError(err.message || "Failed to send the request to Zapier. Please try again.");  // Display error message
      setResponse(null);
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
        <button type="submit">Submit</button>
      </form>
      <QRScanner setVisitorId={setVisitorId} />
      
      {response && (
        <div>
          <p>Status: {response.status}</p>
          <p>Full Name: {response.fullName}</p>
          {response.imageUrl && <img src={response.imageUrl} alt="Visitor" style={{ width: '100px' }} />}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default VisitorCheckIn;
