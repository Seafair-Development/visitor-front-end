// pages/api/proxyToZapier.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Forward the request to the Zapier webhook
      const zapierResponse = await fetch("https://hooks.zapier.com/hooks/catch/13907609/2m737mn/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });

      // Check if the request was successful
      if (!zapierResponse.ok) {
        const errorText = await zapierResponse.text();
        console.error("Error from Zapier:", errorText);  // Log error for debugging
        return res.status(zapierResponse.status).json({ error: errorText });
      }

      // Parse the response from Zapier
      const data = await zapierResponse.json();
      res.status(200).json(data);  // Forward the response back to the client
    } catch (error) {
      console.error("Error connecting to Zapier:", error.message);  // Log error for further insights
      res.status(500).json({ error: "Failed to connect to Zapier. Check network connectivity or webhook availability." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
