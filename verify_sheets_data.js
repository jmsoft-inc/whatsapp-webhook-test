// Verify data from Google Sheets after webhook processing
console.log("🧪 Verifying data from Google Sheets...\n");

const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: "../config/credentials/.env" });

async function verifySheetsData() {
  try {
    console.log("📋 STEP 1: Load Google Sheets Service");
    console.log("-".repeat(30));

    const sheetsService = require("./services/sheets_services/comprehensive_sheets_service");
    console.log("✅ Google Sheets service loaded");

    // Test 1: Check if we can read from sheets
    console.log("\n📋 STEP 2: Read Data from Sheets");
    console.log("-".repeat(30));

    try {
      // Initialize sheets service
      const sheets = new sheetsService();
      console.log("✅ Sheets service initialized");

      // Read data from the main sheet
      const data = await sheets.readSheetData();
      console.log("✅ Sheet data read successfully");

      if (data && data.length > 0) {
        console.log(`📊 Found ${data.length} rows of data`);

        // Display first few rows
        console.log("\n📋 FIRST 3 ROWS OF DATA:");
        console.log("-".repeat(30));

        data.slice(0, 3).forEach((row, index) => {
          console.log(`\nRow ${index + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
        });

        // Check for NB values or strange data
        console.log("\n🔍 CHECKING FOR PROBLEMS:");
        console.log("-".repeat(30));

        let hasNBValues = false;
        let hasStrangeData = false;
        let problemRows = [];

        data.forEach((row, rowIndex) => {
          Object.entries(row).forEach(([key, value]) => {
            if (value && typeof value === "string") {
              if (value.includes("NB")) {
                hasNBValues = true;
                problemRows.push({ row: rowIndex + 1, column: key, value });
              }
              if (
                value.includes("rare gegevens") ||
                value.includes("strange data")
              ) {
                hasStrangeData = true;
                problemRows.push({ row: rowIndex + 1, column: key, value });
              }
            }
          });
        });

        if (hasNBValues || hasStrangeData) {
          console.log("❌ PROBLEMS FOUND:");
          console.log(`   NB values: ${hasNBValues ? "YES" : "NO"}`);
          console.log(`   Strange data: ${hasStrangeData ? "YES" : "NO"}`);
          console.log(`   Problem rows: ${problemRows.length}`);

          console.log("\n📋 PROBLEM DETAILS:");
          problemRows.forEach((problem) => {
            console.log(
              `   Row ${problem.row}, Column ${problem.column}: "${problem.value}"`
            );
          });

          // Ask if user wants to clean the data
          console.log("\n⚠️  RECOMMENDATION:");
          console.log("   The data contains problems. Consider:");
          console.log("   1. Clean the data (remove problem rows)");
          console.log("   2. Keep headers for overview");
          console.log("   3. Re-process files with fixed AI analysis");
        } else {
          console.log("✅ NO PROBLEMS FOUND:");
          console.log("   All data looks clean");
          console.log("   No NB values or strange data detected");
        }
      } else {
        console.log("📊 No data found in sheets");
        console.log("💡 This might mean:");
        console.log("   - Files haven't been processed yet");
        console.log("   - Sheets are empty");
        console.log("   - There's an issue with the sheets service");
      }
    } catch (error) {
      console.log("❌ Error reading sheet data:", error.message);
    }

    // Test 3: Check sheet structure
    console.log("\n📋 STEP 3: Check Sheet Structure");
    console.log("-".repeat(30));

    try {
      const sheets = new sheetsService();
      const headers = await sheets.getSheetHeaders();

      if (headers && headers.length > 0) {
        console.log("✅ Sheet headers found:");
        headers.forEach((header, index) => {
          console.log(`   ${index + 1}. ${header}`);
        });
      } else {
        console.log("❌ No headers found");
      }
    } catch (error) {
      console.log("❌ Error checking sheet structure:", error.message);
    }
  } catch (error) {
    console.log("❌ Error loading sheets service:", error.message);
  }

  console.log("\n🎯 Data verification completed");
  console.log("📋 Check above for any issues");
  console.log("💡 Next steps depend on what was found");
}

// Run the verification
verifySheetsData().catch(console.error);
