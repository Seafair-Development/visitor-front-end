// pages/api/receiveResponse.js

export default async function handler(req, res) {
  console.log("Received request method:", req.method);  // Log the method for debugging

  if (req.method === 'POST') {
    try {
      // Directly access the raw JSON data from req.body
      const data = req.body;
      console.log("Raw request body:", data); // Log the raw data for diagnostics

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
          rawData: data  // Include the raw JSON data for diagnostic purposes
        });
      }

      // Respond with the raw JSON data and the processed fields
      res.status(200).json({
        message: "Data received successfully",
        rawData: data,  // Include the raw JSON data for diagnostic purposes
        status: status || "Status not available",
        fullName: fullName || "Name not available",
        imageUrl: imageUrl || "No Image Available",
        eventDate: eventDate || "Date not available"
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
