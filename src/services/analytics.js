// Analytics service for tracking user interactions

// Track interaction
export const trackInteraction = async (grantId, type) => {
  try {
    await fetch('/api/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grantId,
        type,
        timestamp: new Date().toISOString()
      })
    });
    return true;
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return false;
  }
};

// Submit feedback to Google Sheets
export const submitFeedback = async (feedback) => {
  try {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLhxzmso9W1hyR6BEwsRpLQUhAG7G3CpHJiRaESJWL06WU_rlvGpWMv-ntUh1PAR7y/exec';
    
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        grantId: feedback.grantId,
        organizationName: feedback.organizationName,
        reaction: feedback.reaction
      })
    });

    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
};

// We don't need the getAnalytics function anymore since we're using Google Sheets
export const getAnalytics = async () => {
  return {
    feedback: [],
    interactions: {
      applyClicks: {},
      cardExpansions: {},
      totalViews: {}
    }
  };
}; 