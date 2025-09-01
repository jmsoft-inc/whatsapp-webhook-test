/**
 * Comprehensive Version Update Script
 * Automatically updates version dates, build numbers, and creates new versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

function getGitCommitCount() {
  try {
    const count = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    return parseInt(count);
  } catch (error) {
    console.log('⚠️ Could not get git commit count, using current build number');
    return null;
  }
}

function updateVersion(versionType = 'patch') {
  const versionFile = path.join(__dirname, '../services/version_management.js');
  const currentDate = getCurrentDate();
  const gitCommitCount = getGitCommitCount();
  
  console.log(`📅 Current date: ${currentDate}`);
  console.log(`🔢 Git commit count: ${gitCommitCount}`);
  
  // Read the version management file
  let content = fs.readFileSync(versionFile, 'utf8');
  
  // Extract current version numbers
  const majorMatch = content.match(/major:\s*(\d+)/);
  const minorMatch = content.match(/minor:\s*(\d+)/);
  const patchMatch = content.match(/patch:\s*(\d+)/);
  const buildMatch = content.match(/build:\s*(\d+)/);
  
  if (!majorMatch || !minorMatch || !patchMatch || !buildMatch) {
    console.error('❌ Could not extract current version numbers');
    return;
  }
  
  let major = parseInt(majorMatch[1]);
  let minor = parseInt(minorMatch[1]);
  let patch = parseInt(patchMatch[1]);
  let build = gitCommitCount || parseInt(buildMatch[1]);
  
  // Update version based on type
  switch (versionType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
    default:
      patch++;
      break;
  }
  
  const newVersion = `${major}.${minor}.${patch}`;
  console.log(`🚀 Updating to version: ${newVersion}-stable+${build}`);
  
  // Update version numbers
  content = content.replace(/major:\s*\d+/, `major: ${major}`);
  content = content.replace(/minor:\s*\d+/, `minor: ${minor}`);
  content = content.replace(/patch:\s*\d+/, `patch: ${patch}`);
  content = content.replace(/build:\s*\d+/, `build: ${build}`);
  
  // Update release date
  content = content.replace(
    /releaseDate:\s*['"][^'"]*['"]/,
    `releaseDate: "${currentDate}"`
  );
  
  // Add new milestone entry
  const milestoneEntry = `      {
        version: "${newVersion}",
        date: "${currentDate}",
        features: [
          "Auto-generated version update",
          "Build number: ${build}",
          "Release date: ${currentDate}",
        ],
      },`;
  
  // Find the last milestone and add the new one before the closing bracket
  const lastMilestoneIndex = content.lastIndexOf('      {');
  const closingBracketIndex = content.indexOf('    ],', lastMilestoneIndex);
  
  if (lastMilestoneIndex !== -1 && closingBracketIndex !== -1) {
    content = content.slice(0, closingBracketIndex) + 
              milestoneEntry + '\n' + 
              content.slice(closingBracketIndex);
  }
  
  // Write the updated content back
  fs.writeFileSync(versionFile, content, 'utf8');
  
  console.log('✅ Version updated successfully!');
  console.log(`📅 Release date: ${currentDate}`);
  console.log(`🔢 Build number: ${build}`);
  console.log(`🏷️ Version: ${newVersion}-stable+${build}`);
  
  return {
    version: newVersion,
    build: build,
    date: currentDate
  };
}

// Command line interface
const args = process.argv.slice(2);
const versionType = args[0] || 'patch';

console.log(`🔄 Updating version (${versionType})...`);
const result = updateVersion(versionType);

if (result) {
  console.log('\n🎉 Version update completed!');
  console.log(`📋 Next steps:`);
  console.log(`   1. Review the changes in version_management.js`);
  console.log(`   2. Commit with message: "v${result.version}: Auto-generated version update"`);
  console.log(`   3. Push to repository`);
} else {
  console.log('\n❌ Version update failed!');
  process.exit(1);
}
