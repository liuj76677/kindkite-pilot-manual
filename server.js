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

// MongoDB connection with detailed logging
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kindkite';
console.log('Attempting to connect to MongoDB...');
console.log('Database URI:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@')); // Log URI without credentials

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Connected to database:', mongoose.connection.db.databaseName);
    // List all collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('Available collections:', collections.map(c => c.name));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if we can't connect to MongoDB
  });

// Define MongoDB schemas
const FeedbackSchema = new mongoose.Schema({
  id: String,
  timestamp: Date,
  grantId: String,
  organizationName: String,
  reaction: String
}, { 
  timestamps: true,
  collection: 'feedbacks' // Explicitly name the collection
});

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
}, { 
  timestamps: true,
  collection: 'interactions' // Explicitly name the collection
});

// Create MongoDB models
const Feedback = mongoose.model('Feedback', FeedbackSchema);
const Interaction = mongoose.model('Interaction', InteractionSchema);

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