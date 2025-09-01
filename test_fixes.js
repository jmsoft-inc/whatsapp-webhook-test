/**
 * Test script to verify fixes for reported issues
 */

const { generateInvoiceNumber } = require('./services/improved_invoice_processing');
const { processAdminCommand } = require('./services/admin_commands');

async function testFixes() {
  console.log('🧪 Testing fixes for reported issues...\n');

  // Test 1: Invoice number generation (should be unique)
  console.log('1️⃣ Testing invoice number generation:');
  const invoiceNumbers = [];
  for (let i = 0; i < 5; i++) {
    const invoiceNumber = generateInvoiceNumber();
    invoiceNumbers.push(invoiceNumber);
    console.log(`   Invoice ${i + 1}: ${invoiceNumber}`);
  }
  
  // Check for duplicates
  const uniqueNumbers = new Set(invoiceNumbers);
  if (uniqueNumbers.size === invoiceNumbers.length) {
    console.log('   ✅ All invoice numbers are unique');
  } else {
    console.log('   ❌ Duplicate invoice numbers found');
  }

  // Test 2: Admin commands (should handle missing credentials gracefully)
  console.log('\n2️⃣ Testing admin commands:');
  const testCommands = ['/help', '/stats', '/clear', '/reset'];
  
  for (const command of testCommands) {
    console.log(`   Testing: ${command}`);
    try {
      const result = await processAdminCommand(command);
      console.log(`   ✅ Success: ${result.success}`);
      console.log(`   📝 Message: ${result.message.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 Fix verification completed!');
}

// Run the test
testFixes().catch(console.error);
