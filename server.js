import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// In production, serve the static files from the dist directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kindkite';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define MongoDB schemas
const FeedbackSchema = new mongoose.Schema({
  id: String,
  timestamp: Date,
  grantId: String,
  organizationName: String,
  reaction: String
}, { timestamps: true });

const InteractionSchema = new mongoose.Schema({
  grantId: String,
  type: {
    type: String,
    enum: ['applyClicks', 'cardExpansions', 'totalViews']
  },
  count: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Create MongoDB models
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const Interaction = mongoose.model('Interaction', InteractionSchema);

// Store feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      timestamp: new Date()
    };
    const feedback = new Feedback(feedbackData);
    await feedback.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error storing feedback:', error);
    res.status(500).json({ error: 'Failed to store feedback' });
  }
});

// Update interactions
app.post('/api/interactions', async (req, res) => {
  try {
    const { type, grantId } = req.body;
    
    // Find and update or create interaction record
    const interaction = await Interaction.findOneAndUpdate(
      { grantId, type },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating interactions:', error);
    res.status(500).json({ error: 'Failed to update interactions' });
  }
});

// Get all analytics data
app.get('/api/analytics', async (req, res) => {
  try {
    // Get all feedback
    const feedback = await Feedback.find().sort('-timestamp');

    // Get interactions grouped by type
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

    // Format interactions data
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
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// For production, handle all other routes by serving the index.html
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 