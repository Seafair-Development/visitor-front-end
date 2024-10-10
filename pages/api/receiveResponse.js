// pages/api/receiveResponse.js
let latestData = null;

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { status, fullName, imageUrl } = req.body;
    latestData = { status, fullName, imageUrl };
    console.log("Received data from Zapier:", { status, fullName, imageUrl });
    res.status(200).json({ message: "Data received successfully" });
  } else if (req.method === 'GET') {
    if (latestData) {
      res.status(200).json(latestData);
    } else {
      res.status(200).json({ message: "No data available yet" });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
