// Script to generate proposal answers for each org-grant pair using OpenAI
import { OpenAI } from 'openai';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateProposal(org, grant, questions) {
  const answers = [];
  for (const q of questions) {
    // Create context from org and grant data
    const context = `
      Organization Information:
      Name: ${org.name}
      Mission: ${org.mission}
      Focus Areas: ${org.focusAreas.join(', ')}
      Size: ${org.size}
      Location: ${org.location}

      Grant Information:
      Name: ${grant.name}
      Description: ${grant.description}
      Requirements: ${grant.requirements}
      Deadline: ${grant.deadline}
    `;

    // Generate answer using OpenAI
    const prompt = `Grant Question: ${q.question}\n\nContext:\n${context}\n\nDraft a high-quality answer for this question.`;
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

// Main execution
async function main() {
  try {
    // Load organizations and grants from JSON files
    const orgs = JSON.parse(fs.readFileSync('./data/organizations.json', 'utf8'));
    const grants = JSON.parse(fs.readFileSync('./data/grants.json', 'utf8'));
    const questions = JSON.parse(fs.readFileSync('./data/questions.json', 'utf8'));

    // Generate proposals for each org-grant pair
    for (const org of orgs) {
      for (const grant of grants) {
        console.log(`Generating proposal for ${org.name} - ${grant.name}`);
        const answers = await generateProposal(org, grant, questions);
        
        // Save answers to file
        const outputDir = './output/proposals';
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(
          `${outputDir}/${org.id}_${grant.id}_proposal.json`,
          JSON.stringify({ org, grant, answers }, null, 2)
        );
      }
    }
  } catch (error) {
    console.error('Error generating proposals:', error);
    process.exit(1);
  }
}

main(); 