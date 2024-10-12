// pages/api/receiveResponse.js

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log("Received request in /api/receiveResponse");
  console.log("Request method:", req.method);
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));
  console.log("Raw request body:", JSON.stringify(req.body, null, 2));

  if (req.method === 'POST' || req.method === 'GET') { // Allow GET for debugging
    try {
      // Directly access the raw JSON data from req.body
      const data = req.method === 'POST' ? req.body : req.query; // Use query for GET requests
      console.log("Parsed request data:", JSON.stringify(data, null, 2));

      // Destructure fields from the data for processed output
      const { eventDate, status, fullName, imageUrl } = data;

      // Check if essential fields are missing
      if (!eventDate || !status || !fullName) {
        console.warn("Warning: Missing essential data fields.");
        // Respond with a 400 Bad Request if data is incomplete
        return res.status(400).json({
          error: "Failure - Required data fields are missing.",
          missingFields: {
            eventDate: eventDate ? null : "Missing eventDate",
            status: status ? null : "Missing status",
            fullName: fullName ? null : "Missing fullName"
          },
          receivedData: data  // Include the received data for diagnostic purposes
        });
      }

      // Respond with the raw JSON data and the processed fields
      res.status(200).json({
        message: "Data received successfully",
        receivedData: data,  // Include the received data for diagnostic purposes
        status: status || "Status not available",
        fullName: fullName || "Name not available",
        imageUrl: imageUrl || "No Image Available",
        eventDate: eventDate || "Date not available"
      });

    } catch (error) {
      // Log error details if something goes wrong
      console.error("Error processing data:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: "Failed to process data.", details: error.message });
    }
  } else {
    // Handle non-POST/GET requests
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}