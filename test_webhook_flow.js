#!/usr/bin/env node
/**
 * Webhook Flow Test Script
 * Sends a test message to the webhook to test the flow
 */

const axios = require("axios");

// Webhook URL
const WEBHOOK_URL = "https://whatsapp-webhook-test-hvcc.onrender.com";

console.log("🧪 Testing Webhook Flow...\n");

async function testWebhookFlow() {
  console.log("📤 Sending test message to webhook...");
  
  const testMessage = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "1153970433274156",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551949952",
                phone_number_id: "839070985945286"
              },
              contacts: [
                {
                  profile: { name: "Justin" },
                  wa_id: "31639591370"
                }
              ],
              messages: [
                {
                  from: "31639591370",
                  id: `test_${Date.now()}`,
                  timestamp: Date.now().toString(),
                  text: {
                    body: "test"
                  },
                  type: "text"
                }
              ]
            },
            field: "messages"
          }
        ]
      }
    ]
  };

  try {
    console.log("📤 Sending POST request to webhook...");
    console.log("📤 Message data:", JSON.stringify(testMessage, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, testMessage, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log("✅ Webhook responded successfully");
    console.log("📤 Response status:", response.status);
    console.log("📤 Response data:", response.data);
    
    return true;
  } catch (error) {
    console.log("❌ Error sending test message to webhook");
    console.log("❌ Error:", error.message);
    
    if (error.response) {
      console.log("❌ Response status:", error.response.status);
      console.log("❌ Response data:", error.response.data);
    }
    
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log("🌐 Testing webhook endpoint accessibility...");
  
  try {
    const response = await axios.get(WEBHOOK_URL, {
      timeout: 5000
    });
    
    console.log("✅ Webhook endpoint is accessible");
    console.log("📤 Response:", response.data);
    return true;
  } catch (error) {
    console.log("❌ Error accessing webhook endpoint");
    console.log("❌ Error:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting webhook flow test...\n");
  
  // Test endpoint accessibility first
  const endpointAccessible = await testWebhookEndpoint();
  
  if (!endpointAccessible) {
    console.log("\n❌ Webhook endpoint is not accessible");
    console.log("🔧 Check if the webhook is deployed and running");
    return;
  }
  
  console.log("\n" + "=".repeat(50));
  
  // Test webhook flow
  const flowSuccess = await testWebhookFlow();
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Results:");
  console.log(`  Endpoint Accessible: ${endpointAccessible ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  Flow Test: ${flowSuccess ? "✅ PASS" : "❌ FAIL"}`);
  
  if (flowSuccess) {
    console.log("\n🎉 Webhook flow test completed successfully!");
    console.log("📱 Now check the Render logs to see the processing flow");
    console.log("📱 You should see detailed logs about message processing");
  } else {
    console.log("\n❌ Webhook flow test failed");
    console.log("🔧 Check the error messages above for troubleshooting");
  }
  
  console.log("\n📚 Next steps:");
  console.log("1. Check Render.com logs for detailed processing information");
  console.log("2. Look for the new logging messages we added");
  console.log("3. Verify if the message processing flow works correctly");
}

main().catch(console.error);
