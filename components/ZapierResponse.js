// components/ZapierResponse.js
import React, { useEffect, useState } from 'react';

const ZapierResponse = () => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/receiveResponse'); // API route to fetch response from Zapier
        if (!response.ok) {
          throw new Error("Failed to receive request output from Zapier.");
        }
        const data = await response.json();
        console.log("Response Data:", data); // Debugging: log entire response data
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

  // Debugging: Log raw JSON if date is not available
  if (!isValidDate) {
    console.warn("Date and time not available in response. Full data:", responseData);
  }

  return (
    <div>
      <h3>Visitor Check-In Status</h3>
      <p><strong>Message:</strong> Request from Zapier was successful</p> {/* Default message */}
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
      {!isValidDate && (
        <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
          <strong>Raw JSON:</strong> {JSON.stringify(responseData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ZapierResponse;
