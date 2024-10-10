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
    setResponse(null); // Reset response on new submission
    setLoading(true); 

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
      console.error("Fetch error:", err);
      setError(err.message); // Display the error message to the user
    } finally {
      setLoading(false); // Reset loading state after completion
    }
  };

  // Debugging function to manually send a POST request to /api/receiveResponse
  const handleDebugPost = async () => {
    setError(null);
    setResponse(null); // Reset response on new submission

    try {
      const res = await fetch("/api/receiveResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          visitor_information_visitor_id: visitorId,
          event_information_event_type: eventType,
          test_message: "Debugging POST request"  // Sample debug data
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to send request to receiveResponse. Status: ${res.status}, Details: ${errorText}`);
      }

      const data = await res.json();
      console.log("Debug Response Data:", data); // Log the response data for debugging

      setResponse({
        status: "Debug POST to /api/receiveResponse successful",
        ...data
      });
    } catch (err) {
      console.error("Debug POST error:", err);
      setError(err.message); // Display the error message to the user
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

      {/* Debug button to test POST request to /api/receiveResponse */}
      <button onClick={handleDebugPost} style={{ marginTop: "10px" }}>
        Debug POST to /api/receiveResponse
      </button>

      {/* Show response message on success */}
      {response && (
        <div>
          <p>{response.status}</p>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      
      {/* Show error message on failure */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default VisitorCheckIn;
