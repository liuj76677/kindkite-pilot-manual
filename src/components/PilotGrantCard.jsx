import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { trackInteraction, submitFeedback } from '../services/analytics';

const EffortBadge = ({ level }) => {
  const colors = {
    Light: 'bg-green-100 text-green-800 border-green-200',
    Moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200'
  };

  const dots = {
    Light: '●○○',
    Moderate: '●●○',
    High: '●●●'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[level]}`}>
      <span className="mr-1 font-mono">{dots[level]}</span>
      {level}
    </span>
  );
};

const DeadlineBadge = ({ deadline }) => {
  const isRolling = deadline.toLowerCase().includes('rolling');
  
  return (
    <div className={`inline-flex items-center ${isRolling ? 'text-purple-700' : 'text-[#442e1c]'}`}>
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
          d={isRolling ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              : "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"} />
      </svg>
      <span className="text-sm">{deadline}</span>
    </div>
  );
};

const FeedbackPanel = ({ grantId, organizationName }) => {
  const [feedback, setFeedback] = useState({
    reaction: '',
    submitted: false,
    isSubmitting: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFeedback(prev => ({ ...prev, isSubmitting: true }));
      
      const success = await submitFeedback({
        grantId,
        organizationName,
        reaction: feedback.reaction
      });
      
      if (success) {
        setFeedback(prev => ({ ...prev, submitted: true }));
      }
    } catch (error) {
      console.error('Error handling feedback:', error);
    } finally {
      setFeedback(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (feedback.submitted) {
    return (
      <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
        <p className="font-medium">Thanks for your input!</p>
        <p className="text-sm mt-1">Keep us posted on your application progress.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-[#442e1c] mb-2">What's your initial reaction to this grant?</p>
        <textarea
          value={feedback.reaction}
          onChange={(e) => setFeedback(prev => ({ ...prev, reaction: e.target.value }))}
          placeholder="Share your thoughts about this opportunity..."
          className="w-full px-3 py-2 border border-[#f2e4d5] rounded-lg text-sm text-[#5e4633] placeholder-[#5e4633]/50 focus:ring-[#3d6b44] focus:border-[#3d6b44]"
          rows="3"
          disabled={feedback.isSubmitting}
        />
      </div>

      <button
        type="submit"
        disabled={feedback.isSubmitting}
        className={`w-full px-4 py-2 bg-[#3d6b44] text-white rounded-lg text-sm font-medium transition-all ${
          feedback.isSubmitting 
            ? 'opacity-75 cursor-not-allowed'
            : 'hover:bg-opacity-90'
        }`}
      >
        {feedback.isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Feedback'
        )}
      </button>
    </form>
  );
};

const PilotGrantCard = ({ grant, organizationName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Track view when card is mounted
    trackInteraction(grant.id, 'totalViews');
  }, [grant.id]);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Only track when expanding, not collapsing
      trackInteraction(grant.id, 'cardExpansions');
    }
  };

  const handleApplyClick = () => {
    trackInteraction(grant.id, 'applyClicks');
    window.open(grant.link, '_blank');
  };

  const ExpandArrow = ({ className = "" }) => (
    <svg 
      className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''} ${className}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#f2e4d5] transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#442e1c] mb-2">
              {grant.name}
            </h3>
            <p className="text-sm text-[#5e4633] mb-2">
              {grant.funder}
            </p>
            <div className="flex items-center space-x-3">
              <EffortBadge level={grant.effort} />
              <DeadlineBadge deadline={grant.deadline} />
            </div>
          </div>
          <button
            onClick={handleExpand}
            className="text-[#3d6b44] hover:text-[#2a4b30] transition-colors p-2"
          >
            <ExpandArrow />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-[#f5ead7]/50 p-3 rounded-lg">
            <p className="text-sm font-medium text-[#442e1c] mb-1">Funding Amount</p>
            <p className="text-sm text-[#5e4633]">{grant.funding}</p>
          </div>
          <div className="bg-[#f5ead7]/50 p-3 rounded-lg">
            <p className="text-sm font-medium text-[#442e1c] mb-1">Eligibility</p>
            <p className="text-sm text-[#5e4633]">{grant.eligibility}</p>
          </div>
        </div>

        <div className={`space-y-6 transition-all ${isExpanded ? 'opacity-100' : 'hidden opacity-0'}`}>
          <div className="bg-[#f5ead7]/30 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-[#442e1c] mb-2">Why it's a Good Match</h4>
            <p className="text-sm text-[#5e4633] leading-relaxed">{grant.match}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[#442e1c] mb-3">Application Steps</h4>
            <div className="space-y-3">
              {grant.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#3d6b44] text-white text-sm mr-3 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-[#5e4633] flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={handleApplyClick}
              className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl text-white bg-[#3d6b44] hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-md"
            >
              Apply Now
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {showFeedback && (
            <div className="border-t border-[#f2e4d5] pt-4">
              <FeedbackPanel grantId={grant.id} organizationName={organizationName} />
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {isExpanded && (
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="text-[#3d6b44] hover:text-[#2a4b30] transition-colors p-2 rounded-full hover:bg-[#f5ead7]/50"
              title={showFeedback ? "Hide feedback" : "Give feedback"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleExpand}
            className="text-[#3d6b44] hover:text-[#2a4b30] transition-colors p-2 rounded-full hover:bg-[#f5ead7]/50"
            aria-label={isExpanded ? "Show less" : "Show more"}
          >
            <ExpandArrow className="mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

EffortBadge.propTypes = {
  level: PropTypes.oneOf(['Light', 'Moderate', 'High']).isRequired
};

DeadlineBadge.propTypes = {
  deadline: PropTypes.string.isRequired
};

FeedbackPanel.propTypes = {
  grantId: PropTypes.string.isRequired,
  organizationName: PropTypes.string.isRequired
};

PilotGrantCard.propTypes = {
  grant: PropTypes.shape({
    name: PropTypes.string.isRequired,
    funder: PropTypes.string.isRequired,
    deadline: PropTypes.string.isRequired,
    funding: PropTypes.string.isRequired,
    effort: PropTypes.string.isRequired,
    eligibility: PropTypes.string.isRequired,
    match: PropTypes.string.isRequired,
    steps: PropTypes.arrayOf(PropTypes.string).isRequired,
    link: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  organizationName: PropTypes.string.isRequired,
};

export default PilotGrantCard; 