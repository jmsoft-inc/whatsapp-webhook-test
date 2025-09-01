const fs = require("fs");
const path = require("path");

// Simulate WhatsApp webhook payload for multiple documents
function createMultiDocumentPayload() {
  const testFiles = [
    "20250901_152450.jpg",
    "AH_kassabon_2025-08-22 125400_1427.pdf",
    "factuur rompslomp.pdf",
    "jpg AH_kassabon.jpeg",
    "I am sharing '3151351' with you.pdf",
  ];

  // Test configuration
  const senderNumber = "31639591370"; // Your number
  const testReceiverNumber = "15551949952"; // Test number

  const messages = testFiles.map((filename, index) => ({
    id: `wamid.test${Date.now()}_${index}`,
    from: senderNumber,
    timestamp: Math.floor(Date.now() / 1000) + index,
    type: "document",
    document: {
      filename: filename,
      mime_type: filename.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
      sha256: `test_sha_${index}`,
      id: `doc_id_${index}`,
    },
  }));

  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "test_entry",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: { phone_number_id: "test_phone_id" },
              messages: messages,
            },
            field: "messages",
          },
        ],
      },
    ],
  };
}

// Simulate sending webhook to local server
async function simulateWebhook() {
  const payload = createMultiDocumentPayload();

  console.log("🚀 Simulating WhatsApp webhook with multiple documents...");
  console.log(
    `📱 Simulating ${payload.entry[0].changes[0].value.messages.length} documents from user`
  );

  try {
    const response = await fetch("http://localhost:3000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(`📡 Webhook response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📄 Response: ${responseText}`);

    return true;
  } catch (error) {
    console.error("❌ Error sending webhook:", error.message);
    return false;
  }
}

// Test the analysis library directly first
async function testAnalysisLibrary() {
  console.log("🧪 Testing Analysis Library Directly...\n");

  const InvoiceAnalysisLibrary = require("./services/invoice_analysis_library");
  const library = new InvoiceAnalysisLibrary();

  const testFiles = [
    "../tests/bonnentjes/20250901_152450.jpg",
    "../tests/bonnentjes/AH_kassabon_2025-08-22 125400_1427.pdf",
    "../tests/bonnentjes/factuur rompslomp.pdf",
    "../tests/bonnentjes/jpg AH_kassabon.jpeg",
    "../tests/bonnentjes/I am sharing '3151351' with you.pdf",
  ];

  const results = [];

  for (let i = 0; i < testFiles.length; i++) {
    const filePath = testFiles[i];
    const filename = path.basename(filePath);

    console.log(`🔍 Testing ${i + 1}/${testFiles.length}: ${filename}`);

    try {
      const result = await library.analyzeDocument(filePath, { filename });
      const analysis = result.analysis;

      // Extract key information for summary
      const summary = {
        filename,
        company: analysis?.company_info?.name || "Unknown",
        date: analysis?.transaction_info?.date || "Unknown",
        total: analysis?.financial_info?.total_amount || 0,
        currency: analysis?.financial_info?.currency || "EUR",
        confidence: analysis?.document_info?.confidence || 0,
        hasNBValues: JSON.stringify(result).includes('"NB"'),
      };

      results.push(summary);

      console.log(`   ✅ Company: ${summary.company}`);
      console.log(`   ✅ Date: ${summary.date}`);
      console.log(`   ✅ Total: €${summary.total}`);
      console.log(`   ✅ Confidence: ${summary.confidence}`);
      console.log(
        `   ${summary.hasNBValues ? "❌" : "✅"} Contains NB values: ${
          summary.hasNBValues
        }`
      );
      console.log("");
    } catch (error) {
      console.error(`   ❌ Error analyzing ${filename}:`, error.message);
      results.push({
        filename,
        error: error.message,
        hasNBValues: true,
      });
    }
  }

  // Create summary message like WhatsApp would send
  console.log("📋 SUMMARY - What would be sent to WhatsApp:");
  console.log("=".repeat(60));

  const summaryMessage = `📊 Verwerkte Facturen Overzicht (${
    results.length
  } documenten):

${results
  .map((result, index) => {
    if (result.error) {
      return `${index + 1}. ❌ ${result.filename} - Error: ${result.error}`;
    }
    return `${index + 1}. 📄 ${result.filename}
   🏢 Bedrijf: ${result.company}
   📅 Datum: ${result.date}
   💰 Totaal: €${result.total}
   🎯 Betrouwbaarheid: ${result.confidence}%`;
  })
  .join("\n\n")}

✅ Alle documenten succesvol verwerkt!
📊 Totaal aantal documenten: ${results.length}
❌ Documenten met fouten: ${results.filter((r) => r.error).length}
⚠️ Documenten met NB waarden: ${results.filter((r) => r.hasNBValues).length}`;

  console.log(summaryMessage);
  console.log("=".repeat(60));

  return results;
}

// Main test function
async function runTests() {
  // Set environment variables for local simulation
  process.env.TEST_MODE = "true";
  process.env.LOCAL_SIMULATION_MODE = "true";

  console.log("🎯 WhatsApp Invoice Processing - Local Test\n");
  console.log(
    "🔄 LOCAL SIMULATION MODE: No real WhatsApp messages will be sent\n"
  );

  // Test 1: Direct analysis
  console.log("📋 TEST 1: Direct Analysis Library Test");
  const analysisResults = await testAnalysisLibrary();

  console.log("\n📋 TEST 2: Webhook Simulation Test");
  console.log("🔄 Checking if server is running...");

  try {
    const healthCheck = await fetch("http://localhost:3000/health");
    if (healthCheck.ok) {
      console.log(
        "✅ Server is running, proceeding with webhook simulation..."
      );
      await simulateWebhook();
    } else {
      console.log("❌ Server health check failed");
    }
  } catch (error) {
    console.log("❌ Server not running. Start server with: node app.js");
    console.log("💡 For now, we have tested the analysis library directly.");
  }

  // Summary
  console.log("\n📊 FINAL SUMMARY:");
  console.log(`✅ Documents analyzed: ${analysisResults.length}`);
  console.log(
    `❌ Documents with errors: ${analysisResults.filter((r) => r.error).length}`
  );
  console.log(
    `⚠️ Documents with NB values: ${
      analysisResults.filter((r) => r.hasNBValues).length
    }`
  );

  if (analysisResults.filter((r) => r.hasNBValues).length === 0) {
    console.log("🎉 SUCCESS: No more NB values in analysis!");
  } else {
    console.log("⚠️ WARNING: Some documents still contain NB values");
  }
}

// Run the tests
runTests().catch(console.error);
