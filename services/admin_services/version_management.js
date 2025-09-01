/**
 * Version Management System
 * Handles version tracking, milestones, and development history
 */

// Version history configuration
const VERSION_HISTORY = {
  // Major features and breaking changes
  major: 1,

  // Minor features and enhancements
  minor: 8,

  // Bug fixes and patches
  patch: 20,

  // Development stage
  stage: "stable", // 'alpha', 'beta', 'rc', 'stable'

  // Build number (git commit count)
  build: 76,

  // Release date
  releaseDate: "2025-09-01",

  // Development milestones
  milestones: [
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
    {
      version: "1.8.20",
      date: "2025-09-01",
      features: [
        "Fixed version dates based on actual commit history",
        "Added missing milestones with correct dates",
        "Updated milestone features based on real development",
        "Synchronized version management with git history",
      ],
    },
  ],
};

/**
 * Get current version string
 */
function getCurrentVersion() {
  const { major, minor, patch, stage, build } = VERSION_HISTORY;
  return `${major}.${minor}.${patch}-${stage}+${build}`;
}

/**
 * Get detailed version information
 */
function getVersionInfo() {
  const version = getCurrentVersion();
  const latestMilestone =
    VERSION_HISTORY.milestones[VERSION_HISTORY.milestones.length - 1];

  return {
    version,
    major: VERSION_HISTORY.major,
    minor: VERSION_HISTORY.minor,
    patch: VERSION_HISTORY.patch,
    stage: VERSION_HISTORY.stage,
    build: VERSION_HISTORY.build,
    releaseDate: VERSION_HISTORY.releaseDate,
    latestMilestone,
  };
}

/**
 * Create version message for WhatsApp
 */
function createVersionMessage() {
  const versionInfo = getVersionInfo();

  return `📋 *JMS AI Agents - Version Info*

🏷️ *Current Version:* ${versionInfo.version}
📅 *Release Date:* ${versionInfo.releaseDate}
🔢 *Build Number:* ${versionInfo.build}

📈 *Latest Features:*
${versionInfo.latestMilestone.features
  .map((feature) => `• ${feature}`)
  .join("\n")}

💡 *Development Progress:*
• Total Milestones: ${VERSION_HISTORY.milestones.length}
• Major Features: ${VERSION_HISTORY.major}
• Minor Enhancements: ${VERSION_HISTORY.minor}
• Bug Fixes: ${VERSION_HISTORY.patch}

🚀 *Development Stage:* ${VERSION_HISTORY.stage.toUpperCase()}

*For more information, visit our documentation or contact support.*`;
}

/**
 * Get development statistics
 */
function getDevelopmentStats() {
  const totalFeatures = VERSION_HISTORY.milestones.reduce(
    (sum, milestone) => sum + milestone.features.length,
    0
  );

  return {
    totalCommits: VERSION_HISTORY.build,
    totalMilestones: VERSION_HISTORY.milestones.length,
    totalFeatures,
    averageFeaturesPerMilestone: Math.round(
      totalFeatures / VERSION_HISTORY.milestones.length
    ),
    majorReleases: VERSION_HISTORY.major,
    minorFeatures: VERSION_HISTORY.minor,
    bugFixes: VERSION_HISTORY.patch,
  };
}

module.exports = {
  getCurrentVersion,
  getVersionInfo,
  createVersionMessage,
  getDevelopmentStats,
  VERSION_HISTORY,
};
