import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

export async function GET() {
  try {
    // Check if file exists
    if (!fs.existsSync(FEEDBACK_FILE)) {
      return NextResponse.json({ feedback: [] });
    }

    // Read feedback data
    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'));

    // Sort by timestamp, most recent first
    feedbackData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({ feedback: feedbackData });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { message: 'Error fetching feedback' },
      { status: 500 }
    );
  }
} 