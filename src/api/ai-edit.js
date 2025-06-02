import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullText, selectedText, instruction } = req.body;
    if (!fullText || !selectedText || !instruction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `You are an expert grant writer and editor. Here is a chunk of text from a grant application:

"""
${selectedText}
"""

Instruction: ${instruction}

Return ONLY the improved or corrected version of the selected text, with no extra commentary or formatting. Do not return the full document, only the revised selection.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful grant writing assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.7
    });

    const newText = completion.choices[0].message.content.trim();
    return res.status(200).json({ newText });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
} 