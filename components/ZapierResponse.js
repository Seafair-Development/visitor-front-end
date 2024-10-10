// components/ZapierResponse.js
import React, { useEffect, useState } from 'react';

const ZapierResponse = () => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/receiveResponse'); // Assuming this route provides the latest response data
        if (!response.ok) {
          throw new Error("Failed to receive request output from Zapier.");
        }
        const data = await response.json();
        setResponseData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setResponseData(null);
      }
    };

    // Poll the API every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!responseData) {
    return <p>Loading data...</p>;
  }

  // Parse the eventDate if available
  const eventDate = responseData.eventDate ? new Date(responseData.eventDate) : null;
  const isValidDate = eventDate && !isNaN(eventDate);
  const date = isValidDate ? eventDate.toLocaleDateString() : "Date not available";
  const time = isValidDate ? eventDate.toLocaleTimeString() : "Time not available";

  return (
    <div>
      <h3>Visitor Check-In Status</h3>
      <p><strong>Status:</strong> {responseData.status || "Status not available"}</p>
      <p><strong>Full Name:</strong> {responseData.fullName || "Name not available"}</p>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Time:</strong> {time}</p>
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
