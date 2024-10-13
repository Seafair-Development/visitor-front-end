// /pages/api/proxyToZapier.js

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  try {
    // Construct the payload with the exact expected field names and values
    const zapierPayload = {
      visitor_information_visitor_id: req.body.visitor_information_visitor_id,
      event_information_event_type: req.body.event_information_event_type
    };

    const zapierResponse = await fetch('https://hooks.zapier.com/hooks/catch/your_zap_id_here', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zapierPayload)
    });

    const responseData = await zapierResponse.json();

    // Only respond if Zapier returns a successful status
    if (zapierResponse.status === 200) {
      res.status(200).json(responseData);
    } else {
      res.status(zapierResponse.status).json({ error: `Zapier returned status ${zapierResponse.status}` });
    }
  } catch (error) {
    console.error("Error communicating with Zapier:", error);
    res.status(500).json({ error: "Failed to communicate with Zapier" });
  }
};
