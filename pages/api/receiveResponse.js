// /api/receiveResponse.js

// Regular expression to match UUID v4 format
const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { visitor_id } = req.body;

    // Log the incoming data for debugging
    console.info("Received data from Zapier:", JSON.stringify(req.body, null, 2));

    // Validate that visitor_id is a UUID v4
    if (!visitor_id || !uuidV4Regex.test(visitor_id)) {
      console.warn("Ignoring request due to invalid or null visitor_id.");
      res.status(204).end(); // No response content for invalid visitor_id
      return; // Exit without further processing
    }

    // If visitor_id is a valid UUID v4, process the request
    console.info("Processing request with valid UUID v4 visitor_id:", visitor_id);
    res.status(200).json({
      status: "success",
      data: req.body  // Return the full JSON object for valid request
    });
  } catch (error) {
    console.error("Error processing Zapier response:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
