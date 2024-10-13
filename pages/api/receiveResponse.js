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

    // Track which fields are missing for better logging
    const missingFields = [];
    if (!visitor_id) missingFields.push("visitor_id");
    if (!eventDate) missingFields.push("eventDate");
    if (!fullName) missingFields.push("fullName");
    if (!status) missingFields.push("status");

    // Check for primary data completeness
    if (visitor_id && eventDate && fullName && status) {
      console.info("Processing valid primary data request:", req.body);
      res.status(200).json({
        status: "success",
        data: { visitor_id, eventDate, fullName, status }
      });
      return; // Stop further processing upon valid primary data
    }

    // Log exactly which required fields are missing
    if (missingFields.length > 0) {
      console.warn(`Ignoring request due to missing required fields: ${missingFields.join(", ")}.`);
    }

    // Metadata classification
    const hasMetadata = attempt || request_id;
    if (hasMetadata && missingFields.length > 0) {
      console.info("Processing metadata request only:", { attempt, request_id });
      res.status(207).json({
        status: "multi-status",
        metadata: { attempt, request_id }
      });
      return;
    }

    // Final fall-through ignore with no content if neither primary nor metadata fields are present
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
