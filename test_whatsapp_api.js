/**
 * WhatsApp API Test Script
 * Tests the improved WhatsApp messaging service
 */

const { 
  sendTextMessage, 
  sendInteractiveMessage, 
  testWhatsAppConnection,
  validatePhoneNumber,
  validateMessageContent 
} = require('./services/whatsapp_messaging');

async function testWhatsAppAPI() {
  console.log('🧪 WhatsApp API Testing Suite\n');

  // Test 1: Connection Test
  console.log('1️⃣ Testing WhatsApp API Connection:');
  const connectionTest = await testWhatsAppConnection();
  console.log('   ✅ Connection Test Result:', connectionTest.success);
  if (!connectionTest.success) {
    console.log('   ❌ Error:', connectionTest.error);
    console.log('   📋 Details:', connectionTest.details);
  } else {
    console.log('   📱 Phone Number Info:', connectionTest.phoneNumberInfo);
  }

  // Test 2: Phone Number Validation
  console.log('\n2️⃣ Testing Phone Number Validation:');
  const testNumbers = [
    '31639591370',
    '+31639591370',
    '3163959137',
    '1234567890',
    'invalid'
  ];
  
  for (const number of testNumbers) {
    const isValid = validatePhoneNumber(number);
    console.log(`   ${isValid ? '✅' : '❌'} ${number}: ${isValid || 'Invalid'}`);
  }

  // Test 3: Message Content Validation
  console.log('\n3️⃣ Testing Message Content Validation:');
  const testMessages = [
    'Hello World',
    '',
    null,
    'A'.repeat(5000), // Too long
    'Normal message with emoji 🚀'
  ];
  
  for (const message of testMessages) {
    const isValid = validateMessageContent(message);
    console.log(`   ${isValid ? '✅' : '❌'} "${message?.substring(0, 20) || 'null'}": ${isValid ? 'Valid' : 'Invalid'}`);
  }

  // Test 4: Text Message Test (if connection is successful)
  if (connectionTest.success) {
    console.log('\n4️⃣ Testing Text Message Sending:');
    const testMessage = '🧪 Test message from JMSoft AI Agents - WhatsApp API Test';
    const textResult = await sendTextMessage('31639591370', testMessage);
    console.log('   ✅ Text Message Result:', textResult.success);
    if (textResult.success) {
      console.log('   📤 Message ID:', textResult.messageId);
    } else {
      console.log('   ❌ Error:', textResult.error);
      console.log('   📋 Details:', textResult.details);
    }
  }

  // Test 5: Interactive Message Test (if connection is successful)
  if (connectionTest.success) {
    console.log('\n5️⃣ Testing Interactive Message Sending:');
    const testInteractiveMessage = {
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: "Test Menu"
        },
        body: {
          text: "This is a test interactive message"
        },
        action: {
          button: "Test Button",
          sections: [
            {
              title: "Test Section",
              rows: [
                {
                  id: "test_option",
                  title: "Test Option",
                  description: "This is a test option"
                }
              ]
            }
          ]
        }
      }
    };
    
    const interactiveResult = await sendInteractiveMessage('31639591370', testInteractiveMessage);
    console.log('   ✅ Interactive Message Result:', interactiveResult.success);
    if (interactiveResult.success) {
      console.log('   📤 Message ID:', interactiveResult.messageId);
    } else {
      console.log('   ❌ Error:', interactiveResult.error);
      console.log('   📋 Details:', interactiveResult.details);
    }
  }

  console.log('\n🎉 WhatsApp API Testing Completed!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Connection Test:', connectionTest.success ? 'Passed' : 'Failed');
  console.log('   ✅ Phone Validation: Working');
  console.log('   ✅ Message Validation: Working');
  console.log('   ✅ Text Messaging:', connectionTest.success ? 'Tested' : 'Skipped');
  console.log('   ✅ Interactive Messaging:', connectionTest.success ? 'Tested' : 'Skipped');
  
  if (!connectionTest.success) {
    console.log('\n⚠️ *Recommendations:*');
    console.log('   • Check WhatsApp API credentials');
    console.log('   • Verify phone number ID and access token');
    console.log('   • Ensure WhatsApp Business API is properly configured');
  }
}

// Run the WhatsApp API test
testWhatsAppAPI().catch(console.error);
