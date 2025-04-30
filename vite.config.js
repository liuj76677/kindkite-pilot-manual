import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(FEEDBACK_FILE))) {
  fs.mkdirSync(path.dirname(FEEDBACK_FILE), { recursive: true });
}

// Initialize feedback file if it doesn't exist
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2));
}

// API handlers
const handleStoreFeedback = async (req, res) => {
  try {
    const body = await req.json();
    const { grantId, organizationName, reaction, timestamp = new Date().toISOString() } = body;

    if (!grantId || !organizationName || !reaction) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }), 
        { status: 400 }
      );
    }

    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
    const newFeedback = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      grantId,
      organizationName,
      reaction,
      timestamp
    };

    feedbackData.push(newFeedback);
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));

    return new Response(
      JSON.stringify({ message: 'Feedback stored successfully', feedback: newFeedback })
    );
  } catch (error) {
    console.error('Error storing feedback:', error);
    return new Response(
      JSON.stringify({ message: 'Error storing feedback' }), 
      { status: 500 }
    );
  }
};

const handleGetFeedback = async (req, res) => {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      return new Response(JSON.stringify({ feedback: [] }));
    }

    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));
    feedbackData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return new Response(JSON.stringify({ feedback: feedbackData }));
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return new Response(
      JSON.stringify({ message: 'Error fetching feedback' }), 
      { status: 500 }
    );
  }
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api/store-feedback': {
        target: 'http://localhost:5173',
        bypass: (req, res) => {
          if (req.method === 'POST') {
            return handleStoreFeedback(req, res);
          }
          return new Response(null, { status: 405 });
        }
      },
      '/api/get-feedback': {
        target: 'http://localhost:5173',
        bypass: (req, res) => {
          if (req.method === 'GET') {
            return handleGetFeedback(req, res);
          }
          return new Response(null, { status: 405 });
        }
      }
    }
  }
})
