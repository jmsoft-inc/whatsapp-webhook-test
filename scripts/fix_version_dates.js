/**
 * Fix Version Dates Script
 * Updates version dates based on actual commit history and adds missing milestones
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Version milestones with actual dates based on commit history
const VERSION_MILESTONES = [
  {
    version: "1.0.0",
    date: "2025-08-29",
    features: [
      "Initial project setup",
      "AI Agents Library core components",
      "WhatsApp Invoice Agent implementation",
      "Basic invoice processing",
      "Google Sheets integration",
    ],
  },
  {
    version: "1.1.0",
    date: "2025-08-30",
    features: [
      "Albert Heijn receipt processing",
      "PDF text extraction",
      "Data validation and error handling",
      "Multi-file support for WhatsApp webhook",
    ],
  },
  {
    version: "1.2.0",
    date: "2025-08-31",
    features: [
      "Professional invoice processing",
      "Document type detection",
      "Enhanced regex patterns",
      "Koopzegels tracking tab",
      "Improved Google Sheets styling",
    ],
  },
  {
    version: "1.3.0",
    date: "2025-09-01",
    features: [
      "Admin commands system",
      "Google Sheets management",
      "WhatsApp interactive menus",
      "Comprehensive admin commands for WhatsApp",
    ],
  },
  {
    version: "1.4.0",
    date: "2025-09-01",
    features: [
      "Performance monitoring",
      "Enhanced user feedback",
      "Comprehensive testing suite",
      "100% accuracy for Albert Heijn PDF extraction",
    ],
  },
  {
    version: "1.5.0",
    date: "2025-09-01",
    features: [
      "Multi-file processing",
      "Advanced error handling",
      "System status monitoring",
      "Professional invoice processing for Romslomp",
    ],
  },
  {
    version: "1.6.0",
    date: "2025-09-01",
    features: [
      "Koopzegels tracking",
      "Detailed invoice breakdown",
      "Enhanced Google Sheets formatting",
      "WhatsApp menu fixes and List Message implementation",
    ],
  },
  {
    version: "1.7.0",
    date: "2025-09-01",
    features: [
      "WhatsApp List Message menus",
      "Professional invoice detection",
      "Improved user experience",
      "Enhanced error handling and validation",
    ],
  },
  {
    version: "1.8.0",
    date: "2025-09-01",
    features: [
      "Comprehensive performance monitoring",
      "Enhanced user feedback system",
      "Complete integration testing",
      "Advanced admin commands",
      "Real-time system status",
    ],
  },
  {
    version: "1.8.13",
    date: "2025-09-01",
    features: [
      "Enhanced WhatsApp menu with professional structure",
      "Version management system",
      "Improved user responses",
      "WhatsApp API error handling",
      "Message validation and phone number validation",
    ],
  },
  {
    version: "1.8.14",
    date: "2025-09-01",
    features: [
      "Fixed WhatsApp API 400 errors with Button Messages",
      "Fallback text menu for compatibility",
      "Admin commands via text interface",
      "Improved error handling and validation",
      "Enhanced user experience with reliable messaging",
    ],
  },
  {
    version: "1.8.15",
    date: "2025-09-01",
    features: [
      "Updated menu structure with AI Agent organization",
      "Improved welcome message with friendly and professional tone",
      "Reorganized admin and information commands",
      "Fixed release dates in version management",
      "Enhanced user experience with better menu flow",
    ],
  },
  {
    version: "1.8.16",
    date: "2025-09-01",
    features: [
      "Automatic version management system",
      "Current date updates and build number synchronization",
      "Version update scripts and documentation",
      "Professional version management workflow",
    ],
  },
  {
    version: "1.8.17",
    date: "2025-09-01",
    features: [
      "Comprehensive version management documentation",
      "Automatic milestone tracking",
      "Git commit count synchronization",
      "Professional development workflow",
    ],
  },
];

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

function fixVersionDates() {
  const versionFile = path.join(__dirname, '../services/version_management.js');
  const currentDate = getCurrentDate();
  const gitCommitCount = getGitCommitCount();
  
  console.log(`📅 Current date: ${currentDate}`);
  console.log(`🔢 Git commit count: ${gitCommitCount}`);
  
  // Read the version management file
  let content = fs.readFileSync(versionFile, 'utf8');
  
  // Update build number
  if (gitCommitCount) {
    content = content.replace(/build:\s*\d+/, `build: ${gitCommitCount}`);
  }
  
  // Update release date
  content = content.replace(
    /releaseDate:\s*['"][^'"]*['"]/,
    `releaseDate: "${currentDate}"`
  );
  
  // Replace the entire milestones array
  const milestonesStart = content.indexOf('  milestones: [');
  const milestonesEnd = content.indexOf('  ],', milestonesStart) + 4;
  
  const newMilestones = '  milestones: [\n' + 
    VERSION_MILESTONES.map(milestone => 
      `    {\n      version: "${milestone.version}",\n      date: "${milestone.date}",\n      features: [\n${milestone.features.map(feature => `        "${feature}",`).join('\n')}\n      ],\n    },`
    ).join('\n\n') + '\n  ],';
  
  content = content.slice(0, milestonesStart) + newMilestones + content.slice(milestonesEnd);
  
  // Write the updated content back
  fs.writeFileSync(versionFile, content, 'utf8');
  
  console.log('✅ Version dates fixed successfully!');
  console.log(`📅 Release date: ${currentDate}`);
  console.log(`🔢 Build number: ${gitCommitCount}`);
  console.log(`📋 Milestones updated: ${VERSION_MILESTONES.length} milestones`);
  
  // Show summary of milestones
  console.log('\n📋 Milestone Summary:');
  VERSION_MILESTONES.forEach(milestone => {
    console.log(`   ${milestone.version} (${milestone.date}): ${milestone.features.length} features`);
  });
  
  return {
    milestones: VERSION_MILESTONES.length,
    build: gitCommitCount,
    date: currentDate
  };
}

// Run the fix
console.log('🔧 Fixing version dates based on commit history...');
const result = fixVersionDates();

if (result) {
  console.log('\n🎉 Version dates fixed successfully!');
  console.log(`📋 Next steps:`);
  console.log(`   1. Review the changes in version_management.js`);
  console.log(`   2. Commit with message: "Fix version dates based on actual commit history"`);
  console.log(`   3. Push to repository`);
} else {
  console.log('\n❌ Version date fix failed!');
  process.exit(1);
}
