/**
 * Local Test Script for Invoice Analysis
 * Tests the analysis library with test documents and simulates WhatsApp messaging
 */

const path = require('path');
const fs = require('fs');

// Import the invoice analysis library
const InvoiceAnalysisLibrary = require('./services/invoice_analysis_library');

// Test configuration
const TEST_DOCUMENTS_DIR = '../tests/bonnentjes';
const OUTPUT_FILE = './test_results_local.json';

// Initialize the library
const invoiceLibrary = new InvoiceAnalysisLibrary();

/**
 * Simulate WhatsApp message formatting
 */
function simulateWhatsAppMessage(invoiceData, documentNumber) {
  const company = invoiceData.company_info?.name || invoiceData.company || "Onbekend";
  const amount = invoiceData.financial_info?.total_amount || invoiceData.total_amount || 0;
  const date = invoiceData.transaction_info?.date || invoiceData.date || "Onbekend";
  const time = invoiceData.transaction_info?.time || invoiceData.time || "Onbekend";
  const items = invoiceData.item_summary?.total_items || invoiceData.item_count || 0;
  const payment = invoiceData.financial_info?.payment_method || invoiceData.payment_method || "Onbekend";
  const confidence = invoiceData.document_info?.confidence || invoiceData.confidence || 0;

  return `📄 *Document ${documentNumber} Verwerkt!*

🔍 *Document Type:* ${invoiceData.document_info?.type || "Onbekend"}
🏪 *Bedrijf:* ${company}
💰 *Totaalbedrag:* €${amount}
📅 *Datum:* ${date}
🕐 *Tijd:* ${time}
📊 *Items:* ${items} artikelen
💳 *Betaalmethode:* ${payment}
🎯 *Betrouwbaarheid:* ${confidence}%

*Extra Details:*
📝 *Opmerkingen:* ${invoiceData.notes || "Geen opmerkingen"}
🔍 *Document Type:* ${invoiceData.document_info?.subtype || "Onbekend"}
🌍 *Taal:* ${invoiceData.document_info?.language || "Onbekend"}`;
}

/**
 * Simulate multiple invoices summary
 */
function simulateMultipleInvoicesSummary(invoices) {
  let totalAmount = 0;
  let totalItems = 0;
  const companies = new Set();

  invoices.forEach((invoice) => {
    totalAmount += parseFloat(invoice.financial_info?.total_amount || invoice.total_amount || 0);
    totalItems += parseInt(invoice.item_summary?.total_items || invoice.item_count || 0);
    if (invoice.company_info?.name) companies.add(invoice.company_info.name);
  });

  let responseMessage = `📊 *Meerdere Documenten Verwerking Voltooid!*

📄 *Aantal documenten:* ${invoices.length}
🏪 *Bedrijven:* ${Array.from(companies).join(", ") || "Onbekend"}
💰 *Totaalbedrag:* €${totalAmount.toFixed(2)}
📊 *Totaal items:* ${totalItems}
📅 *Verwerkt op:* ${new Date().toLocaleDateString("nl-NL")}

📋 *Alle Documenten Overzicht:*`;

  // Add details for ALL documents
  invoices.forEach((invoice, index) => {
    const docNum = index + 1;
    const company = invoice.company_info?.name || invoice.company || "Onbekend";
    const amount =
      invoice.financial_info?.total_amount || invoice.total_amount || 0;
    const date = invoice.transaction_info?.date || invoice.date || "Onbekend";
    const items = invoice.item_summary?.total_items || invoice.item_count || 0;
    const payment =
      invoice.financial_info?.payment_method ||
      invoice.payment_method ||
      "Onbekend";
    const confidence =
      invoice.document_info?.confidence || invoice.confidence || 0;

    responseMessage += `\n\n*Document ${docNum}:*
🏪 ${company}
💰 €${amount}
📅 ${date}
📊 ${items} items
💳 ${payment}
🎯 ${confidence}% betrouwbaarheid`;
  });

  responseMessage += `\n\n✅ *Alle data opgeslagen in Google Sheets*
📊 *Bekijk de spreadsheet:* [Google Sheets URL]

📈 *Batch #${Date.now()}*

*Bedankt voor het gebruik van JMSoft AI Document Processor!*`;

  return responseMessage;
}

/**
 * Test a single document
 */
async function testDocument(filePath, documentNumber) {
  try {
    console.log(`\n🔍 Testing document ${documentNumber}: ${path.basename(filePath)}`);
    
    // Analyze the document
    const result = await invoiceLibrary.analyzeDocument(filePath, {
      invoiceNumber: `TEST-${documentNumber}`,
      userPhone: '+31612345678',
      sessionMode: 'single'
    });

    if (!result.success) {
      console.error(`❌ Analysis failed: ${result.error}`);
      return null;
    }

    // Simulate WhatsApp message
    const whatsappMessage = simulateWhatsAppMessage(result.analysis, documentNumber);
    
    console.log(`✅ Analysis successful`);
    console.log(`📊 Company: ${result.analysis.company_info?.name || 'Unknown'}`);
    console.log(`💰 Amount: €${result.analysis.financial_info?.total_amount || 0}`);
    console.log(`📅 Date: ${result.analysis.transaction_info?.date || 'Unknown'}`);
    console.log(`🎯 Confidence: ${result.analysis.document_info?.confidence || 0}%`);
    
    return {
      filePath,
      documentNumber,
      analysis: result.analysis,
      whatsappMessage,
      success: true
    };

  } catch (error) {
    console.error(`❌ Error testing document ${documentNumber}:`, error.message);
    return {
      filePath,
      documentNumber,
      error: error.message,
      success: false
    };
  }
}

/**
 * Test all documents in sequence
 */
async function testAllDocuments() {
  console.log('🚀 Starting local analysis test...');
  
  try {
    // Check if test directory exists
    if (!fs.existsSync(TEST_DOCUMENTS_DIR)) {
      console.error(`❌ Test directory not found: ${TEST_DOCUMENTS_DIR}`);
      return;
    }

    // Get all test files
    const files = fs.readdirSync(TEST_DOCUMENTS_DIR)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.pdf', '.jpg', '.jpeg', '.png'].includes(ext);
      })
      .map(file => path.join(TEST_DOCUMENTS_DIR, file));

    console.log(`📁 Found ${files.length} test files:`);
    files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${path.basename(file)}`);
    });

    if (files.length === 0) {
      console.log('❌ No test files found');
      return;
    }

    // Test each document individually
    const individualResults = [];
    for (let i = 0; i < files.length; i++) {
      const result = await testDocument(files[i], i + 1);
      if (result) {
        individualResults.push(result);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test multiple documents summary
    const successfulResults = individualResults.filter(r => r.success);
    if (successfulResults.length > 0) {
      console.log('\n📊 Testing multiple documents summary...');
      const multipleSummary = simulateMultipleInvoicesSummary(
        successfulResults.map(r => r.analysis)
      );
      
      console.log('\n📱 Multiple Documents WhatsApp Message:');
      console.log('=' .repeat(80));
      console.log(multipleSummary);
      console.log('=' .repeat(80));
    }

    // Save results to file
    const testResults = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      successfulAnalyses: successfulResults.length,
      individualResults,
      multipleSummary: successfulResults.length > 0 ? simulateMultipleInvoicesSummary(
        successfulResults.map(r => r.analysis)
      ) : null
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Test results saved to: ${OUTPUT_FILE}`);

    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`✅ Successful analyses: ${successfulResults.length}/${files.length}`);
    console.log(`❌ Failed analyses: ${files.length - successfulResults.length}`);
    
    if (successfulResults.length > 0) {
      console.log('\n🏆 Best performing document:');
      const bestResult = successfulResults.reduce((best, current) => {
        const bestConfidence = best.analysis.document_info?.confidence || 0;
        const currentConfidence = current.analysis.document_info?.confidence || 0;
        return currentConfidence > bestConfidence ? current : best;
      });
      
      console.log(`   📄 ${path.basename(bestResult.filePath)}`);
      console.log(`   🎯 Confidence: ${bestResult.analysis.document_info?.confidence || 0}%`);
      console.log(`   🏪 Company: ${bestResult.analysis.company_info?.name || 'Unknown'}`);
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

/**
 * Test specific document types
 */
async function testSpecificDocumentTypes() {
  console.log('\n🔬 Testing specific document type detection...');
  
  const testCases = [
    { name: 'Albert Heijn Receipt', content: 'ALBERT HEIJN\nTotaal: €25,50\nBTW: €4,50' },
    { name: 'Studiekosten Invoice', content: 'Studiekosten\nFactuurnummer: 12345\nBedrag: €295,92' },
    { name: 'Rompslomp Document', content: 'Rompslomp\nFactuur\nTotaal: €150,00' },
    { name: 'Generic PDF', content: '%PDF-1.4\nSome generic content\nTotal: €0,00' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📄 Testing: ${testCase.name}`);
      
      // Create a temporary file for testing
      const tempFile = `./temp_test_${Date.now()}.txt`;
      fs.writeFileSync(tempFile, testCase.content);
      
      const result = await invoiceLibrary.analyzeDocument(tempFile, {
        invoiceNumber: 'TEST-TYPE',
        userPhone: '+31612345678',
        sessionMode: 'single'
      });
      
      if (result.success) {
        console.log(`   ✅ Success: ${result.documentType}`);
        console.log(`   🏪 Company: ${result.analysis.company_info?.name || 'Unknown'}`);
        console.log(`   🎯 Confidence: ${result.analysis.document_info?.confidence || 0}%`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
      
      // Clean up temp file
      fs.unlinkSync(tempFile);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
}

// Run the tests
async function runTests() {
  console.log('🧪 JMSoft AI Document Processor - Local Test Suite');
  console.log('=' .repeat(60));
  
  try {
    // Test all documents
    await testAllDocuments();
    
    // Test specific document types
    await testSpecificDocumentTypes();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testDocument,
  testAllDocuments,
  simulateWhatsAppMessage,
  simulateMultipleInvoicesSummary
};
