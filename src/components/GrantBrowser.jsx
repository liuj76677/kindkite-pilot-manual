import React, { useEffect, useState } from 'react';
import { fetchGrants } from '../services/api';

const GrantBrowser = ({ selectedGrantId, onSelectGrant }) => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrants().then(data => {
      setGrants(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4">Loading grants...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Available Grants</h2>
      <div className="space-y-4">
        {grants.map((grant) => (
          <div
            key={grant._id}
            className={`p-4 bg-white rounded-lg shadow-sm border transition-shadow cursor-pointer ${selectedGrantId === grant._id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:shadow-md'}`}
            onClick={() => onSelectGrant(grant._id)}
          >
            <h3 className="font-medium text-gray-900">{grant.title}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">
                Deadline: {grant.deadline}
              </p>
              <p className="text-sm text-gray-600">Funder: {grant.funder}</p>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Effort:</span>
                <span className="text-sm text-gray-700">{grant.effort}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrantBrowser; 