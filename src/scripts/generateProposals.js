// Script to generate proposal answers for each org-grant pair using RAG
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import fs from 'fs';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT
});
const index = pinecone.index('kindkite-grants');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateProposal(org, grant, questions) {
  const answers = [];
  for (const q of questions) {
    // Retrieve relevant org and grant context
    const orgResults = await index.query({
      topK: 3,
      includeMetadata: true,
      queryRequest: { text: q.question, filter: { org_id: org.id } }
    });
    const grantResults = await index.query({
      topK: 3,
      includeMetadata: true,
      queryRequest: { text: q.question, filter: { grant_id: grant.id } }
    });
    const context = [
      ...orgResults.matches.map(m => m.metadata.chunk_text),
      ...grantResults.matches.map(m => m.metadata.chunk_text)
    ].join('\n');
    // Augment prompt
    const prompt = `Grant Question: ${q.question}\n\nRelevant Info:\n${context}\n\nDraft a high-quality answer for this question.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a grant application assistant.' },
        { role: 'user', content: prompt }
      ]
    });
    answers.push({ question: q.question, answer: completion.choices[0].message.content });
    console.log(`Generated answer for: ${q.question}`);
  }
  return answers;
}

// Example usage:
// const org = { id: 'org1', name: 'Tembo Education', ... };
// const grant = { id: 'grant1', name: 'D-Prize', ... };
// const questions = [ { question: 'Describe your mission...' }, ... ];
// await generateProposal(org, grant, questions);

export { generateProposal }; 