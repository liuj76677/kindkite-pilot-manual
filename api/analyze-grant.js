import { Configuration, OpenAIApi } from 'openai';

// Configure OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for actual request
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    console.log('Received request:', {
      method: req.method,
      contentType: req.headers['content-type'],
      bodyLength: req.body ? JSON.stringify(req.body).length : 0
    });

    if (req.method !== 'POST') {
      throw new Error('Only POST requests are supported');
    }

    if (!req.body || !req.body.prompt) {
      throw new Error('Missing required field: prompt');
    }

    console.log('Calling OpenAI with prompt length:', req.body.prompt.length);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a grant analysis expert. Provide analysis in the exact JSON format requested."
        },
        {
          role: "user",
          content: req.body.prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    console.log('OpenAI response:', {
      status: completion.status,
      hasChoices: !!completion.data.choices?.length,
      firstChoice: completion.data.choices?.[0]?.message?.content?.substring(0, 100) + '...'
    });

    if (!completion.data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Validate that the response is valid JSON
    try {
      const parsed = JSON.parse(completion.data.choices[0].message.content);
      console.log('Successfully parsed response as JSON');
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('OpenAI response was not valid JSON');
    }

    return res.status(200).json(completion.data);
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ 
      error: true,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
