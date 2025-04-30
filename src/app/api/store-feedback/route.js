import { NextResponse } from 'next/server';
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

export async function POST(request) {
  try {
    const body = await request.json();
    const { grantId, organizationName, reaction, timestamp = new Date().toISOString() } = body;

    // Validate required fields
    if (!grantId || !organizationName || !reaction) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
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

    return NextResponse.json({ 
      message: 'Feedback stored successfully', 
      feedback: newFeedback 
    });
  } catch (error) {
    console.error('Error storing feedback:', error);
    return NextResponse.json(
      { message: 'Error storing feedback' },
      { status: 500 }
    );
  }
} 