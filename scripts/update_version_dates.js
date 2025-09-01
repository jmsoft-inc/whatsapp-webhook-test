/**
 * Version Date Update Script
 * Automatically updates version dates to current date
 */

const fs = require('fs');
const path = require('path');

function updateVersionDates() {
  const versionFile = path.join(__dirname, '../services/version_management.js');
  
  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];
  
  console.log(`📅 Updating version dates to: ${currentDate}`);
  
  // Read the version management file
  let content = fs.readFileSync(versionFile, 'utf8');
  
  // Update the main release date
  content = content.replace(
    /releaseDate:\s*['"][^'"]*['"]/,
    `releaseDate: "${currentDate}"`
  );
  
  // Update all milestone dates
  content = content.replace(
    /date:\s*['"][^'"]*['"]/g,
    `date: "${currentDate}"`
  );
  
  // Write the updated content back
  fs.writeFileSync(versionFile, content, 'utf8');
  
  console.log('✅ Version dates updated successfully!');
  console.log(`📅 All dates set to: ${currentDate}`);
}

// Run the update
updateVersionDates();
