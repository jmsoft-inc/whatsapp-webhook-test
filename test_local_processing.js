// Local test that processes files directly without WhatsApp download
console.log("🧪 Testing local file processing...\n");

const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: "../config/credentials/.env" });

// Test files to process
const testFiles = [
  "../tests/bonnentjes/20250901_152450.jpg",
  "../tests/bonnentjes/AH_kassabon_2025-08-22 125400_1427.pdf",
  "../tests/bonnentjes/factuur rompslomp.pdf",
  "../tests/bonnentjes/jpg AH_kassabon.jpeg",
  "../tests/bonnentjes/I am sharing '3151351' with you.pdf",
];

async function testLocalProcessing() {
  try {
    console.log("📋 STEP 1: Load Services");
    console.log("-".repeat(30));

    const InvoiceAnalysisLibrary = require("./services/ai_services/invoice_analysis_library");
    const ComprehensiveSheetsService = require("./services/sheets_services/comprehensive_sheets_service");
    const fileProcessor = require("./services/file_services/file_processor");

    // Create instances
    const invoiceAnalysis = new InvoiceAnalysisLibrary();
    const sheetsService = new ComprehensiveSheetsService();

    console.log("✅ All services loaded successfully");

    // Test 1: Check available files
    console.log("\n📋 STEP 2: Check Test Files");
    console.log("-".repeat(30));

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

    // Test 2: Process each file directly
    console.log("\n📋 STEP 3: Process Files Directly");
    console.log("-".repeat(30));

    for (const fileInfo of availableFiles) {
      console.log(`\n📄 Processing: ${fileInfo.filename}`);

      try {
        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(
          Math.random() * 10000
        )}-${process.pid}`;
        console.log(`📊 Invoice number: ${invoiceNumber}`);

        // Step 1: Extract text from file
        console.log("📝 Extracting text from file...");

        // Determine MIME type from file extension
        const fileExtension = path.extname(fileInfo.filename).toLowerCase();
        let mimeType = "application/octet-stream";

        if ([".jpg", ".jpeg"].includes(fileExtension)) {
          mimeType = "image/jpeg";
        } else if (fileExtension === ".png") {
          mimeType = "image/png";
        } else if (fileExtension === ".pdf") {
          mimeType = "application/pdf";
        } else if ([".txt"].includes(fileExtension)) {
          mimeType = "text/plain";
        }

        console.log(`📋 Detected MIME type: ${mimeType}`);
        const extractedText = await fileProcessor.extractTextFromFile(
          fileInfo.fullPath,
          mimeType
        );

        if (!extractedText) {
          console.log("⚠️ No text extracted from file");
          continue;
        }

        // Handle both string and object responses
        const textContent =
          typeof extractedText === "string"
            ? extractedText
            : extractedText.text;

        if (!textContent || textContent.length < 10) {
          console.log("⚠️ Insufficient text extracted from file");
          continue;
        }

        console.log(`✅ Text extracted: ${textContent.length} characters`);
        console.log(`📋 Preview: ${textContent.substring(0, 100)}...`);

        // Step 2: Analyze with AI
        console.log("🤖 Analyzing with AI...");
        const analysisResult = await invoiceAnalysis.analyzeDocument(
          fileInfo.fullPath
        );

        if (!analysisResult) {
          console.log("❌ AI analysis failed");
          continue;
        }

        console.log("✅ AI analysis completed");
        console.log(
          `🏢 Company: ${analysisResult.company_info?.name || "Onbekend"}`
        );
        console.log(
          `💰 Total: €${
            analysisResult.financial_info?.total_amount || "Onbekend"
          }`
        );
        console.log(
          `📅 Date: ${analysisResult.financial_info?.date || "Onbekend"}`
        );

        // Step 3: Save to Google Sheets
        console.log("💾 Saving to Google Sheets...");
        const sheetsResult = await sheetsService.saveComprehensiveAnalysis(
          analysisResult,
          invoiceNumber
        );

        if (sheetsResult) {
          console.log("✅ Data saved to Google Sheets successfully");
        } else {
          console.log("❌ Failed to save to Google Sheets");
        }

        console.log(`✅ ${fileInfo.filename} processed successfully`);
      } catch (error) {
        console.log(`❌ Error processing ${fileInfo.filename}:`, error.message);
      }

      // Wait a bit between files
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("\n🎯 Local file processing test completed");
    console.log("📋 Check Google Sheets for results");
    console.log("💡 Next: Verify the data in sheets");
  } catch (error) {
    console.log("❌ Error in local processing test:", error.message);
  }
}

// Run the test
testLocalProcessing().catch(console.error);
