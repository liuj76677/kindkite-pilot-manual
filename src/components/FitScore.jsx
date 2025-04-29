import PropTypes from 'prop-types';

export default function FitScore({ score, alignment, impact }) {
  // Helper function to determine color based on score
  const getScoreColor = (value) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Helper function to get descriptive text based on score
  const getScoreDescription = (value) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="bg-[#f2e4d5] bg-opacity-70 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#442e1c]">Fit Analysis</h3>
        <div className="flex items-center">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {Math.round(score)}%
          </span>
          <span className="text-sm text-[#5e4633] ml-2">Overall Fit</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#5e4633]">Mission Alignment</span>
            <span className={`text-sm font-semibold ${getScoreColor(alignment)}`}>
              {getScoreDescription(alignment)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full ${
                alignment >= 80
                  ? 'bg-green-500'
                  : alignment >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${alignment}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-[#5e4633]">Impact Potential</span>
            <span className={`text-sm font-semibold ${getScoreColor(impact)}`}>
              {getScoreDescription(impact)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-full rounded-full ${
                impact >= 80
                  ? 'bg-green-500'
                  : impact >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${impact}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

FitScore.propTypes = {
  score: PropTypes.number.isRequired,
  alignment: PropTypes.number.isRequired,
  impact: PropTypes.number.isRequired,
};
