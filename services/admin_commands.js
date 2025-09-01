/**
 * Admin Commands Service
 * Provides administrative functions that can be executed via WhatsApp
 */

const { google } = require("googleapis");
const { createSystemStatusMessage } = require("./enhanced_error_handling");

// Google Sheets configuration
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS;

// Initialize Google Sheets API
let sheets;

function initializeGoogleSheets() {
  try {
    if (!GOOGLE_SHEETS_CREDENTIALS) {
      console.error("❌ GOOGLE_SHEETS_CREDENTIALS not set");
      return false;
    }

    const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    sheets = google.sheets({ version: "v4", auth });
    return true;
  } catch (error) {
    console.error("❌ Error initializing Google Sheets:", error);
    return false;
  }
}

/**
 * Clear all data from Google Sheets tabs
 */
async function clearAllSheetsData() {
  try {
    console.log("🧹 Clearing all sheets data...");

    // Initialize Google Sheets if not already done
    if (!sheets && !initializeGoogleSheets()) {
      return {
        success: false,
        message:
          "❌ **Error clearing sheets data**\n\nCould not initialize Google Sheets API",
      };
    }

    const tabs = ["Invoices", "Detail Invoices", "Koopzegels Tracking"];
    const results = [];

    for (const tab of tabs) {
      try {
        // Get the current data range
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
          range: `${tab}!A:Z`,
        });

        if (response.data.values && response.data.values.length > 1) {
          // Clear all data except headers (keep first row)
          await sheets.spreadsheets.values.clear({
            spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
            range: `${tab}!A2:Z`,
          });

          results.push(`✅ ${tab}: Data cleared (headers preserved)`);
          console.log(`✅ Cleared data from ${tab}`);
        } else {
          results.push(`ℹ️ ${tab}: Already empty`);
        }
      } catch (error) {
        console.error(`❌ Error clearing ${tab}:`, error);
        results.push(`❌ ${tab}: Error - ${error.message}`);
      }
    }

    return {
      success: true,
      message: "🧹 **Sheets Data Cleared**\n\n" + results.join("\n"),
      details: results,
    };
  } catch (error) {
    console.error("❌ Error in clearAllSheetsData:", error);
    return {
      success: false,
      message: "❌ **Error clearing sheets data**\n\n" + error.message,
    };
  }
}

/**
 * Get statistics about the current data
 */
async function getSheetsStatistics() {
  try {
    console.log("📊 Getting sheets statistics...");

    // Initialize Google Sheets if not already done
    if (!sheets && !initializeGoogleSheets()) {
      return {
        success: false,
        message:
          "❌ **Error getting sheets statistics**\n\nCould not initialize Google Sheets API",
      };
    }

    const tabs = ["Invoices", "Detail Invoices", "Koopzegels Tracking"];
    const stats = [];

    for (const tab of tabs) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
          range: `${tab}!A:Z`,
        });

        const rowCount = response.data.values
          ? response.data.values.length - 1
          : 0; // Exclude header
        stats.push(`📋 ${tab}: ${rowCount} rows`);
      } catch (error) {
        console.error(`❌ Error getting stats for ${tab}:`, error);
        stats.push(`❌ ${tab}: Error`);
      }
    }

    return {
      success: true,
      message: "📊 **Sheets Statistics**\n\n" + stats.join("\n"),
      details: stats,
    };
  } catch (error) {
    console.error("❌ Error in getSheetsStatistics:", error);
    return {
      success: false,
      message: "❌ **Error getting statistics**\n\n" + error.message,
    };
  }
}

/**
 * Reset Google Sheets headers and formatting
 */
async function resetSheetsHeaders() {
  try {
    console.log("🔧 Resetting sheets headers...");

    // Initialize Google Sheets if not already done
    if (!sheets && !initializeGoogleSheets()) {
      return {
        success: false,
        message:
          "❌ **Error resetting headers**\n\nCould not initialize Google Sheets API",
      };
    }

    // Import the setup function
    const {
      setupGoogleSheetsHeaders,
    } = require("./improved_invoice_processing");

    const result = await setupGoogleSheetsHeaders();

    if (result) {
      return {
        success: true,
        message:
          "🔧 **Headers Reset Successfully**\n\n✅ All tabs updated with headers\n✅ Formatting applied\n✅ Columns auto-resized",
      };
    } else {
      return {
        success: false,
        message:
          "❌ **Error resetting headers**\n\nCould not complete the operation",
      };
    }
  } catch (error) {
    console.error("❌ Error in resetSheetsHeaders:", error);
    return {
      success: false,
      message: "❌ **Error resetting headers**\n\n" + error.message,
    };
  }
}

/**
 * Delete specific invoice by invoice number
 */
async function deleteInvoiceByNumber(invoiceNumber) {
  try {
    console.log(`🗑️ Deleting invoice: ${invoiceNumber}`);

    // Initialize Google Sheets if not already done
    if (!sheets && !initializeGoogleSheets()) {
      return {
        success: false,
        message:
          "❌ **Error deleting invoice**\n\nCould not initialize Google Sheets API",
      };
    }

    // Search in Invoices tab
    const invoicesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Invoices!A:Z",
    });

    let found = false;
    let rowIndex = -1;

    if (invoicesResponse.data.values) {
      for (let i = 1; i < invoicesResponse.data.values.length; i++) {
        if (invoicesResponse.data.values[i][1] === invoiceNumber) {
          // Invoice number is in column B
          rowIndex = i + 1; // Sheets is 1-indexed
          found = true;
          break;
        }
      }
    }

    if (!found) {
      return {
        success: false,
        message: `❌ **Invoice Not Found**\n\nInvoice number "${invoiceNumber}" not found in the sheets.`,
      };
    }

    // Delete the row from Invoices tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Invoices tab
                dimension: "ROWS",
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    });

    // Also delete from Detail Invoices tab (search by invoice number)
    const detailResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Detail Invoices!A:Z",
    });

    if (detailResponse.data.values) {
      const rowsToDelete = [];
      for (let i = 1; i < detailResponse.data.values.length; i++) {
        if (detailResponse.data.values[i][1] === invoiceNumber) {
          // Invoice number is in column B
          rowsToDelete.push(i + 1);
        }
      }

      // Delete rows in reverse order to maintain indices
      for (let i = rowsToDelete.length - 1; i >= 0; i--) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: 1, // Detail Invoices tab
                    dimension: "ROWS",
                    startIndex: rowsToDelete[i] - 1,
                    endIndex: rowsToDelete[i],
                  },
                },
              },
            ],
          },
        });
      }
    }

    return {
      success: true,
      message: `🗑️ **Invoice Deleted Successfully**\n\n✅ Invoice "${invoiceNumber}" removed from Invoices tab\n✅ Related detail rows removed from Detail Invoices tab`,
    };
  } catch (error) {
    console.error("❌ Error in deleteInvoiceByNumber:", error);
    return {
      success: false,
      message: "❌ **Error deleting invoice**\n\n" + error.message,
    };
  }
}

/**
 * List all available admin commands
 */
function getAdminCommandsList() {
  const commands = [
    "🔧 **Admin Commands**",
    "",
    "📋 *Available Commands:*",
    "",
    "• `/clear` - Clear all data from sheets",
    "• `/stats` - Show sheets statistics",
    "• `/reset` - Reset headers and formatting",
    "• `/delete INV-xxx` - Delete specific invoice",
    "• `/status` - Show system status",
    "• `/help` - Show this help",
    "",
    "💡 *Usage:* Just type the command in WhatsApp",
    "Example: `/clear` or `/delete INV-1234567890-123`",
  ];

  return {
    success: true,
    message: commands.join("\n"),
  };
}

/**
 * Process admin command
 */
async function processAdminCommand(command) {
  const cmd = command.toLowerCase().trim();

  console.log(`🔧 Processing admin command: "${command}"`);

  try {
    if (cmd === "/clear" || cmd === "clear") {
      return await clearAllSheetsData();
    }

    if (cmd === "/stats" || cmd === "stats") {
      return await getSheetsStatistics();
    }

    if (cmd === "/reset" || cmd === "reset") {
      return await resetSheetsHeaders();
    }

    if (cmd === "/help" || cmd === "help") {
      return getAdminCommandsList();
    }

    if (cmd === "/status" || cmd === "status") {
      return {
        success: true,
        message: createSystemStatusMessage(),
      };
    }

    if (cmd.startsWith("/delete ")) {
      const invoiceNumber = command.substring(8).trim();
      if (invoiceNumber) {
        return await deleteInvoiceByNumber(invoiceNumber);
      } else {
        return {
          success: false,
          message:
            "❌ **Invalid Command**\n\nUsage: `/delete INV-1234567890-123`",
        };
      }
    }

    // Unknown command
    return {
      success: false,
      message:
        "❌ **Unknown Command**\n\nType `/help` to see available commands",
    };
  } catch (error) {
    console.error("❌ Error processing admin command:", error);
    return {
      success: false,
      message: "❌ **Command Error**\n\n" + error.message,
    };
  }
}

module.exports = {
  processAdminCommand,
  clearAllSheetsData,
  getSheetsStatistics,
  resetSheetsHeaders,
  deleteInvoiceByNumber,
  getAdminCommandsList,
};
