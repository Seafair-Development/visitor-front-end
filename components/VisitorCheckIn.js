// VisitorCheckIn.js

import React, { useState } from 'react';

const VisitorCheckIn = () => {
  const [visitorId, setVisitorId] = useState("");
  const [eventType, setEventType] = useState("Sign In");
  const [statusMessage, setStatusMessage] = useState("");
  const [visitorData, setVisitorData] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // State for debugging

  // Function to handle the API call and response
  const handleApiResponse = async () => {
    const payload = {
      visitor_information_visitor_id: visitorId,
      event_information_event_type: eventType === "Sign In" ? "signin_after" : "signout_after"
    };

    // Log the payload and set debug info for sent JSON
    console.info("Sending payload to Zapier:", JSON.stringify(payload, null, 2));
    setDebugInfo({ sentJSON: payload, receivedJSON: null });

    try {
      const response = await fetch('/api/proxyToZapier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      clearStatusMessage();

      // Handle only 200 OK responses
      if (response.status === 200) {
        const data = await response.json();
        console.info("Received data from Zapier:", JSON.stringify(data, null, 2));
        
        // Update visitor data and debug info
        setVisitorData(data);
        setDebugInfo(prev => ({ ...prev, receivedJSON: data }));
        setStatusMessage("Check-in complete!");
      } else {
        console.warn(`Ignored non-200 response: ${response.status}`);
        setStatusMessage("Check-in unsuccessful. Please try again.");
        setDebugInfo(prev => ({ ...prev, receivedJSON: `Non-200 response: ${response.status}` }));
      }
    } catch (error) {
      console.error('Error with the API call:', error);
      setStatusMessage("An error occurred. Please try again.");
      setDebugInfo(prev => ({ ...prev, receivedJSON: `Error: ${error.message}` }));
    }
  };

  // Function to clear the status message
  const clearStatusMessage = () => {
    setStatusMessage("");
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    clearStatusMessage();
    setVisitorData(null);
    handleApiResponse(); // Make the API call
  };

  return (
    <div>
      <h1>Visitor Check-In System</h1>
      <p>Please scan your QR code and complete the check-in process below.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Visitor ID:
          <input
            type="text"
            value={visitorId}
            onChange={(e) => setVisitorId(e.target.value)}
            placeholder="Enter or scan Visitor ID"
            required
          />
        </label>

        <label>
          Event Type:
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="Sign In">Sign In</option>
            <option value="Sign Out">Sign Out</option>
          </select>
        </label>
        
        <button type="submit">Submit</button>
      </form>

      <p><strong>Status:</strong> {statusMessage}</p>

      {debugInfo && (
        <div>
          <h3>Debug Mode:</h3>
          <p><strong>Sent JSON:</strong></p>
          <pre>{JSON.stringify(debugInfo.sentJSON, null, 2)}</pre>
          <p><strong>Received JSON:</strong></p>
          <pre>{JSON.stringify(debugInfo.receivedJSON, null, 2)}</pre>
        </div>
      )}

      {visitorData && (
        <div>
          <h3>Visitor Details</h3>
          <p><strong>Visitor Name:</strong> {visitorData.fullName}</p>
          <p><strong>Event Date:</strong> {visitorData.eventDate}</p>
          <p><strong>Status:</strong> {visitorData.status}</p>
          {visitorData.imageUrl && (
            <div>
              <img src={visitorData.imageUrl} alt="Visitor Profile" style={{ width: "150px", height: "150px", borderRadius: "8px" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisitorCheckIn;
