// components/VisitorCheckIn.js
import React, { useState } from "react";
import QRScanner from "./QRScanner";

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("signin_after");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors on new submission

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

      // Check for successful response
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send request to Zapier. Status: ${res.status}, Details: ${errorText}`);
      }

      const data = await res.json();
      
      // Check if the response status is "success"
      if (data.status === "success") {
        setResponse({ status: "Request to Zapier was successful." });
        setError(null);
      } else {
        setResponse(null);
        throw new Error("Unexpected response from Zapier.");
      }
    } catch (err) {
      setError(err.message);  // Display detailed error message
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
          <p>{response.status}</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default VisitorCheckIn;
