import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Validate required environment variables
if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set. Using default localhost URL.');
}

// Simple in-memory storage for documents
const documentStore = new Map();

// Frontend RAG client that communicates with the backend API
export class RAGClient {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async processDocument(content, metadata = {}) {
    try {
      if (!content) {
        throw new Error('Content is required for document processing');
      }

      // Store document in memory
      const docId = `doc_${Date.now()}`;
      documentStore.set(docId, {
        content,
        metadata,
        timestamp: new Date().toISOString()
      });

      return { id: docId, ...metadata };
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(error.response?.data?.error || 'Failed to process document');
    }
  }

  async hybridSearch(query, topK = 5) {
    try {
      if (!query) {
        throw new Error('Search query is required');
      }

      // Simple keyword-based search for now
      const results = Array.from(documentStore.entries())
        .map(([id, doc]) => ({
          id,
          score: this.calculateRelevanceScore(query, doc.content),
          metadata: doc.metadata,
          content: doc.content
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      return results;
    } catch (error) {
      console.error('Error performing hybrid search:', error);
      throw new Error(error.response?.data?.error || 'Failed to perform search');
    }
  }

  calculateRelevanceScore(query, content) {
    // Simple keyword matching score
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);
    const matches = queryWords.filter(word => contentWords.includes(word)).length;
    return matches / queryWords.length;
  }

  async augmentPrompt(query, context, options = {}) {
    try {
      if (!query) {
        throw new Error('Query is required for prompt augmentation');
      }

      if (!Array.isArray(context)) {
        throw new Error('Context must be an array of search results');
      }

      const response = await this.api.post('/rag/augment-prompt', {
        query,
        context,
        options,
      });

      if (!response.data || typeof response.data.response !== 'string') {
        throw new Error('Invalid response format from server');
      }

      return response.data;
    } catch (error) {
      console.error('Error augmenting prompt:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate response');
    }
  }

  async updateDocument(documentId, newContent, metadata = {}) {
    try {
      if (!documentId) {
        throw new Error('Document ID is required for update');
      }

      if (!newContent) {
        throw new Error('New content is required for update');
      }

      // Update document in memory
      if (documentStore.has(documentId)) {
        const existingDoc = documentStore.get(documentId);
        documentStore.set(documentId, {
          ...existingDoc,
          content: newContent,
          metadata: { ...existingDoc.metadata, ...metadata },
          timestamp: new Date().toISOString()
        });
        return { id: documentId, ...metadata };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error(error.response?.data?.error || 'Failed to update document');
    }
  }
}

// Export a singleton instance
export const ragClient = new RAGClient(); 