import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics } from '../services/analytics';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState({
    organization: '',
    grantId: ''
  });

  useEffect(() => {
    const loadFeedback = async () => {
      const data = await getAnalytics();
      setFeedback(data.feedback);
    };
    loadFeedback();
  }, []);

  const filteredFeedback = feedback.filter(item => {
    const matchesOrg = !filter.organization || 
      item.organizationName.toLowerCase().includes(filter.organization.toLowerCase());
    const matchesGrant = !filter.grantId || 
      item.grantId.toLowerCase().includes(filter.grantId.toLowerCase());
    return matchesOrg && matchesGrant;
  });

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-[#5e4633] hover:text-[#442e1c]">Home</Link>
              </li>
              <li>
                <span className="text-[#5e4633] mx-2">›</span>
              </li>
              <li>
                <span className="text-[#442e1c] font-medium">Feedback Dashboard</span>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold text-[#442e1c] mb-4">Feedback Dashboard</h1>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-[#f2e4d5] mb-6">
            <h2 className="text-lg font-semibold text-[#442e1c] mb-4">Filter Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5e4633] mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={filter.organization}
                  onChange={(e) => setFilter(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Filter by organization name..."
                  className="w-full px-3 py-2 border border-[#f2e4d5] rounded-lg text-sm text-[#5e4633] placeholder-[#5e4633]/50 focus:ring-[#3d6b44] focus:border-[#3d6b44]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5e4633] mb-1">
                  Grant ID
                </label>
                <input
                  type="text"
                  value={filter.grantId}
                  onChange={(e) => setFilter(prev => ({ ...prev, grantId: e.target.value }))}
                  placeholder="Filter by grant ID..."
                  className="w-full px-3 py-2 border border-[#f2e4d5] rounded-lg text-sm text-[#5e4633] placeholder-[#5e4633]/50 focus:ring-[#3d6b44] focus:border-[#3d6b44]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#f2e4d5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f2e4d5]">
              <thead className="bg-[#f5ead7]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Grant ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#f2e4d5]">
                {filteredFeedback.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-[#5e4633]">
                      No feedback found
                    </td>
                  </tr>
                ) : (
                  filteredFeedback.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5e4633]">
                        {formatDate(item.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5e4633]">
                        {item.organizationName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5e4633]">
                        {item.grantId}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5e4633]">
                        {item.reaction}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-[#5e4633]">
          Total feedback entries: {filteredFeedback.length}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback; 