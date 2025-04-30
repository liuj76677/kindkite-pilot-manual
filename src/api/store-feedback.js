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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { grantId, organizationName, reaction, timestamp = new Date().toISOString() } = req.body;

    // Validate required fields
    if (!grantId || !organizationName || !reaction) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Read existing feedback
    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));

    // Add new feedback
    const newFeedback = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      grantId,
      organizationName,
      reaction,
      timestamp
    };

    feedbackData.push(newFeedback);

    // Write updated feedback back to file
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));

    res.status(200).json({ message: 'Feedback stored successfully', feedback: newFeedback });
  } catch (error) {
    console.error('Error storing feedback:', error);
    res.status(500).json({ message: 'Error storing feedback' });
  }
} 