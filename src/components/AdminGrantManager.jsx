import React, { useState, useEffect } from 'react';
import { getGrantApplicationData, saveGrantApplication } from '../services/grantDatabase';

export default function AdminGrantManager() {
  const [grants, setGrants] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedGrant, setEditedGrant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    try {
      const response = await fetch('https://kindkite-backend.onrender.com/admin/grants');
      const data = await response.json();
      setGrants(data);
    } catch (err) {
      setError('Failed to fetch grants');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setProcessing(true);
      const response = await fetch('https://kindkite-backend.onrender.com/admin/search-grants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('grantId', selectedGrant?.id || 'new');

      const response = await fetch('https://kindkite-backend.onrender.com/admin/upload-grant', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload grant');
      }

      const result = await response.json();
      setSuccess('Grant uploaded and processed successfully');
      fetchGrants();
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditGrant = () => {
    setEditMode(true);
    setEditedGrant({ ...selectedGrant });
  };

  const handleSaveEdit = async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch(`https://kindkite-backend.onrender.com/admin/grants/${editedGrant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedGrant),
      });

      if (!response.ok) {
        throw new Error('Failed to update grant');
      }

      setSuccess('Grant updated successfully');
      setEditMode(false);
      setSelectedGrant(editedGrant);
      fetchGrants();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddQuestion = () => {
    setEditedGrant({
      ...editedGrant,
      questions: [
        ...(editedGrant.questions || []),
        {
          id: Date.now().toString(),
          question: '',
          type: 'text',
          required: true,
          guidelines: '',
          needsInput: true
        }
      ]
    });
  };

  const handleQuestionChange = (questionId, field, value) => {
    setEditedGrant({
      ...editedGrant,
      questions: editedGrant.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  const handleDeleteQuestion = (questionId) => {
    setEditedGrant({
      ...editedGrant,
      questions: editedGrant.questions.filter(q => q.id !== questionId)
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Grant Management</h1>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Grants</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grant content..."
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            disabled={processing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {processing ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-4">
            <h3 className="font-medium">Search Results</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{result.title}</h4>
                    <p className="text-sm text-gray-500">{result.funder}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    Score: {result.score.toFixed(2)}
                  </span>
                </div>
                {result.matchingChunks?.map((chunk, i) => (
                  <div key={i} className="mt-2 text-sm">
                    <p className="text-gray-700">{chunk.content}</p>
                    {chunk.metadata?.section && (
                      <p className="text-xs text-gray-500 mt-1">
                        Section: {chunk.metadata.section}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing Grant List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Existing Grants</h2>
        <div className="space-y-4">
          {grants.map((grant) => (
            <div
              key={grant.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedGrant?.id === grant.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => {
                setSelectedGrant(grant);
                setEditMode(false);
                setSearchResults([]);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{grant.title}</h3>
                  <p className="text-sm text-gray-500">{grant.funder}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {grant.questions?.length || 0} questions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">
          {selectedGrant ? 'Update Grant' : 'Add New Grant'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grant PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || processing}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {processing ? 'Processing...' : selectedGrant ? 'Update Grant' : 'Add Grant'}
          </button>
        </div>
      </div>

      {/* Grant Details */}
      {selectedGrant && !editMode && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Grant Details</h2>
            <button
              onClick={handleEditGrant}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              Edit Details
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Questions</h3>
              <div className="space-y-2">
                {selectedGrant.questions?.map((question) => (
                  <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{question.question}</p>
                    <p className="text-sm text-gray-500 mt-1">{question.guidelines}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Requirements</h3>
              <div className="space-y-2">
                {selectedGrant.requirements?.map((req, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{req.description}</p>
                    {req.actionNeeded && (
                      <p className="text-sm text-orange-600 mt-1">{req.actionNeeded}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {selectedGrant && editMode && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Grant Details</h2>
            <div className="space-x-2">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={processing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {/* Questions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Questions</h3>
                <button
                  onClick={handleAddQuestion}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Add Question
                </button>
              </div>
              <div className="space-y-4">
                {editedGrant?.questions?.map((question) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                        placeholder="Enter question"
                        className="flex-1 p-2 border rounded mr-2"
                      />
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                    <input
                      type="text"
                      value={question.guidelines}
                      onChange={(e) => handleQuestionChange(question.id, 'guidelines', e.target.value)}
                      placeholder="Enter guidelines"
                      className="w-full p-2 border rounded mt-2"
                    />
                    <div className="flex items-center mt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => handleQuestionChange(question.id, 'required', e.target.checked)}
                          className="mr-2"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 