// components/ZapierResponse.js
import React, { useState, useEffect, useCallback } from 'react';

const ZapierResponse = ({ isSubmitted, visitorId, onDataReceived }) => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/pollZapierData', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error("Failed to receive data from Zapier.");
      }

      const data = await response.json();

      // Validate the presence of visitor_id and ensure it matches the sent visitor ID
      if (!data.visitor_id || data.visitor_id !== visitorId) {
        console.warn(`Visitor ID mismatch or missing visitor ID. Expected: ${visitorId}, Received: ${data.visitor_id}`);
        return; // Skip this response and continue polling
      }

      // If visitor IDs match, set the response data and stop polling
      setResponseData(data);
      setError(null);
      setPolling(false); // Stop polling
      onDataReceived(data); // Pass valid data to parent component
    } catch (err) {
      setError(err.message);
      setPolling(false); // Stop polling on error
    }
  }, [onDataReceived, visitorId]);

  useEffect(() => {
    let intervalId;

    if (isSubmitted && !responseData && !error) {
      setPolling(true);
      fetchData(); // Immediate first check
      intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSubmitted, responseData, error, fetchData]);

  if (!isSubmitted) {
    return null; // Only start polling after submission
  }

  if (polling) {
    return <p>Waiting for response from Zapier...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  if (!responseData) {
    return null;
  }

  return (
    <div>
      <h2>Zapier Response</h2>
      <pre>{JSON.stringify(responseData, null, 2)}</pre>
    </div>
  );
}

export default ZapierResponse;
