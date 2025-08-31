const { setupGoogleSheetsHeaders } = require('./services/improved_invoice_processing.js');

console.log('🔄 Restoring Google Sheets styling...');

async function restoreStyling() {
  try {
    const result = await setupGoogleSheetsHeaders();
    if (result) {
      console.log('✅ Google Sheets styling restored successfully!');
    } else {
      console.log('❌ Failed to restore Google Sheets styling');
    }
  } catch (error) {
    console.error('❌ Error restoring Google Sheets styling:', error.message);
  }
}

restoreStyling();
