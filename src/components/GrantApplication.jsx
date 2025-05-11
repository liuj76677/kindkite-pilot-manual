import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getGrantApplicationData, getApplicationStatus, saveApplicationProgress } from '../services/grantDatabase';
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

  useEffect(() => {
    async function loadApplicationData() {
      try {
        setLoading(true);
        setGlobalError(null);
        setQuestionErrors({});

        // Fetch pre-processed grant application data
        const data = await getGrantApplicationData(grant.id);
        setApplicationData(data);
        setResponses({}); // Clear responses on new load

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
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseEdit(question.id, e.target.value)}
                      className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your response here..."
                      maxLength={question.maxLength || 1000}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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