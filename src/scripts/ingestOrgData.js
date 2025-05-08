// Script to ingest organization data, chunk, and upsert to Pinecone
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT
});
const index = pinecone.index('kindkite-grants');

async function ingestOrgFromJSON(jsonPath) {
  const orgs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  for (const org of orgs) {
    await ingestOrg(org);
  }
}

async function ingestOrg(org) {
  // Flatten org info into text chunks
  const fields = [
    `Organization Name: ${org.name}`,
    `Mission: ${org.mission}`,
    `Focus Areas: ${org.focusAreas?.join(', ')}`,
    `Location: ${org.location}`,
    `Team: ${(org.team || []).map(t => `${t.name} (${t.title}): ${t.responsibilities}`).join('; ')}`,
    `Past Projects: ${(org.pastProjects || []).join('; ')}`,
    `Other Info: ${org.otherInfo || ''}`
  ];
  const text = fields.filter(Boolean).join('\n');
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const docs = [{ pageContent: text }];
  const chunks = await splitter.splitDocuments(docs);
  const records = chunks.map((chunk, i) => ({
    id: `${org.id}-chunk${i}`,
    chunk_text: chunk.pageContent,
    org_id: org.id,
    org_name: org.name,
    chunk_index: i
  }));
  await index.upsert(records, { namespace: '' });
  console.log(`Upserted ${records.length} chunks for org ${org.id}`);
}

// Example usage:
// await ingestOrgFromJSON('path/to/orgs.json');
// await ingestOrg({ id: 'org1', name: 'Tembo Education', ... });

export { ingestOrgFromJSON, ingestOrg }; 