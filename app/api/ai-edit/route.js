import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullText, selectedText, instruction } = body;
    if (!fullText || !selectedText || !instruction) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const prompt = `You are an expert grant writer and editor. Here is the full text of a grant application:
\n"""
${fullText}
"""
\nThe user has selected the following text to edit:
\n"""
${selectedText}
"""
\nInstruction: ${instruction}
\nReturn ONLY the improved or corrected version of the selected text, with no extra commentary or formatting. Do not return the full document, only the revised selection.`;

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
    return new Response(JSON.stringify({ newText }), { status: 200 });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
} 