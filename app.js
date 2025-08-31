// Import Express.js
const express = require("express");
const axios = require("axios");
const { google } = require("googleapis");
const path = require("path");

// Import improved invoice processing
const {
  generateInvoiceNumber,
  extractTextFromImage,
  processWithAI,
  saveDetailedInvoiceToSheets,
  setupGoogleSheetsHeaders,
} = require("./services/improved_invoice_processing");

// Import file processor for multiple file types
const {
  saveReceiptFile,
  extractTextFromFile,
  createReceiptFileViewer,
  createReceiptFilesList,
} = require("./services/file_processor");

// Import image storage (legacy support)
const {
  saveReceiptImage,
  createReceiptViewer,
  createReceiptsList,
} = require("./services/image_storage");

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// WhatsApp API configuration
const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Google Sheets configuration
const GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS;

// User session management
const userSessions = new Map();

// Route for GET requests (webhook verification)
app.get("/", (req, res) => {
  res.send("WhatsApp Webhook is running!");
});

// Route for viewing receipts list
app.get("/receipts", (req, res) => {
  const html = createReceiptFilesList();
  res.send(html);
});

// Route for viewing individual receipt
app.get("/receipt/:invoiceNumber", (req, res) => {
  const invoiceNumber = req.params.invoiceNumber;
  const html = createReceiptFileViewer(invoiceNumber);
  res.send(html);
});

// Route for serving receipt files
app.use(
  "/receipt_files",
  express.static(path.join(__dirname, "services/receipt_files"))
);

// Route for serving receipt images (legacy support)
app.use(
  "/receipt_images",
  express.static(path.join(__dirname, "receipt_images"))
);

// Route for POST requests (webhook events)
app.post("/", async (req, res) => {
  console.log("📥 POST request received");
  console.log("📋 Request body object:", req.body.object);
  console.log("📋 Request body mode:", req.body.mode);
  console.log("📋 Request body hub.challenge:", req.body["hub.challenge"]);
  console.log("📋 Full request body:", JSON.stringify(req.body, null, 2));

  // Handle webhook verification
  if (req.body.mode === "subscribe" && req.body["hub.challenge"]) {
    console.log("✅ WEBHOOK VERIFIED");
    res.status(200).send(req.body["hub.challenge"]);
    return;
  }

  // Handle webhook events
  if (req.body.object === "whatsapp_business_account") {
    console.log("✅ Processing whatsapp_business_account event");
    try {
      await processWebhookEvent(req.body);
      console.log("✅ processWebhookEvent completed successfully");
      res.status(200).send("OK");
    } catch (error) {
      console.error("❌ Error processing webhook event:", error);
      res.status(500).send("Error");
    }
  } else {
    console.log("❌ Object is not whatsapp_business_account:", req.body.object);
    res.status(404).send("Not found");
  }
});

async function processWebhookEvent(body) {
  console.log("🔄 processWebhookEvent called");

  const entry = body.entry?.[0];
  if (!entry) {
    console.log("❌ No entry found in webhook body");
    return;
  }
  console.log("✅ Entry found:", entry.id);

  const changes = entry.changes?.[0];
  if (!changes) {
    console.log("❌ No changes found in entry");
    return;
  }
  console.log("✅ Changes found");
  console.log("📋 Changes value:", JSON.stringify(changes.value, null, 2));

  // Check if this is a valid WhatsApp message
  if (changes.value?.messaging_product !== "whatsapp") {
    console.log(
      "❌ Messaging product is not whatsapp:",
      changes.value?.messaging_product
    );
    return;
  }
  console.log("✅ Messaging product is whatsapp");

  const messages = changes.value.messages;
  if (!messages) {
    console.log("❌ No messages found in changes");
    return;
  }
  console.log("✅ Messages found:", messages.length);

  for (const message of messages) {
    console.log("📨 Processing message:", message.type);
    await processMessage(message);
  }
}

async function processMessage(message) {
  const from = message.from;
  console.log(`Processing message from ${from}:`, message.type);

  if (message.type === "text") {
    await processTextMessage(message);
  } else if (message.type === "image") {
    await processFileMessage(message, "image");
  } else if (message.type === "document") {
    await processFileMessage(message, "document");
  } else if (message.type === "interactive") {
    await processInteractiveMessage(message);
  } else {
    console.log(`⚠️ Unsupported message type: ${message.type}`);
    await sendWhatsAppMessage(
      from,
      `❌ Dit bestandstype wordt nog niet ondersteund: ${message.type}\n\nOndersteunde formaten:\n• Afbeeldingen (JPG, PNG, GIF)\n• PDF bestanden\n• Documenten (DOC, DOCX)\n• Tekstbestanden`
    );
  }
}

async function processInteractiveMessage(message) {
  const from = message.from;
  const interactive = message.interactive;

  if (interactive.type === "button_reply") {
    const buttonId = interactive.button_reply.id;
    console.log(`Button clicked: ${buttonId}`);

    // Get or create user session
    let session = userSessions.get(from);
    if (!session) {
      session = { state: "initial", invoices: [] };
      userSessions.set(from, session);
    }

    // Process button selection
    await handleInitialState(from, buttonId, session);
  }
}

async function processTextMessage(message) {
  const from = message.from;
  const text = message.text?.body?.toLowerCase().trim();

  console.log(`🔍 Processing text message from ${from}: "${text}"`);

  if (!text) {
    console.log("❌ No text body found in message");
    return;
  }

  // Get or create user session
  let session = userSessions.get(from);
  if (!session) {
    session = { state: "initial", invoices: [] };
    userSessions.set(from, session);
    console.log(`📝 Created new session for user ${from}`);
  }

  console.log(`👤 User ${from} in state: ${session.state}, message: "${text}"`);

  // Process based on current state
  try {
    switch (session.state) {
      case "initial":
        console.log(`🔄 Handling initial state for user ${from}`);
        await handleInitialState(from, text, session);
        break;
      case "waiting_for_invoice":
        console.log(`📄 Handling invoice submission for user ${from}`);
        await handleInvoiceSubmission(from, text, session);
        break;
      default:
        console.log(`⚠️ Unknown state for user ${from}: ${session.state}`);
        await sendWhatsAppMessage(
          from,
          "Er is een fout opgetreden. Start opnieuw met een bericht."
        );
        session.state = "initial";
        break;
    }
  } catch (error) {
    console.error(`❌ Error processing message for user ${from}:`, error);
    await sendWhatsAppMessage(
      from,
      "Er is een fout opgetreden. Probeer het opnieuw."
    );
  }
}

async function showMainMenu(from) {
  console.log(`🎛️ showMainMenu called for user ${from}`);

  const menuMessage = {
    messaging_product: "whatsapp",
    to: from,
    type: "interactive",
    interactive: {
      type: "button",
      header: {
        type: "text",
        text: "🧾 AI Invoice Processor",
      },
      body: {
        text: "Ik kan je helpen met het verwerken van facturen en bonnetjes. Kies een optie:",
      },
      action: {
        buttons: [
          {
            type: "reply",
            reply: {
              id: "option_1",
              title: "📄 Meerdere facturen",
            },
          },
          {
            type: "reply",
            reply: {
              id: "option_2",
              title: "📋 1 factuur",
            },
          },
          {
            type: "reply",
            reply: {
              id: "option_3",
              title: "ℹ️ Info",
            },
          },
        ],
      },
    },
  };

  console.log(`📤 Sending interactive menu to user ${from}`);
  const result = await sendWhatsAppInteractiveMessage(from, menuMessage);
  console.log(`📤 Interactive menu sent to user ${from}, result: ${result}`);
}

async function handleInitialState(from, text, session) {
  console.log(
    `🎯 handleInitialState called for user ${from} with text: "${text}"`
  );

  // Show choice menu for any message in initial state
  if (
    text.includes("1") ||
    text.includes("optie 1") ||
    text.includes("meerdere") ||
    text === "option_1"
  ) {
    // Option 1: Multiple invoices
    session.multipleMode = true;
    const message = `📸 *Optie 1: Meerdere facturen/bonnetjes*

Oke, stuur nu alle foto's tegelijkertijd in dan verwerk ik ze in de Google Sheet.

*Stuur alle foto's van je facturen/bonnetjes*

Na het ontvangen van alle facturen geef ik je de belangrijkste kenmerken terug van het factuur en de locatie waar je de sheet kunt vinden.

*Of stuur 'menu' om terug te gaan naar het hoofdmenu.*`;

    await sendWhatsAppMessage(from, message);
    session.state = "waiting_for_invoice";
  } else if (
    text.includes("2") ||
    text.includes("optie 2") ||
    text.includes("1 factuur") ||
    text === "option_2"
  ) {
    // Option 2: Single invoice
    session.multipleMode = false;
    const message = `📸 *Optie 2: 1 factuur/bonnetje*

Oke, stuur je factuur in en dan verwerk ik hem in de Google Sheet.

*Stuur een foto van je factuur/bonnetje*

Na het ontvangen van het factuur geef ik je de belangrijkste kenmerken terug van het factuur en de locatie waar je de sheet kunt vinden.

*Of stuur 'menu' om terug te gaan naar het hoofdmenu.*`;

    await sendWhatsAppMessage(from, message);
    session.state = "waiting_for_invoice";
  } else if (
    text.includes("3") ||
    text.includes("optie 3") ||
    text.includes("info") ||
    text === "option_3"
  ) {
    // Option 3: Information
    const infoMessage = `📋 *JMSoft AI Agents*

Helaas zijn er nog niet meerdere AI Agents beschikbaar die je verder kunnen helpen. 

*JMSoft is druk bezig met het ontwikkelen van nieuwe AI Agents* die je kunnen ondersteunen bij verschillende taken.

*Wil je meer weten of heb je vragen?*
Neem contact op via: *JMSoft.com*`;

    await sendWhatsAppMessage(from, infoMessage);

    // Show menu again after info
    await showMainMenu(from);
    session.state = "initial";
  } else if (
    text.toLowerCase().includes("setup") ||
    text.toLowerCase().includes("tabs") ||
    text.toLowerCase().includes("sheets")
  ) {
    // Setup Google Sheets tabs
    await sendWhatsAppMessage(from, "🔧 Google Sheets tabs worden opgezet...");

    try {
      const setupResult = await setupGoogleSheetsHeaders();
      if (setupResult) {
        await sendWhatsAppMessage(
          from,
          "✅ Google Sheets tabs succesvol opgezet!"
        );
      } else {
        await sendWhatsAppMessage(
          from,
          "❌ Kon Google Sheets tabs niet opzetten. Controleer de configuratie."
        );
      }
    } catch (error) {
      console.error("❌ Error setting up tabs:", error);
      await sendWhatsAppMessage(
        from,
        "❌ Fout bij het opzetten van Google Sheets tabs."
      );
    }

    // Show menu after setup attempt
    await showMainMenu(from);
    session.state = "initial";
  } else if (
    text.includes("menu") ||
    text.includes("terug") ||
    text.includes("help")
  ) {
    // Show main menu
    await showMainMenu(from);
  } else {
    // Show main menu for any other message
    console.log(`📋 Showing main menu for user ${from} (any other message)`);
    await showMainMenu(from);
  }

  console.log(`✅ handleInitialState completed for user ${from}`);
}

async function handleInvoiceSubmission(from, text, session) {
  if (
    text.includes("menu") ||
    text.includes("terug") ||
    text.includes("help")
  ) {
    // Return to main menu
    await showMainMenu(from);
    session.state = "initial";
    session.invoices = [];
  } else if (
    text.includes("klaar") ||
    text.includes("done") ||
    text.includes("finish")
  ) {
    if (session.multipleMode && session.invoices.length > 0) {
      await sendMultipleInvoicesSummary(from, session);
      // Menu is automatically shown in sendMultipleInvoicesSummary
    } else {
      await sendWhatsAppMessage(
        from,
        "Je hebt nog geen facturen ingestuurd. Stuur eerst een foto van een factuur/bonnetje."
      );
      // Show menu after error message
      await showMainMenu(from);
      session.state = "initial";
    }
  } else {
    // For any other text, show menu to guide user
    await showMainMenu(from);
    session.state = "initial";
  }
}

async function processFileMessage(message, fileType) {
  const from = message.from;
  console.log(`📄 Processing ${fileType} message...`);

  // Get user session
  let session = userSessions.get(from);
  if (!session) {
    session = { state: "initial", invoices: [] };
    userSessions.set(from, session);
  }

  try {
    // Generate unique invoice number
    const invoiceNumber = generateInvoiceNumber();
    console.log("📄 Generated invoice number:", invoiceNumber);

    // Get media info based on file type
    let mediaId, mimeType, fileName;
    
    if (fileType === "image") {
      mediaId = message.image.id;
      mimeType = message.image.mime_type || "image/jpeg";
      fileName = message.image.filename || "receipt.jpg";
    } else if (fileType === "document") {
      mediaId = message.document.id;
      mimeType = message.document.mime_type || "application/pdf";
      fileName = message.document.filename || "receipt.pdf";
    }

    console.log(`📄 File info: ${fileName} (${mimeType})`);

    // Get media URL from WhatsApp
    const mediaUrl = await getMediaUrl(mediaId);
    console.log("📄 Media URL:", mediaUrl);

    // Save the receipt file
    const fileResult = await saveReceiptFile(mediaUrl, invoiceNumber, mimeType);
    if (fileResult.success) {
      console.log("📄 Receipt file saved:", fileResult.filename);
    } else {
      console.log("⚠️ Could not save receipt file:", fileResult.error);
      await sendWhatsAppMessage(
        from,
        `❌ Kon het bestand niet opslaan: ${fileResult.error}\n\n💡 Probeer het bestand opnieuw te sturen of neem contact op met support.`
      );
      return;
    }

    // Extract text from file
    const extractedText = await extractTextFromFile(fileResult.filepath, mimeType);
    console.log("📝 Extracted text:", extractedText);

    // Check if text extraction failed
    if (extractedText.includes("PDF Text Extraction Failed") || extractedText.includes("Unsupported file type")) {
      await sendWhatsAppMessage(
        from,
        `❌ Kon geen tekst uit het bestand halen.\n\n${extractedText}\n\n💡 Tips:\n• Stuur een screenshot van het bonnetje\n• Zorg dat het bestand leesbaar is\n• Probeer een andere foto van het bonnetje`
      );
      return;
    }

    // Check if extracted text is too short or empty
    if (!extractedText || extractedText.trim().length < 20) {
      await sendWhatsAppMessage(
        from,
        `❌ Kon geen bruikbare tekst uit het bestand halen.\n\nExtracted text: "${extractedText}"\n\n💡 Tips:\n• Stuur een duidelijke foto van het bonnetje\n• Zorg dat alle tekst leesbaar is\n• Probeer het bestand opnieuw te sturen`
      );
      return;
    }

    // Process with improved AI
    const invoiceData = await processWithAI(extractedText, invoiceNumber);
    console.log("🤖 AI processed data:", invoiceData);

    if (!invoiceData) {
      await sendWhatsAppMessage(
        from,
        "❌ Kon de bonnetje data niet verwerken.\n\n💡 Probeer een andere foto van het bonnetje te sturen."
      );
      return;
    }

    // Save detailed data to Google Sheets
    const saved = await saveDetailedInvoiceToSheets(invoiceData);
    console.log("💾 Saved to sheets:", saved);

    if (!saved) {
      // Try to setup Google Sheets tabs first
      console.log("🔧 Attempting to setup Google Sheets tabs...");
      try {
        await setupGoogleSheetsHeaders();
        // Try saving again
        const retrySaved = await saveDetailedInvoiceToSheets(invoiceData);
        if (retrySaved) {
          console.log("✅ Successfully saved after tab setup");
        } else {
          await sendWhatsAppMessage(
            from,
            "❌ Kon data niet opslaan in Google Sheets. De Google Sheets tabs worden mogelijk nog opgezet. Probeer het over een paar minuten opnieuw."
          );

          // Show menu even if save failed
          await showMainMenu(from);
          session.state = "initial";
          return;
        }
      } catch (setupError) {
        console.error("❌ Error setting up Google Sheets tabs:", setupError);
        await sendWhatsAppMessage(
          from,
          "❌ Kon data niet opslaan in Google Sheets. Probeer het opnieuw of neem contact op met support."
        );

        // Show menu even if save failed
        await showMainMenu(from);
        session.state = "initial";
        return;
      }
    }

    // Add to session
    session.invoices.push(invoiceData);

    // Send response based on mode
    if (session.multipleMode) {
      await sendSingleInvoiceResponse(
        from,
        invoiceData,
        session.invoices.length
      );
    } else {
      await sendSingleInvoiceSummary(from, invoiceData);
      // Menu is automatically shown in sendSingleInvoiceSummary
      session.state = "initial";
      session.invoices = [];
    }
  } catch (error) {
    console.error("❌ Error processing image:", error);
    await sendWhatsAppMessage(
      from,
      "❌ Er is een fout opgetreden bij het verwerken van je foto. Probeer het opnieuw."
    );

    // Always show menu after error
    await showMainMenu(from);
    session.state = "initial";
  }
}

async function sendSingleInvoiceResponse(from, invoiceData, invoiceNumber) {
  const responseMessage = `📄 *Factuur ${invoiceNumber} Verwerkt!*

🔢 *Factuurnummer:* ${invoiceData.invoice_number || "Onbekend"}
🏪 *Bedrijf:* ${invoiceData.company || "Onbekend"}
💰 *Totaalbedrag:* €${invoiceData.total_amount || 0}
📅 *Datum:* ${invoiceData.date || "Onbekend"}
🕐 *Tijd:* ${invoiceData.time || "Onbekend"}
📊 *Items:* ${invoiceData.item_count || 0} artikelen
💳 *Betaalmethode:* ${invoiceData.payment_method || "Onbekend"}
🎯 *Betrouwbaarheid:* ${invoiceData.confidence || 0}%

✅ *Data opgeslagen in Google Sheets*

*Stuur de volgende foto of typ 'klaar' om af te ronden.*`;

  await sendWhatsAppMessage(from, responseMessage);
}

async function sendSingleInvoiceSummary(from, invoiceData) {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_SPREADSHEET_ID}/edit`;

  const responseMessage = `🧾 *Factuur Verwerking Voltooid!*

🔢 *Factuurnummer:* ${invoiceData.invoice_number || "Onbekend"}
🏪 *Bedrijf:* ${invoiceData.company || "Onbekend"}
💰 *Totaalbedrag:* €${invoiceData.total_amount || 0}
📅 *Datum:* ${invoiceData.date || "Onbekend"}
🕐 *Tijd:* ${invoiceData.time || "Onbekend"}
📊 *Items:* ${invoiceData.item_count || 0} artikelen
💳 *Betaalmethode:* ${invoiceData.payment_method || "Onbekend"}
🎯 *Betrouwbaarheid:* ${invoiceData.confidence || 0}%

✅ *Data opgeslagen in Google Sheets*
📊 *Bekijk de spreadsheet:* ${sheetUrl}

📋 *Twee tabs beschikbaar:*
• *Invoices:* Overzicht van alle facturen
• *Detail Invoices:* Gedetailleerde productinformatie per factuur

*Bedankt voor het gebruik van JMSoft AI Invoice Processor!*`;

  await sendWhatsAppMessage(from, responseMessage);

  // Automatically show menu after single invoice processing
  await showMainMenu(from);
}

async function sendMultipleInvoicesSummary(from, session) {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_SPREADSHEET_ID}/edit`;

  let totalAmount = 0;
  let totalItems = 0;
  const companies = new Set();

  session.invoices.forEach((invoice) => {
    totalAmount += parseFloat(invoice.total_amount || 0);
    totalItems += parseInt(invoice.item_count || 0);
    if (invoice.company) companies.add(invoice.company);
  });

  const responseMessage = `📊 *Meerdere Facturen Verwerking Voltooid!*

📄 *Aantal facturen:* ${session.invoices.length}
🏪 *Bedrijven:* ${Array.from(companies).join(", ") || "Onbekend"}
💰 *Totaalbedrag:* €${totalAmount.toFixed(2)}
📊 *Totaal items:* ${totalItems}
📅 *Verwerkt op:* ${new Date().toLocaleDateString("nl-NL")}

✅ *Alle data opgeslagen in Google Sheets*
📊 *Bekijk de spreadsheet:* ${sheetUrl}

📈 *Batch #${Date.now()}*

*Bedankt voor het gebruik van JMSoft AI Invoice Processor!*`;

  await sendWhatsAppMessage(from, responseMessage);

  // Automatically show menu after multiple invoices processing
  await showMainMenu(from);
}

// Get media URL from WhatsApp API
async function getMediaUrl(mediaId) {
  try {
    console.log(`📥 Getting media URL for ID: ${mediaId}`);

    const response = await axios.get(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    console.log("📥 Media URL response:", response.data);
    return response.data.url;
  } catch (error) {
    console.error("❌ Error getting media URL:", error.message);
    console.error("❌ Error details:", error.response?.data);
    // Fallback to simulated URL for testing
    return `https://example.com/media/${mediaId}`;
  }
}

async function saveToGoogleSheets(invoiceData) {
  try {
    console.log("🔄 Starting Google Sheets save...");
    console.log("📋 Invoice data:", JSON.stringify(invoiceData, null, 2));

    // Check if we have the required environment variables
    if (!GOOGLE_SHEETS_SPREADSHEET_ID || !GOOGLE_SHEETS_CREDENTIALS) {
      console.error("❌ Missing Google Sheets environment variables");
      console.error(
        "GOOGLE_SHEETS_SPREADSHEET_ID:",
        !!GOOGLE_SHEETS_SPREADSHEET_ID
      );
      console.error("GOOGLE_SHEETS_CREDENTIALS:", !!GOOGLE_SHEETS_CREDENTIALS);
      return false;
    }

    // Parse the credentials
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

    // Prepare the row data
    const rowData = [
      new Date().toISOString(), // Timestamp
      invoiceData.company || "Onbekend",
      invoiceData.date || new Date().toISOString().split("T")[0],
      invoiceData.total_amount || 0,
      invoiceData.currency || "EUR",
      invoiceData.document_type || "receipt",
      invoiceData.item_count || 0,
      invoiceData.tax_amount || 0,
      invoiceData.payment_method || "unknown",
      invoiceData.confidence || 0,
      invoiceData.notes || "",
    ];

    console.log("📝 Row data to insert:", rowData);

    // Append the data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: "Invoices!A:K", // Assuming headers are in row 1
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: [rowData],
      },
    });

    console.log("✅ Successfully saved to Google Sheets");
    console.log("📊 Response:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Error saving to Google Sheets:", error);
    console.error("❌ Error details:", error.message);
    if (error.response) {
      console.error("❌ API Error:", error.response.data);
    }
    return false;
  }
}

async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("WhatsApp message sent:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}

async function sendWhatsAppInteractiveMessage(to, message) {
  console.log(`📤 sendWhatsAppInteractiveMessage called for user ${to}`);
  console.log(`📤 Message data:`, JSON.stringify(message, null, 2));

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: message.interactive,
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("WhatsApp interactive message sent:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp interactive message:", error);
    return false;
  }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`WhatsApp Webhook server running on port ${PORT}`);
  console.log(`Webhook URL: https://your-app-name.onrender.com`);
  console.log(`Verify Token: ${verifyToken}`);

  // Setup Google Sheets headers on startup
  try {
    console.log("🔧 Setting up Google Sheets headers...");
    await setupGoogleSheetsHeaders();
  } catch (error) {
    console.error("❌ Error setting up Google Sheets headers:", error);
  }
});
