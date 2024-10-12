// components/ZapierResponse.js
import React, { useState, useEffect, useCallback } from 'react';

const ZapierResponse = ({ isSubmitted, onDataReceived }) => {
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

      // Check for valid, non-blank fields
      const requiredFields = ['eventDate', 'status', 'fullName', 'visitor_id'];
      const missingFields = requiredFields.filter(field => !data[field] || data[field] === "");

      // If any required field is missing or blank, skip this data
      if (missingFields.length > 0 || data.status === 'no_data') {
        console.warn(`Incomplete data received. Missing fields: ${missingFields.join(', ')}`);
        return; // Continue polling
      }

      // If data is valid, set response data and stop polling
      setResponseData(data);
      setError(null);
      setPolling(false); // Stop polling
      onDataReceived(data); // Pass the valid data to parent component
    } catch (err) {
      setError(err.message);
      setPolling(false); // Stop polling on error
    }
  }, [onDataReceived]);

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
