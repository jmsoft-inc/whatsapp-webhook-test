/**
 * Comprehensive Google Sheets Service
 * Handles saving data from the new invoice analysis library
 * Automatically creates missing headers and manages multiple tabs
 */

const { google } = require("googleapis");

class ComprehensiveSheetsService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    this.credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
    this.sheets = null;
    this.auth = null;
    this.headersCache = new Map(); // Cache for headers to avoid repeated API calls
    this.initialized = false;
  }

  /**
   * Initialize Google Sheets client
   */
  async initialize() {
    if (!this.spreadsheetId || !this.credentials) {
      console.error("❌ Missing Google Sheets environment variables");
      return false;
    }

    if (this.initialized) {
      return true; // Already initialized
    }

    try {
      const credentials = JSON.parse(this.credentials);
      this.auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      this.sheets = google.sheets({ version: "v4", auth: this.auth });

      // Initialize headers cache on first startup
      await this.initializeHeadersCache();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("❌ Error initializing Google Sheets:", error);
      return false;
    }
  }

  /**
   * Clear headers cache (useful for testing or when headers change)
   */
  clearHeadersCache() {
    this.headersCache.clear();
    console.log("📋 Headers cache cleared");
  }

  /**
   * Save comprehensive analysis data to sheets
   */
  async saveComprehensiveAnalysis(analysisData, invoiceNumber) {
    if (!(await this.initialize())) {
      return false;
    }

    try {
      console.log("💾 Saving comprehensive analysis to sheets...");

      // Save to main invoices tab
      const mainSaved = await this.saveToMainInvoicesTab(
        analysisData,
        invoiceNumber
      );

      // Save to detailed items tab
      const itemsSaved = await this.saveToItemsTab(analysisData, invoiceNumber);

      // Save to comprehensive analysis tab
      const analysisSaved = await this.saveToAnalysisTab(
        analysisData,
        invoiceNumber
      );

      return mainSaved && itemsSaved && analysisSaved;
    } catch (error) {
      console.error("❌ Error saving comprehensive analysis:", error);
      return false;
    }
  }

  /**
   * Save to main invoices tab
   */
  async saveToMainInvoicesTab(analysisData, invoiceNumber) {
    try {
      const headers = [
        "Verwerkt Op",
        "Factuurnummer",
        "Document Type",
        "Bedrijf",
        "Adres",
        "Telefoon",
        "Datum",
        "Tijd",
        "Totaalbedrag",
        "Valuta",
        "Subtotaal",
        "BTW 9%",
        "BTW 21%",
        "BTW Totaal",
        "Korting",
        "Bonus",
        "Koopzegels",
        "Betaalmethode",
        "PIN Bedrag",
        "Transactie ID",
        "Terminal ID",
        "Merchant ID",
        "Filiaal",
        "Bonuskaart",
        "Air Miles",
        "Aantal Items",
        "Unieke Items",
        "Betrouwbaarheid",
        "Opmerkingen",
      ];

      // Ensure headers exist
      await this.ensureHeaders("Invoices", headers);

      const rowData = [
        new Date().toISOString(), // Verwerkt Op
        invoiceNumber, // Factuurnummer
        analysisData.document_info?.type || "NB", // Document Type
        analysisData.company_info?.name || "NB", // Bedrijf
        analysisData.company_info?.address || "NB", // Adres
        analysisData.company_info?.phone || "NB", // Telefoon
        analysisData.transaction_info?.date || "NB", // Datum
        analysisData.transaction_info?.time || "NB", // Tijd
        analysisData.financial_info?.total_amount || 0, // Totaalbedrag
        analysisData.financial_info?.currency || "EUR", // Valuta
        analysisData.financial_info?.subtotal || 0, // Subtotaal
        analysisData.financial_info?.tax_9 || 0, // BTW 9%
        analysisData.financial_info?.tax_21 || 0, // BTW 21%
        analysisData.financial_info?.tax_total || 0, // BTW Totaal
        analysisData.financial_info?.discount_amount || 0, // Korting
        analysisData.financial_info?.bonus_amount || 0, // Bonus
        analysisData.financial_info?.koopzegels_amount || 0, // Koopzegels
        analysisData.financial_info?.payment_method || "NB", // Betaalmethode
        analysisData.financial_info?.payment_pin || 0, // PIN Bedrag
        analysisData.transaction_info?.transaction_id || "NB", // Transactie ID
        analysisData.transaction_info?.terminal_id || "NB", // Terminal ID
        analysisData.transaction_info?.merchant_id || "NB", // Merchant ID
        analysisData.store_info?.filiaal || "NB", // Filiaal
        analysisData.loyalty_info?.bonuskaart || "NB", // Bonuskaart
        analysisData.loyalty_info?.air_miles || "NB", // Air Miles
        analysisData.item_summary?.total_items || 0, // Aantal Items
        analysisData.item_summary?.unique_items || 0, // Unieke Items
        analysisData.document_info?.confidence || 0, // Betrouwbaarheid
        analysisData.notes || "", // Opmerkingen
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Invoices!A:AC",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: { values: [rowData] },
      });

      console.log("✅ Saved to main invoices tab");
      return true;
    } catch (error) {
      console.error("❌ Error saving to main invoices tab:", error);
      return false;
    }
  }

  /**
   * Save individual items to items tab
   */
  async saveToItemsTab(analysisData, invoiceNumber) {
    try {
      const headers = [
        "Factuurnummer",
        "Document Type",
        "Bedrijf",
        "Datum",
        "Item Naam",
        "Aantal",
        "Prijs Per Stuk",
        "Totaalprijs",
        "Categorie",
        "Bonus",
        "Bonus Bedrag",
        "Korting Percentage",
        "BTW Percentage",
      ];

      // Ensure headers exist
      await this.ensureHeaders("Items", headers);

      const items = analysisData.items || [];
      const rows = [];

      for (const item of items) {
        rows.push([
          invoiceNumber, // Factuurnummer
          analysisData.document_info?.type || "NB", // Document Type
          analysisData.company_info?.name || "NB", // Bedrijf
          analysisData.transaction_info?.date || "NB", // Datum
          item.name || "NB", // Item Naam
          item.quantity || 0, // Aantal
          item.unit_price || 0, // Prijs Per Stuk
          item.total_price || 0, // Totaalprijs
          item.category || "NB", // Categorie
          item.bonus || "NB", // Bonus
          item.bonus_amount || 0, // Bonus Bedrag
          item.discount_percentage || 0, // Korting Percentage
          item.tax_rate || 0, // BTW Percentage
        ]);
      }

      if (rows.length > 0) {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: "Items!A:M",
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          resource: { values: rows },
        });
      }

      console.log("✅ Saved items to items tab");
      return true;
    } catch (error) {
      console.error("❌ Error saving to items tab:", error);
      return false;
    }
  }

  /**
   * Save comprehensive analysis to analysis tab
   */
  async saveToAnalysisTab(analysisData, invoiceNumber) {
    try {
      const headers = [
        "Factuurnummer",
        "Document Type",
        "Subtype",
        "Taal",
        "Betrouwbaarheid",
        "Bedrijf Naam",
        "Bedrijf Adres",
        "Bedrijf Telefoon",
        "Bedrijf Email",
        "Bedrijf Website",
        "Bedrijf KVK",
        "Bedrijf BTW",
        "Bedrijf IBAN",
        "Datum",
        "Tijd",
        "Transactie ID",
        "Terminal ID",
        "Merchant ID",
        "POI",
        "Periode",
        "Totaalbedrag",
        "Valuta",
        "Subtotaal Voor Korting",
        "Subtotaal Na Korting",
        "BTW 9% Bedrag",
        "BTW 21% Bedrag",
        "BTW 0% Bedrag",
        "BTW Totaal",
        "Korting Bedrag",
        "Bonus Bedrag",
        "Emballage Bedrag",
        "Voordeel Bedrag",
        "Koopzegels Bedrag",
        "Koopzegels Aantal",
        "Betaalmethode",
        "PIN Bedrag",
        "Contant Bedrag",
        "Kaart Bedrag",
        "Emballagebonnen Bedrag",
        "Bonuskaart",
        "Air Miles",
        "Klantenkaart",
        "Loyalty Punten",
        "BTW 9% Grondslag",
        "BTW 21% Grondslag",
        "BTW 0% Grondslag",
        "Filiaal",
        "Kassa",
        "Medewerker",
        "Bank Naam",
        "Kaart Type",
        "Kaart Nummer",
        "Autorisatie Code",
        "Leesmethode",
        "Totaal Items",
        "Unieke Items",
        "Categorieën",
        "Opmerkingen",
        "Ruwe Tekst Preview",
        "Ruwe Tekst Lengte",
      ];

      // Ensure headers exist
      await this.ensureHeaders("Comprehensive Analysis", headers);

      // Handle raw_text character limit for Google Sheets
      const rawText = analysisData.raw_text || "";
      const rawTextPreview = this.truncateForSheets(rawText, 1000); // Show first 1000 chars
      const rawTextLength = rawText.length;

      const rowData = [
        invoiceNumber, // Factuurnummer
        analysisData.document_info?.type || "NB", // Document Type
        analysisData.document_info?.subtype || "NB", // Subtype
        analysisData.document_info?.language || "NB", // Taal
        analysisData.document_info?.confidence || 0, // Betrouwbaarheid
        analysisData.company_info?.name || "NB", // Bedrijf Naam
        analysisData.company_info?.address || "NB", // Bedrijf Adres
        analysisData.company_info?.phone || "NB", // Bedrijf Telefoon
        analysisData.company_info?.email || "NB", // Bedrijf Email
        analysisData.company_info?.website || "NB", // Bedrijf Website
        analysisData.company_info?.kvk || "NB", // Bedrijf KVK
        analysisData.company_info?.btw || "NB", // Bedrijf BTW
        analysisData.company_info?.iban || "NB", // Bedrijf IBAN
        analysisData.transaction_info?.date || "NB", // Datum
        analysisData.transaction_info?.time || "NB", // Tijd
        analysisData.transaction_info?.transaction_id || "NB", // Transactie ID
        analysisData.transaction_info?.terminal_id || "NB", // Terminal ID
        analysisData.transaction_info?.merchant_id || "NB", // Merchant ID
        analysisData.transaction_info?.poi || "NB", // POI
        analysisData.transaction_info?.period || "NB", // Periode
        analysisData.financial_info?.total_amount || 0, // Totaalbedrag
        analysisData.financial_info?.currency || "EUR", // Valuta
        analysisData.financial_info?.subtotal || 0, // Subtotaal Voor Korting
        analysisData.financial_info?.subtotal_after_discount || 0, // Subtotaal Na Korting
        analysisData.financial_info?.tax_9 || 0, // BTW 9% Bedrag
        analysisData.financial_info?.tax_21 || 0, // BTW 21% Bedrag
        analysisData.financial_info?.tax_0 || 0, // BTW 0% Bedrag
        analysisData.financial_info?.tax_total || 0, // BTW Totaal
        analysisData.financial_info?.discount_amount || 0, // Korting Bedrag
        analysisData.financial_info?.bonus_amount || 0, // Bonus Bedrag
        analysisData.financial_info?.emballage_amount || 0, // Emballage Bedrag
        analysisData.financial_info?.voordeel_amount || 0, // Voordeel Bedrag
        analysisData.financial_info?.koopzegels_amount || 0, // Koopzegels Bedrag
        analysisData.financial_info?.koopzegels_count || 0, // Koopzegels Aantal
        analysisData.financial_info?.payment_method || "NB", // Betaalmethode
        analysisData.financial_info?.payment_pin || 0, // PIN Bedrag
        analysisData.financial_info?.payment_cash || 0, // Contant Bedrag
        analysisData.financial_info?.payment_card || 0, // Kaart Bedrag
        analysisData.financial_info?.payment_emballage || 0, // Emballagebonnen Bedrag
        analysisData.loyalty_info?.bonuskaart || "NB", // Bonuskaart
        analysisData.loyalty_info?.air_miles || "NB", // Air Miles
        analysisData.loyalty_info?.customer_card || "NB", // Klantenkaart
        analysisData.loyalty_info?.loyalty_points || 0, // Loyalty Punten
        analysisData.btw_breakdown?.btw_9_base || 0, // BTW 9% Grondslag
        analysisData.btw_breakdown?.btw_21_base || 0, // BTW 21% Grondslag
        analysisData.btw_breakdown?.btw_0_base || 0, // BTW 0% Grondslag
        analysisData.store_info?.filiaal || "NB", // Filiaal
        analysisData.store_info?.kassa || "NB", // Kassa
        analysisData.store_info?.employee || "NB", // Medewerker
        analysisData.bank_info?.bank_name || "NB", // Bank Naam
        analysisData.bank_info?.card_type || "NB", // Kaart Type
        analysisData.bank_info?.card_number || "NB", // Kaart Nummer
        analysisData.bank_info?.authorization_code || "NB", // Autorisatie Code
        analysisData.bank_info?.reading_method || "NB", // Leesmethode
        analysisData.item_summary?.total_items || 0, // Totaal Items
        analysisData.item_summary?.unique_items || 0, // Unieke Items
        (analysisData.item_summary?.categories || []).join(", "), // Categorieën
        this.truncateForSheets(analysisData.notes || "", 2000), // Opmerkingen
        rawTextPreview, // Ruwe Tekst Preview
        rawTextLength, // Ruwe Tekst Lengte
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Comprehensive Analysis!A:AZ",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: { values: [rowData] },
      });

      // Set row formatting to prevent auto-enlargement of notes column
      try {
        const lastRow = await this.getLastRow("Comprehensive Analysis");
        if (lastRow > 0) {
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            resource: {
              requests: [
                {
                  updateDimensionProperties: {
                    range: {
                      sheetId: await this.getSheetId("Comprehensive Analysis"),
                      dimension: "ROWS",
                      startIndex: lastRow - 1,
                      endIndex: lastRow,
                    },
                    properties: {
                      pixelSize: 100, // Fixed row height
                    },
                    fields: "pixelSize",
                  },
                },
                {
                  repeatCell: {
                    range: {
                      sheetId: await this.getSheetId("Comprehensive Analysis"),
                      startRowIndex: lastRow - 1,
                      endRowIndex: lastRow,
                      startColumnIndex: 52, // Notes column (AZ)
                      endColumnIndex: 53,
                    },
                    cell: {
                      userEnteredFormat: {
                        wrapStrategy: "CLIP", // Prevent text wrapping
                      },
                    },
                    fields: "userEnteredFormat.wrapStrategy",
                  },
                },
              ],
            },
          });
        }
      } catch (formatError) {
        console.log("⚠️ Could not set row formatting:", formatError.message);
      }

      console.log("✅ Saved to comprehensive analysis tab");
      return true;
    } catch (error) {
      console.error("❌ Error saving to analysis tab:", error);
      return false;
    }
  }

  /**
   * Truncate text for Google Sheets (respect 50k character limit)
   */
  truncateForSheets(text, maxLength = 45000) {
    if (!text || text.length <= maxLength) {
      return text;
    }

    return (
      text.substring(0, maxLength) +
      `\n\n[... truncated - full length: ${text.length} characters ...]`
    );
  }

  /**
   * Initialize headers cache for all tabs
   */
  async initializeHeadersCache() {
    try {
      console.log("📋 Initializing headers cache...");

      // Get all sheets in the spreadsheet
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheets = spreadsheet.data.sheets;

      // Cache headers for each sheet
      for (const sheet of sheets) {
        const tabName = sheet.properties.title;
        try {
          const range = `${tabName}!A1:Z1`; // Check first 26 columns
          const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: range,
          });

          const headers = response.data.values?.[0] || [];
          this.headersCache.set(tabName, headers);
          console.log(
            `📋 Cached headers for ${tabName}: ${headers.length} columns`
          );
        } catch (error) {
          console.log(
            `📋 No headers found for ${tabName}, will create when needed`
          );
          this.headersCache.set(tabName, []);
        }
      }

      console.log("📋 Headers cache initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing headers cache:", error);
    }
  }
  /**
   * Ensure headers exist for a tab (using cache to avoid API quota issues)
   */
  async ensureHeaders(tabName, headers) {
    try {
      // Check cache first
      const cachedHeaders = this.headersCache.get(tabName) || [];

      // If headers match, no need to update
      if (
        cachedHeaders.length === headers.length &&
        JSON.stringify(cachedHeaders) === JSON.stringify(headers)
      ) {
        return true;
      }

      // Check if tab exists
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const tabExists = spreadsheet.data.sheets.some(
        (sheet) => sheet.properties.title === tabName
      );

      if (!tabExists) {
        // Create new tab
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: tabName,
                  },
                },
              },
            ],
          },
        });
        console.log(`📋 Created new tab: ${tabName}`);
      }

      // Set headers
      const range = `${tabName}!A1:${this.getColumnLetter(headers.length)}1`;
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: range,
        valueInputOption: "RAW",
        resource: {
          values: [headers],
        },
      });

      // Update cache
      this.headersCache.set(tabName, headers);
      console.log(`📋 Set headers for tab: ${tabName}`);

      return true;
    } catch (error) {
      console.error(`❌ Error ensuring headers for ${tabName}:`, error);
      return false;
    }
  }

  /**
   * Get the last row number for a tab
   */
  async getLastRow(tabName) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${tabName}!A:A`,
      });

      const values = response.data.values || [];
      return values.length;
    } catch (error) {
      console.error(`❌ Error getting last row for ${tabName}:`, error);
      return 0;
    }
  }

  /**
   * Get the sheet ID for a tab
   */
  async getSheetId(tabName) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = response.data.sheets.find(
        (s) => s.properties.title === tabName
      );
      return sheet ? sheet.properties.sheetId : null;
    } catch (error) {
      console.error(`❌ Error getting sheet ID for ${tabName}:`, error);
      return null;
    }
  }

  /**
   * Convert column number to letter (A, B, C, etc.)
   */
  getColumnLetter(columnNumber) {
    let result = "";
    while (columnNumber > 0) {
      columnNumber--;
      result = String.fromCharCode(65 + (columnNumber % 26)) + result;
      columnNumber = Math.floor(columnNumber / 26);
    }
    return result;
  }

  /**
   * Get statistics from sheets
   */
  async getStatistics() {
    if (!(await this.initialize())) {
      return null;
    }

    try {
      const stats = {
        totalInvoices: 0,
        totalAmount: 0,
        companies: new Set(),
        documentTypes: new Set(),
        dateRange: { start: null, end: null },
      };

      // Get data from main invoices tab
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Invoices!A:AC",
      });

      const rows = response.data.values || [];
      if (rows.length > 1) {
        // Skip header row
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          stats.totalInvoices++;

          if (row[8]) {
            // Total amount column
            stats.totalAmount += parseFloat(row[8]) || 0;
          }

          if (row[3]) {
            // Company column
            stats.companies.add(row[3]);
          }

          if (row[2]) {
            // Document type column
            stats.documentTypes.add(row[2]);
          }

          if (row[7]) {
            // Date column
            const date = new Date(row[7]);
            if (!stats.dateRange.start || date < stats.dateRange.start) {
              stats.dateRange.start = date;
            }
            if (!stats.dateRange.end || date > stats.dateRange.end) {
              stats.dateRange.end = date;
            }
          }
        }
      }

      return {
        totalInvoices: stats.totalInvoices,
        totalAmount: stats.totalAmount.toFixed(2),
        uniqueCompanies: stats.companies.size,
        documentTypes: Array.from(stats.documentTypes),
        dateRange: {
          start: stats.dateRange.start?.toISOString().split("T")[0] || "N/A",
          end: stats.dateRange.end?.toISOString().split("T")[0] || "N/A",
        },
      };
    } catch (error) {
      console.error("❌ Error getting statistics:", error);
      return null;
    }
  }
}

module.exports = ComprehensiveSheetsService;
