import PropTypes from 'prop-types';

export default function GrantProgress({ status, deadline }) {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'not started':
        return 'bg-gray-100 text-gray-600';
      case 'in progress':
        return 'bg-blue-100 text-blue-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      case 'submitted':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const calculateDaysLeft = () => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft();
  const urgencyColor = daysLeft <= 7 ? 'text-red-600' : daysLeft <= 14 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          {status}
        </span>
        <span className={`text-sm font-medium ${urgencyColor}`}>
          {daysLeft} days left
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ 
              width: `${Math.min(100, Math.max(0, (30 - daysLeft) / 30 * 100))}%`
            }}
          />
        </div>
        <span className="text-xs text-gray-500">Progress</span>
      </div>
    </div>
  );
}

GrantProgress.propTypes = {
  status: PropTypes.oneOf(['Not Started', 'In Progress', 'Review', 'Submitted']).isRequired,
  deadline: PropTypes.string.isRequired,
};
