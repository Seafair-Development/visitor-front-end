// /pages/api/receiveResponse.js

export default async (req, res) => {
  if (req.method !== "POST") {
    // Only process POST requests
    console.warn("Request ignored: Method not allowed. Expected POST.");
    res.status(405).end();
    return;
  }

  try {
    const { visitor_id, eventDate, fullName, status, imageUrl } = req.body;

    // Log the incoming data for debugging
    console.info("Received data from Zapier:", JSON.stringify(req.body, null, 2));

    // Check for all required primary data fields
    if (visitor_id && eventDate && fullName && status) {
      console.info(`Processing valid primary data request. Returning 200 OK:\n - visitor_id: ${visitor_id}\n - eventDate: ${eventDate}\n - fullName: ${fullName}\n - status: ${status}${imageUrl ? `\n - imageUrl: ${imageUrl}` : ""}`);
      
      res.status(200).json({
        status: "success",
        data: { visitor_id, eventDate, fullName, status, ...(imageUrl && { imageUrl }) }
      });
      return; // Only valid primary data will be processed
    }

    // If any primary data fields are missing, ignore the request without further processing
    console.warn("Request ignored: Missing one or more required fields (visitor_id, eventDate, fullName, status).");
    res.status(204).end(); // No content for ignored requests
  } catch (error) {
    // Log any unexpected errors
    console.error("Error processing Zapier response:", error);
    res.status(500).end(); // Only used in case of server-side errors
  }
};
