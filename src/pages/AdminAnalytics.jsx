import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics } from '../services/analytics';
import { exportData } from '../services/dataExport';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    feedback: [],
    interactions: {
      applyClicks: {},
      cardExpansions: {},
      totalViews: {}
    }
  });
  const [exportStatus, setExportStatus] = useState('');

  useEffect(() => {
    const data = getAnalytics();
    setAnalyticsData(data);
  }, []);

  const handleExport = () => {
    setExportStatus('Exporting...');
    const success = exportData();
    setExportStatus(success ? 'Export successful!' : 'Export failed');
    setTimeout(() => setExportStatus(''), 3000);
  };

  const calculateTotals = () => {
    const { interactions } = analyticsData;
    return {
      totalApplyClicks: Object.values(interactions.applyClicks || {}).reduce((a, b) => a + b, 0),
      totalExpansions: Object.values(interactions.cardExpansions || {}).reduce((a, b) => a + b, 0),
      totalViews: Object.values(interactions.totalViews || {}).reduce((a, b) => a + b, 0),
      totalFeedback: analyticsData.feedback.length
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-[#5e4633] hover:text-[#442e1c]">Home</Link>
            </li>
            <li>
              <span className="text-[#5e4633] mx-2">›</span>
            </li>
            <li>
              <span className="text-[#442e1c] font-medium">Analytics Dashboard</span>
            </li>
          </ol>
        </nav>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#442e1c]">Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#3d6b44]">{exportStatus}</span>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-[#3d6b44] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export to CSV
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-[#f2e4d5]">
            <h3 className="text-lg font-semibold text-[#442e1c] mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-[#3d6b44]">{totals.totalViews}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-[#f2e4d5]">
            <h3 className="text-lg font-semibold text-[#442e1c] mb-2">Apply Clicks</h3>
            <p className="text-3xl font-bold text-[#3d6b44]">{totals.totalApplyClicks}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-[#f2e4d5]">
            <h3 className="text-lg font-semibold text-[#442e1c] mb-2">Card Expansions</h3>
            <p className="text-3xl font-bold text-[#3d6b44]">{totals.totalExpansions}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-[#f2e4d5]">
            <h3 className="text-lg font-semibold text-[#442e1c] mb-2">Feedback Submitted</h3>
            <p className="text-3xl font-bold text-[#3d6b44]">{totals.totalFeedback}</p>
          </div>
        </div>

        {/* Detailed Analytics Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#f2e4d5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f2e4d5]">
              <thead className="bg-[#f5ead7]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Grant ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Apply Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#442e1c] uppercase tracking-wider">
                    Expansions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#f2e4d5]">
                {Object.keys(analyticsData.interactions.totalViews || {}).map((grantId) => (
                  <tr key={grantId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5e4633]">
                      {grantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5e4633]">
                      {analyticsData.interactions.totalViews[grantId] || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5e4633]">
                      {analyticsData.interactions.applyClicks[grantId] || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5e4633]">
                      {analyticsData.interactions.cardExpansions[grantId] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 