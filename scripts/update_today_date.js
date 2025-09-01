/**
 * Update Today's Date Script
 * Automatically updates the releaseDate in version_management.js to today's date
 */

const fs = require("fs");
const path = require("path");

function updateToTodayDate() {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    console.log(`📅 Today's date: ${today}`);

    // Path to version management file
    const versionFile = path.join(
      __dirname,
      "../services/version_management.js"
    );

    // Read the file
    let content = fs.readFileSync(versionFile, "utf8");

    // Update the releaseDate
    const oldPattern = /releaseDate:\s*['"][^'"]*['"]/;
    const newReleaseDate = `releaseDate: "${today}"`;

    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newReleaseDate);

      // Write back to file
      fs.writeFileSync(versionFile, content, "utf8");

      console.log(`✅ Release date updated to today: ${today}`);
      console.log(`📁 File updated: ${versionFile}`);
    } else {
      console.error("❌ Could not find releaseDate pattern in file");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error updating release date:", error.message);
    process.exit(1);
  }
}

// Run the update
updateToTodayDate();
