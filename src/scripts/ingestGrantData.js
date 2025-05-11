// Script to ingest grant data (from PDF or manual entry) and store in JSON format
import fs from 'fs';
import path from 'path';

async function ingestGrantData(content, metadata = {}) {
  try {
    // Create output directory if it doesn't exist
    const outputDir = './data/grants';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate a unique ID for the grant
    const grantId = `grant_${Date.now()}`;
    
    // Create the grant document
    const grantDoc = {
      id: grantId,
      content,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };

    // Save to file
    const outputPath = path.join(outputDir, `${grantId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(grantDoc, null, 2));

    console.log(`Successfully ingested grant data: ${grantId}`);
    return grantDoc;
  } catch (error) {
    console.error('Error ingesting grant data:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Example usage
    const grantContent = {
      name: "Example Grant",
      description: "This is an example grant description",
      requirements: ["Requirement 1", "Requirement 2"],
      deadline: "2024-12-31"
    };

    const metadata = {
      source: "manual_entry",
      category: "education",
      priority: "high"
    };

    await ingestGrantData(grantContent, metadata);
  } catch (error) {
    console.error('Error in main execution:', error);
    process.exit(1);
  }
}

main(); 