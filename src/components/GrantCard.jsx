import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { analyzeGrantFit } from '../services/grantAnalysis';
import FitScore from './FitScore';
import GrantApplication from './GrantApplication';

export default function GrantCard({ grant, organization }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [showApplication, setShowApplication] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function getAnalysis() {
      try {
        setLoading(true);
        setError(null);
        const result = await analyzeGrantFit(organization, grant);
        if (result.error) {
          throw new Error(result.message);
        }
        setAnalysis(result);
      } catch (err) {
        setError(err.message);
        console.error('Error in GrantCard:', err);
      } finally {
        setLoading(false);
      }
    }
    getAnalysis();
  }, [grant, organization]);

  const Section = ({ id, title, children }) => (
    <div className="border-t border-gray-100 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
      <button
        onClick={() => setActiveSection(activeSection === id ? null : id)}
        className="flex items-center justify-between w-full text-left mb-4"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            activeSection === id ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {activeSection === id && <div className="space-y-4">{children}</div>}
    </div>
  );

  Section.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Analysis Error</h4>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {grant.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {grant.funder}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Funding</p>
            <p className="text-sm text-gray-900">{grant.funding}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Deadline</p>
            <p className="text-sm text-gray-900">{grant.deadline}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Effort Level</p>
            <p className="text-sm text-gray-900">{analysis?.effort_level?.rating || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Eligibility</p>
            <p className="text-sm text-gray-900">{grant.eligibility}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Why it's a Good Match</h4>
              <p className="text-sm text-gray-900">{analysis?.why_apply.main_reasons.join(', ')}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Application Steps</h4>
              <ul className="list-disc list-inside text-sm text-gray-900">
                {analysis?.action_items.immediate.slice(0, 3).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <a
                href={grant.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Now
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

GrantCard.propTypes = {
  grant: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    funder: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  organization: PropTypes.shape({
    organization: PropTypes.string.isRequired,
    mission: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired
  }).isRequired
};
