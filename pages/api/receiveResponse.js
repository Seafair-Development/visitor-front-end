// /api/receiveResponse.js

import fetch from 'node-fetch'; // Ensure fetch is available, if necessary

// Regular expression to match UUID v4 format
const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Function to handle secondary POST for metadata or logging
async function sendMetadataPost(data) {
  try {
    const metadataResponse = await fetch('https://your-metadata-endpoint.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!metadataResponse.ok) {
      console.error('Metadata POST failed with status:', metadataResponse.status);
      return metadataResponse.status; // Return the failed status code to handle accordingly
    } else {
      console.info('Metadata POST successfully sent.');
      return 207; // Indicate metadata was processed with 207 Multi-Status
    }
  } catch (error) {
    console.error('Error sending metadata POST:', error);
    return 500; // Internal server error code for secondary POST failure
  }
}

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { visitor_id, eventDate, fullName, status } = req.body;

    // Log the incoming data for debugging
    console.info("Received data from Zapier:", JSON.stringify(req.body, null, 2));

    // Validate visitor_id as a UUID v4 and ensure other required fields are present
    if (!visitor_id || !uuidV4Regex.test(visitor_id)) {
      console.warn("Ignoring request due to invalid or null visitor_id.");
      res.status(204).end(); // No response content for invalid visitor_id
      return;
    }

    if (!eventDate || !fullName || !status) {
      console.warn("Ignoring request due to missing required fields:", 
        [
          !eventDate && 'eventDate', 
          !fullName && 'fullName', 
          !status && 'status'
        ].filter(Boolean).join(", ")
      );
      res.status(204).end(); // No response content for incomplete data
      return;
    }

    // Process the request and send a secondary POST for metadata
    console.info("Processing valid request:", req.body);
    
    // Send secondary POST request with metadata
    const metadataStatus = await sendMetadataPost({
      visitor_id,
      eventDate,
      fullName,
      status,
      timestamp: new Date().toISOString()
    });

    // Use the status from the secondary POST to determine the response code
    if (metadataStatus === 207) {
      // Indicate successful primary processing with metadata processed as multi-status
      res.status(207).json({
        status: "multi-status",
        data: { visitor_id, eventDate, fullName, status },
        metadataStatus: "processed"
      });
    } else if (metadataStatus === 500) {
      res.status(502).json({ error: "Secondary POST failed with an internal server error" });
    } else {
      res.status(500).json({ error: `Secondary POST failed with status code ${metadataStatus}` });
    }
  } catch (error) {
    console.error("Error processing Zapier response:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
