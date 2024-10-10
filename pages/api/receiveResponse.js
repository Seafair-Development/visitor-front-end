// pages/api/receiveResponse.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Log the full payload received from Zapier for debugging
    console.log("Data received from Zapier:", req.body);

    try {
      // Destructure eventDate specifically for additional logging
      const { eventDate } = req.body;

      if (!eventDate) {
        console.warn("Warning: 'eventDate' is missing from the received data.");
      } else {
        console.log("Received eventDate:", eventDate);
      }

      // Echo the entire received data back to the client
      res.status(200).json(req.body);
    } catch (error) {
      console.error("Error processing data from Zapier:", error.message);
      res.status(500).json({ error: "Failed to process data from Zapier." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
