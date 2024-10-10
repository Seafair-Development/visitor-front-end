// pages/api/receiveResponse.js
export default async function handler(req, res) {
  // Log the HTTP method received
  console.log("Request method received:", req.method);

  // Check if the request method is POST
  if (req.method === 'POST') {
    // Log the full payload received from Zapier or other sources for debugging
    console.log("Data received:", req.body);

    try {
      // Destructure eventDate specifically for additional logging
      const { eventDate } = req.body;

      // Log or warn if eventDate is missing
      if (!eventDate) {
        console.warn("Warning: 'eventDate' is missing from the received data.");
      } else {
        console.log("Received eventDate:", eventDate);
      }

      // Echo the entire received data back to the client
      res.status(200).json(req.body);
    } catch (error) {
      // Log and respond with error message if something goes wrong
      console.error("Error processing data:", error.message);
      res.status(500).json({ error: "Failed to process data." });
    }
  } else {
    // Log a warning if the method is not allowed and return a 405 status
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
