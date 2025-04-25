import PropTypes from 'prop-types';

export default function FitScore({ score, alignment, impact }) {
  return (
    <div className="relative p-4 rounded-lg bg-[#f2e4d5] bg-opacity-70 shadow-sm border border-[#f2e4d5]">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[#f2e4d5]"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <circle
              className="text-[#4d7c54]"
              strokeWidth="8"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 * (1 - score / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-[#442e1c]">{score}</span>
              <span className="text-sm text-[#5e4633]">%</span>
            </div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-[#442e1c] mb-2">KindKite Fit</h3>
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <p className="text-[#5e4633] mb-1">Alignment</p>
            <p className="font-semibold text-[#442e1c]">{alignment}%</p>
          </div>
          <div className="text-center">
            <p className="text-[#5e4633] mb-1">Impact</p>
            <p className="font-semibold text-[#442e1c]">{impact}%</p>
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
