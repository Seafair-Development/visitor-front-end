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

      const responseData = await zapierResponse.text();
      console.log("Raw Zapier Response:", responseData);

      let data;
      try {
        data = JSON.parse(responseData);
      } catch (parseError) {
        console.error("Error parsing Zapier response:", parseError);
        return res.status(500).json({ 
          error: "Invalid JSON response from Zapier", 
          rawResponse: responseData 
        });
      }

      console.log("Parsed Zapier Response Data:", data);

      // Check for required fields
      const requiredFields = ['eventDate', 'status', 'fullName', 'visitor_id'];
      const missingFields = requiredFields.filter(field => !data[field]);

      if (missingFields.length > 0) {
        console.warn("Missing required fields:", missingFields);
        return res.status(400).json({ 
          error: "Incomplete data received from Zapier", 
          missingFields,
          receivedData: data
        });
      }

      // Check for undefined or empty string values
      const invalidFields = Object.entries(data)
        .filter(([key, value]) => requiredFields.includes(key) && (value === undefined || value === ""))
        .map(([key]) => key);

      if (invalidFields.length > 0) {
        console.warn("Fields with invalid values:", invalidFields);
        return res.status(400).json({ 
          error: "Received invalid values from Zapier", 
          invalidFields,
          receivedData: data
        });
      }

      // If we've made it here, all required fields are present and valid
      res.status(200).json({ 
        status: "success", 
        data: data
      });
    } catch (error) {
      console.error("Error connecting to Zapier:", error.message);
      res.status(500).json({ 
        error: "Failed to connect to Zapier or process the response", 
        details: error.message 
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}