import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getGrantApplicationData, generateSampleAnswers, getApplicationStatus, saveApplicationProgress } from '../services/grantDatabase';

export default function GrantApplication({ grant, organization }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadApplicationData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch pre-processed grant application data
        const data = await getGrantApplicationData(grant.id);
        setApplicationData(data);

        // Generate sample answers
        const sampleAnswers = await generateSampleAnswers(data.questions, organization);
        setAnswers(sampleAnswers);

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

  const handleSaveProgress = async () => {
    try {
      setSaving(true);
      await saveApplicationProgress(grant.id, organization.id, answers);
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