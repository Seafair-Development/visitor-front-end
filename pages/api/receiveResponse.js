// /api/receiveResponse.js

// Flag to track if the first valid request has been processed
let hasProcessedFirstValidRequest = false;

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Method not allowed" });
    return;
  }

  try {
    const { visitor_id } = req.body;

    // Log the incoming data for debugging purposes
    console.info("Received data from Zapier:", JSON.stringify(req.body, null, 2));

    // Check if visitor_id is present and not null
    if (!visitor_id) {
      console.warn("Ignored request due to missing or null visitor_id.");
      return; // Exit without processing or responding
    }

    // If we have already processed the first valid request, ignore further valid requests
    if (hasProcessedFirstValidRequest) {
      console.warn("Ignored request: already processed the first valid request.");
      return; // Exit without processing or responding
    }

    // Mark that we've processed the first valid request
    hasProcessedFirstValidRequest = true;

    // Process and respond to the first valid request
    console.info("Processing first valid request with visitor_id:", visitor_id);
    res.status(200).json({
      status: "success",
      data: req.body  // Return the full JSON object of the first valid request
    });
  } catch (error) {
    console.error("Error processing Zapier response:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
};
