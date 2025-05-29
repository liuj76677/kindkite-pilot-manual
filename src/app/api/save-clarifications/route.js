import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'pilot_data.json');

export async function POST(req) {
  try {
    const body = await req.json();
    const { orgId, grantId, clarifications } = body;
    if (!orgId || !clarifications || !Array.isArray(clarifications)) {
      return new Response(JSON.stringify({ error: 'Missing orgId or clarifications' }), { status: 400 });
    }
    // Read org data
    const orgs = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const orgIdx = orgs.findIndex(o => o.id === orgId);
    if (orgIdx === -1) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), { status: 404 });
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
    return new Response(JSON.stringify({ org: orgs[orgIdx] }), { status: 200 });
  } catch (error) {
    console.error('Error saving clarifications:', error);
    return new Response(JSON.stringify({ error: 'Failed to save clarifications' }), { status: 500 });
  }
} 