import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
      const response = await this.api.post('/rag/process-document', {
        content,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async hybridSearch(query, topK = 5) {
    try {
      const response = await this.api.post('/rag/search', {
        query,
        topK,
      });
      return response.data;
    } catch (error) {
      console.error('Error performing hybrid search:', error);
      return [];
    }
  }

  async augmentPrompt(query, context, options = {}) {
    try {
      const response = await this.api.post('/rag/augment-prompt', {
        query,
        context,
        options,
      });
      return response.data;
    } catch (error) {
      console.error('Error augmenting prompt:', error);
      return {
        response: 'Error generating response',
        sources: [],
      };
    }
  }

  async updateDocument(documentId, newContent, metadata = {}) {
    try {
      const response = await this.api.put(`/rag/documents/${documentId}`, {
        content: newContent,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export a singleton instance
export const ragClient = new RAGClient(); 