// pages/api/receiveResponse.js
export default async function handler(req, res) {
  // Log the HTTP method and body received
  console.log("Request method received:", req.method);
  console.log("Request body:", req.body);

  // Check if the request method is POST or GET for flexibility
  if (req.method === 'POST' || req.method === 'GET') {
    try {
      // Destructure eventDate for additional logging
      const { eventDate } = req.body || {};
      
      // Log the eventDate if it exists
      if (!eventDate) {
        console.warn("Warning: 'eventDate' is missing from the received data.");
      } else {
        console.log("Received eventDate:", eventDate);
      }

      // Respond with the request body or a sample message for GET requests
      if (req.method === 'POST') {
        res.status(200).json({ message: "Data received successfully", data: req.body });
      } else {
        res.status(200).json({ message: "GET request received (for testing purposes)", data: req.body || "No data in GET request" });
      }

    } catch (error) {
      // Log and respond with error message if something goes wrong
      console.error("Error processing data:", error.message);
      res.status(500).json({ error: "Failed to process data." });
    }
  } else {
    // Log a warning for unsupported methods and return a 405 status
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader("Allow", ["POST", "GET"]); // Allow both POST and GET for testing
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
