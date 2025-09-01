/**
 * Professional Invoice Processing Service
 * Handles extraction of data from professional invoices (not receipts)
 */

const { google } = require("googleapis");

// Google Sheets configuration
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS;

/**
 * Extract data from professional invoice text
 */
function createProfessionalInvoiceResponse(text, invoiceNumber) {
  console.log("📄 Processing professional invoice...");
  console.log("📝 Invoice text:", text.substring(0, 200) + "...");

  // Initialize response object
  const response = {
    invoice_number: invoiceNumber,
    company_name: "Onbekend",
    supplier_name: "Onbekend",
    supplier_address: "Onbekend",
    supplier_phone: "Onbekend",
    supplier_email: "Onbekend",
    supplier_website: "Onbekend",
    supplier_btw: "Onbekend",
    supplier_kvk: "Onbekend",
    supplier_iban: "Onbekend",
    supplier_bic: "Onbekend",
    invoice_date: "Onbekend",
    due_date: "Onbekend",
    invoice_reference: "Onbekend",
    customer_name: "Onbekend",
    customer_address: "Onbekend",
    customer_phone: "Onbekend",
    customer_email: "Onbekend",
    customer_btw: "Onbekend",
    customer_kvk: "Onbekend",
    subtotal_excl_btw: 0,
    btw_amount: 0,
    btw_percentage: 0,
    total_amount: 0,
    currency: "EUR",
    payment_terms: "Onbekend",
    items: [],
    notes: "Onbekend",
    document_type: "professional_invoice",
    processing_method: "Professional invoice extraction - AI not available",
  };

  try {
    // Extract company/supplier information
    const companyMatch = text.match(/Handelsnaam:\s*([^\n]+)/i);
    if (companyMatch) {
      response.company_name = companyMatch[1].trim();
      console.log(`🏢 Company: ${response.company_name}`);
    }

    // Extract supplier name (usually after Handelsnaam or in company name)
    if (response.company_name !== "Onbekend") {
      response.supplier_name = response.company_name;
    }

    // Extract supplier address
    const addressMatch = text.match(
      /(?:Hoog-Harnasch|Praagsingel)\s+\d+[^\n]*/i
    );
    if (addressMatch) {
      response.supplier_address = addressMatch[0].trim();
      console.log(`📍 Address: ${response.supplier_address}`);
    }

    // Extract phone number
    const phoneMatch =
      text.match(/Tel\.:\s*([^\n]+)/i) || text.match(/\+31[^\n]*/i);
    if (phoneMatch) {
      response.supplier_phone = phoneMatch[1]
        ? phoneMatch[1].trim()
        : phoneMatch[0].trim();
      console.log(`📞 Phone: ${response.supplier_phone}`);
    }

    // Extract email
    const emailMatch =
      text.match(/E-mail:\s*([^\n]+)/i) ||
      text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    if (emailMatch) {
      response.supplier_email = emailMatch[1]
        ? emailMatch[1].trim()
        : emailMatch[0].trim();
      console.log(`📧 Email: ${response.supplier_email}`);
    }

    // Extract website
    const websiteMatch =
      text.match(/Website:\s*([^\n]+)/i) || text.match(/www\.[^\s]+/i);
    if (websiteMatch) {
      response.supplier_website = websiteMatch[1]
        ? websiteMatch[1].trim()
        : websiteMatch[0].trim();
      console.log(`🌐 Website: ${response.supplier_website}`);
    }

    // Extract BTW number
    const btwMatch =
      text.match(/Btw-nummer:\s*([^\n]+)/i) || text.match(/NL\d{9}[A-Z]\d{2}/i);
    if (btwMatch) {
      response.supplier_btw = btwMatch[1]
        ? btwMatch[1].trim()
        : btwMatch[0].trim();
      console.log(`🏛️ BTW: ${response.supplier_btw}`);
    }

    // Extract KVK number
    const kvkMatch =
      text.match(/KVK-nummer:\s*([^\n]+)/i) || text.match(/\d{8}/i);
    if (kvkMatch) {
      response.supplier_kvk = kvkMatch[1]
        ? kvkMatch[1].trim()
        : kvkMatch[0].trim();
      console.log(`📋 KVK: ${response.supplier_kvk}`);
    }

    // Extract IBAN
    const ibanMatch =
      text.match(/IBAN:\s*([^\n]+)/i) ||
      text.match(/NL\d{2}\s*[A-Z]{4}\s*\d{4}\s*\d{4}\s*\d{2}/i);
    if (ibanMatch) {
      response.supplier_iban = ibanMatch[1]
        ? ibanMatch[1].trim()
        : ibanMatch[0].trim();
      console.log(`🏦 IBAN: ${response.supplier_iban}`);
    }

    // Extract BIC
    const bicMatch =
      text.match(/BIC:\s*([^\n]+)/i) ||
      text.match(/[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?/i);
    if (bicMatch) {
      response.supplier_bic = bicMatch[1]
        ? bicMatch[1].trim()
        : bicMatch[0].trim();
      console.log(`🏦 BIC: ${response.supplier_bic}`);
    }

    // Extract invoice date
    const invoiceDateMatch = text.match(
      /Factuurdatum:\s*(\d{2}\/\d{2}\/\d{4})/i
    );
    if (invoiceDateMatch) {
      const dateStr = invoiceDateMatch[1];
      const [day, month, year] = dateStr.split("/");
      response.invoice_date = `${year}-${month}-${day}`;
      console.log(`📅 Invoice date: ${response.invoice_date}`);
    }

    // Extract due date
    const dueDateMatch = text.match(/Vervaldatum:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (dueDateMatch) {
      const dateStr = dueDateMatch[1];
      const [day, month, year] = dateStr.split("/");
      response.due_date = `${year}-${month}-${day}`;
      console.log(`⏰ Due date: ${response.due_date}`);
    }

    // Extract invoice reference
    const invoiceRefMatch = text.match(/Factuur:\s*([^\n]+)/i);
    if (invoiceRefMatch) {
      response.invoice_reference = invoiceRefMatch[1].trim();
      console.log(`📄 Invoice ref: ${response.invoice_reference}`);
    }

    // Extract customer information - look for the customer section
    const customerMatch = text.match(/T\.a\.v\.\s*([^\n]+)/i);
    if (customerMatch) {
      response.customer_name = customerMatch[1].trim();
      console.log(`👤 Customer: ${response.customer_name}`);
    }

    // Extract customer address - look for the customer address after customer name
    const textLines = text.split("\n");
    let customerAddressFound = false;
    for (let i = 0; i < textLines.length; i++) {
      if (textLines[i].includes("T.a.v.") && i + 1 < textLines.length) {
        // Look for address in next few lines
        for (let j = i + 1; j < Math.min(i + 5, textLines.length); j++) {
          const line = textLines[j].trim();
          if (
            line &&
            !line.includes("Btw-nummer") &&
            !line.includes("KVK-nummer") &&
            !line.includes("Tel.") &&
            !line.includes("E-mail") &&
            !line.includes("Website") &&
            !line.includes("IBAN") &&
            !line.includes("BIC") &&
            !line.includes("Factuurdatum")
          ) {
            // This might be the customer address
            if (line.match(/^\d{4}[A-Z]{2}\s+[A-Za-z\s-]+$/)) {
              response.customer_address = line;
              customerAddressFound = true;
              console.log(`📍 Customer address: ${response.customer_address}`);
              break;
            }
          }
        }
        if (customerAddressFound) break;
      }
    }

    // If no customer address found, try to find it in the text
    if (!customerAddressFound) {
      const customerAddressMatch = text.match(
        /(?:Praagsingel|Hoog-Harnasch)\s+\d+[^\n]*/i
      );
      if (customerAddressMatch) {
        response.customer_address = customerAddressMatch[0].trim();
        console.log(
          `📍 Customer address (fallback): ${response.customer_address}`
        );
      }
    }

    // Extract amounts
    const subtotalMatch = text.match(
      /Totaalbedrag excl\. btw[^\d]*(\d+[.,]\d{2})/i
    );
    if (subtotalMatch) {
      response.subtotal_excl_btw = parseFloat(
        subtotalMatch[1].replace(",", ".")
      );
      console.log(`💰 Subtotal excl BTW: ${response.subtotal_excl_btw}`);
    }

    const btwAmountMatch =
      text.match(/Btw hoog[^€]*€\s*(\d+[.,]\d{2})/i) ||
      text.match(/Btw hoog[^\d]*(\d+[.,]\d{2})/i);
    if (btwAmountMatch) {
      response.btw_amount = parseFloat(btwAmountMatch[1].replace(",", "."));
      console.log(`🏛️ BTW amount: ${response.btw_amount}`);
    }

    const totalMatch = text.match(
      /Totaalbedrag incl\. btw[^\d]*(\d+[.,]\d{2})/i
    );
    if (totalMatch) {
      response.total_amount = parseFloat(totalMatch[1].replace(",", "."));
      console.log(`💶 Total amount: ${response.total_amount}`);
    }

    // Calculate BTW percentage
    if (response.subtotal_excl_btw > 0 && response.btw_amount > 0) {
      response.btw_percentage = Math.round(
        (response.btw_amount / response.subtotal_excl_btw) * 100
      );
      console.log(`📊 BTW percentage: ${response.btw_percentage}%`);
    }

    // Extract items - look for the items section
    const itemLines = text.split("\n");
    for (let i = 0; i < itemLines.length; i++) {
      const line = itemLines[i].trim();
      // Look for item pattern: quantity + description + price excl + price incl
      const itemMatch = line.match(
        /^(\d+)([^€]+)€\s*(\d+[.,]\d{2})€\s*(\d+[.,]\d{2})$/i
      );
      if (itemMatch) {
        const item = {
          quantity: parseInt(itemMatch[1]),
          description: itemMatch[2].trim(),
          price_excl_btw: parseFloat(itemMatch[3].replace(",", ".")),
          price_incl_btw: parseFloat(itemMatch[4].replace(",", ".")),
        };
        response.items.push(item);
        console.log(
          `📦 Item: ${item.quantity}x ${item.description} - €${item.price_excl_btw} excl BTW`
        );
      }
    }

    // Extract payment terms
    const paymentMatch = text.match(
      /Gelieve dit bedrag[^€]*€\s*([^,]+)[^0-9]*(\d{2}\/\d{2}\/\d{4})/i
    );
    if (paymentMatch) {
      response.payment_terms = `€${paymentMatch[1].trim()} due ${
        paymentMatch[2]
      }`;
      console.log(`💳 Payment terms: ${response.payment_terms}`);
    } else {
      // Try alternative pattern
      const altPaymentMatch = text.match(
        /€\s*(\d+[.,]\d{2})[^0-9]*(\d{2}\/\d{2}\/\d{4})/i
      );
      if (altPaymentMatch) {
        response.payment_terms = `€${altPaymentMatch[1].trim()} due ${
          altPaymentMatch[2]
        }`;
        console.log(`💳 Payment terms (alt): ${response.payment_terms}`);
      }
    }

    console.log("✅ Professional invoice processing completed");
    return response;
  } catch (error) {
    console.error("❌ Error processing professional invoice:", error);
    return response;
  }
}

/**
 * Save professional invoice data to Google Sheets
 */
async function saveProfessionalInvoiceToSheets(invoiceData) {
  try {
    console.log("💾 Saving professional invoice to Google Sheets...");

    // Check environment variables
    if (!GOOGLE_SHEETS_SPREADSHEET_ID || !GOOGLE_SHEETS_CREDENTIALS) {
      console.error("❌ Missing Google Sheets environment variables");
      return false;
    }

    // Parse credentials
    let credentials;
    try {
      credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
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

    // Save to main Invoices tab (extended structure for professional invoices)
    const mainRowData = [
      new Date().toISOString(), // Timestamp
      invoiceData.invoice_number || "INV-UNKNOWN",
      invoiceData.company_name || "Onbekend", // Company name
      invoiceData.invoice_date || new Date().toISOString().split("T")[0], // Invoice date
      "Onbekend", // Time (not applicable for invoices)
      "Onbekend", // Subtotaal na korting (not applicable)
      "Onbekend", // Subtotaal vóór korting (not applicable)
      "Onbekend", // BTW 9%
      invoiceData.btw_amount || "Onbekend", // BTW 21% (or total BTW)
      "Onbekend", // BTW 9% grondslag
      invoiceData.subtotal_excl_btw || "Onbekend", // BTW 21% grondslag (actually subtotal excl BTW)
      "Onbekend", // Bonus totaal (not applicable)
      "Onbekend", // Emballage totaal (not applicable)
      "Onbekend", // Voordeel totaal (not applicable)
      "Onbekend", // Koopzegels bedrag (not applicable)
      "Onbekend", // Koopzegels aantal (not applicable)
      invoiceData.total_amount || "Onbekend", // Total amount
      "Onbekend", // Betaald PIN (not applicable)
      "Onbekend", // Betaald Emballage (not applicable)
      invoiceData.currency || "EUR",
      invoiceData.document_type || "professional_invoice",
      invoiceData.items?.length || "Onbekend", // Item count
      "INVOICE", // Payment method
      "Onbekend", // Filiaal (not applicable)
      invoiceData.supplier_address || "Onbekend", // Adres
      invoiceData.supplier_phone || "Onbekend", // Telefoon
      "Onbekend", // Kassa (not applicable)
      invoiceData.invoice_reference || "Onbekend", // Transactie (use invoice reference)
      "Onbekend", // Terminal ID (not applicable)
      "Onbekend", // Merchant ID (not applicable)
      "Onbekend", // Bonuskaart (not applicable)
      "Onbekend", // Air Miles (not applicable)
      "Onbekend", // Confidence
      invoiceData.payment_terms || "Onbekend", // Notes (use payment terms)
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Invoices!A:AH",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [mainRowData],
      },
    });

    // Save detailed items to Detail Invoices tab
    if (invoiceData.items && invoiceData.items.length > 0) {
      console.log(
        `📝 Saving ${invoiceData.items.length} items to Detail Invoices tab`
      );

      const detailRows = invoiceData.items.map((item) => [
        new Date().toISOString(), // Timestamp
        invoiceData.invoice_number || "INV-UNKNOWN",
        invoiceData.company_name || "Onbekend",
        invoiceData.invoice_date || new Date().toISOString().split("T")[0],
        item.description || "Onbekend", // Item name
        "professional_service", // Category
        item.quantity || "1",
        item.price_excl_btw || "0", // Unit price (excl BTW)
        item.price_incl_btw || "0", // Total price (incl BTW)
        "nee", // Bonus info (not applicable)
        "0", // Bonus bedrag (not applicable)
        invoiceData.currency || "EUR",
        "INVOICE", // Payment method
        "Onbekend", // Kassa (not applicable)
        invoiceData.invoice_reference || "Onbekend", // Transactie (use invoice reference)
        "Onbekend", // Terminal (not applicable)
        "Onbekend", // Merchant (not applicable)
        "Onbekend", // POI (not applicable)
        "Onbekend", // Filiaal (not applicable)
        invoiceData.supplier_address || "Onbekend", // Adres
        invoiceData.supplier_phone || "Onbekend", // Telefoon
        "Onbekend", // Bonuskaart (not applicable)
        "Onbekend", // Air Miles (not applicable)
        invoiceData.payment_terms || "Onbekend", // Notes (use payment terms)
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        range: "Detail Invoices!A:W",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: detailRows,
        },
      });

      console.log(`✅ Successfully saved ${detailRows.length} detail rows`);
    } else {
      console.log("⚠️ No items found to save to Detail Invoices tab");
    }

    console.log("✅ Successfully saved professional invoice to Google Sheets");
    return true;
  } catch (error) {
    console.error(
      "❌ Error saving professional invoice to Google Sheets:",
      error
    );
    return false;
  }
}

/**
 * Determine if text is from a professional invoice
 */
function isProfessionalInvoice(text) {
  const professionalIndicators = [
    // Dutch professional invoice indicators
    /Handelsnaam:/i,
    /Factuurdatum:/i,
    /Vervaldatum:/i,
    /Btw-nummer:/i,
    /KVK-nummer:/i,
    /IBAN:/i,
    /BIC:/i,
    /Totaalbedrag excl\. btw/i,
    /Totaalbedrag incl\. btw/i,
    // English professional invoice indicators
    /Invoice Number:/i,
    /Invoice Date:/i,
    /Due Date:/i,
    /VAT Number:/i,
    /Company Number:/i,
    /Bank Account:/i,
    /Subtotal excl\. VAT/i,
    /Subtotal incl\. VAT/i,
    // General professional invoice patterns
    /FACTUUR/i,
    /INVOICE/i,
    /Leverancier:/i,
    /Supplier:/i,
    /Klant:/i,
    /Customer:/i,
    /Betaaltermijn:/i,
    /Payment Terms:/i,
    /T\.a\.v\./i, // "Ter attentie van" (Dutch)
    /Attn:/i, // Attention (English)
  ];

  const matchCount = professionalIndicators.filter((indicator) =>
    indicator.test(text)
  ).length;

  console.log(
    `🔍 Professional invoice detection: ${matchCount} indicators found`
  );
  return matchCount >= 2; // Reduced threshold to 2 for better detection
}

/**
 * Determine if text is from a receipt
 */
function isReceipt(text) {
  const receiptIndicators = [
    /ALBERT HEIJN/i,
    /SUBTOTAAL/i,
    /UW VOORDEEL/i,
    /KOOPZEGELS/i,
    /BONUSKAART/i,
    /AIRMILES/i,
    /PINNEN/i,
    /BTW OVER EUR/i,
  ];

  const matchCount = receiptIndicators.filter((indicator) =>
    indicator.test(text)
  ).length;
  return matchCount >= 3; // At least 3 indicators suggest receipt
}

module.exports = {
  createProfessionalInvoiceResponse,
  saveProfessionalInvoiceToSheets,
  isProfessionalInvoice,
  isReceipt,
};
