#!/usr/bin/env node

/**
 * Google Sheets Credentials Validator
 *
 * This script helps validate Google Sheets credentials and configuration
 * to debug issues with the WhatsApp webhook integration.
 */

const { google } = require("googleapis");

// Get environment variables
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS;

console.log("🔍 Google Sheets Credentials Validator");
console.log("=====================================\n");

// Check if environment variables are set
console.log("📋 Environment Variables Check:");
console.log(
  `GOOGLE_SHEETS_SPREADSHEET_ID: ${spreadsheetId ? "✅ Set" : "❌ Missing"}`
);
console.log(
  `GOOGLE_SHEETS_CREDENTIALS: ${credentialsJson ? "✅ Set" : "❌ Missing"}\n`
);

if (!spreadsheetId || !credentialsJson) {
  console.log("❌ Missing required environment variables!");
  console.log(
    "Please set both GOOGLE_SHEETS_SPREADSHEET_ID and GOOGLE_SHEETS_CREDENTIALS"
  );
  process.exit(1);
}

// Validate JSON format
let credentials;
try {
  credentials = JSON.parse(credentialsJson);
  console.log("✅ JSON credentials parsed successfully");
} catch (error) {
  console.log("❌ Failed to parse JSON credentials:");
  console.log(error.message);
  console.log(
    "\n💡 Make sure the JSON is properly formatted and contains no line breaks"
  );
  process.exit(1);
}

// Validate required fields
console.log("\n🔍 Validating Credentials Structure:");
const requiredFields = [
  "type",
  "project_id",
  "private_key_id",
  "private_key",
  "client_email",
];
let allFieldsPresent = true;

requiredFields.forEach((field) => {
  if (credentials[field]) {
    console.log(`✅ ${field}: Present`);
  } else {
    console.log(`❌ ${field}: Missing`);
    allFieldsPresent = false;
  }
});

if (!allFieldsPresent) {
  console.log("\n❌ Missing required fields in credentials!");
  process.exit(1);
}

console.log("\n✅ All required fields present");

// Test Google Sheets API connection
async function testConnection() {
  try {
    console.log("\n🔗 Testing Google Sheets API Connection...");

    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Test 1: Get spreadsheet properties
    console.log("📊 Testing spreadsheet access...");
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    console.log("✅ Successfully accessed spreadsheet!");
    console.log(`📋 Spreadsheet Title: ${response.data.properties.title}`);
    console.log(
      `📄 Sheets: ${response.data.sheets
        .map((s) => s.properties.title)
        .join(", ")}`
    );

    // Test 2: Try to read a small range
    console.log("\n📖 Testing read access...");
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "A1:Z1", // Read first row
    });

    console.log("✅ Successfully read from spreadsheet!");
    console.log(
      `📝 First row has ${
        readResponse.data.values ? readResponse.data.values[0].length : 0
      } columns`
    );

    // Test 3: Try to append a test row
    console.log("\n✍️ Testing write access...");
    const testData = [
      new Date().toISOString(),
      "TEST_ENTRY",
      "VALIDATION_TEST",
      0,
      "EUR",
      "test",
      0,
      0,
      "test",
      100,
      "Credentials validation test",
    ];

    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "Invoices!A:K",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [testData],
      },
    });

    console.log("✅ Successfully wrote to spreadsheet!");
    console.log(
      `📊 Updated range: ${appendResponse.data.updates.updatedRange}`
    );
    console.log(`📝 Updated rows: ${appendResponse.data.updates.updatedRows}`);

    console.log(
      "\n🎉 All tests passed! Google Sheets integration is working correctly."
    );
    console.log(
      "\n💡 You can now delete the test row from your spreadsheet if desired."
    );
  } catch (error) {
    console.log("\n❌ Google Sheets API test failed:");
    console.log(`Error: ${error.message}`);

    if (error.code === 403) {
      console.log("\n🔧 Possible solutions:");
      console.log(
        "1. Make sure the service account email has access to the spreadsheet"
      );
      console.log(
        "2. Check that Google Sheets API is enabled in Google Cloud Console"
      );
      console.log("3. Verify the service account has the correct permissions");
    } else if (error.code === 404) {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Check that the spreadsheet ID is correct");
      console.log("2. Make sure the spreadsheet exists and is accessible");
    }

    process.exit(1);
  }
}

// Run the test
testConnection();
