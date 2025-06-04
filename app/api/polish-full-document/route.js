import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { requirements, answers, grantTitle, orgName, prompt, clarifications } = body;
    console.log('Polish API received:', JSON.stringify(body, null, 2));
    if (!requirements || !answers) {
      return new Response(JSON.stringify({ error: 'Missing requirements or answers' }), { status: 400 });
    }

    let fullPrompt = `You are an expert grant writer. Your job is to combine the provided draft answers into a single, cohesive, detailed, and well-formatted grant application document for the grant titled '${grantTitle}' for the organization '${orgName}'.\n\n` +
      `Rules:\n` +
      `1. Do NOT delete, omit, summarize, or rephrase away any content from the provided answers. Every detail, fact, and example from the draft answers must be included in the final document.\n` +
      `2. Only combine, organize, and polish the answers, ensuring every grant requirement is addressed in full detail.\n` +
      `3. The output should be as detailed, specific, and comprehensive as possible, preserving all information and examples.\n` +
      `4. The writing style should be professional, clear, and persuasive, as if written by a top grant writer.\n` +
      `5. The final document must meet every grant requirement and include all relevant details from the draft answers.\n` +
      `6. If you find any section that is missing information, unclear, or requires a plan/strategy, STOP and return a list of specific clarification questions for the user to answer.\n` +
      `7. Do NOT invent or assume any information that is not present in the answers or clarifications.\n` +
      `8. If clarifications are provided, incorporate them in the appropriate sections.\n` +
      `9. The final output should be a single, ready-to-submit document, formatted in HTML (no markdown).\n` +
      `10. When asking clarification questions, ONLY ask for missing factual information. Do NOT reference section-specific jargon, grant section names, or assume the user knows what the grant is asking. Phrase each question in plain, user-friendly language, and be specific about what factual detail is missing.\n` +
      `11. Do NOT ask the user to "clarify" or "elaborate" in general terms—be concrete about what information is needed.\n` +
      `12. Minimize the number of clarification questions. Only ask for information that is absolutely required to complete the draft. Do NOT ask broad, open-ended, or fluffy questions. Each question must be specific, actionable, and only about factual gaps that prevent completion.\n` +
      `13. Ask at most 3 clarification questions per round. If more information is still needed after the user answers, you may ask follow-up questions in the next round.\n` +
      `14. When determining what to ask, carefully reference the original grant guidelines, questions, the draft answers, and all known information about the organization. Only ask for information that is truly missing after considering all available context.\n` +
      `\nGrant Requirements and Descriptions:\n` +
      requirements.map(r => `- ${r.label}: ${r.description}`).join('\n') +
      `\n\nDraft Answers:\n` +
      answers.map(a => `- ${a.label}: ${a.answer}`).join('\n') +
      (clarifications && clarifications.length > 0 ? `\n\nClarifications Provided:\n${clarifications.map(c => `- ${c.question}: ${c.answer}`).join('\n')}` : '') +
      `\n\nIf you need more information to complete any section, return ONLY a JSON object with a key 'clarificationQuestions' and a list of questions. Otherwise, return ONLY a JSON object with a key 'polishedDocument' and the HTML string.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful grant writing assistant. Respond ONLY in JSON as instructed.' },
        { role: 'user', content: fullPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const content = completion.choices[0].message.content;
    console.log('OpenAI response:', content);
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to parse AI response', raw: content }), { status: 500 });
    }
    return new Response(JSON.stringify(parsed), { status: 200 });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
} 