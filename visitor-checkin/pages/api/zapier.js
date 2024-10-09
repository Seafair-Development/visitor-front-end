export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { visitor_information_visitor_id, event_information_event_type } = req.body;

    const response = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitor_information_visitor_id,
        event_information_event_type
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
