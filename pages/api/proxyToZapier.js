// /pages/api/proxyToZapier.js

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    // Explicitly structure the payload to match Zapier's expected format
    const zapierPayload = {
      visitor_information_visitor_id: req.body.visitor_information_visitor_id,
      event_information_event_type: req.body.event_information_event_type
    };

    const zapierResponse = await fetch("https://hooks.zapier.com/hooks/catch/your_zap_id_here", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(zapierPayload)
    });

    const contentType = zapierResponse.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      // Parse JSON response if Content-Type is correct
      responseData = await zapierResponse.json();
    } else {
      // Handle non-JSON response as an error
      responseData = await zapierResponse.text();
      console.warn("Non-JSON response from Zapier:", responseData);
      
      // Send back a 500 status with the unexpected response
      res.status(500).json({ error: "Unexpected response format from Zapier", details: responseData });
      return; // Stop further processing since response was not JSON
    }

    // Confirm the response includes necessary data before forwarding it
    if (zapierResponse.ok && responseData.visitor_id && responseData.eventDate && responseData.fullName && responseData.status) {
      res.status(200).json(responseData);
    } else {
      console.warn("Received incomplete or metadata response from Zapier:", responseData);
      res.status(204).end(); // Use 204 to indicate no content for incomplete/metadata responses
    }
  } catch (error) {
    console.error("Error communicating with Zapier:", error);
    res.status(500).json({ error: "Failed to communicate with Zapier" });
  }
};
