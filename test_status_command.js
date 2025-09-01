/**
 * Test script for the new system status command
 */

const { processAdminCommand } = require('./services/admin_commands');

async function testStatusCommand() {
  console.log('🧪 Testing System Status Command\n');

  try {
    const result = await processAdminCommand('/status');
    console.log('✅ Success:', result.success);
    console.log('📝 Message:');
    console.log(result.message);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run the test
testStatusCommand().catch(console.error);
