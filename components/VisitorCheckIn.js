// components/VisitorCheckIn.js
import React, { useState } from "react";
import QRScanner from "./QRScanner";

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("signin_after");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rawOutput, setRawOutput] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    setResponse(null);
    setRawOutput(null);
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

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400) {
          if (data.missingFields) {
            throw new Error(`Missing fields in Zapier response: ${data.missingFields.join(', ')}`);
          } else if (data.undefinedFields) {
            throw new Error(`Undefined fields in Zapier response: ${data.undefinedFields.join(', ')}`);
          } else {
            throw new Error(data.error || "Bad request");
          }
        } else {
          throw new Error(`Failed to send request to Zapier. Status: ${res.status}, Details: ${data.error || 'Unknown error'}`);
        }
      }

      if (data.status === "success") {
        if (data.isRawOutput) {
          setRawOutput(data.rawData);
        } else {
          setResponse(data);
        }
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

  // Debugging function to manually send a POST request to /api/receiveResponse
  const handleDebugPost = async () => {
    setError(null);
    setResponse(null);
    setRawOutput(null);

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
      console.log("Debug Response Data:", data);

      setResponse({
        status: "Debug POST to /api/receiveResponse successful",
        ...data
      });
    } catch (err) {
      console.error("Debug POST error:", err);
      setError(err.message);
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

      {/* Display raw JSON output for diagnostics */}
      {rawOutput && (
        <div>
          <h3>Raw JSON Output (Diagnostic):</h3>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(rawOutput, null, 2)}
          </pre>
        </div>
      )}

      {/* Show regular response message on success */}
      {response && !rawOutput && (
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