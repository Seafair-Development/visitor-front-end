// /pages/api/proxyToZapier.js

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  console.log("Incoming request body:", req.body);

  // Input validation
  if (!req.body.visitor_information_visitor_id || !req.body.event_information_event_type) {
    res.status(400).json({ error: "Missing required fields in request body" });
    return;
  }

  try {
    const zapierPayload = {
      visitor_information_visitor_id: req.body.visitor_information_visitor_id,
      event_information_event_type: req.body.event_information_event_type
    };

    const zapierResponse = await fetch("https://hooks.zapier.com/hooks/catch/13907609/2m737mn/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(zapierPayload),
      timeout: 10000 // 10 second timeout
    });

    console.log("Zapier response status:", zapierResponse.status);

    if (zapierResponse.ok) {
      const responseData = await zapierResponse.json();
      console.log("Zapier response data:", responseData);

      if (responseData.visitor_id && responseData.eventDate && responseData.fullName && responseData.status) {
        res.status(200).json(responseData);
      } else {
        res.status(500).json({ error: "Incomplete data received from Zapier" });
      }
    } else {
      const errorText = await zapierResponse.text();
      console.error("Zapier error response:", errorText);
      res.status(zapierResponse.status).json({ error: "Error from Zapier" });
    }

  } catch (error) {
    console.error("Error communicating with Zapier:", error);
    res.status(500).json({ error: "Failed to communicate with Zapier" });
  }
};
