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

const callVercelFunction = async (prompt) => {
  try {
    console.log('Calling Vercel function with prompt length:', prompt.length);

    const response = await fetch('https://kindkite-backend.onrender.com/analyze-grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    console.log('Vercel function response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('Vercel function error:', error);
      throw new Error(`Analysis failed: ${error}`);
    }

    const data = await response.json();
    console.log('Vercel function raw response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const parsedContent = JSON.parse(data.choices[0].message.content);
    console.log('Parsed API response:', parsedContent);
    
    return parsedContent;
  } catch (error) {
    console.error('Error in callVercelFunction:', error);
    throw error;
  }
}

export async function analyzeGrantFit(organization, grant) {
  console.log('Starting analyzeGrantFit for:', {
    organization: organization?.organization,
    grant: grant?.title
  });

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

    const result = await callVercelFunction(prompt);
    
    // Validate the response structure
    const requiredFields = ['alignment_score', 'likelihood', 'effort_level', 'key_strengths', 'action_items', 'why_apply'];
    const missingFields = requiredFields.filter(field => !result[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Invalid API response: missing fields: ${missingFields.join(', ')}`);
    }

    // Save to cache
    console.log('Caching analysis for:', grant.title);
    updateCache(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error in analyzeGrantFit:', error);
    // Return a more structured error response
    return {
      error: true,
      message: error.message,
      alignment_score: 0,
      likelihood: 0,
      effort_level: {
        rating: 'Unknown',
        hours_estimate: 'Unknown'
      },
      key_strengths: {
        points: ['Error analyzing grant fit']
      },
      action_items: {
        immediate: ['Review error and try again'],
        preparation: []
      },
      why_apply: {
        main_reasons: ['Analysis failed']
      }
    };
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

    // Create a unique cache key for this org's grant rankings
    const cacheKey = `${organization.organization}_rankings`;
    
    // Check cache first
    const cache = getCache();
    if (cache[cacheKey]) {
      console.log('Using cached rankings for:', organization.organization);
      return cache[cacheKey];
    }

    console.log('Generating new rankings for:', organization.organization);

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

    console.log('Analyses completed:', analyses.map(a => ({
      title: a.grant_title,
      hasError: a.analysis.error,
      score: a.analysis.error ? 0 : (a.analysis.alignment_score + a.analysis.likelihood) / 2
    })));

    // Sort grants by their scores
    const rankedGrants = analyses
      .filter(item => !item.analysis.error) // Remove any failed analyses
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

    const result = { 
      top_grants: rankedGrants,
      total_analyzed: analyses.length,
      successful_analyses: analyses.filter(a => !a.analysis.error).length
    };

    // Only cache if we have successful rankings
    if (rankedGrants.length > 0) {
      console.log('Caching rankings for:', organization.organization);
      updateCache(cacheKey, result);
    } else {
      console.warn('No successful analyses to cache');
    }
    
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
      })),
      total_analyzed: grants.length,
      successful_analyses: 0
    };
  }
}
