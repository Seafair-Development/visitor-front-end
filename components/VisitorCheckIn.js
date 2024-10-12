// components/VisitorCheckIn.js
import React, { useState } from "react";
import QRScanner from "./QRScanner";

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("signin_after");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentJSON, setSentJSON] = useState(null);
  const [receivedJSON, setReceivedJSON] = useState(null);
  const [debugMode, setDebugMode] = useState(true); // Toggle for showing debug info

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setReceivedJSON(null);
    setLoading(true);

    const requestBody = {
      visitor_information_visitor_id: visitorId,
      event_information_event_type: eventType
    };
    setSentJSON(requestBody); // Save the JSON being sent for debugging

    try {
      const res = await fetch("/api/proxyToZapier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();
      setReceivedJSON(data); // Save the JSON received for debugging

      // Check response for validity
      if (!res.ok) {
        if (res.status === 400) {
          if (data.missingFields) {
            throw new Error(`Missing fields in Zapier response: ${data.missingFields.join(', ')}`);
          } else if (data.invalidFields) {
            throw new Error(`Invalid fields in Zapier response: ${data.invalidFields.join(', ')}`);
          } else {
            throw new Error(data.error || "Bad request");
          }
        } else {
          throw new Error(`Failed to send request to Zapier. Status: ${res.status}, Details: ${data.error || 'Unknown error'}`);
        }
      }

      if (data.status === "success") {
        setResponse(data);
        setError(null);
      } else {
        throw new Error("Unexpected response from Zapier.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Visitor Check-In</h1>
      <form onSubmit={handleSubmit}>
        <QRScanner setVisitorId={setVisitorId} />
        <label>
          Event Type:
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="signin_after">Sign In</option>
            <option value="signout_after">Sign Out</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {/* Toggle debug information */}
      <label>
        Debug Mode:
        <input type="checkbox" checked={debugMode} onChange={() => setDebugMode(!debugMode)} />
      </label>

      {/* Debug: Display sent JSON */}
      {debugMode && sentJSON && (
        <div>
          <h3>Sent JSON:</h3>
          <pre style={{ backgroundColor: '#e6f7ff', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(sentJSON, null, 2)}
          </pre>
        </div>
      )}

      {/* Debug: Display received JSON */}
      {debugMode && receivedJSON && (
        <div>
          <h3>Received JSON:</h3>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(receivedJSON, null, 2)}
          </pre>
        </div>
      )}

      {/* Regular response output */}
      {response && (
        <div>
          <h3>Response:</h3>
          <p>{response.status}</p>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {/* Error message display */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};

export default VisitorCheckIn;
