// components/ZapierResponse.js
import React, { useEffect, useState } from 'react';

const ZapierResponse = () => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);  // Error state for webhook response

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/receiveResponse');
        if (!response.ok) {
          throw new Error("Error receiving response from Zapier.");
        }
        const data = await response.json();
        setResponseData(data);
        setError(null);  // Clear error if successful
      } catch (err) {
        setError(err.message || "Failed to receive the response from Zapier.");
        setResponseData(null);
      }
    };

    // Poll the API every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup on component unmount
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!responseData) {
    return <p>Loading data...</p>;
  }

  return (
    <div>
      <h3>Visitor Check-In Status</h3>
      <p><strong>Status:</strong> {responseData.status}</p>
      <p><strong>Full Name:</strong> {responseData.fullName}</p>
      {responseData.imageUrl && (
        <div>
          <p><strong>Visitor Image:</strong></p>
          <img src={responseData.imageUrl} alt="Visitor" style={{ width: '100px' }} />
        </div>
      )}
    </div>
  );
};

export default ZapierResponse;
