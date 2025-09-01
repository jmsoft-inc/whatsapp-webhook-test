// Clean sheet data while keeping headers
console.log("🧪 Cleaning sheet data while keeping headers...\n");

// Load environment variables
require("dotenv").config({ path: "../config/credentials/.env" });

async function cleanSheetsData() {
  try {
    console.log("📋 STEP 1: Load Google Sheets Service");
    console.log("-".repeat(30));

    const sheetsService = require("./services/sheets_services/comprehensive_sheets_service");
    console.log("✅ Google Sheets service loaded");

    // Test 1: Check current data
    console.log("\n📋 STEP 2: Check Current Data");
    console.log("-".repeat(30));

    try {
      const sheets = new sheetsService();

      // Initialize the service first
      const initialized = await sheets.initialize();
      if (!initialized) {
        console.log("❌ Failed to initialize sheets service");
        return;
      }

      console.log("✅ Sheets service initialized");

      // Get current data directly from sheets API
      const response = await sheets.sheets.spreadsheets.values.get({
        spreadsheetId: sheets.spreadsheetId,
        range: "Comprehensive Analysis!A2:Z1000", // Read from row 2 (skip headers)
      });

      const currentData = response.data.values || [];
      console.log(`📊 Current data: ${currentData.length} rows`);

      if (currentData && currentData.length > 0) {
        console.log("⚠️  Data found - will be cleaned");

        // Show what will be removed
        console.log("\n📋 DATA TO BE REMOVED:");
        currentData.slice(0, 3).forEach((row, index) => {
          console.log(`Row ${index + 1}: ${Object.values(row).join(" | ")}`);
        });

        if (currentData.length > 3) {
          console.log(`... and ${currentData.length - 3} more rows`);
        }
      } else {
        console.log("✅ No data to clean");
        return;
      }
    } catch (error) {
      console.log("❌ Error checking current data:", error.message);
      return;
    }

    // Test 2: Clean the data
    console.log("\n📋 STEP 3: Clean Sheet Data");
    console.log("-".repeat(30));

    try {
      const sheets = new sheetsService();

      // Initialize the service first
      const initialized = await sheets.initialize();
      if (!initialized) {
        console.log("❌ Failed to initialize sheets service");
        return;
      }

      // Clear all data rows but keep headers using the sheets API directly
      const response = await sheets.sheets.spreadsheets.values.clear({
        spreadsheetId: sheets.spreadsheetId,
        range: "Comprehensive Analysis!A2:Z1000", // Clear from row 2 (keep headers)
      });

      if (response.status === 200) {
        console.log("✅ Sheet data cleared successfully");
        console.log("📋 Headers preserved for overview");
      } else {
        console.log("❌ Failed to clear sheet data");
      }
    } catch (error) {
      console.log("❌ Error clearing sheet data:", error.message);
    }

    // Test 3: Verify headers are still there
    console.log("\n📋 STEP 4: Verify Headers Preserved");
    console.log("-".repeat(30));

    try {
      const sheets = new sheetsService();

      // Initialize the service first
      const initialized = await sheets.initialize();
      if (!initialized) {
        console.log("❌ Failed to initialize sheets service");
        return;
      }

      // Get headers directly from sheets API
      const response = await sheets.sheets.spreadsheets.values.get({
        spreadsheetId: sheets.spreadsheetId,
        range: "Comprehensive Analysis!A1:Z1", // Read headers from row 1
      });

      const headers = response.data.values ? response.data.values[0] : [];

      if (headers && headers.length > 0) {
        console.log("✅ Headers preserved:");
        headers.forEach((header, index) => {
          console.log(`   ${index + 1}. ${header}`);
        });

        console.log("\n📊 Sheet is now clean and ready for new data");
        console.log(
          "💡 Headers provide clear overview of what data will be stored"
        );
      } else {
        console.log("❌ No headers found after cleaning");
        console.log("⚠️  This might indicate a problem");
      }
    } catch (error) {
      console.log("❌ Error verifying headers:", error.message);
    }
  } catch (error) {
    console.log("❌ Error loading sheets service:", error.message);
  }

  console.log("\n🎯 Sheet cleaning completed");
  console.log("📋 Check above for results");
  console.log("💡 Next: Re-process test files for clean data");
}

// Run the cleaning
cleanSheetsData().catch(console.error);
