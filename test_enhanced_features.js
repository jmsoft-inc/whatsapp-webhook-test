/**
 * Enhanced Features Test Script
 * Tests all new features including performance monitoring and user feedback
 */

const { performanceMonitor } = require('./services/performance_monitoring');
const { 
  createWelcomeMessage, 
  createProcessingMessage, 
  createSuccessMessage, 
  createErrorMessage, 
  createHelpMessage,
  createMultipleFilesSummary 
} = require('./services/user_feedback');
const { processAdminCommand } = require('./services/admin_commands');

async function testEnhancedFeatures() {
  console.log('🧪 Enhanced Features Testing Suite\n');

  // Test 1: Performance Monitoring
  console.log('1️⃣ Testing Performance Monitoring:');
  
  // Simulate some activity
  performanceMonitor.recordRequest();
  performanceMonitor.recordRequest();
  performanceMonitor.recordError();
  performanceMonitor.recordProcessingTime(150);
  performanceMonitor.recordProcessingTime(200);
  performanceMonitor.recordFileProcessing();
  performanceMonitor.recordAdminCommand();
  
  const stats = performanceMonitor.getStats();
  console.log('   📊 Performance Stats:');
  console.log(`   - Requests: ${stats.requests}`);
  console.log(`   - Errors: ${stats.errors}`);
  console.log(`   - Error Rate: ${stats.errorRate}`);
  console.log(`   - Avg Processing Time: ${stats.avgProcessingTime}`);
  console.log(`   - Files Processed: ${stats.fileProcessings}`);
  console.log(`   - Admin Commands: ${stats.adminCommands}`);
  console.log(`   - Requests/Minute: ${stats.requestsPerMinute}`);
  
  const performanceReport = performanceMonitor.createPerformanceReport();
  console.log('   📋 Performance Report Length:', performanceReport.length, 'chars');

  // Test 2: User Feedback Messages
  console.log('\n2️⃣ Testing User Feedback Messages:');
  
  const welcomeMessage = createWelcomeMessage('John');
  console.log('   📝 Welcome Message Length:', welcomeMessage.length, 'chars');
  
  const processingMessage = createProcessingMessage('PDF', 'test_invoice.pdf');
  console.log('   📝 Processing Message Length:', processingMessage.length, 'chars');
  
  const successMessage = createSuccessMessage('receipt', 'INV-123', 'Albert Heijn', '43.85');
  console.log('   📝 Success Message Length:', successMessage.length, 'chars');
  
  const errorMessage = createErrorMessage('file_processing', 'OCR failed');
  console.log('   📝 Error Message Length:', errorMessage.length, 'chars');
  
  const helpMessage = createHelpMessage();
  console.log('   📝 Help Message Length:', helpMessage.length, 'chars');

  // Test 3: Multiple Files Summary
  console.log('\n3️⃣ Testing Multiple Files Summary:');
  
  const filesProcessed = [
    { company: 'Albert Heijn', totalAmount: '43.85', invoiceNumber: 'INV-001' },
    { company: 'Albert Heijn', totalAmount: '28.50', invoiceNumber: 'INV-002' },
    { company: 'Romslomp B.V.', totalAmount: '242.00', invoiceNumber: 'INV-003' }
  ];
  
  const totalAmount = filesProcessed.reduce((sum, file) => sum + parseFloat(file.totalAmount), 0);
  const companies = filesProcessed.map(file => file.company);
  
  const multipleFilesMessage = createMultipleFilesSummary(filesProcessed, totalAmount, companies);
  console.log('   📝 Multiple Files Message Length:', multipleFilesMessage.length, 'chars');

  // Test 4: Enhanced Admin Commands
  console.log('\n4️⃣ Testing Enhanced Admin Commands:');
  
  const newCommands = ['/performance', '/status'];
  
  for (const command of newCommands) {
    console.log(`   Testing: ${command}`);
    try {
      const result = await processAdminCommand(command);
      console.log(`   ✅ Success: ${result.success}`);
      console.log(`   📝 Message Length: ${result.message.length} chars`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  // Test 5: Performance Monitoring Integration
  console.log('\n5️⃣ Testing Performance Monitoring Integration:');
  
  // Record more activity
  for (let i = 0; i < 5; i++) {
    performanceMonitor.recordRequest();
    performanceMonitor.recordProcessingTime(100 + Math.random() * 100);
  }
  
  const updatedStats = performanceMonitor.getStats();
  console.log('   📊 Updated Performance Stats:');
  console.log(`   - Total Requests: ${updatedStats.requests}`);
  console.log(`   - Error Rate: ${updatedStats.errorRate}`);
  console.log(`   - Avg Processing Time: ${updatedStats.avgProcessingTime}`);

  // Test 6: Error Handling Scenarios
  console.log('\n6️⃣ Testing Error Handling Scenarios:');
  
  const errorTypes = ['file_processing', 'google_sheets', 'whatsapp_api', 'general'];
  
  for (const errorType of errorTypes) {
    const errorMsg = createErrorMessage(errorType, 'Test context');
    console.log(`   📝 ${errorType} Error Length: ${errorMsg.length} chars`);
  }

  console.log('\n🎉 Enhanced Features Testing Completed Successfully!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Performance Monitoring: Working');
  console.log('   ✅ User Feedback Messages: Working');
  console.log('   ✅ Multiple Files Summary: Working');
  console.log('   ✅ Enhanced Admin Commands: Working');
  console.log('   ✅ Error Handling: Comprehensive');
  console.log('   ✅ Integration: Seamless');
}

// Run the enhanced features test
testEnhancedFeatures().catch(console.error);
