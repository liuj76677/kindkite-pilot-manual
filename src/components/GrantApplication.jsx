import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getGrantApplicationData, generateSampleAnswers, getApplicationStatus, saveApplicationProgress } from '../services/grantDatabase';
import { ragClient } from '../utils/rag';
import axios from 'axios';

export default function GrantApplication({ grant, organization }) {
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [questionErrors, setQuestionErrors] = useState({});
  const [applicationData, setApplicationData] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [responses, setResponses] = useState({});
  const [generatingResponses, setGeneratingResponses] = useState({});

  useEffect(() => {
    async function loadApplicationData() {
      try {
        setLoading(true);
        setGlobalError(null);
        setQuestionErrors({});

        // Fetch pre-processed grant application data
        const data = await getGrantApplicationData(grant.id);
        setApplicationData(data);

        // Generate responses for each question
        const generatedResponses = {};
        for (const question of data.questions) {
          try {
            setGeneratingResponses(prev => ({ ...prev, [question.id]: true }));
            
            const searchResults = await ragClient.hybridSearch(
              `${question.question} ${question.guidelines}`
            );
            
            const prompt = `
              Organization Information:
              ${JSON.stringify(organization)}
              
              Grant Question:
              ${question.question}
              
              Guidelines:
              ${question.guidelines}
              
              Please generate a response that:
              1. Directly answers the question
              2. Incorporates relevant organization information
              3. Follows the guidelines
              4. Stays within ${question.maxLength || 1000} characters
            `;

            const response = await ragClient.augmentPrompt(prompt, searchResults);
            generatedResponses[question.id] = response.response || '';
          } catch (err) {
            console.error(`Error generating response for question ${question.id}:`, err);
            setQuestionErrors(prev => ({
              ...prev,
              [question.id]: `Failed to generate response: ${err.message}`
            }));
            generatedResponses[question.id] = '';
          } finally {
            setGeneratingResponses(prev => ({ ...prev, [question.id]: false }));
          }
        }
        setResponses(generatedResponses);

        // Get application status
        const applicationStatus = await getApplicationStatus(grant.id, organization.id);
        setStatus(applicationStatus);
      } catch (err) {
        setGlobalError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadApplicationData();
  }, [grant.id, organization]);

  const handleResponseEdit = (questionId, newResponse) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: newResponse
    }));
  };

  const handleSaveProgress = async () => {
    try {
      setSaving(true);
      await saveApplicationProgress(grant.id, organization.id, responses);
      // Refresh status after saving
      const newStatus = await getApplicationStatus(grant.id, organization.id);
      setStatus(newStatus);
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grant application...</p>
        </div>
      </div>
    );
  }

  if (globalError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error</h3>
        <p className="text-red-600 mt-2">{globalError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Application Status */}
      {status && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Application Progress</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                status.completed ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-gray-600">
                {status.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <button
              onClick={handleSaveProgress}
              disabled={saving}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions Section */}
      {applicationData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Application Questions</h3>
          <div className="space-y-4">
            {applicationData.questions.map((question) => (
              <div key={question.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{question.question}</p>
                    <p className="text-sm text-gray-500 mt-1">{question.guidelines}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    question.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {question.required ? 'Required' : 'Optional'}
                  </span>
                </div>
                
                {/* Sample Answer */}
                {answers && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Sample Answer:</p>
                    <p className="mt-2 text-gray-600">{answers.answers.find(a => a.questionId === question.id)?.answer}</p>
                    {answers.answers.find(a => a.questionId === question.id)?.needsReview && (
                      <p className="mt-2 text-sm text-orange-600">
                        Note: This answer needs review. {answers.answers.find(a => a.questionId === question.id)?.reviewNotes}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseEdit(question.id, e.target.value)}
                      className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your response here..."
                      maxLength={question.maxLength || 1000}
                    />
                    {generatingResponses[question.id] && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                    {questionErrors[question.id] && (
                      <p className="mt-2 text-sm text-red-600">{questionErrors[question.id]}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {responses[question.id]?.length || 0} / {question.maxLength || 1000} characters
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements Section */}
      {applicationData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Requirements</h3>
          <div className="space-y-4">
            {applicationData.requirements.map((req, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className={`mt-1 w-4 h-4 rounded-full ${
                  req.isMet ? 'bg-green-100' : 'bg-red-100'
                }`} />
                <div>
                  <p className="font-medium">{req.description}</p>
                  {!req.isMet && (
                    <p className="text-sm text-orange-600 mt-1">{req.actionNeeded}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines Section */}
      {applicationData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Guidelines</h3>
          <div className="space-y-4">
            {Object.entries(applicationData.guidelines).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-medium capitalize mb-2">{category}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {items.map((item, index) => (
                    <li key={index} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4 mt-8">
        <button className="px-6 py-2 border rounded-lg">
          Save Draft
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
          Submit Application
        </button>
      </div>
    </div>
  );
}

GrantApplication.propTypes = {
  grant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    funder: PropTypes.string.isRequired,
  }).isRequired,
  organization: PropTypes.shape({
    id: PropTypes.string.isRequired,
    organization: PropTypes.string.isRequired,
    mission: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
}; 