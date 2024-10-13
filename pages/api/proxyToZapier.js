// /pages/api/proxyToZapier.js

export default async (req, res) => {
  if (req.method !== "POST") {
    // Return a 405 status without logging for non-POST requests
    res.status(405).end();
    return;
  }

  try {
    const zapierPayload = {
      visitor_information_visitor_id: req.body.visitor_information_visitor_id,
      event_information_event_type: req.body.event_information_event_type
    };

    console.info("Sending payload to Zapier:", JSON.stringify(zapierPayload, null, 2));

    const zapierResponse = await fetch('https://hooks.zapier.com/hooks/catch/your_zap_id_here', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zapierPayload)
    });

    const responseData = await zapierResponse.json();
    console.info("Received response from Zapier:", JSON.stringify(responseData, null, 2));

    if (zapierResponse.status === 200) {
      res.status(200).json(responseData);
    } else {
      console.warn("Non-200 response from Zapier:", zapierResponse.status);
      res.status(zapierResponse.status).json({ error: `Zapier returned status ${zapierResponse.status}` });
    }
  } catch (error) {
    console.error("Error communicating with Zapier:", error);
    res.status(500).json({ error: "Failed to communicate with Zapier" });
  }
};
