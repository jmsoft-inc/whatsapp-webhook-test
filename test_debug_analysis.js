const InvoiceAnalysisLibrary = require("./services/invoice_analysis_library");
const fs = require("fs");
const path = require("path");

async function debugAnalysis() {
  console.log("🔍 Debug Analysis Test\n");

  const library = new InvoiceAnalysisLibrary();
  const filePath = "../tests/bonnentjes/jpg AH_kassabon.jpeg";

  console.log("📄 Testing file:", path.basename(filePath));

  // Step 1: Extract text
  console.log("\n🔤 Step 1: Text Extraction");
  const documentType = library.detectDocumentType(filePath);
  console.log(`Document type detected: ${documentType}`);

  const extractedText = await library.extractText(filePath, documentType);
  console.log(`Extracted text length: ${extractedText.length} characters`);
  console.log(`Text preview: ${extractedText.substring(0, 200)}...`);

  // Step 2: Check if Albert Heijn is in the text
  console.log("\n🏢 Step 2: Company Detection");
  const lowerText = extractedText.toLowerCase();
  console.log(`Contains "albert heijn": ${lowerText.includes("albert heijn")}`);
  console.log(`Contains "ah": ${lowerText.includes("ah")}`);
  console.log(`Contains "albert": ${lowerText.includes("albert")}`);
  console.log(`Contains "heijn": ${lowerText.includes("heijn")}`);

  // Step 3: Test extractActualDataFromText directly
  console.log("\n🧠 Step 3: Direct extractActualDataFromText test");
  const extractedData = library.extractActualDataFromText(
    extractedText,
    documentType
  );
  console.log("Extracted data:", {
    confidence: extractedData.confidence,
    company: extractedData.company,
    transaction: extractedData.transaction,
    financial: extractedData.financial,
  });

  // Step 4: Test full analysis
  console.log("\n📊 Step 4: Full Analysis");
  const fullAnalysis = await library.analyzeDocument(filePath);
  console.log("Full analysis result:", {
    success: fullAnalysis.success,
    documentType: fullAnalysis.documentType,
    analysis: fullAnalysis.analysis
      ? {
          document_info: fullAnalysis.analysis.document_info,
          company_info: fullAnalysis.analysis.company_info,
          transaction_info: fullAnalysis.analysis.transaction_info,
          financial_info: fullAnalysis.analysis.financial_info,
        }
      : null,
  });

  // Step 5: Test with known good text
  console.log("\n✅ Step 5: Test with known good text");
  const goodText =
    "Albert Heijn kassabon 22/08/2025 12:55 Totaal: €43.85 BTW: €3.20";
  const goodExtracted = library.extractActualDataFromText(
    goodText,
    "albert_heijn_receipt"
  );
  console.log("Good text extracted:", {
    confidence: goodExtracted.confidence,
    company: goodExtracted.company,
    transaction: goodExtracted.transaction,
    financial: goodExtracted.financial,
  });
}

debugAnalysis().catch(console.error);
