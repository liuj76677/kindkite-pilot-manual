import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import OpenAI from 'openai';

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://kindkite-pilot-manual.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// === API ROUTES (keep all API routes here, before static/catch-all) ===
// Add test endpoint to verify database connection
app.get('/api/test-db', async (req, res) => {
  try {
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    // Get counts
    const feedbackCount = await Feedback.countDocuments();
    const interactionCount = await Interaction.countDocuments();
    res.json({
      status: 'connected',
      database: dbName,
      collections: collections.map(c => c.name),
      counts: {
        feedback: feedbackCount,
        interactions: interactionCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Store feedback with logging
app.post('/api/feedback', async (req, res) => {
  try {
    console.log('Received feedback:', req.body);
    const feedbackData = {
      ...req.body,
      timestamp: new Date()
    };
    const feedback = new Feedback(feedbackData);
    const savedFeedback = await feedback.save();
    console.log('Saved feedback:', savedFeedback);
    res.json({ success: true, savedFeedback });
  } catch (error) {
    console.error('Error storing feedback:', error);
    res.status(500).json({ error: 'Failed to store feedback', details: error.message });
  }
});

// Update interactions with logging
app.post('/api/interactions', async (req, res) => {
  try {
    console.log('Received interaction:', req.body);
    const { type, grantId } = req.body;
    
    const interaction = await Interaction.findOneAndUpdate(
      { grantId, type },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    
    console.log('Updated interaction:', interaction);
    res.json({ success: true, interaction });
  } catch (error) {
    console.error('Error updating interactions:', error);
    res.status(500).json({ error: 'Failed to update interactions', details: error.message });
  }
});

// Get all analytics data with logging
app.get('/api/analytics', async (req, res) => {
  try {
    console.log('Fetching analytics data...');
    const feedback = await Feedback.find().sort('-timestamp');
    console.log(`Found ${feedback.length} feedback entries`);

    const interactions = await Interaction.aggregate([
      {
        $group: {
          _id: '$type',
          data: {
            $push: {
              grantId: '$grantId',
              count: '$count'
            }
          }
        }
      }
    ]);
    console.log('Aggregated interactions:', interactions);

    const formattedInteractions = interactions.reduce((acc, { _id, data }) => {
      acc[_id] = data.reduce((counts, item) => {
        counts[item.grantId] = item.count;
        return counts;
      }, {});
      return acc;
    }, {
      applyClicks: {},
      cardExpansions: {},
      totalViews: {}
    });

    res.json({
      feedback,
      interactions: formattedInteractions
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

// Save clarifications endpoint
app.post('/api/save-clarifications', async (req, res) => {
  try {
    const { orgId, grantId, clarifications } = req.body;
    if (!orgId || !clarifications || !Array.isArray(clarifications)) {
      return res.status(400).json({ error: 'Missing orgId or clarifications' });
    }
    const now = new Date();
    // Add clarifications to the org
    const update = {
      $push: {
        clarifications: {
          $each: clarifications.map(c => ({
            grantId,
            question: c.question,
            answer: c.answer,
            timestamp: now
          }))
        }
      }
    };
    const org = await Organization.findOneAndUpdate({ id: orgId }, update, { new: true });
    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json({ org });
  } catch (error) {
    console.error('Error saving clarifications:', error);
    res.status(500).json({ error: 'Failed to save clarifications' });
  }
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/ai-edit', async (req, res) => {
  try {
    const { fullText, selectedText, instruction } = req.body;
    if (!fullText || !selectedText || !instruction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `You are an expert grant writer and editor. Here is a chunk of text from a grant application:\n\n"""\n${selectedText}\n"""\n\nInstruction: ${instruction}\n\nReturn ONLY the improved or corrected version of the selected text, with no extra commentary or formatting. Do not return the full document, only the revised selection.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a helpful grant writing assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512,
      temperature: 0.7
    });

    const newText = completion.choices[0].message.content.trim();
    return res.status(200).json({ newText });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Serve the static files from the dist directory (AFTER API routes)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html (AFTER API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 