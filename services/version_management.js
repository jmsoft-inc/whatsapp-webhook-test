/**
 * Version Management Service
 * Tracks development progress and maintains semantic versioning
 */

// Version history based on git commits and development milestones
const VERSION_HISTORY = {
  // Major features and breaking changes
  major: 1,

  // Minor features and enhancements
  minor: 8,

  // Bug fixes and patches
  patch: 14,

  // Development stage
  stage: "stable", // 'alpha', 'beta', 'rc', 'stable'

  // Build number (git commit count)
  build: 72,

  // Release date
  releaseDate: "2025-01-09",

  // Development milestones
  milestones: [
    {
      version: "1.0.0",
      date: "2025-01-09",
      features: [
        "Initial WhatsApp webhook setup",
        "Basic invoice processing",
        "Google Sheets integration",
      ],
    },
    {
      version: "1.1.0",
      date: "2025-01-09",
      features: [
        "Albert Heijn receipt processing",
        "PDF text extraction",
        "Data validation and error handling",
      ],
    },
    {
      version: "1.2.0",
      date: "2025-01-09",
      features: [
        "Professional invoice processing",
        "Document type detection",
        "Enhanced regex patterns",
      ],
    },
    {
      version: "1.3.0",
      date: "2025-01-09",
      features: [
        "Admin commands system",
        "Google Sheets management",
        "WhatsApp interactive menus",
      ],
    },
    {
      version: "1.4.0",
      date: "2025-01-09",
      features: [
        "Performance monitoring",
        "Enhanced user feedback",
        "Comprehensive testing suite",
      ],
    },
    {
      version: "1.5.0",
      date: "2025-01-09",
      features: [
        "Multi-file processing",
        "Advanced error handling",
        "System status monitoring",
      ],
    },
    {
      version: "1.6.0",
      date: "2025-01-09",
      features: [
        "Koopzegels tracking",
        "Detailed invoice breakdown",
        "Enhanced Google Sheets formatting",
      ],
    },
    {
      version: "1.7.0",
      date: "2025-01-09",
      features: [
        "WhatsApp List Message menus",
        "Professional invoice detection",
        "Improved user experience",
      ],
    },
    {
      version: "1.8.0",
      date: "2025-01-09",
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
      date: "2025-01-09",
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
      date: "2025-01-09",
      features: [
        "Fixed WhatsApp API 400 errors with Button Messages",
        "Fallback text menu for compatibility",
        "Admin commands via text interface",
        "Improved error handling and validation",
        "Enhanced user experience with reliable messaging",
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
 * Get version information for display
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
 * Create version display message for WhatsApp
 */
function createVersionMessage() {
  const versionInfo = getVersionInfo();

  return `📋 *JMSoft AI Agents - Version Info*

🔢 *Version:* ${versionInfo.version}
📅 *Release Date:* ${versionInfo.releaseDate}
🏗️ *Build:* ${versionInfo.build}
📊 *Stage:* ${versionInfo.stage}

📈 *Latest Features:*
${versionInfo.latestMilestone.features
  .map((feature) => `• ${feature}`)
  .join("\n")}

💡 *Development Progress:*
• ${versionInfo.major} Major releases
• ${versionInfo.minor} Minor features
• ${versionInfo.patch} Bug fixes
• ${versionInfo.build} Total commits

*Powered by JMSoft AI Technology*`;
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
    totalFeatures,
    totalMilestones: VERSION_HISTORY.milestones.length,
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
