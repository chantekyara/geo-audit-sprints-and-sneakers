export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    if (!data.email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // === HubSpot Form Submission ===
    // Replace PORTAL_ID and FORM_GUID with actual values
    const hubspotResponse = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${process.env.HUBSPOT_PORTAL_ID}/${process.env.HUBSPOT_FORM_GUID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: data.fields,
          context: {
            ...data.context,
            hutk: data.hutk || '',
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
          }
        })
      }
    );

    if (!hubspotResponse.ok) {
      const errorBody = await hubspotResponse.text();
      console.error('HubSpot error:', errorBody);
      return res.status(502).json({ error: 'Failed to submit to HubSpot' });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
