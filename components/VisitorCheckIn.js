// components/VisitorCheckIn.js
import React, { useState } from "react";
import QRScanner from "./QRScanner";
import ZapierResponse from "./ZapierResponse";

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("signin_after");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentJSON, setSentJSON] = useState(null);
  const [receivedJSON, setReceivedJSON] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [debugMode, setDebugMode] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setReceivedJSON(null);
    setLoading(true);
    setIsSubmitted(true);

    const requestBody = {
      visitor_information_visitor_id: visitorId,
      event_information_event_type: eventType
    };
    setSentJSON(requestBody);

    try {
      const res = await fetch("/api/proxyToZapier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();
      setReceivedJSON(data);

      if (!res.ok || data.error) {
        const missingFields = data.missingFields ? `Missing fields: ${data.missingFields.join(', ')}` : "Unknown error";
        throw new Error(`Error: ${data.error || "Request failed"}. ${missingFields}`);
      }

      setResponse(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Visitor Check-In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Visitor ID:
          <input
            type="text"
            value={visitorId}
            onChange={(e) => setVisitorId(e.target.value)}
            placeholder="Enter or scan Visitor ID"
            required
          />
        </label>

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

      <label>
        Debug Mode:
        <input type="checkbox" checked={debugMode} onChange={() => setDebugMode(!debugMode)} />
      </label>

      {debugMode && sentJSON && (
        <div>
          <h3>Sent JSON:</h3>
          <pre style={{ backgroundColor: '#e6f7ff', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(sentJSON, null, 2)}
          </pre>
        </div>
      )}

      {debugMode && receivedJSON && (
        <div>
          <h3>Received JSON:</h3>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(receivedJSON, null, 2)}
          </pre>
        </div>
      )}

      {response && (
        <div>
          <h3>Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ZapierResponse
        isSubmitted={isSubmitted}
        visitorId={visitorId}
        onDataReceived={(data) => setResponse(data)}
      />
    </div>
  );
};

export default VisitorCheckIn;
