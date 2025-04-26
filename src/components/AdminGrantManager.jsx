import React, { useState, useEffect } from 'react';
import { getGrantApplicationData, saveGrantApplication } from '../services/grantDatabase';

export default function AdminGrantManager() {
  const [grants, setGrants] = useState([]);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Fetch existing grants
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
      fetchGrants(); // Refresh the grants list
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
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

      {/* Grant List */}
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
              onClick={() => setSelectedGrant(grant)}
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
      {selectedGrant && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Grant Details</h2>
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
    </div>
  );
} 