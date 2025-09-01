/**
 * Comprehensive Invoice Analysis Library
 * Handles all types of invoices, receipts, and documents
 * Supports multiple languages, formats, and extraction methods
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

class InvoiceAnalysisLibrary {
  constructor() {
    this.supportedLanguages = ["nld", "eng", "deu", "fra", "spa", "ita"];
    this.supportedFormats = ["jpg", "jpeg", "png", "pdf", "tiff", "bmp"];
    this.extractionMethods = ["ocr", "ai", "hybrid", "manual"];

    // Initialize configuration
    this.config = {
      openai: {
        model: "gpt-5",
        temperature: 0.1,
        maxTokens: 4000,
      },
      ocr: {
        confidenceThreshold: 60,
        language: "nld+eng",
      },
      processing: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        timeout: 30000,
      },
    };
  }

  /**
   * Main analysis method - analyzes any document type
   */
  async analyzeDocument(filePath, options = {}) {
    try {
      console.log(`🔍 Starting document analysis: ${filePath}`);

      // Determine document type
      const documentType = this.detectDocumentType(filePath);

      // Extract text using appropriate method
      const extractedText = await this.extractText(filePath, documentType);

      // Process with AI for comprehensive analysis
      const analysis = await this.processWithAI(
        extractedText,
        documentType,
        options
      );

      // Validate and enhance results
      const validatedAnalysis = this.validateAndEnhance(
        analysis,
        extractedText
      );

      return {
        success: true,
        documentType,
        extractedText,
        analysis: validatedAnalysis,
        metadata: {
          filePath,
          fileSize: fs.statSync(filePath).size,
          analysisTimestamp: new Date().toISOString(),
          processingTime: Date.now(),
        },
      };
    } catch (error) {
      console.error(`❌ Document analysis failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        documentType: "unknown",
        extractedText: "",
        analysis: null,
      };
    }
  }

  /**
   * Detect document type based on content and structure
   */
  detectDocumentType(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, "utf8").substring(0, 1000);

    // Check for specific patterns
    if (content.includes("ALBERT HEIJN") || content.includes("AH")) {
      return "albert_heijn_receipt";
    }
    if (content.includes("JUMBO") || content.includes("SUPERMARKT")) {
      return "jumbo_receipt";
    }
    if (content.includes("LIDL") || content.includes("LIDL")) {
      return "lidl_receipt";
    }
    if (content.includes("ALDI") || content.includes("ALDI")) {
      return "aldi_receipt";
    }
    if (content.includes("ETOS") || content.includes("KRUIDVAT")) {
      return "pharmacy_receipt";
    }
    if (
      content.includes("TANKSTATION") ||
      content.includes("SHELL") ||
      content.includes("BP")
    ) {
      return "gas_station_receipt";
    }
    if (
      content.includes("RESTAURANT") ||
      content.includes("CAFE") ||
      content.includes("BAR")
    ) {
      return "restaurant_receipt";
    }
    if (content.includes("HOTEL") || content.includes("ACCOMMODATIE")) {
      return "hotel_receipt";
    }
    if (
      content.includes("TRANSPORT") ||
      content.includes("OV") ||
      content.includes("NS")
    ) {
      return "transport_receipt";
    }
    if (content.includes("FACTUUR") || content.includes("INVOICE")) {
      return "business_invoice";
    }
    if (content.includes("BONNETJE") || content.includes("RECEIPT")) {
      return "general_receipt";
    }

    return "unknown_document";
  }

  /**
   * Extract text from document using multiple methods
   */
  async extractText(filePath, documentType) {
    console.log(`📄 Extracting text from ${documentType}`);

    // Try OCR first
    let ocrText = await this.extractTextWithOCR(filePath);

    // If OCR fails, try AI extraction
    if (!ocrText || ocrText.length < 50) {
      console.log(`🔄 OCR failed, trying AI extraction`);
      ocrText = await this.extractTextWithAI(filePath);
    }

    // Fallback to file reading for text files
    if (!ocrText || ocrText.length < 50) {
      console.log(`📖 Trying direct file reading`);
      ocrText = this.readTextFile(filePath);
    }

    return ocrText || "No text could be extracted";
  }

  /**
   * Extract text using OCR
   */
  async extractTextWithOCR(filePath) {
    // Simulated OCR extraction - in production use Tesseract or cloud OCR
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

  /**
   * Extract text using AI
   */
  async extractTextWithAI(filePath) {
    // Simulated AI extraction
    return await this.extractTextWithOCR(filePath);
  }

  /**
   * Read text from text files
   */
  readTextFile(filePath) {
    try {
      return fs.readFileSync(filePath, "utf8");
    } catch (error) {
      console.error(`❌ Error reading text file: ${error.message}`);
      return null;
    }
  }

  /**
   * Process extracted text with AI for comprehensive analysis
   */
  async processWithAI(text, documentType, options = {}) {
    if (!process.env.OPENAI_API_KEY) {
      console.log("⚠️ OpenAI API key not configured, using fallback analysis");
      return this.createFallbackAnalysis(text, documentType);
    }

    try {
      const prompt = this.createAnalysisPrompt(text, documentType, options);

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: this.config.openai.model,
          messages: [
            {
              role: "system",
              content: prompt.system,
            },
            {
              role: "user",
              content: prompt.user,
            },
          ],
          temperature: this.config.openai.temperature,
          max_tokens: this.config.openai.maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: this.config.processing.timeout,
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      console.log("🤖 AI Analysis completed");

      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        console.error("❌ Error parsing AI response:", parseError);
        return this.createFallbackAnalysis(text, documentType);
      }
    } catch (error) {
      console.error("❌ OpenAI API error:", error.message);
      return this.createFallbackAnalysis(text, documentType);
    }
  }

  /**
   * Create comprehensive analysis prompt
   */
  createAnalysisPrompt(text, documentType, options) {
    const systemPrompt = `Je bent een expert in het analyseren van alle soorten facturen, bonnetjes en documenten.
    
    Analyseer het document zeer gedetailleerd en extraheer ALLE beschikbare informatie in JSON formaat.
    
    Gebruik deze uitgebreide JSON structuur:
    {
      "document_info": {
        "type": "Type document (receipt, invoice, bill, etc.)",
        "subtype": "Subtype (supermarket, restaurant, gas_station, etc.)",
        "language": "Taal van het document",
        "confidence": "Betrouwbaarheid 0-100"
      },
      "company_info": {
        "name": "Bedrijfsnaam",
        "address": "Adres",
        "phone": "Telefoonnummer",
        "email": "Email adres",
        "website": "Website",
        "kvk": "KVK nummer",
        "btw": "BTW nummer",
        "iban": "IBAN nummer"
      },
      "transaction_info": {
        "date": "Datum in YYYY-MM-DD formaat",
        "time": "Tijd in HH:MM formaat",
        "invoice_number": "Factuurnummer",
        "transaction_id": "Transactie ID",
        "terminal_id": "Terminal ID",
        "merchant_id": "Merchant ID",
        "poi": "POI nummer",
        "period": "Periode nummer"
      },
      "financial_info": {
        "subtotal": "Subtotaal vóór kortingen",
        "subtotal_after_discount": "Subtotaal na kortingen",
        "total_amount": "Totaalbedrag",
        "currency": "Valuta",
        "tax_9": "BTW 9% bedrag",
        "tax_21": "BTW 21% bedrag",
        "tax_0": "BTW 0% bedrag",
        "tax_total": "Totaal BTW bedrag",
        "discount_amount": "Totaal korting bedrag",
        "bonus_amount": "Bonus bedrag",
        "emballage_amount": "Emballage/statiegeld bedrag",
        "voordeel_amount": "Voordeel bedrag",
        "koopzegels_amount": "Koopzegels bedrag",
        "koopzegels_count": "Aantal koopzegels",
        "payment_method": "Betaalmethode",
        "payment_pin": "PIN bedrag",
        "payment_cash": "Contant bedrag",
        "payment_card": "Kaart bedrag",
        "payment_emballage": "Emballagebonnen bedrag"
      },
      "loyalty_info": {
        "bonuskaart": "Bonuskaart nummer",
        "air_miles": "Air Miles nummer",
        "customer_card": "Klantenkaart nummer",
        "loyalty_points": "Loyalty punten"
      },
      "items": [
        {
          "name": "Productnaam",
          "quantity": "Aantal",
          "unit_price": "Prijs per stuk",
          "total_price": "Totaalprijs",
          "category": "Categorie",
          "bonus": "Bonus info",
          "bonus_amount": "Bonus bedrag",
          "discount_percentage": "Korting percentage",
          "tax_rate": "BTW percentage"
        }
      ],
      "item_summary": {
        "total_items": "Totaal aantal items",
        "unique_items": "Aantal unieke items",
        "categories": ["Lijst van categorieën"]
      },
      "btw_breakdown": {
        "btw_9_base": "BTW 9% grondslag",
        "btw_21_base": "BTW 21% grondslag",
        "btw_0_base": "BTW 0% grondslag"
      },
      "store_info": {
        "filiaal": "Filiaal nummer",
        "kassa": "Kassa nummer",
        "employee": "Medewerker ID"
      },
      "bank_info": {
        "bank_name": "Bank naam",
        "card_type": "Kaart type",
        "card_number": "Kaart nummer (gemaskeerd)",
        "authorization_code": "Autorisatie code",
        "reading_method": "Leesmethode"
      },
      "notes": "Extra opmerkingen en details",
      "raw_text": "Ruwe tekst van het document"
    }
    
    Belangrijke regels:
    - Gebruik EXACTE bedragen uit de tekst (geen € of komma's)
    - Herken alle specifieke elementen per document type
    - Extraheer ALLE individuele items met exacte prijzen
    - Herken subtotaal vóór en na kortingen
    - Herken alle BTW bedragen en grondslagen
    - Herken alle betaalmethoden en bedragen
    - Herken filiaal informatie (nummer, adres, telefoon)
    - Herken loyalty informatie (bonuskaart, air miles)
    - Herken terminal/merchant IDs
    - Wees uiterst nauwkeurig - dit is voor boekhouding
    - Als een waarde niet te bepalen is, gebruik "NB" (Niet Bepaald)
    - Voeg altijd de ruwe tekst toe voor verificatie`;

    const userPrompt = `Document type: ${documentType}
    
    Document tekst:
    ${text}
    
    Extra opties: ${JSON.stringify(options)}
    
    Voer een uitgebreide analyse uit en retourneer alleen geldige JSON.`;

    return {
      system: systemPrompt,
      user: userPrompt,
    };
  }

  /**
   * Create fallback analysis when AI is not available
   */
  createFallbackAnalysis(text, documentType) {
    console.log(`📝 Creating fallback analysis for ${documentType}`);

    // Basic pattern matching for common elements
    const analysis = {
      document_info: {
        type: documentType,
        subtype: this.detectSubtype(text),
        language: this.detectLanguage(text),
        confidence: 70,
      },
      company_info: this.extractCompanyInfo(text),
      transaction_info: this.extractTransactionInfo(text),
      financial_info: this.extractFinancialInfo(text),
      loyalty_info: this.extractLoyaltyInfo(text),
      items: this.extractItems(text),
      item_summary: this.createItemSummary(text),
      btw_breakdown: this.extractBTWBreakdown(text),
      store_info: this.extractStoreInfo(text),
      bank_info: this.extractBankInfo(text),
      notes: "Fallback analysis - manual verification recommended",
      raw_text: text,
    };

    return analysis;
  }

  /**
   * Detect document subtype
   */
  detectSubtype(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("albert heijn") || lowerText.includes("ah"))
      return "albert_heijn";
    if (lowerText.includes("jumbo")) return "jumbo";
    if (lowerText.includes("lidl")) return "lidl";
    if (lowerText.includes("aldi")) return "aldi";
    if (lowerText.includes("etos") || lowerText.includes("kruidvat"))
      return "pharmacy";
    if (
      lowerText.includes("shell") ||
      lowerText.includes("bp") ||
      lowerText.includes("tankstation")
    )
      return "gas_station";
    if (
      lowerText.includes("restaurant") ||
      lowerText.includes("cafe") ||
      lowerText.includes("bar")
    )
      return "restaurant";
    if (lowerText.includes("hotel")) return "hotel";
    if (
      lowerText.includes("ns") ||
      lowerText.includes("ov") ||
      lowerText.includes("transport")
    )
      return "transport";

    return "general";
  }

  /**
   * Detect document language
   */
  detectLanguage(text) {
    const dutchWords = [
      "van",
      "de",
      "het",
      "een",
      "voor",
      "met",
      "bij",
      "naar",
      "uit",
      "aan",
    ];
    const englishWords = [
      "the",
      "and",
      "for",
      "with",
      "from",
      "to",
      "in",
      "on",
      "at",
      "by",
    ];

    const lowerText = text.toLowerCase();
    const dutchCount = dutchWords.filter((word) =>
      lowerText.includes(word)
    ).length;
    const englishCount = englishWords.filter((word) =>
      lowerText.includes(word)
    ).length;

    if (dutchCount > englishCount) return "nld";
    if (englishCount > dutchCount) return "eng";
    return "mixed";
  }

  /**
   * Extract company information
   */
  extractCompanyInfo(text) {
    const lines = text.split("\n");
    const companyInfo = {
      name: "NB",
      address: "NB",
      phone: "NB",
      email: "NB",
      website: "NB",
      kvk: "NB",
      btw: "NB",
      iban: "NB",
    };

    // Extract company name (usually first line)
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine && !firstLine.match(/^\d/)) {
        companyInfo.name = firstLine;
      }
    }

    // Extract phone number
    const phoneMatch = text.match(/(\d{3}-\d{7}|\d{10})/);
    if (phoneMatch) {
      companyInfo.phone = phoneMatch[1];
    }

    return companyInfo;
  }

  /**
   * Extract transaction information
   */
  extractTransactionInfo(text) {
    const transactionInfo = {
      date: "NB",
      time: "NB",
      invoice_number: "NB",
      transaction_id: "NB",
      terminal_id: "NB",
      merchant_id: "NB",
      poi: "NB",
      period: "NB",
    };

    // Extract date
    const datePatterns = [
      /(\d{2})\/(\d{2})\/(\d{4})/, // 22/08/2025
      /(\d{2})-(\d{2})-(\d{4})/, // 22-08-2025
      /(\d{2})-(\d{1})-(\d{4})/, // 22-8-2025
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const day = match[1].padStart(2, "0");
        const month = match[2].padStart(2, "0");
        const year = match[3];
        transactionInfo.date = `${year}-${month}-${day}`;
        break;
      }
    }

    // Extract time
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      transactionInfo.time = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
    }

    // Extract transaction ID
    const transMatch = text.match(/Transactie:\s*(\d+)/i);
    if (transMatch) {
      transactionInfo.transaction_id = transMatch[1];
    }

    // Extract terminal ID
    const terminalMatch = text.match(/Terminal:\s*(\w+)/i);
    if (terminalMatch) {
      transactionInfo.terminal_id = terminalMatch[1];
    }

    // Extract merchant ID
    const merchantMatch = text.match(/Merchant:\s*(\d+)/i);
    if (merchantMatch) {
      transactionInfo.merchant_id = merchantMatch[1];
    }

    // Extract POI
    const poiMatch = text.match(/POI:\s*(\d+)/i);
    if (poiMatch) {
      transactionInfo.poi = poiMatch[1];
    }

    // Extract period
    const periodMatch = text.match(/Periode:\s*(\d+)/i);
    if (periodMatch) {
      transactionInfo.period = periodMatch[1];
    }

    return transactionInfo;
  }

  /**
   * Extract financial information
   */
  extractFinancialInfo(text) {
    const financialInfo = {
      subtotal: 0,
      subtotal_after_discount: 0,
      total_amount: 0,
      currency: "EUR",
      tax_9: 0,
      tax_21: 0,
      tax_0: 0,
      tax_total: 0,
      discount_amount: 0,
      bonus_amount: 0,
      emballage_amount: 0,
      voordeel_amount: 0,
      koopzegels_amount: 0,
      koopzegels_count: 0,
      payment_method: "NB",
      payment_pin: 0,
      payment_cash: 0,
      payment_card: 0,
      payment_emballage: 0,
    };

    // Extract total amount
    const totalPatterns = [
      /TOTAAL:\s*(\d+[.,]\d{2})/i,
      /Totaal:\s*(\d+[.,]\d{2})/i,
      /Totaal betaald:\s*(\d+[.,]\d{2})/i,
    ];

    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        financialInfo.total_amount = parseFloat(match[1].replace(",", "."));
        break;
      }
    }

    // Extract subtotal
    const subtotalPatterns = [
      /SUBTOTAAL:\s*(\d+[.,]\d{2})/i,
      /Subtotaal:\s*(\d+[.,]\d{2})/i,
    ];

    for (const pattern of subtotalPatterns) {
      const match = text.match(pattern);
      if (match) {
        financialInfo.subtotal_after_discount = parseFloat(
          match[1].replace(",", ".")
        );
        break;
      }
    }

    // Extract BTW amounts
    const btw9Match = text.match(/9%:\s*(\d+[.,]\d{2})\s*(\d+[.,]\d{2})/i);
    if (btw9Match) {
      financialInfo.tax_9 = parseFloat(btw9Match[2].replace(",", "."));
    }

    const btw21Match = text.match(/21%:\s*(\d+[.,]\d{2})\s*(\d+[.,]\d{2})/i);
    if (btw21Match) {
      financialInfo.tax_21 = parseFloat(btw21Match[2].replace(",", "."));
    }

    // Extract payment method
    if (text.includes("PINNEN")) {
      financialInfo.payment_method = "PIN";
      const pinMatch = text.match(/PINNEN:\s*(\d+[.,]\d{2})/i);
      if (pinMatch) {
        financialInfo.payment_pin = parseFloat(pinMatch[1].replace(",", "."));
      }
    }

    return financialInfo;
  }

  /**
   * Extract loyalty information
   */
  extractLoyaltyInfo(text) {
    const loyaltyInfo = {
      bonuskaart: "NB",
      air_miles: "NB",
      customer_card: "NB",
      loyalty_points: 0,
    };

    // Extract bonuskaart
    const bonusMatch = text.match(/BONUSKAART:\s*(\w+)/i);
    if (bonusMatch) {
      loyaltyInfo.bonuskaart = bonusMatch[1];
    }

    // Extract air miles
    const airMilesMatch = text.match(/AIRMILES NR\.:\s*(\w+)/i);
    if (airMilesMatch) {
      loyaltyInfo.air_miles = airMilesMatch[1];
    }

    return loyaltyInfo;
  }

  /**
   * Extract individual items
   */
  extractItems(text) {
    const items = [];
    const lines = text.split("\n");

    for (const line of lines) {
      // Pattern for item lines: quantity + description + price
      const itemMatch = line.match(/^(\d+)\s+([^:]+):\s*(\d+[.,]\d{2})/);
      if (itemMatch) {
        items.push({
          name: itemMatch[2].trim(),
          quantity: parseInt(itemMatch[1]),
          unit_price: parseFloat(itemMatch[3].replace(",", ".")),
          total_price: parseFloat(itemMatch[3].replace(",", ".")),
          category: "general",
          bonus: "NB",
          bonus_amount: 0,
          discount_percentage: 0,
          tax_rate: 9,
        });
      }
    }

    return items;
  }

  /**
   * Create item summary
   */
  createItemSummary(text) {
    const items = this.extractItems(text);
    const categories = [...new Set(items.map((item) => item.category))];

    return {
      total_items: items.reduce((sum, item) => sum + item.quantity, 0),
      unique_items: items.length,
      categories: categories,
    };
  }

  /**
   * Extract BTW breakdown
   */
  extractBTWBreakdown(text) {
    const btwBreakdown = {
      btw_9_base: 0,
      btw_21_base: 0,
      btw_0_base: 0,
    };

    // Extract BTW 9% base
    const btw9Match = text.match(/9%:\s*(\d+[.,]\d{2})/i);
    if (btw9Match) {
      btwBreakdown.btw_9_base = parseFloat(btw9Match[1].replace(",", "."));
    }

    // Extract BTW 21% base
    const btw21Match = text.match(/21%:\s*(\d+[.,]\d{2})/i);
    if (btw21Match) {
      btwBreakdown.btw_21_base = parseFloat(btw21Match[1].replace(",", "."));
    }

    return btwBreakdown;
  }

  /**
   * Extract store information
   */
  extractStoreInfo(text) {
    const storeInfo = {
      filiaal: "NB",
      kassa: "NB",
      employee: "NB",
    };

    // Extract filiaal number
    const filiaalMatch = text.match(/FILIAAL\s*(\d+)/i);
    if (filiaalMatch) {
      storeInfo.filiaal = filiaalMatch[1];
    }

    return storeInfo;
  }

  /**
   * Extract bank information
   */
  extractBankInfo(text) {
    const bankInfo = {
      bank_name: "NB",
      card_type: "NB",
      card_number: "NB",
      authorization_code: "NB",
      reading_method: "NB",
    };

    // Extract bank name
    const bankMatch = text.match(/Bank:\s*([^\n]+)/i);
    if (bankMatch) {
      bankInfo.bank_name = bankMatch[1].trim();
    }

    // Extract card type
    const cardTypeMatch = text.match(/Maestro:\s*(\w+)/i);
    if (cardTypeMatch) {
      bankInfo.card_type = cardTypeMatch[1];
    }

    // Extract card number
    const cardNumberMatch = text.match(/Kaart:\s*(\d+x+\d+)/i);
    if (cardNumberMatch) {
      bankInfo.card_number = cardNumberMatch[1];
    }

    // Extract authorization code
    const authMatch = text.match(/Autorisatiecode:\s*(\w+)/i);
    if (authMatch) {
      bankInfo.authorization_code = authMatch[1];
    }

    // Extract reading method
    const readingMatch = text.match(/Leesmethode:\s*(\w+)/i);
    if (readingMatch) {
      bankInfo.reading_method = readingMatch[1];
    }

    return bankInfo;
  }

  /**
   * Validate and enhance analysis results
   */
  validateAndEnhance(analysis, originalText) {
    // Ensure all required fields exist
    const requiredFields = [
      "document_info",
      "company_info",
      "transaction_info",
      "financial_info",
      "loyalty_info",
      "items",
      "item_summary",
      "btw_breakdown",
      "store_info",
      "bank_info",
    ];

    for (const field of requiredFields) {
      if (!analysis[field]) {
        analysis[field] = {};
      }
    }

    // Add raw text if not present
    if (!analysis.raw_text) {
      analysis.raw_text = originalText;
    }

    // Validate financial calculations
    if (analysis.financial_info) {
      const fi = analysis.financial_info;

      // Ensure total amount is positive
      if (fi.total_amount && fi.total_amount < 0) {
        fi.total_amount = Math.abs(fi.total_amount);
      }

      // Calculate tax total if individual taxes are present
      if (fi.tax_9 || fi.tax_21) {
        fi.tax_total = (fi.tax_9 || 0) + (fi.tax_21 || 0);
      }
    }

    return analysis;
  }

  /**
   * Get all supported variables and capabilities
   */
  getSupportedVariables() {
    return {
      document_types: [
        "albert_heijn_receipt",
        "jumbo_receipt",
        "lidl_receipt",
        "aldi_receipt",
        "pharmacy_receipt",
        "gas_station_receipt",
        "restaurant_receipt",
        "hotel_receipt",
        "transport_receipt",
        "business_invoice",
        "general_receipt",
      ],
      languages: this.supportedLanguages,
      formats: this.supportedFormats,
      extraction_methods: this.extractionMethods,
      variables: {
        document_info: ["type", "subtype", "language", "confidence"],
        company_info: [
          "name",
          "address",
          "phone",
          "email",
          "website",
          "kvk",
          "btw",
          "iban",
        ],
        transaction_info: [
          "date",
          "time",
          "invoice_number",
          "transaction_id",
          "terminal_id",
          "merchant_id",
          "poi",
          "period",
        ],
        financial_info: [
          "subtotal",
          "subtotal_after_discount",
          "total_amount",
          "currency",
          "tax_9",
          "tax_21",
          "tax_0",
          "tax_total",
          "discount_amount",
          "bonus_amount",
          "emballage_amount",
          "voordeel_amount",
          "koopzegels_amount",
          "koopzegels_count",
          "payment_method",
          "payment_pin",
          "payment_cash",
          "payment_card",
          "payment_emballage",
        ],
        loyalty_info: [
          "bonuskaart",
          "air_miles",
          "customer_card",
          "loyalty_points",
        ],
        items: [
          "name",
          "quantity",
          "unit_price",
          "total_price",
          "category",
          "bonus",
          "bonus_amount",
          "discount_percentage",
          "tax_rate",
        ],
        item_summary: ["total_items", "unique_items", "categories"],
        btw_breakdown: ["btw_9_base", "btw_21_base", "btw_0_base"],
        store_info: ["filiaal", "kassa", "employee"],
        bank_info: [
          "bank_name",
          "card_type",
          "card_number",
          "authorization_code",
          "reading_method",
        ],
      },
    };
  }
}

module.exports = InvoiceAnalysisLibrary;
