// /pages/api/receiveResponse.js

export default async (req, res) => {
  if (req.method !== "POST") {
    console.warn("Request ignored: Method not allowed. Expected POST.");
    res.status(405).json({ error: "Method not allowed. Only POST requests are accepted." });
    return;
  }

  try {
    const { visitor_id, eventDate, fullName, status, attempt, request_id } = req.body;

    // Log the incoming data for debugging
    console.info("Received data from Zapier:", JSON.stringify(req.body, null, 2));

    // Handle metadata requests first, to skip and log them immediately
    if ((attempt || request_id) && !visitor_id && !eventDate && !fullName && !status) {
      console.info("Processing metadata request only. Returning 207 Multi-Status:", { attempt, request_id });
      res.status(207).json({
        status: "multi-status",
        metadata: { attempt, request_id }
      });
      return; // Skip further processing and exit
    }

    // Track missing fields for primary data
    const missingFields = [];
    if (!visitor_id) missingFields.push("visitor_id");
    if (!eventDate) missingFields.push("eventDate");
    if (!fullName) missingFields.push("fullName");
    if (!status) missingFields.push("status");

    // Log primary data if all required fields are present and return 200 OK
    if (!missingFields.length) {
      // Log primary data processing success before responding
      console.info("Processing valid primary data request. Returning 200 OK:", {
        visitor_id, eventDate, fullName, status
      });
      
      res.status(200).json({
        status: "success",
        data: { visitor_id, eventDate, fullName, status }
      });
      return; // Stop further processing
    }

    // Log missing fields if primary data is incomplete
    if (missingFields.length > 0) {
      console.warn(`Ignoring request due to missing required fields: ${missingFields.join(", ")}.`);
    }

    // Final case: If both primary and metadata fields are missing, log and ignore
    console.warn("Ignoring request due to absence of both primary data and metadata fields.");
    res.status(204).end();
  } catch (error) {
    console.error("Error processing Zapier response:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
