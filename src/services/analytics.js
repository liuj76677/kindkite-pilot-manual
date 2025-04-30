// Analytics service for tracking user interactions

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// Initialize analytics data structure
const initializeAnalytics = () => {
  try {
    // Initialize feedback if not exists
    if (!localStorage.getItem(STORAGE_KEYS.FEEDBACK)) {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify([]));
    }
    
    // Initialize interactions if not exists
    if (!localStorage.getItem(STORAGE_KEYS.INTERACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify({
        applyClicks: {},
        cardExpansions: {},
        totalViews: {}
      }));
    }
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
};

// Track apply button clicks
export const trackApplyClick = async (grantId) => {
  try {
    await fetch(`${API_URL}/api/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'applyClicks',
        grantId
      })
    });
  } catch (error) {
    console.error('Error tracking apply click:', error);
  }
};

// Track card expansions
export const trackCardExpansion = async (grantId) => {
  try {
    await fetch(`${API_URL}/api/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'cardExpansions',
        grantId
      })
    });
  } catch (error) {
    console.error('Error tracking card expansion:', error);
  }
};

// Track grant views
export const trackGrantView = async (grantId) => {
  try {
    await fetch(`${API_URL}/api/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'totalViews',
        grantId
      })
    });
  } catch (error) {
    console.error('Error tracking grant view:', error);
  }
};

// Submit feedback
export const submitFeedback = async (feedback) => {
  try {
    await fetch(`${API_URL}/api/feedback`, {
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
    const response = await fetch(`${API_URL}/api/analytics`);
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

// Initialize analytics on module load
initializeAnalytics(); 