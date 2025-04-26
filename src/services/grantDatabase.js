// API base URL
const API_BASE_URL = 'http://localhost:8080';

// Fetch pre-processed grant application data
export const getGrantApplicationData = async (grantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/grant-application/${grantId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch grant application data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching grant application:', error);
    throw error;
  }
};

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

export const saveGrantApplication = async (grantId, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/grants/${grantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to save grant application');
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving grant application:', error);
    throw error;
  }
}; 