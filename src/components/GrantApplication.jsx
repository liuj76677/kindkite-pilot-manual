import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getGrantApplicationData, generateSampleAnswers, getApplicationStatus, saveApplicationProgress } from '../services/grantDatabase';
import { searchSimilarDocuments, augmentPrompt } from '../utils/rag';
import axios from 'axios';

export default function GrantApplication({ grant, organization }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    async function loadApplicationData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch pre-processed grant application data
        const data = await getGrantApplicationData(grant.id);
        setApplicationData(data);

        // Fetch draft answers from backend RAG endpoint
        let draftAnswers = null;
        try {
          const response = await axios.post('/api/generate-draft-answers', {
            orgInfo: organization,
            grantQuestions: data.questions
          });
          draftAnswers = response.data;
        } catch (e) {
          // If the endpoint fails, fallback to empty answers
          draftAnswers = { answers: [] };
        }
        setAnswers(draftAnswers);
        // Set initial responses to the draft answers
        const initialResponses = {};
        if (draftAnswers && draftAnswers.answers) {
          draftAnswers.answers.forEach(a => {
            initialResponses[a.questionId] = a.answer;
          });
        }
        setResponses(initialResponses);

        // Get application status
        const applicationStatus = await getApplicationStatus(grant.id, organization.id);
        setStatus(applicationStatus);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadApplicationData();
  }, [grant.id, organization]);

  useEffect(() => {
    loadGrantAndGenerateResponses();
  }, [grant.id, organization]);

  const loadGrantAndGenerateResponses = async () => {
    try {
      setLoading(true);
      // First, get the grant details
      const grantDetails = await fetchGrantDetails(grant.id);
      setApplicationData(grantDetails.application);

      // Generate responses for each question
      const generatedResponses = {};
      for (const question of grantDetails.application.questions) {
        const context = await searchSimilarDocuments(
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
          4. Stays within ${question.maxLength} characters
        `;

        const response = await augmentPrompt(prompt, context);
        generatedResponses[question.id] = response;
      }

      setResponses(generatedResponses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
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
                  <textarea
                    value={responses[question.id] || ''}
                    onChange={(e) => handleResponseEdit(question.id, e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    rows={question.type === 'short_answer' ? 3 : 8}
                    maxLength={question.maxLength}
                  />
                  <div className="text-sm text-gray-500">
                    {responses[question.id]?.length || 0} / {question.maxLength} characters
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