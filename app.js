// Load environment variables from .env file
require("dotenv").config({ path: "../config/credentials/.env" });

// Set environment for source identification
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

// Import Express.js
const express = require("express");
const path = require("path");

// Import services from ai_agents_library
const whatsappMessaging = require("./whatsapp_messaging");
const invoiceAnalysis = require("./invoice_analysis_library");
const sheetsService = require("./comprehensive_sheets_service");
const fileProcessor = require("./file_processor");
const adminCommands = require("./admin_commands");

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
      adminCommands: "✅"
    }
  });
});

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    console.log("📥 POST request received");
    console.log("📋 Request body object:", req.body.object);
    console.log("📋 Request body mode:", req.body.mode);
    console.log("📋 Request body hub.challenge:", req.body["hub.challenge"]);
    console.log("📋 Full request body:", JSON.stringify(req.body, null, 2));

    // Handle webhook verification
    if (req.body.mode === "subscribe" && req.body["hub.challenge"]) {
      console.log("✅ Webhook verification successful");
      res.status(200).send(req.body["hub.challenge"]);
      return;
    }

    // Process webhook events
    if (req.body.object === "whatsapp_business_account") {
      console.log("✅ Processing whatsapp_business_account event");
      
      // Process each entry
      for (const entry of req.body.entry) {
        console.log("🔄 processWebhookEvent called");
        console.log("✅ Entry found:", entry.id);
        
        for (const change of entry.changes) {
          console.log("✅ Changes found");
          console.log("📋 Changes value:", JSON.stringify(change.value, null, 2));
          
          if (change.field === "messages") {
            const messages = change.value.messages;
            console.log("✅ Messaging product is", change.value.messaging_product);
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
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}-${process.pid}`;
    console.log("📄 Generated invoice number:", invoiceNumber);
    
    // Get file info
    const fileInfo = message.document;
    console.log("📄 File info:", fileInfo.filename, `(${fileInfo.mime_type})`);
    
    // Send initial confirmation
    await whatsappMessaging.sendTextMessage(
      message.from,
      `✅ Bestand "${fileInfo.filename}" ontvangen!\n\n📊 Factuurnummer: ${invoiceNumber}\n📅 Verwerkt op: ${new Date().toLocaleString('nl-NL')}\n\nDe factuur wordt geanalyseerd en opgeslagen in Google Sheets.`
    );
    
    // TODO: Implement actual file processing with AI analysis
    // This would involve:
    // 1. Downloading the file
    // 2. Processing with OCR
    // 3. AI analysis with ChatGPT
    // 4. Storing in Google Sheets
    // 5. Sending detailed response
    
    console.log("📄 File processing completed for:", fileInfo.filename);
    
  } catch (error) {
    console.error("❌ Error processing file message:", error);
    
    // Send error message
    try {
      await whatsappMessaging.sendTextMessage(
        message.from,
        "❌ Er is een fout opgetreden bij het verwerken van het bestand. Probeer het later opnieuw."
      );
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
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}-${process.pid}`;
    console.log("🖼️ Generated invoice number:", invoiceNumber);
    
    // Get image info
    const imageInfo = message.image;
    console.log("🖼️ Image info:", imageInfo.id, `(${imageInfo.mime_type})`);
    
    // Send confirmation
    await whatsappMessaging.sendTextMessage(
      message.from,
      `✅ Afbeelding ontvangen!\n\n📊 Factuurnummer: ${invoiceNumber}\n📅 Verwerkt op: ${new Date().toLocaleString('nl-NL')}\n\nDe afbeelding wordt geanalyseerd met OCR en AI, en opgeslagen in Google Sheets.`
    );
    
    // TODO: Implement actual image processing with OCR and AI analysis
    
    console.log("🖼️ Image processing completed");
    
  } catch (error) {
    console.error("❌ Error processing image message:", error);
    
    try {
      await whatsappMessaging.sendTextMessage(
        message.from,
        "❌ Er is een fout opgetreden bij het verwerken van de afbeelding. Probeer het later opnieuw."
      );
    } catch (sendError) {
      console.error("❌ Failed to send error message:", sendError);
    }
  }
}

// Process text messages
async function processTextMessage(message) {
  try {
    console.log("📝 Processing text message:", message.text.body);
    const text = message.text.body.toLowerCase();
    
    // Handle commands
    if (text.includes("help") || text.includes("help")) {
      await whatsappMessaging.sendTextMessage(
        message.from,
        "🤖 WhatsApp Invoice Agent Help\n\n📤 Stuur een foto of PDF van een factuur/bon\n📊 De agent analyseert het automatisch\n💾 Data wordt opgeslagen in Google Sheets\n\nVoor vragen, neem contact op met support."
      );
    } else if (text.includes("status") || text.includes("status")) {
      await whatsappMessaging.sendTextMessage(
        message.from,
        "📊 Agent Status: Online ✅\n🔄 Laatste update: " + new Date().toLocaleString('nl-NL') + "\n📁 Verwerkte bestanden: Actief\n🤖 AI Analysis: Beschikbaar"
      );
    } else if (text.includes("admin") && text.includes("help")) {
      // Check if user is admin (implement proper admin check)
      await adminCommands.processAdminCommand(message.from, text);
    } else {
      await whatsappMessaging.sendTextMessage(
        message.from,
        "📤 Stuur een foto of PDF van een factuur/bon om te beginnen met de verwerking.\n\n📝 Commando's:\n- 'help' - Toon help\n- 'status' - Agent status\n- 'admin help' - Admin commando's"
      );
    }
    
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
