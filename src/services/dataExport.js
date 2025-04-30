import { getAnalytics } from './analytics';

// Convert JSON data to CSV string
const convertToCSV = (data, headers) => {
  const rows = [headers];
  
  data.forEach(item => {
    const row = headers.map(header => {
      // Handle cases where the value might contain commas or quotes
      const value = item[header] || '';
      if (value.toString().includes(',') || value.toString().includes('"')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value;
    });
    rows.push(row);
  });

  return rows.map(row => row.join(',')).join('\n');
};

// Format feedback data for CSV
const formatFeedbackForExport = (feedback) => {
  return feedback.map(item => ({
    id: item.id,
    timestamp: item.timestamp,
    grantId: item.grantId,
    organizationName: item.organizationName,
    reaction: item.reaction
  }));
};

// Format interactions data for CSV
const formatInteractionsForExport = (interactions) => {
  const { totalViews, applyClicks, cardExpansions } = interactions;
  const allGrantIds = new Set([
    ...Object.keys(totalViews || {}),
    ...Object.keys(applyClicks || {}),
    ...Object.keys(cardExpansions || {})
  ]);

  return Array.from(allGrantIds).map(grantId => ({
    grantId,
    views: totalViews[grantId] || 0,
    applyClicks: applyClicks[grantId] || 0,
    expansions: cardExpansions[grantId] || 0
  }));
};

// Export data to CSV files
export const exportData = () => {
  try {
    const { feedback, interactions } = getAnalytics();
    
    // Format feedback data
    const feedbackData = formatFeedbackForExport(feedback);
    const feedbackCSV = convertToCSV(
      feedbackData,
      ['id', 'timestamp', 'grantId', 'organizationName', 'reaction']
    );

    // Format interactions data
    const interactionsData = formatInteractionsForExport(interactions);
    const interactionsCSV = convertToCSV(
      interactionsData,
      ['grantId', 'views', 'applyClicks', 'expansions']
    );

    // Create download links
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Download feedback CSV
    const feedbackBlob = new Blob([feedbackCSV], { type: 'text/csv;charset=utf-8;' });
    const feedbackLink = document.createElement('a');
    feedbackLink.href = URL.createObjectURL(feedbackBlob);
    feedbackLink.download = `feedback_${timestamp}.csv`;
    feedbackLink.click();

    // Download interactions CSV
    const interactionsBlob = new Blob([interactionsCSV], { type: 'text/csv;charset=utf-8;' });
    const interactionsLink = document.createElement('a');
    interactionsLink.href = URL.createObjectURL(interactionsBlob);
    interactionsLink.download = `interactions_${timestamp}.csv`;
    interactionsLink.click();

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
}; 