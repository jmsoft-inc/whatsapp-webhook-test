const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extractRomslompPDF() {
  try {
    console.log('📄 Extracting Romslomp PDF...');
    
    const pdfPath = path.join(__dirname, '../tests/bonnentjes/factuur rompslomp.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    const data = await pdfParse(dataBuffer);
    const extractedText = data.text;
    
    console.log('📝 Extracted text from Romslomp PDF:');
    console.log('=' .repeat(80));
    console.log(extractedText);
    console.log('=' .repeat(80));
    
    // Save extracted text to file for analysis
    const outputPath = path.join(__dirname, 'romslomp_extracted_text.txt');
    fs.writeFileSync(outputPath, extractedText);
    console.log(`💾 Extracted text saved to: ${outputPath}`);
    
    return extractedText;
  } catch (error) {
    console.error('❌ Error extracting PDF:', error);
    throw error;
  }
}

// Run the extraction
extractRomslompPDF().then(() => {
  console.log('✅ PDF extraction completed!');
}).catch(error => {
  console.error('❌ Extraction failed:', error);
});
