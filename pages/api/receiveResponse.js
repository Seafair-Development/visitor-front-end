// pages/api/receiveResponse.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log("Received request in /api/receiveResponse");
  console.log("Request method:", req.method);
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));

  if (req.method === 'POST' || req.method === 'GET') {
    try {
      const data = req.method === 'POST' ? req.body : req.query;
      
      console.log("Raw received data:");
      console.log(JSON.stringify(data, null, 2));

      // Ensure data is an object
      if (typeof data !== 'object' || data === null) {
        console.error("Received data is not an object:", data);
        return res.status(400).json({
          error: "Invalid data format. Expected an object.",
          receivedData: data
        });
      }
      
      console.log("Checking for required fields:");
      console.log("eventDate:", data.eventDate, typeof data.eventDate);
      console.log("status:", data.status, typeof data.status);
      console.log("fullName:", data.fullName, typeof data.fullName);

      // Check if fields exist and are not empty strings
      const isEventDateValid = data.eventDate && data.eventDate.trim() !== "";
      const isStatusValid = data.status && data.status.trim() !== "";
      const isFullNameValid = data.fullName && data.fullName.trim() !== "";

      if (!isEventDateValid || !isStatusValid || !isFullNameValid) {
        console.warn("Warning: Missing or empty essential data fields.");
        return res.status(400).json({
          error: "Failure - Required data fields are missing or empty.",
          missingOrEmptyFields: {
            eventDate: isEventDateValid ? null : "Missing or empty eventDate",
            status: isStatusValid ? null : "Missing or empty status",
            fullName: isFullNameValid ? null : "Missing or empty fullName"
          },
          receivedData: data
        });
      }

      res.status(200).json({
        message: "Data received successfully",
        receivedData: data,
        status: data.status,
        fullName: data.fullName,
        imageUrl: data.imageUrl || "No Image Available",
        eventDate: data.eventDate,
        visitor_id: data.visitor_id // Include this field in the response
      });

    } catch (error) {
      console.error("Error processing data:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: "Failed to process data.", details: error.message });
    }
  } else {
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}