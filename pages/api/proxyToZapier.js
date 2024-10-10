// pages/api/proxyToZapier.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log("Received data:", req.body);  // Log request data for troubleshooting

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
        console.error("Error from Zapier:", errorText);  // Log Zapier response for debugging
        return res.status(zapierResponse.status).json({ error: errorText });
      }

      const data = await zapierResponse.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error connecting to Zapier:", error.message);  // Log error for further insights
      res.status(500).json({ error: "Failed to connect to Zapier. Check network connectivity or webhook availability." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
