import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Fetch pre-processed grant application data
export async function getGrantApplicationData(grantId) {
  try {
    const response = await fetch(`https://kindkite-backend.onrender.com/grant-application/${grantId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch grant application data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching grant application data:', error);
    throw error;
  }
}

// Generate sample answers for pre-processed questions
export async function generateSampleAnswers(questions, organization) {
  try {
    const prompt = `
    Generate sample answers for these grant application questions based on the organization's profile:

    Organization Profile:
    ${JSON.stringify(organization, null, 2)}

    Questions:
    ${JSON.stringify(questions, null, 2)}

    Provide answers in this JSON format:
    {
      "answers": [
        {
          "questionId": "matching question id",
          "answer": "sample answer text",
          "confidence": number (0-100),
          "needsReview": true|false,
          "reviewNotes": "what needs to be reviewed or modified"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error generating sample answers:', error);
    throw error;
  }
}

// Get application status and progress
export async function getApplicationStatus(grantId, organizationId) {
  try {
    const response = await fetch(`https://kindkite-backend.onrender.com/application-status/${grantId}/${organizationId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch application status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching application status:', error);
    throw error;
  }
}

// Save application progress
export async function saveApplicationProgress(grantId, organizationId, answers) {
  try {
    const response = await fetch(`https://kindkite-backend.onrender.com/save-application/${grantId}/${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      throw new Error('Failed to save application progress');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving application progress:', error);
    throw error;
  }
} 