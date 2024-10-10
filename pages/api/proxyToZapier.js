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

      const contentType = zapierResponse.headers.get("content-type");
      if (!zapierResponse.ok) {
        const errorText = await zapierResponse.text();
        console.error("Error from Zapier:", errorText);
        return res.status(zapierResponse.status).json({ error: errorText });
      }

      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await zapierResponse.json();
      } else {
        data = await zapierResponse.text();
        console.warn("Received non-JSON response from Zapier:", data);
      }
      
      console.log("Zapier Response Data:", data);
      res.status(200).json({ status: "success", data });
    } catch (error) {
      console.error("Error connecting to Zapier:", error.message);
      res.status(500).json({ error: "Failed to connect to Zapier. Check network connectivity or webhook availability." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
