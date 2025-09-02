// Load environment variables from .env file
require("dotenv").config({ path: "../config/credentials/.env" });

// Set environment for source identification
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

// Import Express.js
const express = require("express");
const path = require("path");

// Import services from organized folders
const whatsappMessaging = require("./services/whatsapp_services/whatsapp_messaging");
const invoiceAnalysis = require("./services/ai_services/invoice_analysis_library");
const sheetsService = require("./services/sheets_services/comprehensive_sheets_service");
const fileProcessor = require("./services/file_services/file_processor");
const adminCommands = require("./services/admin_services/admin_commands");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/", (req, res) => {
  res.send("WhatsApp Webhook is running!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "WhatsApp Webhook server is running",
    environment: process.env.NODE_ENV,
    services: {
      whatsapp: "✅",
      invoiceAnalysis: "✅",
      sheetsService: "✅",
      fileProcessor: "✅",
      adminCommands: "✅",
    },
  });
});

// Webhook GET endpoint for verification
app.get("/webhook", async (req, res) => {
  try {
    console.log("📥 GET request received for webhook verification");
    console.log("📋 Query hub.mode:", req.query["hub.mode"]);
    console.log("📋 Query hub.challenge:", req.query["hub.challenge"]);

    // Handle webhook verification
    if (req.query["hub.mode"] === "subscribe" && req.query["hub.challenge"]) {
      console.log("✅ Webhook verification successful");
      console.log("📋 Challenge:", req.query["hub.challenge"]);
      res.status(200).send(req.query["hub.challenge"]);
      return;
    }

    res.status(400).send("Bad Request");
  } catch (error) {
    console.error("❌ Error in webhook verification:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Webhook POST endpoint for receiving messages
app.post("/webhook", async (req, res) => {
  try {
    console.log("📥 POST request received");
    console.log("📋 Request body object:", req.body.object);
    console.log("📋 Full request body:", JSON.stringify(req.body, null, 2));

    // Process webhook events
    if (req.body.object === "whatsapp_business_account") {
      console.log("✅ Processing whatsapp_business_account event");

      // Process each entry
      for (const entry of req.body.entry) {
        console.log("🔄 processWebhookEvent called");
        console.log("✅ Entry found:", entry.id);

        for (const change of entry.changes) {
          console.log("✅ Changes found");
          console.log(
            "📋 Changes value:",
            JSON.stringify(change.value, null, 2)
          );

          if (change.field === "messages") {
            const messages = change.value.messages;
            console.log(
              "✅ Messaging product is",
              change.value.messaging_product
            );
            console.log("✅ Messages found:", messages.length);

            // Process each message
            for (const message of messages) {
              console.log("📨 Processing message:", message.type);
              await processMessage(message);
            }
          }
        }
      }

      console.log("✅ processWebhookEvent completed successfully");
      res.status(200).send("OK");
    } else {
      res.status(404).send("Not Found");
    }
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Process individual messages
async function processMessage(message) {
  try {
    console.log("Processing message from", message.from + ":", message.type);

    if (message.type === "document") {
      await processFileMessage(message);
    } else if (message.type === "text") {
      await processTextMessage(message);
    } else if (message.type === "image") {
      await processImageMessage(message);
    }
  } catch (error) {
    console.error("❌ Error processing message:", error);
  }
}

// Process file messages (documents, PDFs)
async function processFileMessage(message) {
  try {
    console.log("📄 Processing document message...");

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}-${process.pid}`;
    console.log("📄 Generated invoice number:", invoiceNumber);

    // Get file info
    const fileInfo = message.document;
    console.log("📄 File info:", fileInfo.filename, `(${fileInfo.mime_type})`);

    // Send initial confirmation
    await whatsappMessaging.sendTextMessage(
      message.from,
      `✅ Bestand "${
        fileInfo.filename
      }" ontvangen!\n\n📊 Factuurnummer: ${invoiceNumber}\n📅 Verwerkt op: ${new Date().toLocaleString(
        "nl-NL"
      )}\n\nDe factuur wordt geanalyseerd en opgeslagen in Google Sheets.`
    );

    // REAL FILE PROCESSING IMPLEMENTATION
    console.log("🔄 Starting real file processing...");

    try {
      // Step 1: Download file from WhatsApp
      console.log("📥 Downloading file from WhatsApp...");
      const downloadedFile = await fileProcessor.downloadWhatsAppFile(
        fileInfo.id,
        fileInfo.filename
      );

      if (!downloadedFile) {
        throw new Error("Failed to download file from WhatsApp");
      }

      console.log("✅ File downloaded successfully:", downloadedFile.path);

      // Step 2: Process file with OCR and AI analysis
      console.log("🤖 Processing file with AI analysis...");
      const analysisResult = await invoiceAnalysis.analyzeInvoiceFile(
        downloadedFile.path
      );

      if (!analysisResult) {
        throw new Error("AI analysis failed");
      }

      console.log("✅ AI analysis completed successfully");

      // Step 3: Save to Google Sheets
      console.log("💾 Saving analysis to Google Sheets...");
      const sheetsResult = await sheetsService.saveComprehensiveAnalysis(
        analysisResult,
        invoiceNumber
      );

      if (!sheetsResult) {
        throw new Error("Failed to save to Google Sheets");
      }

      console.log("✅ Data saved to Google Sheets successfully");

      // Step 4: Send detailed success response
      const successMessage = `🎉 Factuur succesvol verwerkt!\n\n📊 Factuurnummer: ${invoiceNumber}\n🏢 Bedrijf: ${
        analysisResult.company_info?.name || "Onbekend"
      }\n💰 Totaal: €${
        analysisResult.financial_info?.total_amount || "Onbekend"
      }\n📅 Datum: ${
        analysisResult.financial_info?.date || "Onbekend"
      }\n\n✅ Data is opgeslagen in Google Sheets`;

      await whatsappMessaging.sendTextMessage(message.from, successMessage);

      // Step 5: Clean up downloaded file
      await fileProcessor.cleanupFile(downloadedFile.path);
      console.log("🧹 Temporary file cleaned up");

      console.log(
        "📄 File processing completed successfully for:",
        fileInfo.filename
      );
      
      // Show main menu after successful processing
      setTimeout(async () => {
        await showMainMenu(message.from);
      }, 3000);
    } catch (processingError) {
      console.error("❌ Error during file processing:", processingError);

      // Send detailed error message
      await whatsappMessaging.sendTextMessage(
        message.from,
        `❌ Fout tijdens verwerking:\n\n${processingError.message}\n\n💡 Probeer het later opnieuw of neem contact op met support.`
      );

      throw processingError; // Re-throw to be caught by outer catch
    }
      } catch (error) {
      console.error("❌ Error processing file message:", error);

      // Send error message
      try {
        await whatsappMessaging.sendTextMessage(
          message.from,
          "❌ Er is een fout opgetreden bij het verwerken van het bestand. Probeer het later opnieuw."
        );
        
        // Show main menu after error
        setTimeout(async () => {
          await showMainMenu(message.from);
        }, 2000);
      } catch (sendError) {
        console.error("❌ Failed to send error message:", sendError);
      }
    }
}

// Process image messages
async function processImageMessage(message) {
  try {
    console.log("🖼️ Processing image message...");

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}-${process.pid}`;
    console.log("🖼️ Generated invoice number:", invoiceNumber);

    // Get image info
    const imageInfo = message.image;
    console.log("🖼️ Image info:", imageInfo.id, `(${imageInfo.mime_type})`);

    // Send confirmation
    await whatsappMessaging.sendTextMessage(
      message.from,
      `✅ Afbeelding ontvangen!\n\n📊 Factuurnummer: ${invoiceNumber}\n📅 Verwerkt op: ${new Date().toLocaleString(
        "nl-NL"
      )}\n\nDe afbeelding wordt geanalyseerd met OCR en AI, en opgeslagen in Google Sheets.`
    );

    // REAL IMAGE PROCESSING IMPLEMENTATION
    console.log("🔄 Starting real image processing...");

    try {
      // Step 1: Download image from WhatsApp
      console.log("📥 Downloading image from WhatsApp...");
      const downloadedImage = await fileProcessor.downloadWhatsAppFile(
        imageInfo.id,
        imageInfo.filename || "image.jpg"
      );

      if (!downloadedImage) {
        throw new Error("Failed to download image from WhatsApp");
      }

      console.log("✅ Image downloaded successfully:", downloadedImage.path);

      // Step 2: Process image with OCR and AI analysis
      console.log("🤖 Processing image with AI analysis...");
      const analysisResult = await invoiceAnalysis.analyzeInvoiceFile(
        downloadedImage.path
      );

      if (!analysisResult) {
        throw new Error("AI analysis failed");
      }

      console.log("✅ AI analysis completed successfully");

      // Step 3: Save to Google Sheets
      console.log("💾 Saving analysis to Google Sheets...");
      const sheetsResult = await sheetsService.saveComprehensiveAnalysis(
        analysisResult,
        invoiceNumber
      );

      if (!sheetsResult) {
        throw new Error("Failed to save to Google Sheets");
      }

      console.log("✅ Data saved to Google Sheets successfully");

      // Step 4: Send detailed success response
      const successMessage = `🎉 Afbeelding succesvol verwerkt!\n\n📊 Factuurnummer: ${invoiceNumber}\n🏢 Bedrijf: ${
        analysisResult.company_info?.name || "Onbekend"
      }\n💰 Totaal: €${
        analysisResult.financial_info?.total_amount || "Onbekend"
      }\n📅 Datum: ${
        analysisResult.financial_info?.date || "Onbekend"
      }\n\n✅ Data is opgeslagen in Google Sheets`;

      await whatsappMessaging.sendTextMessage(message.from, successMessage);

      // Step 5: Clean up downloaded image
      await fileProcessor.cleanupFile(downloadedImage.path);
      console.log("🧹 Temporary image cleaned up");

      console.log("🖼️ Image processing completed successfully");
      
      // Show main menu after successful processing
      setTimeout(async () => {
        await showMainMenu(message.from);
      }, 3000);
    } catch (processingError) {
      console.error("❌ Error during image processing:", processingError);

      // Send detailed error message
      await whatsappMessaging.sendTextMessage(
        message.from,
        `❌ Fout tijdens verwerking:\n\n${processingError.message}\n\n💡 Probeer het later opnieuw of neem contact op met support.`
      );

      throw processingError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("❌ Error processing image message:", error);

    try {
      await whatsappMessaging.sendTextMessage(
        message.from,
        "❌ Er is een fout opgetreden bij het verwerken van de afbeelding. Probeer het later opnieuw."
      );
      
      // Show main menu after error
      setTimeout(async () => {
        await showMainMenu(message.from);
      }, 2000);
    } catch (sendError) {
      console.error("❌ Failed to send error message:", sendError);
    }
  }
}

// Menu Functions
async function showMainMenu(phoneNumber) {
  const menuMessage = `🤖 **WhatsApp Invoice Agent - Hoofdmenu**

📋 **Beschikbare opties:**

1️⃣ **Factuur verwerken** - Stuur een enkele factuur/bon
2️⃣ **Meerdere facturen** - Bulk verwerking van meerdere bestanden  
3️⃣ **Admin opties** - Beheer en onderhoud
4️⃣ **Systeem status** - Controleer de status

💡 **Gebruik:** Stuur het nummer (1, 2, 3, 4) of typ 'menu' om dit menu opnieuw te tonen.

📤 **Of stuur direct een foto/PDF van een factuur om te beginnen!**`;

  await whatsappMessaging.sendTextMessage(phoneNumber, menuMessage);
  
  // Always show menu after any action
  console.log("📋 Main menu sent to:", phoneNumber);
}

async function showInvoiceOptions(phoneNumber) {
  const message = `📄 **Factuur Verwerking**

📤 **Stuur nu een van de volgende bestanden:**
• 📷 Foto van een factuur/bon (JPG, PNG)
• 📄 PDF bestand van een factuur
• 📋 Document bestand

🔄 **Wat gebeurt er:**
1. Bestand wordt gedownload van WhatsApp
2. OCR tekst wordt geëxtraheerd
3. AI analyseert de inhoud
4. Data wordt opgeslagen in Google Sheets
5. Je krijgt een overzicht van de resultaten

💡 **Tip:** Zorg dat de factuur goed leesbaar is voor het beste resultaat!`;

  await whatsappMessaging.sendTextMessage(phoneNumber, message);
  
  // Show main menu after showing options
  setTimeout(async () => {
    await showMainMenu(phoneNumber);
  }, 2000);
}

async function showBulkProcessingOptions(phoneNumber) {
  const message = `📦 **Meerdere Facturen Verwerken**

🔄 **Hoe het werkt:**
1. Stuur meerdere facturen/bonnen achter elkaar
2. Elk bestand wordt individueel verwerkt
3. Je krijgt een overzicht van alle resultaten
4. Data wordt opgeslagen in Google Sheets

📤 **Stuur nu je facturen:**
• 📷 Foto's van facturen/bonnen
• 📄 PDF bestanden
• 📋 Document bestanden

💡 **Tip:** Je kunt tot 10 bestanden tegelijk verwerken. Stuur ze één voor één.`;

  await whatsappMessaging.sendTextMessage(phoneNumber, message);
  
  // Show main menu after showing options
  setTimeout(async () => {
    await showMainMenu(phoneNumber);
  }, 2000);
}

async function showAdminOptions(phoneNumber) {
  const message = `🔧 **Admin Opties**

📋 **Beschikbare commando's:**

• `/clear` - Wis alle data uit Google Sheets
• `/stats` - Toon statistieken
• `/reset` - Reset headers en formatting
• `/status` - Systeem status
• `/help` - Admin help

💡 **Gebruik:** Typ het commando (bijvoorbeeld: /clear)`;

  await whatsappMessaging.sendTextMessage(phoneNumber, message);
  
  // Show main menu after showing options
  setTimeout(async () => {
    await showMainMenu(phoneNumber);
  }, 2000);
}

async function showSystemStatus(phoneNumber) {
  const statusMessage = `📊 **Systeem Status**

✅ **WhatsApp Webhook:** Actief
✅ **Google Sheets:** Verbonden
✅ **AI Analysis:** Beschikbaar
✅ **File Processing:** Klaar

🌍 **Environment:** Production
⏰ **Laatste update:** ${new Date().toLocaleString("nl-NL")}
🔄 **Uptime:** ${Math.floor(process.uptime() / 3600)} uur

💡 **Status:** Alle systemen werken correct!`;

  await whatsappMessaging.sendTextMessage(phoneNumber, statusMessage);
  
  // Show main menu after showing status
  setTimeout(async () => {
    await showMainMenu(phoneNumber);
  }, 2000);
}

// Process text messages
async function processTextMessage(message) {
  try {
    console.log("📝 Processing text message:", message.text.body);
    const text = message.text.body.toLowerCase();
    
    // Check for menu commands
    if (text === "menu" || text === "help" || text === "start" || text === "begin") {
      await showMainMenu(message.from);
      return;
    }
    
    // Check for specific menu options
    if (text === "1" || text === "factuur" || text === "facturen") {
      await showInvoiceOptions(message.from);
      return;
    }
    
    if (text === "2" || text === "meerdere" || text === "bulk") {
      await showBulkProcessingOptions(message.from);
      return;
    }
    
    if (text === "3" || text === "admin" || text === "beheer") {
      await showAdminOptions(message.from);
      return;
    }
    
    // Handle admin commands
    if (text.startsWith("/")) {
      try {
        const result = await adminCommands.processAdminCommand(text);
        if (result && result.success) {
          await whatsappMessaging.sendTextMessage(message.from, result.message);
        } else {
          await whatsappMessaging.sendTextMessage(message.from, "❌ Admin commando mislukt. Probeer het opnieuw.");
        }
        
        // Show main menu after admin command
        setTimeout(async () => {
          await showMainMenu(message.from);
        }, 2000);
      } catch (error) {
        console.error("❌ Error processing admin command:", error);
        await whatsappMessaging.sendTextMessage(message.from, "❌ Er is een fout opgetreden bij het verwerken van het admin commando.");
        
        // Show main menu after error
        setTimeout(async () => {
          await showMainMenu(message.from);
        }, 2000);
      }
      return;
    }
    
    if (text === "4" || text === "status" || text === "info") {
      await showSystemStatus(message.from);
      return;
    }
    
    // If no command recognized, show main menu
    await showMainMenu(message.from);
  } catch (error) {
    console.error("❌ Error processing text message:", error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Webhook server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`✅ All services loaded successfully`);
});

module.exports = app;
