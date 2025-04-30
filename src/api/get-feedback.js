import fs from 'fs';
import path from 'path';

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if file exists
    if (!fs.existsSync(FEEDBACK_FILE)) {
      return res.status(200).json({ feedback: [] });
    }

    // Read feedback data
    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));

    // Sort by timestamp, most recent first
    feedbackData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ feedback: feedbackData });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
} 