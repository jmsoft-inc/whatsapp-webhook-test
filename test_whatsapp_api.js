#!/usr/bin/env node
/**
 * WhatsApp API Test Script
 * Tests WhatsApp API functionality directly
 */

const axios = require('axios');

// Configuration
const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const TEST_PHONE = "31639591370";

console.log('🧪 Testing WhatsApp API...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`  PHONE_NUMBER_ID: ${PHONE_NUMBER_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`  ACCESS_TOKEN: ${ACCESS_TOKEN ? '✅ Set' : '❌ Not set'}`);
console.log(`  TEST_PHONE: ${TEST_PHONE}`);

if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
  console.log('\n❌ Missing required environment variables');
  console.log('Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN');
  process.exit(1);
}

async function testTextMessage() {
  console.log('\n📝 Testing Text Message...');
  
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: TEST_PHONE,
        type: "text",
        text: {
          body: "🧪 Test bericht van WhatsApp API"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log('✅ Text message sent successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Error sending text message');
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

async function testInteractiveMessage() {
  console.log('\n🎛️ Testing Interactive Message...');
  
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: TEST_PHONE,
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "text",
            text: "🧾 AI Invoice Processor"
          },
          body: {
            text: "Ik kan je helpen met het verwerken van facturen en bonnetjes. Kies een optie:"
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "option_1",
                  title: "📄 Meerdere facturen"
                }
              },
              {
                type: "reply",
                reply: {
                  id: "option_2",
                  title: "📋 1 factuur"
                }
              },
              {
                type: "reply",
                reply: {
                  id: "option_3",
                  title: "ℹ️ Info"
                }
              }
            ]
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    console.log('✅ Interactive message sent successfully');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Error sending interactive message');
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n🌐 Testing Webhook Endpoint...');
  
  try {
    const webhookUrl = process.env.WEBHOOK_URL || 'https://whatsapp-webhook-test-hvcc.onrender.com';
    const response = await axios.get(webhookUrl);
    
    console.log('✅ Webhook endpoint is accessible');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error accessing webhook endpoint');
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting WhatsApp API tests...\n');
  
  const results = {
    textMessage: await testTextMessage(),
    interactiveMessage: await testInteractiveMessage(),
    webhookEndpoint: await testWebhookEndpoint()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`  Text Message: ${results.textMessage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Interactive Message: ${results.interactiveMessage ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Webhook Endpoint: ${results.webhookEndpoint ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed!');
    console.log('✅ WhatsApp API is working correctly');
  } else {
    console.log('\n❌ Some tests failed');
    console.log('🔧 Check the error messages above for troubleshooting');
  }
  
  console.log('\n📚 Next steps:');
  console.log('1. Send a message to your WhatsApp number');
  console.log('2. Check the webhook logs for processing');
  console.log('3. Verify the response is sent back');
}

main().catch(console.error);
