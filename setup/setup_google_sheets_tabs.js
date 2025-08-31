/**
 * Google Sheets Tab Setup Script
 * Creates and configures both Invoices and Detail Invoices tabs
 */

const { google } = require("googleapis");

async function setupGoogleSheetsTabs() {
  try {
    console.log("🔧 Setting up Google Sheets tabs...");

    // Check environment variables
    if (
      !process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
      !process.env.GOOGLE_SHEETS_CREDENTIALS
    ) {
      console.error("❌ Missing Google Sheets environment variables");
      return false;
    }

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    } catch (error) {
      console.error("❌ Error parsing Google Sheets credentials:", error);
      return false;
    }

    // Create Google Sheets client
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // First, get the current spreadsheet to see what tabs exist
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    });

    console.log(
      "📊 Current tabs:",
      spreadsheet.data.sheets.map((s) => s.properties.title)
    );

    // Check if tabs exist, if not create them
    const existingTabs = spreadsheet.data.sheets.map((s) => s.properties.title);
    const requiredTabs = ["Invoices", "Detail Invoices"];
    const tabsToCreate = requiredTabs.filter(
      (tab) => !existingTabs.includes(tab)
    );

    if (tabsToCreate.length > 0) {
      console.log("📋 Creating missing tabs:", tabsToCreate);

      // Create missing tabs
      const requests = tabsToCreate.map((tabTitle) => ({
        addSheet: {
          properties: {
            title: tabTitle,
            gridProperties: {
              rowCount: 1000,
              columnCount: 50,
            },
          },
        },
      }));

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        resource: {
          requests: requests,
        },
      });

      console.log("✅ Created tabs:", tabsToCreate);
    }

    // Expand existing tabs to have enough columns
    console.log("🔧 Expanding existing tabs to 50 columns...");
    const expandRequests = spreadsheet.data.sheets.map((sheet) => ({
      updateSheetProperties: {
        properties: {
          sheetId: sheet.properties.sheetId,
          gridProperties: {
            rowCount: 1000,
            columnCount: 50,
          },
        },
        fields: "gridProperties.columnCount",
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      resource: {
        requests: expandRequests,
      },
    });

    console.log("✅ Expanded all tabs to 50 columns");

    // Setup Invoices tab headers
    const invoicesHeaders = [
      "Timestamp",
      "Factuurnummer",
      "Bedrijf",
      "Datum",
      "Tijd",
      "Subtotaal na korting",
      "Subtotaal vóór korting",
      "BTW 9%",
      "BTW 21%",
      "BTW 9% Grondslag",
      "BTW 21% Grondslag",
      "Bonus Totaal",
      "Emballage Totaal",
      "Voordeel Totaal",
      "Koopzegels Bedrag",
      "Koopzegels Aantal",
      "Totaalbedrag",
      "Betaald PIN",
      "Betaald Emballage",
      "Valuta",
      "Document Type",
      "Aantal Items",
      "Betaalmethode",
      "Filiaal",
      "Adres",
      "Telefoon",
      "Kassa",
      "Transactie",
      "Terminal ID",
      "Merchant ID",
      "Bonuskaart",
      "Air Miles",
      "Betrouwbaarheid",
      "Opmerkingen",
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Invoices!A1:AH1",
      valueInputOption: "RAW",
      resource: {
        values: [invoicesHeaders],
      },
    });

    console.log("✅ Updated Invoices tab headers");

    // Setup Detail Invoices tab headers
    const detailHeaders = [
      "Timestamp",
      "Factuurnummer",
      "Bedrijf",
      "Datum",
      "Productnaam",
      "Categorie",
      "Hoeveelheid",
      "Prijs per stuk",
      "Totaalprijs",
      "Bonus Info",
      "Bonus Bedrag",
      "Valuta",
      "Betaalmethode",
      "Kassa",
      "Transactie",
      "Opmerkingen",
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Detail Invoices!A1:P1",
      valueInputOption: "RAW",
      resource: {
        values: [detailHeaders],
      },
    });

    console.log("✅ Updated Detail Invoices tab headers");

    // Format headers with bold and background color
    const formatRequests = [
      // Format Invoices tab headers
      {
        repeatCell: {
          range: {
            sheetId: spreadsheet.data.sheets.find(
              (s) => s.properties.title === "Invoices"
            )?.properties.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 34,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
              textFormat: {
                bold: true,
                foregroundColor: { red: 1, green: 1, blue: 1 },
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
      // Format Detail Invoices tab headers
      {
        repeatCell: {
          range: {
            sheetId: spreadsheet.data.sheets.find(
              (s) => s.properties.title === "Detail Invoices"
            )?.properties.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: detailHeaders.length,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
              textFormat: {
                bold: true,
                foregroundColor: { red: 1, green: 1, blue: 1 },
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
      // Format data rows with alternating colors
      {
        repeatCell: {
          range: {
            sheetId: spreadsheet.data.sheets.find(
              (s) => s.properties.title === "Invoices"
            )?.properties.sheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: 33,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.98, green: 0.98, blue: 0.98 },
              textFormat: {
                bold: false,
                foregroundColor: { red: 0, green: 0, blue: 0 },
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
      // Format Detail Invoices data rows
      {
        repeatCell: {
          range: {
            sheetId: spreadsheet.data.sheets.find(
              (s) => s.properties.title === "Detail Invoices"
            )?.properties.sheetId,
            startRowIndex: 1,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: detailHeaders.length,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.98, green: 0.98, blue: 0.98 },
              textFormat: {
                bold: false,
                foregroundColor: { red: 0, green: 0, blue: 0 },
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      resource: {
        requests: formatRequests,
      },
    });

    console.log("✅ Applied formatting to headers");

    // Auto-resize columns
    const autoResizeRequests = [
      // Auto-resize Invoices tab
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: spreadsheet.data.sheets.find(
              (s) => s.properties.title === "Invoices"
            )?.properties.sheetId,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex: 33,
          },
        },
      },
      // Auto-resize Detail Invoices tab
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: spreadsheet.data.sheets.find(
              (s) => s.properties.title === "Detail Invoices"
            )?.properties.sheetId,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex: detailHeaders.length,
          },
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      resource: {
        requests: autoResizeRequests,
      },
    });

    console.log("✅ Auto-resized columns");

    console.log("🎉 Google Sheets tabs setup completed successfully! ✅");
    console.log("📊 Available tabs:");
    console.log("   • Invoices - Overzicht van alle facturen");
    console.log("   • Detail Invoices - Gedetailleerde productinformatie");

    return true;
  } catch (error) {
    console.error("❌ Error setting up Google Sheets tabs:", error);
    return false;
  }
}

// Test function to run setup
async function testSetup() {
  console.log("🧪 Testing Google Sheets tabs setup...");
  const result = await setupGoogleSheetsTabs();
  if (result) {
    console.log("✅ Setup test completed successfully");
  } else {
    console.log("❌ Setup test failed");
  }
}

module.exports = {
  setupGoogleSheetsTabs,
  testSetup,
};

// Run test if called directly
if (require.main === module) {
  testSetup();
}
