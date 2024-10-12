// components/ZapierResponse.js
import React, { useState, useEffect, useCallback } from 'react';

const ZapierResponse = ({ isSubmitted, visitorId, onDataReceived }) => {
  const [polling, setPolling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/pollZapierData', {
        method: 'GET',
      });

      // Only process if the response is 200 OK
      if (response.status !== 200) {
        console.warn(`Ignored response with status: ${response.status}`);
        return; // Exit without processing further
      }

      const data = await response.json();

      // Check if visitor_id matches the expected ID
      if (!data.visitor_id || data.visitor_id !== visitorId) {
        console.warn(`Visitor ID mismatch. Expected: ${visitorId}, Received: ${data.visitor_id}`);
        return; // Continue polling, do not process this response
      }

      // Process and pass valid response data to the parent component
      console.info("Received valid response:", data);
      setPolling(false); // Stop polling once valid data is received
      onDataReceived(data); // Send complete data to parent component
    } catch (err) {
      console.error("Polling error:", err); // Log for debugging
      setPolling(false);
    }
  }, [onDataReceived, visitorId]);

  useEffect(() => {
    let intervalId;

    if (isSubmitted) {
      setPolling(true);
      fetchData();
      intervalId = setInterval(fetchData, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSubmitted, fetchData]);

  if (!isSubmitted) {
    return null; // Poll only after submission
  }

  if (polling) {
    return <p>Waiting for response from Zapier...</p>;
  }

  return null;
};

export default ZapierResponse;
