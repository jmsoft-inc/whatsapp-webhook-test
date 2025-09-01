/**
 * Update Release Date Script
 * Automatically updates the releaseDate in version_management.js to the last commit date
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function updateReleaseDate() {
  try {
    // Get the date of the last commit
    const lastCommitDate = execSync('git log -1 --format="%ad" --date=short', { encoding: 'utf8' }).trim();
    
    console.log(`📅 Last commit date: ${lastCommitDate}`);
    
    // Path to version management file
    const versionFile = path.join(__dirname, '../services/version_management.js');
    
    // Read the file
    let content = fs.readFileSync(versionFile, 'utf8');
    
    // Update the releaseDate
    const oldPattern = /releaseDate:\s*['"][^'"]*['"]/;
    const newReleaseDate = `releaseDate: "${lastCommitDate}"`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newReleaseDate);
      
      // Write back to file
      fs.writeFileSync(versionFile, content, 'utf8');
      
      console.log(`✅ Release date updated to: ${lastCommitDate}`);
      console.log(`📁 File updated: ${versionFile}`);
    } else {
      console.error('❌ Could not find releaseDate pattern in file');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error updating release date:', error.message);
    process.exit(1);
  }
}

// Run the update
updateReleaseDate();
