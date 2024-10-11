// pages/api/receiveResponse.js
import { json } from 'micro';

export default async function handler(req, res) {
  console.log("Received request method:", req.method);  // Log the method for debugging

  if (req.method === 'POST') {
    try {
      // Explicitly parse the JSON body
      const data = await json(req);
      console.log("Parsed request body:", data); // Log the parsed data

      // Destructure fields from the data
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
          }
        });
      }

      // Log valid data
      console.log("Received valid data:", { eventDate, status, fullName, imageUrl });

      // Respond with a success message if all data is present
      res.status(200).json({
        message: "Data received successfully",
        data: data,
        status: status,
        fullName: fullName,
        imageUrl: imageUrl || "No Image Available",
        eventDate: eventDate
      });

    } catch (error) {
      // Log error details if something goes wrong
      console.error("Error processing data:", error.message);
      res.status(500).json({ error: "Failed to process data." });
    }
  } else {
    // Handle non-POST requests
    console.warn(`Method ${req.method} not allowed.`);
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
