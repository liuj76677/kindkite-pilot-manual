import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { analyzeGrantFit } from '../services/grantAnalysis';
import FitScore from './FitScore';

export default function GrantCard({ grant, organization }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');

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
    <div className="bg-gradient-to-br from-[#f5ead7] to-[#f8dfc3] rounded-2xl shadow-md overflow-hidden border border-[#f2e4d5]">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-[#442e1c]">{grant.title}</h2>
          <p className="text-base text-[#5e4633]">{grant.funder}</p>
        </div>

        {/* Fit Score */}
        {analysis && (
          <div className="mb-6">
            <FitScore
              score={analysis.alignment_score}
              alignment={analysis.alignment_score}
              impact={analysis.likelihood}
            />
          </div>
        )}

        {/* Primary Action */}
        <a
          href={grant.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-[#3d6b44] hover:bg-opacity-90 text-white text-lg font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-md mb-6"
        >
          Apply Now
        </a>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-[#f2e4d5] bg-opacity-70 p-4 rounded-lg shadow-sm">
            <p className="font-medium text-[#442e1c] mb-1">Deadline</p>
            <p className="text-[#5e4633]">{grant.deadline}</p>
          </div>
          <div className="bg-[#f2e4d5] bg-opacity-70 p-4 rounded-lg shadow-sm">
            <p className="font-medium text-[#442e1c] mb-1">Effort Level</p>
            <p className="text-[#5e4633]">{analysis?.effort_level?.rating || 'Unknown'}</p>
          </div>
        </div>

        {/* Expandable Sections */}
        {analysis && (
          <>
            <Section id="overview" title="Why This Grant?">
              <div className="bg-[#f2e4d5] bg-opacity-70 rounded-lg p-4 shadow-sm">
                <div className="space-y-3">
                  {analysis.why_apply.main_reasons.map((reason, index) => (
                    <p key={index} className="text-sm text-[#5e4633] leading-relaxed">{reason}</p>
                  ))}
                </div>
              </div>
            </Section>

            <Section id="actions" title="Action Items">
              <div className="bg-[#f2e4d5] bg-opacity-70 rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  {analysis.action_items.immediate.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-[#442e1c] mb-2">Next Steps:</p>
                      <ul className="list-disc list-inside text-sm space-y-2">
                        {analysis.action_items.immediate.slice(0, 3).map((item, index) => (
                          <li key={index} className="text-[#5e4633] leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            <Section id="strategy" title="Strategic Insights">
              <div className="bg-[#f2e4d5] bg-opacity-70 rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[#442e1c] mb-2">Key Strengths:</p>
                    <ul className="list-disc list-inside text-sm space-y-2">
                      {analysis.key_strengths.points.slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-[#5e4633] leading-relaxed">{strength}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

GrantCard.propTypes = {
  grant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    funder: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
  organization: PropTypes.shape({
    organization: PropTypes.string.isRequired,
    mission: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
};
