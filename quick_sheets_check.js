// Quick check of Google Sheets data
console.log('🔍 Quick check of Google Sheets data...\n');

const ComprehensiveSheetsService = require('./services/sheets_services/comprehensive_sheets_service');

async function quickCheck() {
  try {
    const sheetsService = new ComprehensiveSheetsService();
    await sheetsService.initialize();
    
    console.log('✅ Sheets service initialized');
    
    // Check Comprehensive Analysis tab
    const response = await sheetsService.sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Comprehensive Analysis!A:Z'
    });
    
    const rows = response.data.values || [];
    console.log(`📊 Found ${rows.length} rows in Comprehensive Analysis tab`);
    
    if (rows.length > 0) {
      console.log('\n📋 Headers:', rows[0]);
      
      if (rows.length > 1) {
        console.log('\n📄 First data row:', rows[1]);
        console.log('\n📄 Last data row:', rows[rows.length - 1]);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking sheets:', error.message);
  }
}

quickCheck();
