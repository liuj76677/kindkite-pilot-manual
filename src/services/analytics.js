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

// Submit feedback
export const submitFeedback = async (feedback) => {
  try {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...feedback
      })
    });
    return true;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return false;
  }
};

// Get all analytics data
export const getAnalytics = async () => {
  try {
    const response = await fetch('/api/analytics');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting analytics:', error);
    return {
      feedback: [],
      interactions: {
        applyClicks: {},
        cardExpansions: {},
        totalViews: {}
      }
    };
  }
}; 