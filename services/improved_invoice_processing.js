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

  // Simulated OCR result with EXACT values from real receipt
  const simulatedText = `ALBERT HEIJN
FILIAAL 1427
Parijsplein 19
070-3935033

22/08/2025 12:55

AANTAL OMSCHRIJVING PRIJS BEDRAG
BONUSKAART: xx0802
AIRMILES NR.: xx6254
1 BOODSCH TAS: 1,59
1 DZH HV MELK: 1,99
1 DZH YOGHURT: 2,29
1 HONING: 2,25
3 BAPAO: 0,99
1 DZH CREME FR: 1,09
1 ZAANSE HOEVE: 2,69 25%
1 BOTERH WORST: 1,49
1 SCHOUDERHAM: 1,79
1 AH ROOMBRIE: 2,99
1 CHERRYTOMAAT: 1,19
1 AH SALADE: 3,29 B
1 AH SALADE: 2,79 B
1 VRUCHT HAGEL: 2,59
1 ROZ KREN BOL: 2,69
2 VOLK BOLLEN: 1,59
1 DE ICE CARAM: 1,59
1 APPELFLAP: 1,78 B

21 SUBTOTAAL: 40,24

BONUS AHROOMBOTERA: -0,79
BONUS AHSALADES175: -2,33
25% K ZAANSE HOEVE: -0,67

UW VOORDEEL: 3,79
waarvan BONUS BOX PREMIUM: 0,00

SUBTOTAAL: 36,45

74 KOOPZEGELS PREMIUM: 7,40

TOTAAL: 43,85

6 eSPAARZEGELS PREMIUM
28 MIJN AH MILES PREMIUM

BETAALD MET:
PINNEN: 43,85

Totaal betaald: 43,85 EUR

POI: 50282895
Terminal: 5F2GVM
Merchant: 1315641
Periode: 5234
Transactie: 02286653
Maestro: A0000000043060
Bank: ABN AMRO BANK
Kaart: 673400xxxxxxxxx2056
Kaartserienummer: 5
Autorisatiecode: F30005
Leesmethode: CHIP

BTW OVER EUR
9%: 31,98 2,88
21%: 1,31 0,28
TOTAAL: 33,29 3,16

1427 12:54
35 41
22-8-2025

Vragen over je kassabon? Onze collega's helpen je graag`;

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
            
            Analyseer het bonnetje zeer gedetailleerd en extraheer ALLE beschikbare informatie in JSON formaat:
            {
              "invoice_number": "Factuurnummer (gebruik het meegegeven nummer)",
              "company": "ALBERT HEIJN",
              "date": "Datum in YYYY-MM-DD formaat",
              "time": "Tijd in HH:MM formaat",
              "total_amount": "Totaalbedrag (alleen het getal, geen €)",
              "subtotal": "Subtotaal na kortingen (alleen het getal)",
              "subtotal_before_discount": "Subtotaal vóór kortingen (alleen het getal)",
              "tax_9": "BTW 9% (alleen het getal)",
              "tax_21": "BTW 21% (alleen het getal)",
              "bonus_amount": "Totaal bonus/korting bedrag (alleen het getal, 0 als geen bonus)",
              "emballage_amount": "Totaal emballage/statiegeld bedrag (alleen het getal, 0 als geen emballage)",
              "voordeel_amount": "Totaal voordeel/korting bedrag (alleen het getal, 0 als geen voordeel)",
              "koopzegels_amount": "Koopzegels bedrag (alleen het getal, 0 als geen koopzegels)",
              "koopzegels_count": "Aantal koopzegels (alleen het getal)",
              "currency": "EUR",
              "document_type": "receipt",
              "payment_method": "Betaalmethode (PIN, CONTANT, etc.)",
              "payment_pin": "Bedrag betaald met PIN (alleen het getal)",
              "payment_emballage": "Bedrag betaald met emballagebonnen (alleen het getal)",
              "store_info": {
                "filiaal": "Filiaal nummer",
                "adres": "Adres van het filiaal",
                "telefoon": "Telefoonnummer filiaal",
                "kassa": "Kassa nummer",
                "transactie": "Transactie nummer",
                "terminal": "Terminal ID",
                "merchant": "Merchant ID"
              },
              "loyalty": {
                "bonuskaart": "Bonuskaart nummer (gemaskeerd)",
                "air_miles": "Air Miles nummer (gemaskeerd)"
              },
              "items": [
                {
                  "name": "Volledige productnaam",
                  "quantity": "Aantal",
                  "unit_price": "Prijs per stuk (alleen het getal)",
                  "total_price": "Totaalprijs (alleen het getal)",
                  "category": "Categorie (voeding, non-food, etc.)",
                  "bonus": "Bonus info (ja/nee/onbekend)",
                  "bonus_amount": "Bonus bedrag voor dit product (alleen het getal)"
                }
              ],
              "item_count": "Totaal aantal verschillende artikelen",
              "confidence": "Betrouwbaarheid 0-100",
              "notes": "Extra opmerkingen en details",
              "btw_breakdown": {
                "btw_9_base": "BTW 9% grondslag (alleen het getal)",
                "btw_21_base": "BTW 21% grondslag (alleen het getal)"
              }
            }
            
            Belangrijk:
            - Gebruik EXACTE bedragen uit de tekst (geen € of komma's)
            - Herken ALLE Albert Heijn specifieke elementen
            - Extraheer ALLE individuele items met exacte prijzen
            - Herken subtotaal vóór en na kortingen
            - Herken alle BTW bedragen en grondslagen
            - Herken alle betaalmethoden en bedragen
            - Herken filiaal informatie (nummer, adres, telefoon)
            - Herken loyalty informatie (bonuskaart, air miles)
            - Herken terminal/merchant IDs
            - Gebruik het meegegeven factuurnummer
            - Wees uiterst nauwkeurig - dit is voor boekhouding
            - Als een waarde niet te bepalen is, gebruik "NB" (Niet Bepaald)`,
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

// Enhanced fallback response with comprehensive data extraction for Dutch receipts
function createFallbackResponse(text, invoiceNumber) {
  console.log(`📝 Creating enhanced fallback response for invoice: ${invoiceNumber}`);

  // Enhanced extraction with ChatGPT-5 insights
  let date = "NB";
  let time = "NB";
  let altDate = "NB";
  let altTime = "NB";

  // Extract date and time with multiple patterns (ChatGPT-5 approach)
  // Primary: Look in payment block for "Datum DD/MM/YYYY HH:MM"
  const paymentDateMatch = text.match(/Datum\s+(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/i);
  if (paymentDateMatch) {
    const day = paymentDateMatch[1].padStart(2, "0");
    const month = paymentDateMatch[2].padStart(2, "0");
    const year = paymentDateMatch[3];
    const hour = paymentDateMatch[4].padStart(2, "0");
    const minute = paymentDateMatch[5];
    date = `${year}-${month}-${day}`;
    time = `${hour}:${minute}`;
  }

  // Secondary: Look for alternative timestamp at bottom "HH:MM DD-M-YYYY"
  const altDateMatch = text.match(/(\d{1,2}):(\d{2})\s+(\d{1,2})-(\d{1,2})-(\d{4})/);
  if (altDateMatch) {
    const hour = altDateMatch[1].padStart(2, "0");
    const minute = altDateMatch[2];
    const day = altDateMatch[3].padStart(2, "0");
    const month = altDateMatch[4].padStart(2, "0");
    const year = altDateMatch[5];
    altTime = `${hour}:${minute}`;
    altDate = `${year}-${month}-${day}`;
  }

  // Fallback: Try other date patterns if primary failed
  if (date === "NB") {
    const datePatterns = [
      /(\d{2})-(\d{2})-(\d{4})/, // 29-08-2025
      /(\d{2})\/(\d{2})\/(\d{4})/, // 22/08/2025
      /(\d{2})-(\d{1})-(\d{4})/, // 22-8-2025
    ];

    for (const pattern of datePatterns) {
      const dateMatch = text.match(pattern);
      if (dateMatch) {
        const day = dateMatch[1].padStart(2, "0");
        const month = dateMatch[2].padStart(2, "0");
        const year = dateMatch[3];
        date = `${year}-${month}-${day}`;
        break;
      }
    }
  }

  // Extract subtotals with ChatGPT-5 logic
  let subtotalAfterDiscount = 0;
  let subtotalBeforeDiscount = 0;

  // Find all SUBTOTAAL matches and use the correct ones
  const lines = text.split('\n');
  let subtotalCount = 0;
  let subtotals = [];

  for (const line of lines) {
    if (line.includes('SUBTOTAAL:')) {
      subtotalCount++;
      const match = line.match(/SUBTOTAAL:\s*(\d+[.,]\d{2})/i);
      if (match) {
        subtotals.push(parseFloat(match[1].replace(",", ".")));
      }
    }
  }

  // Apply ChatGPT-5 logic: first SUBTOTAAL = before discounts, second = after discounts
  if (subtotals.length >= 2) {
    subtotalBeforeDiscount = subtotals[0];
    subtotalAfterDiscount = subtotals[1];
  } else if (subtotals.length === 1) {
    subtotalBeforeDiscount = subtotals[0];
    // Look for UW VOORDEEL to calculate after discount
    const voordeelMatch = text.match(/UW VOORDEEL:\s*(\d+[.,]\d{2})/i);
    if (voordeelMatch) {
      const voordeel = parseFloat(voordeelMatch[1].replace(",", "."));
      subtotalAfterDiscount = subtotalBeforeDiscount - voordeel;
    }
  }

  // Extract BTW breakdown with enhanced patterns
  let btw9 = 0;
  let btw21 = 0;
  let btw9Base = 0;
  let btw21Base = 0;

  // Enhanced BTW extraction (ChatGPT-5 approach)
  const btw9Match = text.match(/9%:\s*(\d+[.,]\d{2})\s*(\d+[.,]\d{2})/i);
  if (btw9Match) {
    btw9Base = parseFloat(btw9Match[1].replace(",", "."));
    btw9 = parseFloat(btw9Match[2].replace(",", "."));
  }

  const btw21Match = text.match(/21%:\s*(\d+[.,]\d{2})\s*(\d+[.,]\d{2})/i);
  if (btw21Match) {
    btw21Base = parseFloat(btw21Match[1].replace(",", "."));
    btw21 = parseFloat(btw21Match[2].replace(",", "."));
  }

  // Extract bonus amounts with enhanced patterns
  let bonusTotal = 0;
  const bonusPatterns = [
    /BONUS\s+[A-Z\s]+:\s*-(\d+[.,]\d{2})/gi,
    /\d+%\s+K\s+[A-Z\s]+:\s*-(\d+[.,]\d{2})/gi,
  ];

  for (const pattern of bonusPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      bonusTotal += parseFloat(match[1].replace(",", "."));
    }
  }

  // Extract voordeel (ChatGPT-5: positive savings)
  let voordeelTotal = 0;
  const voordeelMatch = text.match(/UW VOORDEEL:\s*(\d+[.,]\d{2})/i);
  if (voordeelMatch) {
    voordeelTotal = parseFloat(voordeelMatch[1].replace(",", "."));
  }

  // Extract koopzegels with enhanced patterns
  let koopzegelsAmount = 0;
  let koopzegelsCount = 0;

  const koopzegelsMatch = text.match(/(\d+)\s*KOOPZEGELS\s+PREMIUM:\s*(\d+[.,]\d{2})/i);
  if (koopzegelsMatch) {
    koopzegelsCount = parseInt(koopzegelsMatch[1]);
    koopzegelsAmount = parseFloat(koopzegelsMatch[2].replace(",", "."));
  }

  // Extract total amount with ChatGPT-5 logic
  let totalAmount = 0;
  
  // Find the last TOTAAL match (the final total, not BTW total)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('TOTAAL:') && !line.includes('BTW OVER EUR')) {
      const match = line.match(/TOTAAL:\s*(\d+[.,]\d{2})/i);
      if (match && !line.match(/TOTAAL:\s*(\d+[.,]\d{2})\s+(\d+[.,]\d{2})/)) {
        totalAmount = parseFloat(match[1].replace(",", "."));
        break;
      }
    }
  }

  // Extract PIN payment with enhanced patterns
  let pinAmount = 0;
  const pinMatch = text.match(/PINNEN:\s*(\d+[.,]\d{2})/i);
  if (pinMatch) {
    pinAmount = parseFloat(pinMatch[1].replace(",", "."));
  }

  // Extract store information with enhanced patterns
  let filiaal = "NB";
  let adres = "NB";
  let telefoon = "NB";
  let kassa = "NB";
  let transactie = "NB";
  let terminal = "NB";
  let merchant = "NB";
  let poi = "NB";
  let autorisatiecode = "NB";

  // Enhanced store info extraction (ChatGPT-5 approach)
  const filiaalMatch = text.match(/FILIAAL\s*(\d+)/i);
  if (filiaalMatch) filiaal = filiaalMatch[1];

  // Extract address from line after FILIAAL
  const lines2 = text.split('\n');
  for (let i = 0; i < lines2.length; i++) {
    if (lines2[i].includes('FILIAAL')) {
      if (i + 1 < lines2.length) {
        const addressLine = lines2[i + 1].trim();
        if (addressLine && !addressLine.includes('FILIAAL') && !addressLine.match(/^\d{3}-\d{7}$/)) {
          adres = addressLine;
        }
      }
      break;
    }
  }

  const telefoonMatch = text.match(/(\d{3}-\d{7})/);
  if (telefoonMatch) telefoon = telefoonMatch[1];

  // Enhanced transaction info extraction
  const transactieMatch = text.match(/Transactie:\s*(\d+)/i);
  if (transactieMatch) transactie = transactieMatch[1];

  const terminalMatch = text.match(/Terminal:\s*(\w+)/i);
  if (terminalMatch) terminal = terminalMatch[1];

  const merchantMatch = text.match(/Merchant:\s*(\d+)/i);
  if (merchantMatch) merchant = merchantMatch[1];

  const poiMatch = text.match(/POI:\s*(\d+)/i);
  if (poiMatch) poi = poiMatch[1];

  const authMatch = text.match(/Autorisatiecode:\s*(\w+)/i);
  if (authMatch) autorisatiecode = authMatch[1];

  // Extract loyalty information with enhanced patterns
  let bonuskaart = "NB";
  let airMiles = "NB";

  const bonuskaartMatch = text.match(/BONUSKAART:\s*(\w+)/i);
  if (bonuskaartMatch) bonuskaart = bonuskaartMatch[1];

  const airMilesMatch = text.match(/AIRMILES\s+NR\.?:\s*(\w+)/i);
  if (airMilesMatch) airMiles = airMilesMatch[1];

  // Enhanced item extraction with ChatGPT-5 logic
  const items = [];
  const itemPatterns = [
    /^(\d+)\s+([A-Z\s]+):\s*(\d+[.,]\d{2})\s*(\d+[.,]\d{2})(?:\s*B)?$/gi, // Format: "3 BAPAO: 0,99 2,97"
    /^(\d+)\s+([A-Z\s]+):\s*(\d+[.,]\d{2})(?:\s*B)?$/gi, // Format: "1 DZH HV MELK: 1,99"
    /^([A-Z\s]+):\s*(\d+[.,]\d{2})(?:\s*B)?$/gi, // Format: "AH SALADE: 3,29 B"
  ];

  let itemCount = 0;
  let itemMatch;

  for (const pattern of itemPatterns) {
    while ((itemMatch = pattern.exec(text)) !== null && itemCount < 50) {
      let itemName, itemPrice, quantity, hasBonus;

      if (itemMatch[1] && itemMatch[2] && itemMatch[3] && itemMatch[4]) {
        // Format: "3 BAPAO: 0,99 2,97"
        quantity = itemMatch[1];
        itemName = itemMatch[2].trim();
        itemPrice = parseFloat(itemMatch[3].replace(",", "."));
        const totalPrice = parseFloat(itemMatch[4].replace(",", "."));
        hasBonus = itemMatch[0].includes(" B");
      } else if (itemMatch[1] && itemMatch[2] && itemMatch[3]) {
        // Format: "1 DZH HV MELK: 1,99" or "AH SALADE: 3,29 B"
        if (isNaN(parseInt(itemMatch[1]))) {
          // Format: "AH SALADE: 3,29 B"
          quantity = "1";
          itemName = itemMatch[1].trim();
          itemPrice = parseFloat(itemMatch[2].replace(",", "."));
          hasBonus = itemMatch[0].includes(" B");
        } else {
          // Format: "1 DZH HV MELK: 1,99"
          quantity = itemMatch[1];
          itemName = itemMatch[2].trim();
          itemPrice = parseFloat(itemMatch[3].replace(",", "."));
          hasBonus = itemMatch[0].includes(" B");
        }
      }

      if (
        itemName &&
        itemName.length > 2 &&
        itemPrice > 0 &&
        itemPrice < 1000 &&
        !itemName.includes("BONUSKAART") &&
        !itemName.includes("AIRMILES") &&
        !itemName.includes("SUBTOTAAL") &&
        !itemName.includes("TOTAAL") &&
        !itemName.includes("BONUS") &&
        !itemName.includes("UW VOORDEEL") &&
        !itemName.includes("KOOPZEGELS")
      ) {
        items.push({
          name: itemName,
          quantity: quantity,
          unit_price: itemPrice,
          total_price: itemPrice * parseInt(quantity),
          category: "voeding",
          bonus: hasBonus ? "ja" : "nee",
          bonus_amount: 0,
        });
        itemCount++;
      }
    }
  }

  // Extract item count from the first SUBTOTAAL line (ChatGPT-5 approach)
  const itemCountMatch = text.match(/(\d+)\s*SUBTOTAAL:/i);
  if (itemCountMatch) {
    itemCount = parseInt(itemCountMatch[1]);
  } else if (items.length > 0) {
    itemCount = items.length;
  }

  // Calculate confidence score with enhanced logic
  let confidence = 70; // Base confidence for fallback response
  if (date !== "NB") confidence += 5;
  if (time !== "NB") confidence += 5;
  if (subtotalAfterDiscount > 0) confidence += 5;
  if (subtotalBeforeDiscount > 0) confidence += 5;
  if (btw9 > 0) confidence += 5;
  if (btw21 > 0) confidence += 5;
  if (bonusTotal > 0) confidence += 5;
  if (voordeelTotal > 0) confidence += 5;
  if (koopzegelsAmount > 0) confidence += 5;
  if (totalAmount > 0) confidence += 5;
  if (pinAmount > 0) confidence += 5;
  if (itemCount > 0) confidence += 5;
  if (filiaal !== "NB") confidence += 5;
  if (transactie !== "NB") confidence += 5;
  if (terminal !== "NB") confidence += 5;
  if (merchant !== "NB") confidence += 5;
  if (bonuskaart !== "NB") confidence += 5;
  if (airMiles !== "NB") confidence += 5;

  return {
    invoice_number: invoiceNumber,
    company: "ALBERT HEIJN",
    date: date,
    time: time,
    alt_date: altDate,
    alt_time: altTime,
    total_amount: totalAmount,
    subtotal: subtotalAfterDiscount,
    subtotal_before_discount: subtotalBeforeDiscount,
    tax_9: btw9,
    tax_21: btw21,
    bonus_amount: Math.abs(bonusTotal),
    emballage_amount: 0,
    voordeel_amount: voordeelTotal,
    koopzegels_amount: koopzegelsAmount,
    koopzegels_count: koopzegelsCount,
    currency: "EUR",
    document_type: "receipt",
    payment_method: "PIN",
    payment_pin: pinAmount,
    payment_emballage: 0,
    store_info: {
      filiaal: filiaal,
      adres: adres,
      telefoon: telefoon,
      kassa: kassa,
      transactie: transactie,
      terminal: terminal,
      merchant: merchant,
      poi: poi,
      autorisatiecode: autorisatiecode,
    },
    loyalty: {
      bonuskaart: bonuskaart,
      air_miles: airMiles,
    },
    items: items,
    item_count: itemCount,
    confidence: Math.min(confidence, 100),
    notes: "Enhanced fallback response with ChatGPT-5 analysis - AI niet beschikbaar",
    btw_breakdown: {
      btw_9_base: btw9Base,
      btw_21_base: btw21Base,
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
      invoiceData.subtotal || "NB", // Subtotaal na korting
      invoiceData.subtotal_before_discount || "NB", // Subtotaal vóór korting
      invoiceData.tax_9 || "NB",
      invoiceData.tax_21 || "NB",
      invoiceData.btw_breakdown?.btw_9_base || "NB", // BTW 9% grondslag
      invoiceData.btw_breakdown?.btw_21_base || "NB", // BTW 21% grondslag
      invoiceData.bonus_amount || "NB", // Bonus totaal
      invoiceData.emballage_amount || "NB", // Emballage totaal
      invoiceData.voordeel_amount || "NB", // Voordeel totaal
      invoiceData.koopzegels_amount || "NB", // Koopzegels bedrag
      invoiceData.koopzegels_count || "NB", // Koopzegels aantal
      invoiceData.total_amount || "NB",
      invoiceData.payment_pin || "NB", // Betaald PIN
      invoiceData.payment_emballage || "NB", // Betaald Emballage
      invoiceData.currency || "EUR",
      invoiceData.document_type || "receipt",
      invoiceData.item_count || "NB",
      invoiceData.payment_method || "NB",
      invoiceData.store_info?.filiaal || "NB", // Filiaal
      invoiceData.store_info?.adres || "NB", // Adres
      invoiceData.store_info?.telefoon || "NB", // Telefoon
      invoiceData.store_info?.kassa || "NB", // Kassa
      invoiceData.store_info?.transactie || "NB", // Transactie
      invoiceData.store_info?.terminal || "NB", // Terminal ID
      invoiceData.store_info?.merchant || "NB", // Merchant ID
      invoiceData.loyalty?.bonuskaart || "NB", // Bonuskaart
      invoiceData.loyalty?.air_miles || "NB", // Air Miles
      invoiceData.confidence || "NB",
      invoiceData.notes || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
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
        invoiceData.company || "NB",
        invoiceData.date || new Date().toISOString().split("T")[0],
        item.name || "NB",
        item.category || "voeding",
        item.quantity || "1",
        item.unit_price || "0",
        item.total_price || "0",
        item.bonus || "nee", // Bonus info
        item.bonus_amount || "0", // Bonus bedrag
        invoiceData.currency || "EUR",
        invoiceData.payment_method || "NB",
        invoiceData.store_info?.kassa || "NB",
        invoiceData.store_info?.transactie || "NB",
        invoiceData.store_info?.terminal || "NB",
        invoiceData.store_info?.merchant || "NB",
        invoiceData.store_info?.poi || "NB",
        invoiceData.store_info?.filiaal || "NB",
        invoiceData.store_info?.adres || "NB",
        invoiceData.store_info?.telefoon || "NB",
        invoiceData.loyalty?.bonuskaart || "NB",
        invoiceData.loyalty?.air_miles || "NB",
        invoiceData.notes || "",
      ]);

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        range: "Detail Invoices!A:W", // Updated range to include all new columns
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: detailRows,
        },
      });

      console.log(`✅ Successfully saved ${detailRows.length} detail rows`);
    } else {
      console.log("⚠️  No items found to save to Detail Invoices tab");
    }

    // Save koopzegels tracking data if koopzegels are present
    if (invoiceData.koopzegels_amount > 0 && invoiceData.koopzegels_count > 0) {
      console.log("📊 Saving koopzegels tracking data...");

      // Calculate koopzegels per euro
      const koopzegelsPerEuro = (
        invoiceData.koopzegels_count / invoiceData.total_amount
      ).toFixed(4);

      // Get existing koopzegels data to calculate cumulative totals
      try {
        const existingData = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: "Koopzegels Tracking!A:L",
        });

        let cumulativeKoopzegelsCount = invoiceData.koopzegels_count;
        let cumulativeKoopzegelsAmount = invoiceData.koopzegels_amount;
        let totalSpent = invoiceData.total_amount;

        // Calculate cumulative totals from existing data
        if (existingData.data.values && existingData.data.values.length > 1) {
          const lastRow =
            existingData.data.values[existingData.data.values.length - 1];
          if (lastRow && lastRow.length >= 9) {
            cumulativeKoopzegelsCount =
              parseFloat(lastRow[8]) + invoiceData.koopzegels_count;
            cumulativeKoopzegelsAmount =
              parseFloat(lastRow[9]) + invoiceData.koopzegels_amount;
            totalSpent = parseFloat(lastRow[10]) + invoiceData.total_amount;
          }
        }

        // Calculate average koopzegels per euro over ALL existing rows
        let totalKoopzegelsFromAllRows = invoiceData.koopzegels_count;
        let totalSpentFromAllRows = invoiceData.total_amount;

        // Sum up all koopzegels and amounts from existing data (skip header row)
        if (existingData.data.values && existingData.data.values.length > 1) {
          for (let i = 1; i < existingData.data.values.length; i++) {
            const row = existingData.data.values[i];
            if (row && row.length >= 6) {
              totalKoopzegelsFromAllRows += parseFloat(row[5]) || 0; // Koopzegels Aantal
              totalSpentFromAllRows += parseFloat(row[4]) || 0; // Totaalbedrag Factuur
            }
          }
        }

        // Calculate true average over all transactions
        const averageKoopzegelsPerEuro = (
          totalKoopzegelsFromAllRows / totalSpentFromAllRows
        ).toFixed(4);

        const koopzegelsRow = [
          new Date().toISOString(), // Timestamp
          invoiceData.invoice_number || "INV-UNKNOWN",
          invoiceData.date || new Date().toISOString().split("T")[0],
          invoiceData.company || "NB",
          invoiceData.total_amount || "0", // Totaalbedrag Factuur
          invoiceData.koopzegels_count || "0", // Koopzegels Aantal
          invoiceData.koopzegels_amount || "0", // Koopzegels Bedrag
          koopzegelsPerEuro, // Koopzegels per Euro
          cumulativeKoopzegelsCount, // Cumulatief Koopzegels Aantal
          cumulativeKoopzegelsAmount, // Cumulatief Koopzegels Bedrag
          averageKoopzegelsPerEuro, // Gemiddelde Koopzegels per Euro
          `Factuur: ${invoiceData.invoice_number}`, // Opmerkingen
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
          range: "Koopzegels Tracking!A:L",
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          resource: {
            values: [koopzegelsRow],
          },
        });

        console.log(`✅ Successfully saved koopzegels tracking data`);
        console.log(
          `📊 Cumulative koopzegels: ${cumulativeKoopzegelsCount} (€${cumulativeKoopzegelsAmount})`
        );
        console.log(
          `📊 Total koopzegels from all rows: ${totalKoopzegelsFromAllRows}`
        );
        console.log(`📊 Total spent from all rows: €${totalSpentFromAllRows}`);
        console.log(
          `📊 Average koopzegels per euro (over all transactions): ${averageKoopzegelsPerEuro}`
        );
      } catch (error) {
        console.error("❌ Error saving koopzegels tracking data:", error);
      }
    } else {
      console.log("ℹ️  No koopzegels found, skipping koopzegels tracking");
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
    const {
      setupGoogleSheetsTabs,
    } = require("../setup/setup_google_sheets_tabs");
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
  createFallbackResponse,
};
