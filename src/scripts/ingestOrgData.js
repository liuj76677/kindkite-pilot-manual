// Script to ingest organization data and store in JSON format
import fs from 'fs';
import path from 'path';

async function ingestOrgData(content, metadata = {}) {
  try {
    // Create output directory if it doesn't exist
    const outputDir = './data/organizations';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate a unique ID for the organization
    const orgId = `org_${Date.now()}`;
    
    // Create the organization document
    const orgDoc = {
      id: orgId,
      content,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };

    // Save to file
    const outputPath = path.join(outputDir, `${orgId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(orgDoc, null, 2));

    console.log(`Successfully ingested organization data: ${orgId}`);
    return orgDoc;
  } catch (error) {
    console.error('Error ingesting organization data:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Example usage
    const orgContent = {
      name: "Example Organization",
      mission: "To provide quality education to underserved communities",
      focusAreas: ["education", "community development"],
      size: "small",
      location: "New York, NY"
    };

    const metadata = {
      source: "manual_entry",
      status: "active",
      verified: true
    };

    await ingestOrgData(orgContent, metadata);
  } catch (error) {
    console.error('Error in main execution:', error);
    process.exit(1);
  }
}

main(); 