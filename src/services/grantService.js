import { processPDF, storeDocument, searchSimilarDocuments, augmentPrompt, enhancedRAG } from '../utils/rag';
import { GrantDocumentProcessor } from '../utils/grantDocumentProcessor';
import { dprizeFirstRoundQuestions, dprizeSubmissionRequirements } from '../data/dprizeQuestions';

class GrantService {
  constructor() {
    this.grants = new Map();
    this.documentProcessor = new GrantDocumentProcessor();
    this.initializeDprizeGrant();
  }

  initializeDprizeGrant() {
    const dprizeGrant = {
      id: 'd-prize',
      title: 'D-Prize First Round Proposal',
      organization: 'D-Prize',
      description: 'D-Prize funds new organizations that distribute proven poverty interventions.',
      requirements: {
        eligibility: [
          'Must be a new organization or venture idea',
          'Must focus on distributing proven poverty interventions',
          'Must be able to complete a pilot program'
        ]
      },
      application: {
        questions: dprizeFirstRoundQuestions,
        requirements: dprizeSubmissionRequirements
      }
    };
    this.grants.set('d-prize', dprizeGrant);
  }

  async initializeGrantDatabase(grantData) {
    // Process and store grant data
    for (const grant of grantData) {
      const chunks = await this.processGrantData(grant);
      await storeDocument(chunks, {
        type: 'grant',
        grantId: grant.id,
        metadata: grant.metadata
      });
      this.grants.set(grant.id, grant);
    }
  }

  async processGrantData(grant) {
    // Convert grant data into chunks for RAG
    const grantText = `
      Title: ${grant.title}
      Description: ${grant.description}
      Organization: ${grant.organization}
      Requirements: ${grant.requirements.eligibility.join(', ')}
      Questions: ${grant.application.questions.map(q => 
        `Question: ${q.question} Guidelines: ${q.guidelines}`
      ).join('\n')}
    `;
    
    return [{
      pageContent: grantText,
      metadata: {
        grantId: grant.id,
        type: 'grant'
      }
    }];
  }

  async findMatchingGrants(organization, topK = 3) {
    const organizationProfile = `
      Organization Name: ${organization.name}
      Mission: ${organization.mission}
      Focus Areas: ${organization.focusAreas.join(', ')}
      Size: ${organization.size}
      Location: ${organization.location}
    `;

    // Use enhanced RAG for better matching
    const matches = await enhancedRAG.hybridSearch(organizationProfile, topK);
    
    return matches.map(match => ({
      ...this.grants.get(match.metadata.grantId),
      relevanceScore: match.score,
      matchedContext: match.metadata.content
    }));
  }

  async processGrantApplication(grantId, organization, pdfBuffer) {
    // Process the grant application PDF
    const { structuredData, chunks } = await this.documentProcessor.processGrantPDF(pdfBuffer);
    
    // Store the processed data
    await storeDocument(chunks, {
      type: 'grant_application',
      grantId,
      organizationId: organization.id,
      metadata: {
        ...structuredData,
        grantId,
        organizationId: organization.id
      }
    });

    // Generate responses for each question
    const responses = await this.generateResponses(structuredData.questions, organization, chunks);
    
    return {
      structuredData,
      responses,
      requiredDocuments: structuredData.documents,
      deadlines: structuredData.deadlines
    };
  }

  async generateResponses(questions, organization, contextChunks) {
    const responses = {};
    
    for (const question of questions) {
      // Find relevant context for this specific question
      const relevantChunks = contextChunks.filter(chunk => 
        chunk.metadata.section === 'questions' || 
        chunk.pageContent.toLowerCase().includes(question.question.toLowerCase())
      );

      const context = relevantChunks.map(chunk => chunk.pageContent).join('\n\n');

      const prompt = `
        Organization Information:
        ${JSON.stringify(organization)}
        
        Grant Question:
        ${question.question}
        
        Question Context:
        ${question.context}
        
        Please generate a response that:
        1. Directly answers the question
        2. Incorporates relevant organization information
        3. Follows the guidelines and context provided
        4. Is specific and detailed
        5. Maintains a professional tone
        6. Focuses on concrete examples and achievements
      `;

      const response = await augmentPrompt(prompt, context);
      responses[question.question] = {
        answer: response,
        context: question.context,
        relevantChunks: relevantChunks.map(chunk => chunk.pageContent)
      };
    }

    return responses;
  }

  async validateResponses(responses, organization, grantId) {
    const validationResults = {};
    
    for (const [question, response] of Object.entries(responses)) {
      const prompt = `
        Organization Information:
        ${JSON.stringify(organization)}
        
        Grant Question:
        ${question}
        
        Generated Response:
        ${response.answer}
        
        Please validate this response by:
        1. Checking if it directly answers the question
        2. Verifying it includes relevant organization information
        3. Ensuring it follows the guidelines
        4. Identifying any missing information
        5. Suggesting improvements
        
        Provide your validation in the following format:
        {
          "isValid": boolean,
          "missingElements": [string],
          "suggestions": [string],
          "score": number (0-100)
        }
      `;

      const validation = await augmentPrompt(prompt, response.context);
      validationResults[question] = JSON.parse(validation);
    }

    return validationResults;
  }

  async generateApplicationSummary(grantId, organization, responses) {
    const prompt = `
      Organization Information:
      ${JSON.stringify(organization)}
      
      Generated Responses:
      ${JSON.stringify(responses)}
      
      Please provide a summary of the application that:
      1. Highlights key strengths
      2. Identifies potential areas of concern
      3. Suggests any missing information
      4. Provides an overall assessment
    `;

    return await augmentPrompt(prompt, '');
  }

  async updateGrantData(grantId, newData) {
    const grant = this.grants.get(grantId);
    if (!grant) throw new Error('Grant not found');

    // Update grant data
    Object.assign(grant, newData);
    this.grants.set(grantId, grant);

    // Update vector database
    const chunks = await this.processGrantData(grant);
    await storeDocument(chunks, {
      type: 'grant',
      grantId: grant.id,
      metadata: grant.metadata
    });
  }

  async generateGrantResponse(organization, grantId, question) {
    const grant = this.grants.get(grantId);
    if (!grant) throw new Error('Grant not found');

    // Get relevant context using RAG
    const context = await enhancedRAG.hybridSearch(
      `${question.question} ${question.guidelines}`,
      3
    );

    // Generate response using augmented prompt
    const { response, sources } = await enhancedRAG.augmentPrompt(
      question.question,
      context,
      {
        includeSources: true,
        maxContextLength: 2000,
        temperature: 0.7,
        systemPrompt: `You are a grant application assistant helping with a D-Prize application. 
        The response should be concise, specific, and follow the guidelines exactly.
        ${question.requiresTable ? 'Include a well-formatted table where required.' : ''}
        ${question.isOptional ? 'This is an optional question - only answer if applicable.' : ''}`
      }
    );

    return {
      response,
      sources,
      question,
      grantId,
      maxLength: question.maxLength
    };
  }
}

export const grantService = new GrantService(); 