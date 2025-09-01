// Simple script to read data directly from Google Sheets
console.log("🧪 Reading data directly from Google Sheets...\n");

// Load environment variables
require("dotenv").config({ path: "../config/credentials/.env" });

async function readSheetsData() {
  try {
    console.log("📋 STEP 1: Load Google Sheets Service");
    console.log("-".repeat(30));

    const ComprehensiveSheetsService = require("./services/sheets_services/comprehensive_sheets_service");
    const sheetsService = new ComprehensiveSheetsService();

    console.log("✅ Google Sheets service loaded");

    // Initialize the service
    console.log("\n📋 STEP 2: Initialize Service");
    console.log("-".repeat(30));

    const initialized = await sheetsService.initialize();
    if (!initialized) {
      console.log("❌ Failed to initialize sheets service");
      return;
    }

    console.log("✅ Sheets service initialized successfully");

    // Read data from the Comprehensive Analysis tab
    console.log("\n📋 STEP 3: Read Data from Comprehensive Analysis Tab");
    console.log("-".repeat(30));

    try {
      // Read data from the Comprehensive Analysis tab
      const response = await sheetsService.sheets.spreadsheets.values.get({
        spreadsheetId: sheetsService.spreadsheetId,
        range: "Comprehensive Analysis!A2:Z1000", // Read from row 2 (skip headers)
      });

      const rows = response.data.values || [];

      if (rows.length === 0) {
        console.log("📊 No data found in Comprehensive Analysis tab");
        console.log("💡 This means no files have been processed yet");
      } else {
        console.log(
          `📊 Found ${rows.length} rows of data in Comprehensive Analysis tab`
        );

        // Show first few rows
        console.log("\n📋 FIRST 3 ROWS OF DATA:");
        console.log("-".repeat(30));

        rows.slice(0, 3).forEach((row, index) => {
          console.log(`\nRow ${index + 1}:`);
          row.forEach((cell, cellIndex) => {
            if (cell && cell.toString().trim() !== "") {
              console.log(`  Column ${cellIndex + 1}: "${cell}"`);
            }
          });
        });

        if (rows.length > 3) {
          console.log(`\n... and ${rows.length - 3} more rows`);
        }

        // Check for NB values or strange data
        console.log("\n🔍 CHECKING FOR PROBLEMS:");
        console.log("-".repeat(30));

        let hasNBValues = false;
        let hasStrangeData = false;
        let problemRows = [];

        rows.forEach((row, rowIndex) => {
          row.forEach((cell, cellIndex) => {
            if (cell && typeof cell === "string") {
              if (cell.includes("NB")) {
                hasNBValues = true;
                problemRows.push({
                  row: rowIndex + 2,
                  column: cellIndex + 1,
                  value: cell,
                });
              }
              if (
                cell.includes("rare gegevens") ||
                cell.includes("strange data") ||
                cell.includes("Onbekend")
              ) {
                hasStrangeData = true;
                problemRows.push({
                  row: rowIndex + 2,
                  column: cellIndex + 1,
                  value: cell,
                });
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
          problemRows.slice(0, 10).forEach((problem) => {
            console.log(
              `   Row ${problem.row}, Column ${problem.column}: "${problem.value}"`
            );
          });

          if (problemRows.length > 10) {
            console.log(`   ... and ${problemRows.length - 10} more problems`);
          }
        } else {
          console.log("✅ NO PROBLEMS FOUND:");
          console.log("   All data looks clean");
          console.log("   No NB values or strange data detected");
        }
      }
    } catch (error) {
      console.log("❌ Error reading sheet data:", error.message);
    }
  } catch (error) {
    console.log("❌ Error loading sheets service:", error.message);
  }

  console.log("\n🎯 Data reading completed");
  console.log("📋 Check above for results");
  console.log("💡 Next steps depend on what was found");
}

// Run the test
readSheetsData().catch(console.error);
