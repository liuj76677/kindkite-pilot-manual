const CACHE_KEY = 'kindkite_grant_links';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

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
    
    // If not in cache, search for the link
    const searchQuery = `${funder} ${grantTitle} grant application apply`;
    
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        filter: funder.toLowerCase()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to search for grant link');
    }

    const data = await response.json();
    
    const linkData = {
      url: data.url || '#',
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
