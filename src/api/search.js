import express from 'express';

const router = express.Router();

router.post('/search', async (req, res) => {
  try {
    const { query, filter } = req.body;
    
    // Use web search to find relevant URLs
    const searchResults = await fetch('https://api.openai.com/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        domain: filter
      })
    });

    if (!searchResults.ok) {
      throw new Error('Failed to search');
    }

    const data = await searchResults.json();
    
    // Find the most relevant URL from the search results
    const relevantUrl = data.results[0]?.url;
    
    res.json({ url: relevantUrl || null });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Failed to search for grant' });
  }
});

export default router;
