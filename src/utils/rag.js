import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Validate required environment variables
if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set. Using default localhost URL.');
}

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

      const response = await this.api.post('/rag/process-document', {
        content,
        metadata,
      });

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      return response.data;
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

      const response = await this.api.post('/rag/search', {
        query,
        topK,
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid search results format from server');
      }

      return response.data;
    } catch (error) {
      console.error('Error performing hybrid search:', error);
      throw new Error(error.response?.data?.error || 'Failed to perform search');
    }
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

      const response = await this.api.put(`/rag/documents/${documentId}`, {
        content: newContent,
        metadata,
      });

      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error(error.response?.data?.error || 'Failed to update document');
    }
  }
}

// Export a singleton instance
export const ragClient = new RAGClient(); 