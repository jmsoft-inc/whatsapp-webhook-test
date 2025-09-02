// WhatsApp Simulation Script
// Simulates messages from +31639591370 and processes 6 test files
console.log('🧪 WhatsApp Simulation - Testing complete flow...\n');

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: "../config/credentials/.env" });

// Test files to process
const testFiles = [
  '../tests/bonnentjes/20250901_152450.jpg',
  '../tests/bonnentjes/AH_kassabon_2025-08-22 125400_1427.pdf',
  '../tests/bonnentjes/factuur rompslomp.pdf',
  '../tests/bonnentjes/jpg AH_kassabon.jpeg',
  '../tests/bonnentjes/I am sharing \'3151351\' with you.pdf',
  '../tests/bonnentjes/test_factuur_extra.pdf' // 6th test file
];

async function simulateWhatsAppFlow() {
  try {
    console.log('📋 STEP 1: Load Services');
    console.log('-'.repeat(30));
    
    const whatsappMessaging = require('./services/whatsapp_services/whatsapp_messaging');
    const InvoiceAnalysisLibrary = require('./services/ai_services/invoice_analysis_library');
    const ComprehensiveSheetsService = require('./services/sheets_services/comprehensive_sheets_service');
    const fileProcessor = require('./services/file_services/file_processor');
    
    // Create instances
    const invoiceAnalysis = new InvoiceAnalysisLibrary();
    const sheetsService = new ComprehensiveSheetsService();
    
    console.log('✅ All services loaded successfully');
    
    // Simulate WhatsApp user +31639591370
    const userPhone = '+31639591370';
    const testNumberId = '839070985945286';
    
    console.log(`📱 Simulating WhatsApp user: ${userPhone}`);
    console.log(`🆔 Test number ID: ${testNumberId}`);
    
    // Step 1: User sends "test" message
    console.log('\n📋 STEP 2: Simulate User Message');
    console.log('-'.repeat(30));
    console.log(`📤 ${userPhone} sends: "test"`);
    
    // This should trigger the help message response
    const helpMessage = "🤖 WhatsApp Invoice Agent Help\n\n📤 Stuur een foto of PDF van een factuur/bon\n📊 De agent analyseert het automatisch\n💾 Data wordt opgeslagen in Google Sheets\n\nVoor vragen, neem contact op met support.";
    
    console.log(`📥 Response: ${helpMessage}`);
    
    // Step 2: User chooses option 1 (factuur verwerken)
    console.log('\n📋 STEP 3: User Chooses Option 1');
    console.log('-'.repeat(30));
    console.log(`📤 ${userPhone} sends: "1"`);
    
    const option1Message = `📄 **Factuur Verwerking**

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
    
    console.log(`📥 Response: ${option1Message.substring(0, 100)}...`);
    
    // Step 3: Process 6 test files
    console.log('\n📋 STEP 4: Process 6 Test Files');
    console.log('-'.repeat(30));
    
    let processedCount = 0;
    let successCount = 0;
    
    for (const filePath of testFiles) {
      const filename = path.basename(filePath);
      const fullPath = path.resolve(__dirname, filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ File not found: ${filename}`);
        continue;
      }
      
      console.log(`\n📄 Processing: ${filename}`);
      processedCount++;
      
      try {
        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}-${process.pid}`;
        console.log(`📊 Invoice number: ${invoiceNumber}`);
        
        // Step 1: Extract text from file
        console.log('📝 Extracting text from file...');
        
        // Determine MIME type from file extension
        const fileExtension = path.extname(filename).toLowerCase();
        let mimeType = 'application/octet-stream';
        
        if (['.jpg', '.jpeg'].includes(fileExtension)) {
          mimeType = 'image/jpeg';
        } else if (fileExtension === '.png') {
          mimeType = 'image/png';
        } else if (fileExtension === '.pdf') {
          mimeType = 'application/pdf';
        } else if (['.txt'].includes(fileExtension)) {
          mimeType = 'text/plain';
        }
        
        console.log(`📋 Detected MIME type: ${mimeType}`);
        const extractedText = await fileProcessor.extractTextFromFile(fullPath, mimeType);
        
        if (!extractedText) {
          console.log('⚠️ No text extracted from file');
          continue;
        }
        
        // Handle both string and object responses
        const textContent = typeof extractedText === 'string' ? extractedText : extractedText.text;
        
        if (!textContent || textContent.length < 10) {
          console.log('⚠️ Insufficient text extracted from file');
          continue;
        }
        
        console.log(`✅ Text extracted: ${textContent.length} characters`);
        
        // Step 2: Analyze with AI
        console.log('🤖 Analyzing with AI...');
        const analysisResult = await invoiceAnalysis.analyzeDocument(fullPath);
        
        if (!analysisResult) {
          console.log('❌ AI analysis failed');
          continue;
        }
        
        console.log('✅ AI analysis completed');
        
        // Step 3: Save to Google Sheets
        console.log('💾 Saving to Google Sheets...');
        const sheetsResult = await sheetsService.saveComprehensiveAnalysis(analysisResult, invoiceNumber);
        
        if (sheetsResult) {
          console.log('✅ Data saved to Google Sheets successfully');
          successCount++;
          
          // Send success message to user
          const successMessage = `🎉 ${filename} succesvol verwerkt!\n\n📊 Factuurnummer: ${invoiceNumber}\n🏢 Bedrijf: ${analysisResult.analysis?.company_info?.name || 'Onbekend'}\n💰 Totaal: €${analysisResult.analysis?.financial_info?.total_amount || 'Onbekend'}\n📅 Datum: ${analysisResult.analysis?.financial_info?.date || 'Onbekend'}\n\n✅ Data is opgeslagen in Google Sheets`;
          
          console.log(`📤 Sending success message to ${userPhone}:`);
          console.log(successMessage.substring(0, 100) + '...');
          
        } else {
          console.log('❌ Failed to save to Google Sheets');
        }
        
        console.log(`✅ ${filename} processed successfully`);
        
      } catch (error) {
        console.log(`❌ Error processing ${filename}:`, error.message);
      }
      
      // Wait a bit between files
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Final summary
    console.log('\n📋 STEP 5: Final Summary');
    console.log('-'.repeat(30));
    console.log(`📊 Files processed: ${processedCount}`);
    console.log(`✅ Successfully saved: ${successCount}`);
    console.log(`❌ Failed: ${processedCount - successCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Test completed successfully!');
      console.log('📋 Check Google Sheets for the processed data');
      console.log('💡 All files should now be stored with proper analysis');
    } else {
      console.log('\n❌ Test failed - no files were processed successfully');
    }
    
  } catch (error) {
    console.log('❌ Error in WhatsApp simulation:', error.message);
  }
}

// Run the simulation
simulateWhatsAppFlow().catch(console.error);
