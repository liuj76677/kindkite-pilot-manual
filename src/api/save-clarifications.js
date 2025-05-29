import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'pilot_data.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orgId, grantId, clarifications } = req.body;
    if (!orgId || !clarifications || !Array.isArray(clarifications)) {
      return res.status(400).json({ error: 'Missing orgId or clarifications' });
    }
    // Read org data
    const orgs = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const orgIdx = orgs.findIndex(o => o.id === orgId);
    if (orgIdx === -1) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (!orgs[orgIdx].clarifications) orgs[orgIdx].clarifications = [];
    // Add clarifications with timestamp and grantId
    const now = new Date().toISOString();
    clarifications.forEach(c => {
      orgs[orgIdx].clarifications.push({
        grantId,
        question: c.question,
        answer: c.answer,
        timestamp: now
      });
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(orgs, null, 2));
    res.status(200).json({ org: orgs[orgIdx] });
  } catch (error) {
    console.error('Error saving clarifications:', error);
    res.status(500).json({ error: 'Failed to save clarifications' });
  }
} 