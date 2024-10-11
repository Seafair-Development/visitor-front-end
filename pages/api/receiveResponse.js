// pages/api/receiveResponse.js
export default async function handler(req, res) {
  console.log("Received request method:", req.method);  // Log the method for debugging

  if (req.method === 'POST') {
    try {
      // Log request body for debugging
      console.log("Request body:", req.body);

      const { eventDate } = req.body || {};
      
      // Log eventDate if provided
      if (!eventDate) {
        console.warn("Warning: 'eventDate' is missing from the received data.");
      } else {
        console.log("Received eventDate:", eventDate);
      }

      // Send a success response with the data received
      res.status(200).json({
        message: "Data received successfully",
        data: req.body,
        status: req.body.status || "Status not available",
        fullName: req.body.fullName || "Name not available",
        imageUrl: req.body.imageUrl || "No Image Available",
        eventDate: eventDate || "Date not available",
      });
    } catch (error) {
      console.error("Error processing data:", error.message);
      res.status(500).json({ error: "Failed to process data." });
    }
  } else {
    // Only allow POST requests
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
