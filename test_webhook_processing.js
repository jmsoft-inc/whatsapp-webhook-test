// Test webhook processing with real test files
console.log("🧪 Testing webhook processing with real test files...\n");

const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Test files to process
const testFiles = [
  "../tests/bonnentjes/20250901_152450.jpg",
  "../tests/bonnentjes/AH_kassabon_2025-08-22 125400_1427.pdf",
  "../tests/bonnentjes/factuur rompslomp.pdf",
  "../tests/bonnentjes/jpg AH_kassabon.jpeg",
  "../tests/bonnentjes/I am sharing '3151351' with you.pdf",
];

// Webhook endpoint
const WEBHOOK_URL = "http://localhost:3000/webhook";

async function testWebhookProcessing() {
  console.log("📋 TEST FILES TO PROCESS:");
  console.log("=".repeat(50));

  let availableFiles = [];

  testFiles.forEach((file, index) => {
    const filename = path.basename(file);
    const fullPath = path.resolve(__dirname, file);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      availableFiles.push({ path: file, filename, fullPath });
      console.log(`${index + 1}. ${filename} - ✅ Available`);
    } else {
      console.log(`${index + 1}. ${filename} - ❌ Missing`);
    }
  });

  if (availableFiles.length === 0) {
    console.log("❌ No test files available");
    return;
  }

  console.log(`\n📊 Found ${availableFiles.length} available test files`);
  console.log("\n🔄 Starting webhook processing tests...");
  console.log("=".repeat(50));

  // Test 1: Check if webhook is running
  console.log("\n📋 TEST 1: Webhook Health Check");
  console.log("-".repeat(30));

  try {
    const healthResponse = await axios.get("http://localhost:3000/health");
    console.log("✅ Webhook is running");
    console.log("📊 Status:", healthResponse.data.status);
    console.log("🌍 Environment:", healthResponse.data.environment);
  } catch (error) {
    console.log("❌ Webhook is not running:", error.message);
    console.log("💡 Start the webhook first with: node app.js");
    return;
  }

  // Test 2: Process each test file
  console.log("\n📋 TEST 2: Process Test Files");
  console.log("-".repeat(30));

  for (const fileInfo of availableFiles) {
    console.log(`\n📄 Processing: ${fileInfo.filename}`);

    try {
      // Simulate WhatsApp webhook message for file
      const webhookMessage = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "test_entry_id",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  messages: [
                    {
                      from: "+31639591370", // Test sender
                      type: "document",
                      document: {
                        id: `test_doc_${Date.now()}`,
                        filename: fileInfo.filename,
                        mime_type: "application/pdf",
                      },
                      timestamp: Date.now(),
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      // Send to webhook
      const response = await axios.post(WEBHOOK_URL, webhookMessage, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      });

      console.log(`✅ ${fileInfo.filename} processed successfully`);
      console.log(`📊 Response status: ${response.status}`);

      // Wait a bit between files
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`❌ Error processing ${fileInfo.filename}:`, error.message);
    }
  }

  console.log("\n🎯 Webhook processing test completed");
  console.log("📋 Check Google Sheets for results");
  console.log("💡 Next: Read and verify the data");
}

// Run the test
testWebhookProcessing().catch(console.error);
