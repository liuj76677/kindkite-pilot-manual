// /api/find-grant-link.js
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { grantTitle, funder } = req.body;

    if (!grantTitle || !funder) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `Find the most likely application URL for this grant:
    Grant Title: ${grantTitle}
    Funder: ${funder}

    Return only a JSON object in this format:
    {
      "url": "the most likely URL for the grant application"
    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(parsed);
  } catch (error) {
    console.error("Error in /api/find-grant-link:", error);
    res.status(500).json({ error: "OpenAI error", details: error.message });
  }
}
