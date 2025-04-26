// API base URL - use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Fetch pre-processed grant application data
export async function getGrantApplicationData(grantId) {
  try {
    const response = await fetch(`${API_BASE_URL}/grant-application/${grantId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch grant application data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching grant application data:', error);
    throw error;
  }
}

// Generate sample answers for pre-processed questions
export async function generateSampleAnswers(questions, organization) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ questions, organization })
    });

    if (!response.ok) {
      throw new Error('Failed to generate sample answers');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating sample answers:', error);
    throw error;
  }
}

// Get application status and progress
export async function getApplicationStatus(grantId, organizationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/application-status/${grantId}/${organizationId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch application status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching application status:', error);
    throw error;
  }
}

// Save application progress
export async function saveApplicationProgress(grantId, organizationId, answers) {
  try {
    const response = await fetch(`${API_BASE_URL}/save-application/${grantId}/${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) {
      throw new Error('Failed to save application progress');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving application progress:', error);
    throw error;
  }
} 