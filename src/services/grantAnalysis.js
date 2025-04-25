import { CACHE_KEY, CACHE_EXPIRY } from './constants';

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

const callOpenAI = async (prompt) => {
  const response = await fetch('/api/analyze-grant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error('Failed to analyze grant');
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function analyzeGrantFit(organization, grant) {
  try {
    // Create a unique cache key for this org-grant pair
    const cacheKey = `${organization.organization}_${grant.title}`;
    
    // Check cache first
    const cache = getCache();
    if (cache[cacheKey]) {
      console.log('Using cached analysis for:', grant.title);
      return cache[cacheKey];
    }

    console.log('Generating new analysis for:', grant.title);

    if (!organization || !grant) {
      throw new Error('Missing required parameters: organization and grant are required');
    }

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

    const result = await callOpenAI(prompt);
    
    // Validate the response structure
    const requiredFields = ['alignment_score', 'likelihood', 'effort_level', 'key_strengths', 'action_items', 'why_apply'];
    for (const field of requiredFields) {
      if (!result[field]) {
        throw new Error(`Invalid API response: missing ${field}`);
      }
    }

    // Save to cache
    console.log('Caching analysis for:', grant.title);
    updateCache(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error in analyzeGrantFit:', error);
    return {
      error: true,
      message: error.message
    };
  }
}

export async function rankGrants(organization, grants) {
  try {
    // Create a unique cache key for this org's grant rankings
    const cacheKey = `${organization.organization}_rankings`;
    
    // Check cache first
    const cache = getCache();
    if (cache[cacheKey]) {
      console.log('Using cached rankings for:', organization.organization);
      return cache[cacheKey];
    }

    console.log('Generating new rankings for:', organization.organization);

    if (!organization || !grants || !Array.isArray(grants)) {
      throw new Error('Invalid parameters: organization and grants array are required');
    }

    // For each grant, get its analysis (which will use cache if available)
    const analyses = await Promise.all(
      grants.map(async (grant) => {
        const analysis = await analyzeGrantFit(organization, grant);
        return {
          grant_title: grant.title,
          analysis
        };
      })
    );

    // Sort grants by their scores
    const rankedGrants = analyses
      .filter(item => !item.analysis.error)
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

    const result = { top_grants: rankedGrants };

    // Save to cache
    console.log('Caching rankings for:', organization.organization);
    updateCache(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error ranking grants:', error);
    return {
      error: true,
      message: error.message,
      top_grants: grants.slice(0, 3).map(grant => ({
        grant_title: grant.title,
        rank: 0,
        score: 0,
        key_factors: ['Error in analysis'],
        why_ranked_here: 'Error occurred during analysis'
      }))
    };
  }
}
