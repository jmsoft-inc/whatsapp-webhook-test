const { processAdminCommand } = require('./services/admin_commands');

console.log('🧪 Testing Admin Commands...\n');

async function testAdminCommands() {
  const commands = [
    '/help',
    '/stats',
    '/clear',
    '/reset',
    '/delete INV-TEST-123'
  ];

  for (const command of commands) {
    console.log(`\n🔧 Testing command: "${command}"`);
    console.log('=' .repeat(50));
    
    try {
      const result = await processAdminCommand(command);
      console.log(`✅ Success: ${result.success}`);
      console.log(`📝 Message: ${result.message}`);
      
      if (result.details) {
        console.log(`📊 Details:`, result.details);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('=' .repeat(50));
  }
}

// Run the tests
testAdminCommands().then(() => {
  console.log('\n🎉 Admin commands test completed!');
}).catch(error => {
  console.error('\n❌ Test failed:', error);
});
