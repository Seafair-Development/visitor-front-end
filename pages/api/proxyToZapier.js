// /pages/api/proxyToZapier.js

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    // Construct the payload with exact field names
    const zapierPayload = {
      visitor_information_visitor_id: req.body.visitor_information_visitor_id,
      event_information_event_type: req.body.event_information_event_type
    };

    // Send the payload to Zapier
    const zapierResponse = await fetch("https://hooks.zapier.com/hooks/catch/13907609/2m737mn/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(zapierPayload)
    });

    // Check the content type to handle non-JSON responses
    const contentType = zapierResponse.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      // Parse JSON response from Zapier
      responseData = await zapierResponse.json();
    } else {
      // Handle non-JSON response as text
      responseData = await zapierResponse.text();
      console.warn("Non-JSON response from Zapier:", responseData);
    }

    // Handle Zapier response based on the status and data format
    if (zapierResponse.ok) { // Checks for HTTP 200-299 status codes
      if (typeof responseData === 'object') {
        res.status(200).json(responseData);
      } else {
        console.warn("Unexpected response format from Zapier:", responseData);
        res.status(500).json({ error: "Invalid JSON format received from Zapier" });
      }
    } else {
      res.status(zapierResponse.status).json({ error: `Zapier returned status ${zapierResponse.status}`, details: responseData });
    }
  } catch (error) {
    console.error("Error communicating with Zapier:", error);
    res.status(500).json({ error: "Failed to communicate with Zapier" });
  }
};
