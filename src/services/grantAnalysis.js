import { CACHE_KEY, CACHE_EXPIRY } from './constants';

// API base URL - use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getCache = () => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return {};
    
    const { data, timestamp } = JSON.parse(cache);
    
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return {};
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return {};
  }
}

const updateCache = (cacheKey, analysisData) => {
  try {
    const existingCache = getCache();
    const newCache = {
      ...existingCache,
      [cacheKey]: analysisData
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: newCache,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error updating cache:', error);
  }
}

const callBackendAPI = async (prompt) => {
  try {
    console.log('Calling backend with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch(`${API_BASE_URL}/analyze-grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend raw response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response format:', data);
      throw new Error('Invalid API response format');
    }

    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      console.log('Parsed API response:', parsedContent);
      return parsedContent;
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      console.error('Raw content that failed to parse:', data.choices[0].message.content);
      throw new Error('Failed to parse API response');
    }
  } catch (error) {
    console.error('Error in callBackendAPI:', error);
    throw error;
  }
}

export async function analyzeGrantFit(organization, grant) {
  console.log('Starting analyzeGrantFit for:', {
    organization: organization?.organization,
    grant: grant?.title
  });

  try {
    if (!organization || !grant) {
      throw new Error('Missing required parameters: organization and grant are required');
    }

    console.log('Generating new analysis for:', grant.title);

    const prompt = `
    Organization Information:
    Name: ${organization.organization}
    Mission: ${organization.mission}
    Country: ${organization.country}

    Grant Information:
    Title: ${grant.title}
    Funder: ${grant.funder}
    Summary: ${grant.summary}
    Effort Level: ${grant.effort}
    Success Chance: ${grant.chance_of_success}

    Task: Analyze this grant opportunity for the organization and provide detailed, actionable insights.
    Consider:
    1. Mission alignment and strategic fit
    2. Organization's competitive advantages
    3. Current funding trends in education technology
    4. Geographic and eligibility factors
    5. Specific requirements and preferences of the funder

    Provide a comprehensive analysis in this JSON format:
    {
      "alignment_score": number (1-100),
      "likelihood": number (1-100),
      "effort_level": {
        "rating": "Light|Moderate|High",
        "hours_estimate": string (e.g. "10-20", "20-40", "40+")
      },
      "key_strengths": {
        "points": string[] (2-3 key strengths)
      },
      "action_items": {
        "immediate": string[] (2-3 next steps),
        "preparation": string[]
      },
      "why_apply": {
        "main_reasons": string[] (2-3 reasons)
      }
    }`;

    console.log('Calling API for grant analysis...');
    const result = await callBackendAPI(prompt);
    console.log('API response for grant:', grant.title, result);
    
    // Validate the response structure
    const requiredFields = ['alignment_score', 'likelihood', 'effort_level', 'key_strengths', 'action_items', 'why_apply'];
    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Invalid API response: missing fields: ${missingFields.join(', ')}`);
    }

    return result;
  } catch (error) {
    console.error('Error in analyzeGrantFit:', error);
    throw error; // Let rankGrants handle the error
  }
}

export async function rankGrants(organization, grants) {
  console.log('Starting rankGrants for:', {
    organization: organization?.organization,
    grantsCount: grants?.length
  });

  try {
    if (!organization || !grants || !Array.isArray(grants)) {
      throw new Error('Invalid parameters: organization and grants array are required');
    }

    console.log('Analyzing all grants for:', organization.organization);

    // Analyze each grant without using cache
    const analyses = await Promise.all(
      grants.map(async (grant) => {
        try {
          console.log('Starting analysis for grant:', grant.title);
          const analysis = await analyzeGrantFit(organization, grant);
          console.log('Analysis completed for grant:', grant.title, analysis);
          return {
            grant_title: grant.title,
            analysis
          };
        } catch (error) {
          console.error('Error analyzing grant:', grant.title, error);
          return {
            grant_title: grant.title,
            error: true,
            errorMessage: error.message
          };
        }
      })
    );

    console.log('All analyses completed. Raw results:', analyses);

    // Filter out failed analyses and sort by score
    const successfulAnalyses = analyses.filter(item => !item.error);
    console.log('Successful analyses:', successfulAnalyses.length);

    if (successfulAnalyses.length === 0) {
      console.error('No successful grant analyses');
      throw new Error('Failed to analyze any grants successfully. Please try again.');
    }

    // Sort grants by their scores
    const rankedGrants = successfulAnalyses
      .sort((a, b) => {
        const scoreA = (a.analysis.alignment_score + a.analysis.likelihood) / 2;
        const scoreB = (b.analysis.alignment_score + b.analysis.likelihood) / 2;
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map((item, index) => ({
        grant_title: item.grant_title,
        rank: index + 1,
        score: Math.round((item.analysis.alignment_score + item.analysis.likelihood) / 2),
        key_factors: item.analysis.key_strengths.points,
        why_ranked_here: item.analysis.why_apply.main_reasons[0]
      }));

    console.log('Final ranked grants:', rankedGrants);

    return { 
      success: true,
      top_grants: rankedGrants,
      total_analyzed: analyses.length,
      successful_analyses: successfulAnalyses.length
    };
  } catch (error) {
    console.error('Error ranking grants:', error);
    throw error;
  }
}
