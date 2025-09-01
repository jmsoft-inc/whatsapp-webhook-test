#!/usr/bin/env node

/**
 * Auto Update Today's Date Script
 * Automatically keeps the releaseDate in version_management.js updated to today's date
 * This script can be run daily or whenever you want to sync the releaseDate with today
 */

const fs = require("fs");
const path = require("path");

function autoUpdateTodayDate() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    console.log(`🔄 Auto-updating release date to today: ${today}`);

    // Path to version management file
    const versionFile = path.join(
      __dirname,
      "../services/version_management.js"
    );

    // Read the file
    let content = fs.readFileSync(versionFile, "utf8");

    // Check current releaseDate
    const currentDateMatch = content.match(/releaseDate:\s*['"]([^'"]*)['"]/);
    const currentDate = currentDateMatch ? currentDateMatch[1] : null;

    if (currentDate === today) {
      console.log(`✅ Release date is already up-to-date: ${today}`);
      return;
    }

    // Update the releaseDate
    const oldPattern = /releaseDate:\s*['"][^'"]*['"]/;
    const newReleaseDate = `releaseDate: "${today}"`;

    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newReleaseDate);

      // Write back to file
      fs.writeFileSync(versionFile, content, "utf8");

      console.log(
        `✅ Release date updated from ${currentDate} to today: ${today}`
      );
      console.log(`📁 File updated: ${versionFile}`);
      console.log(
        `💡 Tip: Run 'npm run version:today' to manually update the release date`
      );
    } else {
      console.error("❌ Could not find releaseDate pattern in file");
    }
  } catch (error) {
    console.error("❌ Error in auto-update:", error.message);
  }
}

// Run the auto-update
autoUpdateTodayDate();
