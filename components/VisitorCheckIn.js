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

  // ... rest of the component (handleDebugPost, render method) remains the same

  return (
    <div>
      {/* ... form and other elements remain the same ... */}

      {/* Display sent JSON */}
      {sentJSON && (
        <div>
          <h3>Sent JSON:</h3>
          <pre style={{ backgroundColor: '#e6f7ff', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(sentJSON, null, 2)}
          </pre>
        </div>
      )}

      {/* Display received JSON */}
      {receivedJSON && (
        <div>
          <h3>Received JSON:</h3>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(receivedJSON, null, 2)}
          </pre>
        </div>
      )}

      {/* Show regular response message on success */}
      {response && (
        <div>
          <h3>Processed Response:</h3>
          <p>{response.status}</p>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      
      {/* Show error message on failure */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};

export default VisitorCheckIn;