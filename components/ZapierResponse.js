// components/ZapierResponse.js
import React, { useState, useEffect, useCallback } from 'react';

const ZapierResponse = ({ isSubmitted, visitorId, onDataReceived }) => {
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/pollZapierData', {
        method: 'GET',
      });

      if (!response.ok) {
        console.error("Failed to receive data from Zapier."); // Log error to console
        return;
      }

      const data = await response.json();

      // Check visitor_id and required fields
      if (data.visitor_id !== visitorId || !data.eventDate || !data.fullName || !data.visitor_id) {
        console.warn(`Incomplete data. Received visitor ID: ${data.visitor_id}`);
        return; // Continue polling
      }

      setPolling(false); // Stop polling
      onDataReceived(data); // Send complete data to parent component
    } catch (err) {
      console.error("Polling error:", err); // Log for debugging
      setError("There was an issue polling the data. Please try again.");
      setPolling(false); // Stop polling on error
    }
  }, [onDataReceived, visitorId]);

  useEffect(() => {
    let intervalId;

    if (isSubmitted && !error) {
      setPolling(true);
      fetchData();
      intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSubmitted, fetchData, error]);

  if (!isSubmitted) {
    return null; // Poll only after submission
  }

  if (polling) {
    return <p>Waiting for response from Zapier...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return null;
};

export default ZapierResponse;
