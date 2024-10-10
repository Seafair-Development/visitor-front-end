import React, { useState, useEffect } from "react";

const PollingComponent = () => {
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch("/api/your-response-endpoint")
        .then(response => response.json())
        .then(data => {
          setResponseData(data);
          setError(null);
        })
        .catch(err => {
          setError("Error fetching response.");
          setResponseData(null);
        });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {responseData ? (
        <div>
          <h3>Response:</h3>
          <p>Status: {responseData.status}</p>
          <p>Full Name: {responseData.fullName}</p>
          {responseData.imageUrl && <img src={responseData.imageUrl} alt="Visitor" />}
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>Waiting for response...</p>
      )}
    </div>
  );
};

export default PollingComponent;
