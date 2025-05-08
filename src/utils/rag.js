import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import puppeteer from 'puppeteer';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

const index = pinecone.Index('grant-matching');

// Enhanced RAG Implementation
export class EnhancedRAG {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Initialize the index with integrated embedding model
    this.index = this.pinecone.index('grant-matching', {
      embed: {
        model: 'llama-text-embed-v2',
        field_map: { text: 'chunk_text' }
      }
    });
  }

  async processDocument(content, metadata = {}) {
    try {
      // Create semantic chunks
      const chunks = await this.createSemanticChunks(content);
      
      // Prepare records for upsert
      const records = chunks.map((chunk, index) => ({
        id: `${metadata.id || 'doc'}-${index}`,
        values: chunk, // Pinecone will automatically generate embeddings
        metadata: {
          ...metadata,
          chunk_text: chunk,
          chunk_index: index
        }
      }));

      // Upsert to Pinecone
      await this.index.upsert(records);
      
      return {
        success: true,
        chunks: records.length
      };
    } catch (error) {
      console.error('Error processing document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createSemanticChunks(content) {
    // Use semantic boundaries for chunking
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '.', '!', '?', ';', ':', ' ', '']
    });
    
    return await splitter.splitText(content);
  }

  async generateEmbedding(text) {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async hybridSearch(query, topK = 5) {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Perform vector search
    const vectorResults = await this.index.query({
      vector: queryEmbedding,
      topK: topK * 2, // Get more results for re-ranking
      includeMetadata: true,
    });

    // Perform keyword search
    const keywordResults = await this.keywordSearch(query, topK * 2);

    // Combine and re-rank results
    const combinedResults = this.combineAndRerankResults(
      vectorResults.matches,
      keywordResults,
      query
    );

    return combinedResults.slice(0, topK);
  }

  async keywordSearch(query, topK) {
    // Implement BM25 or similar keyword search
    // This is a placeholder for actual implementation
    return [];
  }

  combineAndRerankResults(vectorResults, keywordResults, query) {
    // Combine results from both searches
    const combined = [...vectorResults, ...keywordResults];
    
    // Remove duplicates
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    
    // Re-rank based on multiple factors
    return unique.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query);
      const scoreB = this.calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });
  }

  calculateRelevanceScore(result, query) {
    // Implement sophisticated scoring
    // Consider factors like:
    // - Vector similarity
    // - Keyword match
    // - Recency
    // - Source authority
    return result.score || 0;
  }

  async augmentPrompt(query, context, options = {}) {
    const {
      includeSources = true,
      maxContextLength = 2000,
      temperature = 0.7
    } = options;

    // Format context with sources
    const formattedContext = includeSources
      ? this.formatContextWithSources(context)
      : context.map(c => c.content).join('\n\n');

    // Create the prompt
    const prompt = `
      Context Information:
      ${formattedContext}
      
      User Query:
      ${query}
      
      Please provide a response that:
      1. Directly answers the query
      2. Uses only the provided context
      3. Cites sources when relevant
      4. Acknowledges any limitations or uncertainties
    `;

    // Generate response
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are a grant application assistant." },
        { role: "user", content: prompt }
      ],
      temperature
    });

    return {
      response: completion.choices[0].message.content,
      sources: includeSources ? context.map(c => c.metadata) : []
    };
  }

  formatContextWithSources(context) {
    return context.map((c, i) => `
      [Source ${i + 1}]
      ${c.content}
      Source: ${c.metadata.source || 'Unknown'}
      Last Updated: ${c.metadata.lastUpdated || 'Unknown'}
    `).join('\n\n');
  }

  async updateDocument(documentId, newContent, metadata = {}) {
    // Delete old vectors
    await this.index.delete({
      filter: { documentId }
    });

    // Process and store new content
    return await this.processDocument(newContent, {
      ...metadata,
      id: documentId,
      lastUpdated: new Date().toISOString()
    });
  }
}

export const enhancedRAG = new EnhancedRAG();

// Document Processing Functions
export async function processWebPage(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const content = await page.content();
  await browser.close();
  
  // Convert to PDF (you'll need to implement this)
  const pdfBuffer = await convertToPDF(content);
  return processPDF(pdfBuffer);
}

export async function processPDF(pdfBuffer) {
  const loader = new PDFLoader(pdfBuffer);
  const docs = await loader.load();
  
  // Split documents into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  const chunks = await textSplitter.splitDocuments(docs);
  return chunks;
}

// Embedding and Storage Functions
export async function generateEmbeddings(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export async function storeDocument(chunks, metadata) {
  for (const chunk of chunks) {
    const embedding = await generateEmbeddings(chunk.pageContent);
    await index.upsert({
      vectors: [{
        id: crypto.randomUUID(),
        values: embedding,
        metadata: {
          ...metadata,
          text: chunk.pageContent,
        }
      }]
    });
  }
}

// Search Functions
export async function searchSimilarDocuments(query, topK = 5) {
  const queryEmbedding = await generateEmbeddings(query);
  
  const searchResults = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });
  
  return searchResults.matches;
}

// RAG Augmentation Function
export async function augmentPrompt(query, context) {
  const prompt = `
    Based on the following grant information:
    ${context}
    
    Please answer the following question:
    ${query}
  `;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: "You are a grant matching and writing assistant." },
      { role: "user", content: prompt }
    ],
  });
  
  return completion.choices[0].message.content;
}

// Continuous Update Function
export async function updateDocument(documentId, newContent) {
  const chunks = await processPDF(newContent);
  await storeDocument(chunks, { documentId });
} 