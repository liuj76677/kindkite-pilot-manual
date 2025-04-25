const CACHE_KEY = 'kindkite_grant_links';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCache() {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return {};

    const { data, timestamp } = JSON.parse(cache);

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
    // Check local cache
    const cache = getCache();
    if (cache[grantId]) {
      return cache[grantId];
    }

    // Call Vercel backend function instead of OpenAI directly
    const response = await fetch('https://kindkite-backend.onrender.com/find-grant-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grantTitle, funder }),
    });

    if (!response.ok) throw new Error('Failed to fetch grant link');

    const result = await response.json();

    const linkData = {
      url: result.url || '#',
      error: null,
      timestamp: Date.now()
    };

    updateCache(grantId, linkData);
    return linkData;
  } catch (error) {
    console.error('Error finding grant link:', error);
    const errorData = {
      url: '#',
      error: 'Could not find grant application link',
      timestamp: Date.now()
    };

    updateCache(grantId, errorData);
    return errorData;
  }
}
