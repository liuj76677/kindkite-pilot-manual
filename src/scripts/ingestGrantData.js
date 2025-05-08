// Script to ingest grant data (from PDF or manual entry), chunk, and upsert to Pinecone
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT
});
const index = pinecone.index('kindkite-grants');

async function ingestGrantFromPDF(pdfPath, grantMeta) {
  const loader = new PDFLoader(pdfPath);
  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const chunks = await splitter.splitDocuments(docs);
  const records = chunks.map((chunk, i) => ({
    id: `${grantMeta.id}-chunk${i}`,
    chunk_text: chunk.pageContent,
    ...grantMeta,
    chunk_index: i
  }));
  await index.upsert(records, { namespace: '' });
  console.log(`Upserted ${records.length} chunks for grant ${grantMeta.id}`);
}

async function ingestGrantFromText(text, grantMeta) {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const docs = [{ pageContent: text }];
  const chunks = await splitter.splitDocuments(docs);
  const records = chunks.map((chunk, i) => ({
    id: `${grantMeta.id}-chunk${i}`,
    chunk_text: chunk.pageContent,
    ...grantMeta,
    chunk_index: i
  }));
  await index.upsert(records, { namespace: '' });
  console.log(`Upserted ${records.length} chunks for grant ${grantMeta.id}`);
}

// Example usage:
// await ingestGrantFromPDF('path/to/grant.pdf', { id: 'grant1', name: 'D-Prize', ... });
// await ingestGrantFromText('grant text here', { id: 'grant2', name: 'Other Grant', ... });

export { ingestGrantFromPDF, ingestGrantFromText }; 