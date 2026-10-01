import { setMemoryStatus } from '../../../../lib/emailMemory';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    await setMemoryStatus(req.query.id, req.body?.status);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
