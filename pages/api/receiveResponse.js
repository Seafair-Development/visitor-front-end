// /pages/api/receiveResponse.js

export default async (req, res) => {
  if (req.method !== "POST") {
    console.warn("Request ignored: Method not allowed. Expected POST.");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { visitor_id, eventDate, fullName, status, attempt, request_id } = req.body;

    // Log the incoming data for debugging
    console.info("Received data from Zapier:", JSON.stringify(req.body, null, 2));

    // Track which fields are missing
    const missingFields = [];
    
    if (!visitor_id) missingFields.push("visitor_id");
    if (!eventDate) missingFields.push("eventDate");
    if (!fullName) missingFields.push("fullName");
    if (!status) missingFields.push("status");

    // Check for primary data and metadata fields
    const hasPrimaryData = visitor_id && eventDate && fullName && status;
    const hasMetadata = attempt || request_id;

    if (!hasPrimaryData) {
      if (missingFields.length > 0) {
        console.warn(`Ignoring request due to missing required fields: ${missingFields.join(", ")}.`);
      } else {
        console.warn("Ignoring request due to absence of primary data fields.");
      }
    }

    // Primary data validation
    if (hasPrimaryData) {
      console.info("Processing valid primary data request:", req.body);
      res.status(200).json({
        status: "success",
        data: { visitor_id, eventDate, fullName, status }
      });
      return;
    }

    // Metadata classification
    if (hasMetadata && !hasPrimaryData) {
      console.info("Processing metadata request only. Metadata fields present:", {
        attempt, 
        request_id
      });
      res.status(207).json({
        status: "multi-status",
        metadata: { attempt, request_id }
      });
      return;
    }

    // Log if the request has no relevant fields for processing
    console.warn("Ignoring request due to absence of both primary data and metadata fields.");
    res.status(204).end(); // No response content for incomplete data
  } catch (error) {
    console.error("Error processing Zapier response:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
