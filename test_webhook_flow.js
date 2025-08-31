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
                phone_number_id: "839070985945286",
              },
              contacts: [
                {
                  profile: { name: "Justin" },
                  wa_id: "31639591370",
                },
              ],
              messages: [
                {
                  from: "31639591370",
                  id: `test_${Date.now()}`,
                  timestamp: Date.now().toString(),
                  text: {
                    body: "test",
                  },
                  type: "text",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  };

  try {
    console.log("📤 Sending POST request to webhook...");
    console.log("📤 Message data:", JSON.stringify(testMessage, null, 2));

    const response = await axios.post(WEBHOOK_URL, testMessage, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
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
      timeout: 5000,
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

async function waitForPhoneResponse() {
  console.log("\n📱 Waiting for phone response...");
  console.log("📱 Please check your phone (31639591370) for a message");
  console.log("📱 You should receive an interactive menu with buttons");
  console.log(
    "📱 If you don't receive anything, there's an issue with the WhatsApp API"
  );

  console.log("\n⏰ Waiting 30 seconds for you to check your phone...");

  for (let i = 30; i > 0; i--) {
    process.stdout.write(`\r⏰ Waiting: ${i} seconds remaining...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n\n📱 Did you receive a message on your phone?");
  console.log("📱 If YES: The webhook is working correctly!");
  console.log("📱 If NO: There's an issue with WhatsApp API configuration");
}

async function testMultipleScenarios() {
  console.log("\n🔄 Testing multiple scenarios...");

  const scenarios = [
    { message: "hallo", description: "Basic greeting" },
    { message: "test", description: "Test message" },
    { message: "help", description: "Help command" },
    { message: "menu", description: "Menu command" },
    { message: "random text", description: "Random text" },
  ];

  for (const scenario of scenarios) {
    console.log(
      `\n📤 Testing: "${scenario.message}" (${scenario.description})`
    );

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
                  phone_number_id: "839070985945286",
                },
                contacts: [
                  {
                    profile: { name: "Justin" },
                    wa_id: "31639591370",
                  },
                ],
                messages: [
                  {
                    from: "31639591370",
                    id: `test_${Date.now()}_${scenario.message}`,
                    timestamp: Date.now().toString(),
                    text: {
                      body: scenario.message,
                    },
                    type: "text",
                  },
                ],
              },
              field: "messages",
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(WEBHOOK_URL, testMessage, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      console.log(`✅ "${scenario.message}" processed successfully`);

      // Wait 2 seconds between tests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`❌ "${scenario.message}" failed: ${error.message}`);
    }
  }
}

async function main() {
  console.log("🚀 Starting comprehensive webhook flow test...\n");

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
  console.log("📊 Initial Test Results:");
  console.log(
    `  Endpoint Accessible: ${endpointAccessible ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(`  Flow Test: ${flowSuccess ? "✅ PASS" : "❌ FAIL"}`);

  if (flowSuccess) {
    console.log("\n🎉 Webhook flow test completed successfully!");
    console.log("📱 Now checking if messages are sent to your phone...");

    // Wait for phone response
    await waitForPhoneResponse();

    // Test multiple scenarios
    await testMultipleScenarios();

    console.log("\n" + "=".repeat(50));
    console.log("📱 PHONE RESPONSE CHECK:");
    console.log("📱 Did you receive any messages on your phone?");
    console.log("📱 If YES: The system is working correctly!");
    console.log("📱 If NO: Check the following:");
    console.log("   1. WhatsApp API environment variables in Render");
    console.log("   2. WhatsApp webhook configuration");
    console.log("   3. Phone number permissions");
  } else {
    console.log("\n❌ Webhook flow test failed");
    console.log("🔧 Check the error messages above for troubleshooting");
  }

  console.log("\n📚 Next steps:");
  console.log("1. Check Render.com logs for detailed processing information");
  console.log("2. Look for the new logging messages we added");
  console.log("3. Verify if the message processing flow works correctly");
  console.log("4. Check your phone for received messages");
}

main().catch(console.error);
