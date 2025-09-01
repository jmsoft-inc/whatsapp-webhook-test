// Simple test to check sheets data using available methods
console.log("🧪 Testing Google Sheets data...\n");

// Load environment variables
require("dotenv").config({ path: "../config/credentials/.env" });

async function testSheetsData() {
  try {
    console.log("📋 STEP 1: Load Google Sheets Service");
    console.log("-".repeat(30));

    const sheetsService = require("./services/sheets_services/comprehensive_sheets_service");
    console.log("✅ Google Sheets service loaded");

    // Test 1: Check if we can initialize
    console.log("\n📋 STEP 2: Initialize Sheets Service");
    console.log("-".repeat(30));

    try {
      const sheets = new sheetsService();
      const initialized = await sheets.initialize();

      if (initialized) {
        console.log("✅ Sheets service initialized successfully");
      } else {
        console.log("❌ Failed to initialize sheets service");
        return;
      }
    } catch (error) {
      console.log("❌ Error initializing sheets service:", error.message);
      return;
    }

    // Test 2: Get statistics (this reads data from sheets)
    console.log("\n📋 STEP 3: Get Sheet Statistics");
    console.log("-".repeat(30));

    try {
      const sheets = new sheetsService();
      const stats = await sheets.getStatistics();

      if (stats) {
        console.log("✅ Statistics retrieved successfully");
        console.log("\n📊 SHEET STATISTICS:");
        console.log("-".repeat(30));
        console.log(`📄 Total Invoices: ${stats.totalInvoices}`);
        console.log(`💰 Total Amount: €${stats.totalAmount}`);
        console.log(`🏢 Unique Companies: ${stats.uniqueCompanies}`);
        console.log(`📋 Document Types: ${stats.documentTypes.join(", ")}`);
        console.log(
          `📅 Date Range: ${stats.dateRange.start} to ${stats.dateRange.end}`
        );

        if (stats.totalInvoices > 0) {
          console.log("\n✅ Data found in sheets");
          console.log("💡 This means files have been processed");
        } else {
          console.log("\n📊 No data found in sheets");
          console.log("💡 This means no files have been processed yet");
        }
      } else {
        console.log("❌ Failed to get statistics");
      }
    } catch (error) {
      console.log("❌ Error getting statistics:", error.message);
    }

    // Test 3: Setup headers to ensure structure is correct
    console.log("\n📋 STEP 4: Check Sheet Headers");
    console.log("-".repeat(30));

    try {
      const sheets = new sheetsService();
      const headersResult = await sheets.setupHeaders();

      if (headersResult) {
        console.log("✅ Headers setup completed");
        console.log("📋 Sheet structure is correct");
      } else {
        console.log("❌ Failed to setup headers");
      }
    } catch (error) {
      console.log("❌ Error setting up headers:", error.message);
    }
  } catch (error) {
    console.log("❌ Error loading sheets service:", error.message);
  }

  console.log("\n🎯 Sheets test completed");
  console.log("📋 Check above for results");
  console.log("💡 Next steps depend on what was found");
}

// Run the test
testSheetsData().catch(console.error);
