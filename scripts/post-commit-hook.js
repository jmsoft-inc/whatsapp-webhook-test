#!/usr/bin/env node

/**
 * Post-Commit Hook Script
 * Automatically updates the releaseDate in version_management.js after each commit
 * This script can be run manually or set up as a git hook
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function updateReleaseDateAfterCommit() {
  try {
    // Get the date of the last commit
    const lastCommitDate = execSync('git log -1 --format="%ad" --date=short', { encoding: 'utf8' }).trim();
    
    console.log(`🔄 Post-commit: Updating release date to ${lastCommitDate}...`);
    
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
      
      console.log(`✅ Release date automatically updated to: ${lastCommitDate}`);
      console.log(`💡 Tip: Run 'npm run version:release-date' to manually update the release date`);
    } else {
      console.error('❌ Could not find releaseDate pattern in file');
    }
    
  } catch (error) {
    console.error('❌ Error in post-commit hook:', error.message);
  }
}

// Run the update
updateReleaseDateAfterCommit();
