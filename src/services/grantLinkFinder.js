import OpenAI from 'openai';

const CACHE_KEY = 'kindkite_grant_links';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function getCache() {
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

function updateCache(grantId, linkData) {
  try {
    const existingCache = getCache();
    const newCache = {
      ...existingCache,
      [grantId]: linkData
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: newCache,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error updating cache:', error);
  }
}

export async function findGrantLink(grantTitle, funder, grantId) {
  try {
    // Check cache first
    const cache = getCache();
    if (cache[grantId]) {
      return cache[grantId];
    }
    
    // If not in cache, use OpenAI to find the most likely URL
    const prompt = `Find the most likely application URL for this grant:
    Grant Title: ${grantTitle}
    Funder: ${funder}
    
    Return only a JSON object in this format:
    {
      "url": "the most likely URL for the grant application"
    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    const linkData = {
      url: result.url || '#',
      error: null,
      timestamp: Date.now()
    };

    // Save to cache
    updateCache(grantId, linkData);
    
    return linkData;
  } catch (error) {
    console.error('Error finding grant link:', error);
    const errorData = {
      url: '#',
      error: 'Could not find grant application link',
      timestamp: Date.now()
    };
    
    // Cache the error state too to prevent repeated failed API calls
    updateCache(grantId, errorData);
    
    return errorData;
  }
}
