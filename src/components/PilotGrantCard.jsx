import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PilotGrantCard = ({ grant }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {grant.name}
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
            <p className="text-sm text-gray-900">{grant.effort}</p>
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
              <p className="text-sm text-gray-900">{grant.match}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Application Steps</h4>
              <ul className="list-disc list-inside text-sm text-gray-900">
                {grant.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <a
                href={grant.link}
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
  }).isRequired,
};

export default PilotGrantCard; 