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
          throw new Error(`Failed to send request to Zapier. Status: ${res.status}`);
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

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Form fields here */}
      </form>
      <QRScanner setVisitorId={setVisitorId} />

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