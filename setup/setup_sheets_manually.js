#!/usr/bin/env node

/**
 * Manual Google Sheets Setup Script
 * Run this script to create and configure the Google Sheets tabs immediately
 */

require("dotenv").config();
const { setupGoogleSheetsTabs } = require("./setup_google_sheets_tabs");

async function main() {
  console.log("🚀 Starting manual Google Sheets setup...");
  console.log("=" * 50);

  try {
    const result = await setupGoogleSheetsTabs();

    if (result) {
      console.log(
        "\n🎉 SUCCESS! Google Sheets tabs have been created and configured."
      );
      console.log("\n📊 Your Google Sheet now has:");
      console.log("   • Invoices tab - Overzicht van alle facturen");
      console.log(
        "   • Detail Invoices tab - Gedetailleerde productinformatie"
      );
      console.log("\n🔗 You can view your sheet at:");
      console.log(
        `   https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_SPREADSHEET_ID}/edit`
      );
    } else {
      console.log("\n❌ FAILED! Could not set up Google Sheets tabs.");
      console.log("Please check your environment variables and try again.");
    }
  } catch (error) {
    console.error("\n💥 ERROR:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure GOOGLE_SHEETS_SPREADSHEET_ID is set");
    console.log("2. Make sure GOOGLE_SHEETS_CREDENTIALS is set");
    console.log(
      "3. Check that the service account has access to the spreadsheet"
    );
  }
}

// Run the setup
main();
