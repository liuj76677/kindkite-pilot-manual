import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Process uploaded PDF
export async function processGrantPDF(file) {
  try {
    // First, convert PDF to text using OCR
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://kindkite-backend.onrender.com/process-pdf', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to process PDF');
    }

    const { text, metadata } = await response.json();
    
    // Extract questions and requirements using RAG
    const analysis = await analyzeGrantContent(text, metadata);
    
    return {
      success: true,
      questions: analysis.questions,
      requirements: analysis.requirements,
      guidelines: analysis.guidelines,
      sampleAnswers: analysis.sampleAnswers
    };
  } catch (error) {
    console.error('Error processing grant PDF:', error);
    throw error;
  }
}

// Analyze grant content using RAG
async function analyzeGrantContent(text, metadata) {
  try {
    const prompt = `
    Analyze this grant application document and extract:
    1. All application questions
    2. Requirements and guidelines
    3. Evaluation criteria
    4. Key deadlines and submission requirements

    Document Text:
    ${text}

    Metadata:
    ${JSON.stringify(metadata, null, 2)}

    Provide the analysis in this JSON format:
    {
      "questions": [
        {
          "id": "unique_id",
          "question": "full question text",
          "type": "text|number|file|multiple_choice",
          "required": true|false,
          "guidelines": "any specific guidelines for this question",
          "sampleAnswer": "a sample answer based on the organization's profile",
          "needsInput": true|false
        }
      ],
      "requirements": [
        {
          "category": "eligibility|submission|evaluation",
          "description": "requirement description",
          "isMet": true|false,
          "actionNeeded": "what needs to be done to meet this requirement"
        }
      ],
      "guidelines": {
        "formatting": ["list of formatting requirements"],
        "submission": ["list of submission requirements"],
        "evaluation": ["list of evaluation criteria"]
      }
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error analyzing grant content:', error);
    throw error;
  }
}

// Search for grant information
export async function searchGrantInfo(grantTitle, funder) {
  try {
    const response = await fetch('https://kindkite-backend.onrender.com/search-grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grantTitle, funder })
    });

    if (!response.ok) {
      throw new Error('Failed to search grant information');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching grant info:', error);
    throw error;
  }
}

// Generate sample answers for questions
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