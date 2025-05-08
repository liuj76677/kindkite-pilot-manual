import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';

export class GrantDocumentProcessor {
  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
  }

  async processGrantPDF(pdfBuffer) {
    const loader = new PDFLoader(pdfBuffer);
    const docs = await loader.load();
    
    // Extract structured information from the PDF
    const structuredData = this.extractStructuredData(docs);
    
    // Create chunks for RAG
    const chunks = await this.createChunks(docs, structuredData);
    
    return {
      structuredData,
      chunks
    };
  }

  extractStructuredData(docs) {
    const fullText = docs.map(doc => doc.pageContent).join('\n');
    
    // Extract key sections using regex patterns
    const sections = {
      eligibility: this.extractSection(fullText, /eligibility|requirements|qualifications/i),
      applicationProcess: this.extractSection(fullText, /application process|how to apply|submission/i),
      questions: this.extractQuestions(fullText),
      documents: this.extractRequiredDocuments(fullText),
      deadlines: this.extractDeadlines(fullText)
    };

    return sections;
  }

  extractSection(text, pattern) {
    const match = text.match(new RegExp(`${pattern.source}.*?(?=\\n\\n|$)`, 'is'));
    return match ? match[0].trim() : '';
  }

  extractQuestions(text) {
    const questions = [];
    const questionPattern = /(?:^|\n)(?:\d+\.|Q\d+\.|Question \d+:)\s*(.*?)(?=\n\d+\.|Q\d+\.|Question \d+:|$)/gs;
    
    let match;
    while ((match = questionPattern.exec(text)) !== null) {
      questions.push({
        question: match[1].trim(),
        context: this.getQuestionContext(text, match.index)
      });
    }
    
    return questions;
  }

  getQuestionContext(text, questionIndex) {
    // Get the paragraph before and after the question
    const contextStart = Math.max(0, text.lastIndexOf('\n\n', questionIndex));
    const contextEnd = text.indexOf('\n\n', questionIndex + 1);
    return text.slice(contextStart, contextEnd).trim();
  }

  extractRequiredDocuments(text) {
    const documents = [];
    const docPattern = /(?:required|submit|provide).*?(?:document|form|file).*?(?=\n|$)/gi;
    
    let match;
    while ((match = docPattern.exec(text)) !== null) {
      documents.push(match[0].trim());
    }
    
    return documents;
  }

  extractDeadlines(text) {
    const deadlines = [];
    const datePattern = /(?:deadline|due date|submission date).*?(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\w+ \d{1,2},? \d{4})/gi;
    
    let match;
    while ((match = datePattern.exec(text)) !== null) {
      deadlines.push(match[0].trim());
    }
    
    return deadlines;
  }

  async createChunks(docs, structuredData) {
    // Create chunks from the full text
    const textChunks = await this.textSplitter.splitDocuments(docs);
    
    // Add metadata to chunks
    return textChunks.map(chunk => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        section: this.determineSection(chunk.pageContent, structuredData)
      }
    }));
  }

  determineSection(chunkText, structuredData) {
    // Determine which section the chunk belongs to
    for (const [section, content] of Object.entries(structuredData)) {
      if (content.toLowerCase().includes(chunkText.toLowerCase())) {
        return section;
      }
    }
    return 'general';
  }
} 