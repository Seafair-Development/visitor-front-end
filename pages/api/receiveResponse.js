// /pages/api/receiveResponse.js

// Regular expression to match UUID v4 format
const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { visitor_id, eventDate, fullName, status, attempt, request_id } = req.body;

    // Log the incoming data for debugging
    console.info("Received data from Zapier:", JSON.stringify(req.body, null, 2));

    // Check for primary data
    const hasPrimaryData = visitor_id && eventDate && fullName && status;
    
    // Check for metadata fields
    const hasMetadata = attempt || request_id;

    // Primary data validation
    if (hasPrimaryData && uuidV4Regex.test(visitor_id)) {
      console.info("Processing valid primary data request:", req.body);
      res.status(200).json({
        status: "success",
        data: { visitor_id, eventDate, fullName, status }
      });
      return;
    }

    // Metadata classification
    if (hasMetadata && !hasPrimaryData) {
      console.info("Processing metadata request only:", req.body);
      res.status(207).json({
        status: "multi-status",
        metadata: { attempt, request_id }
      });
      return;
    }

    // If both primary and metadata are missing or invalid, ignore
    console.warn("Ignoring request due to missing required fields.");
    res.status(204).end(); // No response content for incomplete data
  } catch (error) {
    console.error("Error processing Zapier response:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
