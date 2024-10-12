// /api/receiveResponse.js
export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Method not allowed" });
    return;
  }

  try {
    const { visitor_information_visitor_id: sentVisitorId, event_information_event_type } = req.body;
    const { visitor_id, eventDate, fullName, status } = req.body;  // Adapt to your actual data structure

    // Required fields to validate
    const requiredFields = ["visitor_id", "eventDate", "fullName"];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    // Ensure visitor_id is not null and matches the sent visitor ID
    if (missingFields.length > 0 || visitor_id !== sentVisitorId) {
      const missingInfo = missingFields.length > 0 ? `Missing fields: ${missingFields.join(", ")}` : '';
      const visitorIdMismatch = visitor_id !== sentVisitorId ? `Visitor ID mismatch. Expected: ${sentVisitorId}, Received: ${visitor_id}` : '';
      const errorMessage = `${missingInfo} ${visitorIdMismatch}`.trim();

      console.warn(`Incomplete or mismatched data received: ${errorMessage}`);
      res.status(400).json({
        error: "Incomplete data or visitor ID mismatch",
        missingFields,
        visitorIdMismatch,
        receivedData: req.body
      });
      return;
    }

    // Output the complete response JSON if all validations pass
    console.info("Received complete and valid data from Zapier:", req.body);
    res.status(200).json({
      status: "success",
      data: req.body  // Return the full JSON object
    });
  } catch (error) {
    console.error("Error processing Zapier response:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
