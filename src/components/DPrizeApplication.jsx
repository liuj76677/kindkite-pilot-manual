import React, { useState, useEffect } from 'react';
import { grantService } from '../services/grantService';
import { dprizeSubmissionRequirements } from '../data/dprizeQuestions';

const DPrizeApplication = ({ organization, pdfBuffer }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [responses, setResponses] = useState({});
  const [validation, setValidation] = useState({});
  const [summary, setSummary] = useState(null);
  const [response, setResponse] = useState(null);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    processApplication();
  }, [organization, pdfBuffer]);

  const processApplication = async () => {
    try {
      setLoading(true);
      setError(null);

      // Process the grant application
      const result = await grantService.processGrantApplication(
        'd-prize',
        organization,
        pdfBuffer
      );

      setApplicationData(result.structuredData);
      setResponses(result.responses);

      // Validate responses
      const validationResults = await grantService.validateResponses(
        result.responses,
        organization,
        'd-prize'
      );
      setValidation(validationResults);

      // Generate summary
      const applicationSummary = await grantService.generateApplicationSummary(
        'd-prize',
        organization,
        result.responses
      );
      setSummary(applicationSummary);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseEdit = (question, newResponse) => {
    setResponses(prev => ({
      ...prev,
      [question]: {
        ...prev[question],
        answer: newResponse
      }
    }));
  };

  const handleGenerateResponse = async (question) => {
    setIsLoading(true);
    try {
      const result = await grantService.generateGrantResponse(
        organization,
        'd-prize',
        question
      );
      setResponse(result.response);
      setSources(result.sources);
    } catch (error) {
      console.error('Error generating response:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = (question, response) => {
    if (question.requiresTable) {
      return (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {response.tableHeaders?.map((header, index) => (
                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {response.tableData?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <textarea
              value={response.additionalText || ''}
              onChange={(e) => handleResponseEdit(question.id, { ...response, additionalText: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Additional information..."
            />
          </div>
        </div>
      );
    }

    return (
      <textarea
        value={response.answer}
        onChange={(e) => handleResponseEdit(question.id, { ...response, answer: e.target.value })}
        className="w-full p-3 border rounded-lg"
        rows={6}
        maxLength={question.maxLength}
      />
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Submission Requirements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Submission Requirements</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Concept Note</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Maximum {dprizeSubmissionRequirements.conceptNote.maxPages} pages</li>
              <li>Format: {dprizeSubmissionRequirements.conceptNote.format}</li>
              <li>Maximum size: {dprizeSubmissionRequirements.conceptNote.maxSize}</li>
              <li className="text-yellow-600">{dprizeSubmissionRequirements.conceptNote.note}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Resumes</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Maximum {dprizeSubmissionRequirements.resumes.maxPagesPerPerson} page per person</li>
              <li>Format: {dprizeSubmissionRequirements.resumes.format}</li>
              <li>Maximum size: {dprizeSubmissionRequirements.resumes.maxSize}</li>
              <li>{dprizeSubmissionRequirements.resumes.note}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Language</h3>
            <p className="text-sm text-gray-600">{dprizeSubmissionRequirements.language.note}</p>
          </div>
        </div>
      </div>

      {/* Application Summary */}
      {summary && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Application Summary</h2>
          <div className="prose max-w-none">
            {summary}
          </div>
        </div>
      )}

      {/* Questions and Responses */}
      <div className="space-y-6">
        {dprizeFirstRoundQuestions.map((question) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{question.question}</h3>
                <p className="text-sm text-gray-600 mt-1">{question.guidelines}</p>
                {question.context && (
                  <p className="text-sm text-yellow-600 mt-2">{question.context}</p>
                )}
                {question.isOptional && (
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mt-2">
                    Optional
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {renderResponse(question, responses[question.id] || {})}
                <div className="text-sm text-gray-500">
                  {responses[question.id]?.answer?.length || 0} / {question.maxLength} characters
                </div>
              </div>

              {/* Validation Results */}
              {validation[question.id] && (
                <div className={`p-4 rounded-lg ${
                  validation[question.id].isValid ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      Score: {validation[question.id].score}/100
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      validation[question.id].isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {validation[question.id].isValid ? 'Valid' : 'Needs Review'}
                    </span>
                  </div>
                  
                  {validation[question.id].missingElements.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium text-sm">Missing Elements:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {validation[question.id].missingElements.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation[question.id].suggestions.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium text-sm">Suggestions:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {validation[question.id].suggestions.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Response Section */}
      {response && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Generated Response</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
          
          {/* Sources Section */}
          {sources.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Sources</h4>
              <div className="space-y-2">
                {sources.map((source, index) => (
                  <div key={index} className="text-sm text-gray-500">
                    <p className="font-medium">{source.source || 'Unknown Source'}</p>
                    <p className="text-xs">Last Updated: {source.lastUpdated}</p>
                    <p className="mt-1 text-gray-600">{source.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Generating response...</span>
          </div>
        </div>
      )}

      {/* Required Documents */}
      {applicationData?.documents && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Required Documents</h2>
          <ul className="list-disc list-inside space-y-2">
            {applicationData.documents.map((doc, index) => (
              <li key={index} className="text-gray-600">{doc}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Deadlines */}
      {applicationData?.deadlines && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Important Deadlines</h2>
          <ul className="list-disc list-inside space-y-2">
            {applicationData.deadlines.map((deadline, index) => (
              <li key={index} className="text-gray-600">{deadline}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button className="px-6 py-2 border rounded-lg">
          Save Draft
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Submit Application
        </button>
      </div>
    </div>
  );
};

export default DPrizeApplication; 