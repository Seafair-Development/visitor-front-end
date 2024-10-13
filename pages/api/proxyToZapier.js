// /pages/api/proxyToZapier.js

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
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
      responseData = await zapierResponse.json();
    } else {
      responseData = await zapierResponse.text();
      console.warn("Non-JSON response from Zapier:", responseData);
    }

    // Only process responses that include primary data fields
    if (zapierResponse.ok && responseData.visitor_id && responseData.eventDate && responseData.fullName && responseData.status) {
      res.status(200).json(responseData);
    } else {
      console.warn("Received metadata or incomplete data from Zapier, not sending to the front end:", responseData);
      res.status(204).end(); // Use 204 to indicate no content
    }
  } catch (error) {
    console.error("Error communicating with Zapier:", error);
    res.status(500).json({ error: "Failed to communicate with Zapier" });
  }
};
