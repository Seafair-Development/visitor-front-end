// pages/api/proxyToZapier.js
export default async function handler(req, res) {
  console.log("Request method:", req.method);
  console.log("Received request body:", req.body);

  if (req.method === 'POST') {
    try {
      const zapierResponse = await fetch("https://hooks.zapier.com/hooks/catch/13907609/2m737mn/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });

      if (!zapierResponse.ok) {
        const errorText = await zapierResponse.text();
        console.error("Error from Zapier:", errorText);
        return res.status(zapierResponse.status).json({ error: errorText });
      }

      const data = await zapierResponse.json();
      console.log("Zapier Response Data:", data);

      // Check for required fields
      const requiredFields = ['eventDate', 'status', 'fullName', 'visitor_id'];
      const missingFields = requiredFields.filter(field => !data[field]);

      if (missingFields.length > 0) {
        console.warn("Missing required fields:", missingFields);
        return res.status(400).json({ 
          error: "Incomplete data received from Zapier", 
          missingFields 
        });
      }

      // Check for undefined values
      const undefinedFields = Object.keys(data).filter(key => data[key] === undefined);
      if (undefinedFields.length > 0) {
        console.warn("Fields with undefined values:", undefinedFields);
        return res.status(400).json({ 
          error: "Received undefined values from Zapier", 
          undefinedFields 
        });
      }

      // If we've made it here, all required fields are present and no undefined values
      // Pass through the raw JSON for diagnostic purposes
      res.status(200).json({ 
        status: "success", 
        rawData: data,
        isRawOutput: true  // Flag to indicate this is raw output
      });
    } catch (error) {
      console.error("Error connecting to Zapier:", error.message);
      res.status(500).json({ error: "Failed to connect to Zapier. Check network connectivity or webhook availability." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}