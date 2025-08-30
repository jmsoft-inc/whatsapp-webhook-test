/**
 * Improved Invoice Processing for Dutch Receipts
 * Specifically optimized for Albert Heijn and other Dutch supermarkets
 */

const axios = require("axios");

// Generate unique invoice number
function generateInvoiceNumber() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
}

// Improved OCR text extraction with Albert Heijn specific patterns
async function extractTextFromImage(imageUrl) {
  console.log(`🔍 Extracting text from image: ${imageUrl}`);

  // In a real implementation, you would use a proper OCR service
  // For now, we'll simulate with improved patterns for Albert Heijn

  // Simulated OCR result with better formatting
  const simulatedText = `ALBERT HEIJN
BONNETJE
Datum: 15-01-2024
Tijd: 14:30:25
Kassa: 3

MELK HALFVOLLE 2L    2x €1,25     €2,50
BROOD VOLKOREN 500G   1x €1,80     €1,80
KAAS JONG BELEGEN     1x €3,20     €3,20
BOTER ROOMBOTER 250G  1x €2,10     €2,10
APPELS ELSTAR 1KG     1x €2,50     €2,50
BANANEN 1KG           1x €1,80     €1,80

Subtotaal:            €13,90
BTW 9%:               €1,25
BTW 21%:              €1,66
Totaal:               €16,81

Betaalmethode: PIN
Kaartnummer: ****1234
Transactie: 123456789

Bedankt voor je aankoop!
www.albertheijn.nl`;

  return simulatedText;
}

// Enhanced AI processing for Dutch receipts
async function processWithAI(text, invoiceNumber) {
  if (!process.env.OPENAI_API_KEY) {
    console.log("OpenAI API key not configured, using fallback response");
    return createFallbackResponse(text, invoiceNumber);
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Je bent een expert in het extraheren van factuurgegevens uit Nederlandse supermarkt bonnetjes, specifiek Albert Heijn.
            
            Extraheer de volgende informatie in JSON formaat:
            {
              "invoice_number": "Factuurnummer (gebruik het meegegeven nummer)",
              "company": "Bedrijfsnaam (bijv. ALBERT HEIJN)",
              "date": "Datum in YYYY-MM-DD formaat",
              "time": "Tijd in HH:MM formaat",
              "total_amount": "Totaalbedrag (alleen het getal, geen €)",
              "subtotal": "Subtotaal (alleen het getal)",
              "tax_9": "BTW 9% (alleen het getal)",
              "tax_21": "BTW 21% (alleen het getal)",
              "bonus_amount": "Bonus bedrag (alleen het getal, 0 als geen bonus)",
              "emballage_amount": "Emballage bedrag (alleen het getal, 0 als geen emballage)",
              "voordeel_amount": "Voordeel bedrag (alleen het getal, 0 als geen voordeel)",
              "koopzegels_amount": "Koopzegels bedrag (alleen het getal, 0 als geen koopzegels)",
              "currency": "EUR",
              "document_type": "receipt",
              "payment_method": "Betaalmethode (PIN, CONTANT, etc.)",
              "items": [
                {
                  "name": "Productnaam",
                  "quantity": "Aantal",
                  "unit_price": "Prijs per stuk",
                  "total_price": "Totaalprijs",
                  "category": "Categorie (voeding, non-food, etc.)",
                  "bonus": "Bonus info (ja/nee/onbekend)"
                }
              ],
              "item_count": "Totaal aantal verschillende artikelen",
              "confidence": "Betrouwbaarheid 0-100",
              "notes": "Extra opmerkingen",
              "store_info": {
                "kassa": "Kassa nummer",
                "transactie": "Transactie nummer"
              }
            }
            
            Belangrijk:
            - Gebruik exacte bedragen uit de tekst
            - Zorg dat alle bedragen alleen getallen zijn (geen € of komma's)
            - Herken Albert Heijn specifieke patronen
            - Extraheer alle individuele items met hoeveelheden en prijzen
            - Herken subtotaal, bonus, emballage, voordeel, koopzegels en BTW bedragen
            - Gebruik het meegegeven factuurnummer
            - Als subtotaal niet expliciet genoemd wordt, bereken het als total_amount - tax_9 - tax_21 - bonus_amount - emballage_amount - voordeel_amount - koopzegels_amount
            - Let op: emballage kan ook "statiegeld" genoemd worden
            - Let op: voordeel kan ook "korting" of "actie" genoemd worden
            - Let op: koopzegels kunnen ook "zegels" genoemd worden`,
          },
          {
            role: "user",
            content: `Factuurnummer: ${invoiceNumber}\n\nBonnetje tekst:\n${text}`,
          },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log("🤖 AI Response:", aiResponse);

    try {
      const invoiceData = JSON.parse(aiResponse);
      return invoiceData;
    } catch (parseError) {
      console.error("❌ Error parsing AI response:", parseError);
      return createFallbackResponse(text, invoiceNumber);
    }
  } catch (error) {
    console.error("❌ OpenAI API error:", error.message);
    return createFallbackResponse(text, invoiceNumber);
  }
}

// Fallback response when AI is not available
function createFallbackResponse(text, invoiceNumber) {
  // Extract basic information from text
  const company = text.includes("ALBERT HEIJN") || text.includes("AH") ? "ALBERT HEIJN" : "NB";
  const date = new Date().toISOString().split("T")[0];
  
  // Try to extract total amount from text with multiple patterns
  let total = 0;
  const totalPatterns = [
    /(?:TOTAAL|TOTAALBEDRAG|TOTALE|TOTAAL:)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i,
    /(?:BETALEN|TE BETALEN)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i,
    /[€]?\s*(\d+[.,]\d{2}|\d+)\s*(?:EUR|€)/i,
    /(\d+[.,]\d{2})\s*[€]?/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      total = parseFloat(match[1].replace(",", "."));
      break;
    }
  }
  
  // Try to extract subtotal
  let subtotal = 0;
  const subtotalMatch = text.match(/(?:SUBTOTAAL|SUBTOTAAL:)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i);
  if (subtotalMatch) {
    subtotal = parseFloat(subtotalMatch[1].replace(",", "."));
  }
  
  // Try to extract BTW amounts
  let tax9 = 0;
  let tax21 = 0;
  const tax9Match = text.match(/(?:BTW\s*9%?|9%\s*BTW)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i);
  const tax21Match = text.match(/(?:BTW\s*21%?|21%\s*BTW)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i);
  
  if (tax9Match) tax9 = parseFloat(tax9Match[1].replace(",", "."));
  if (tax21Match) tax21 = parseFloat(tax21Match[1].replace(",", "."));
  
  // Try to extract bonus, emballage, voordeel, koopzegels
  let bonus = 0;
  let emballage = 0;
  let voordeel = 0;
  let koopzegels = 0;
  
  const bonusMatch = text.match(/(?:BONUS|BONUS:)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i);
  const emballageMatch = text.match(/(?:EMBALLAGE|STATIEGELD|EMBALLAGE:)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i);
  const voordeelMatch = text.match(/(?:VOORDEEL|KORTING|ACTIE|VOORDEEL:)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i);
  const koopzegelsMatch = text.match(/(?:KOOPZEGELS|ZEGELS|KOOPZEGELS:)\s*[€]?\s*(\d+[.,]\d{2}|\d+)/i);
  
  if (bonusMatch) bonus = parseFloat(bonusMatch[1].replace(",", "."));
  if (emballageMatch) emballage = parseFloat(emballageMatch[1].replace(",", "."));
  if (voordeelMatch) voordeel = parseFloat(voordeelMatch[1].replace(",", "."));
  if (koopzegelsMatch) koopzegels = parseFloat(koopzegelsMatch[1].replace(",", "."));
  
  // Try to extract payment method
  let paymentMethod = "NB";
  if (text.includes("PIN") || text.includes("PINPAS")) paymentMethod = "PIN";
  else if (text.includes("CONTANT") || text.includes("CASH")) paymentMethod = "CONTANT";
  else if (text.includes("IDEAL")) paymentMethod = "IDEAL";
  else if (text.includes("CREDITCARD") || text.includes("CREDIT")) paymentMethod = "CREDITCARD";
  
  // Try to extract time
  let time = "NB";
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }
  
  // Try to extract kassa and transactie numbers
  let kassa = "NB";
  let transactie = "NB";
  const kassaMatch = text.match(/(?:KASSA|KAS)\s*(\d+)/i);
  const transactieMatch = text.match(/(?:TRANSACTIE|TRANS|TXN)\s*(\d+)/i);
  
  if (kassaMatch) kassa = kassaMatch[1];
  if (transactieMatch) transactie = transactieMatch[1];
  
  // Try to extract individual items
  const items = [];
  const itemPattern = /([A-Z\s]+)\s+(\d+[.,]\d{2})\s*[€]?/gi;
  let itemMatch;
  let itemCount = 0;
  
  while ((itemMatch = itemPattern.exec(text)) !== null && itemCount < 10) {
    const itemName = itemMatch[1].trim();
    const itemPrice = parseFloat(itemMatch[2].replace(",", "."));
    
    if (itemName.length > 2 && itemPrice > 0) {
      items.push({
        name: itemName,
        quantity: "1",
        unit_price: itemPrice,
        total_price: itemPrice,
        category: "voeding",
        bonus: "NB",
      });
      itemCount++;
    }
  }
  
  // If no items found, create a generic one
  if (items.length === 0) {
    items.push({
      name: "Producten",
      quantity: "1",
      unit_price: total,
      total_price: total,
      category: "voeding",
      bonus: "NB",
    });
  }

  return {
    invoice_number: invoiceNumber,
    company: company,
    date: date,
    time: time,
    total_amount: total,
    subtotal: subtotal || (total - tax9 - tax21 - bonus - emballage - voordeel - koopzegels),
    tax_9: tax9,
    tax_21: tax21,
    bonus_amount: bonus,
    emballage_amount: emballage,
    voordeel_amount: voordeel,
    koopzegels_amount: koopzegels,
    currency: "EUR",
    document_type: "receipt",
    payment_method: paymentMethod,
    items: items,
    item_count: items.length,
    confidence: 70,
    notes: "Handmatige verwerking - AI niet beschikbaar, data geëxtraheerd uit tekst",
    store_info: {
      kassa: kassa,
      transactie: transactie,
    },
  };
}

// Save detailed invoice data to Google Sheets
async function saveDetailedInvoiceToSheets(invoiceData) {
  try {
    console.log("💾 Saving detailed invoice to Google Sheets...");

    const { google } = require("googleapis");

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

    // Save to main Invoices tab
    const mainRowData = [
      new Date().toISOString(), // Timestamp
      invoiceData.invoice_number || "INV-UNKNOWN",
      invoiceData.company || "NB",
      invoiceData.date || new Date().toISOString().split("T")[0],
      invoiceData.time || "NB",
      invoiceData.subtotal || "NB",
      invoiceData.tax_9 || "NB",
      invoiceData.tax_21 || "NB",
      invoiceData.bonus_amount || "NB",
      invoiceData.emballage_amount || "NB",
      invoiceData.voordeel_amount || "NB",
      invoiceData.koopzegels_amount || "NB",
      invoiceData.total_amount || "NB",
      invoiceData.currency || "EUR",
      invoiceData.document_type || "receipt",
      invoiceData.item_count || "NB",
      invoiceData.payment_method || "NB",
      invoiceData.confidence || "NB",
      invoiceData.notes || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Invoices!A:S",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [mainRowData],
      },
    });

    // Save detailed items to Detail Invoices tab
    if (invoiceData.items && invoiceData.items.length > 0) {
      const detailRows = invoiceData.items.map((item) => [
        new Date().toISOString(), // Timestamp
        invoiceData.invoice_number || "INV-UNKNOWN",
        invoiceData.company || "NB",
        invoiceData.date || new Date().toISOString().split("T")[0],
        item.name || "NB",
        item.category || "NB",
        item.quantity || "NB",
        item.unit_price || "NB",
        item.total_price || "NB",
        item.bonus || "NB",
        invoiceData.currency || "EUR",
        invoiceData.payment_method || "NB",
        invoiceData.store_info?.kassa || "NB",
        invoiceData.store_info?.transactie || "NB",
        invoiceData.notes || "",
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: "Detail Invoices!A:O",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: detailRows,
        },
      });
    }

    console.log("✅ Successfully saved detailed invoice to Google Sheets");
    return true;
  } catch (error) {
    console.error("❌ Error saving detailed invoice to Google Sheets:", error);
    return false;
  }
}

// Create Google Sheets headers if they don't exist
async function setupGoogleSheetsHeaders() {
  try {
    // Use the new setup function
    const { setupGoogleSheetsTabs } = require("./setup_google_sheets_tabs");
    return await setupGoogleSheetsTabs();
  } catch (error) {
    console.error("❌ Error setting up Google Sheets headers:", error);
    return false;
  }
}

module.exports = {
  generateInvoiceNumber,
  extractTextFromImage,
  processWithAI,
  saveDetailedInvoiceToSheets,
  setupGoogleSheetsHeaders,
};
