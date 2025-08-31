#!/usr/bin/env node
/**
 * Environment Debug Script
 * Helps identify WhatsApp API configuration issues
 */

const axios = require("axios");

console.log("🔍 Debugging WhatsApp API Configuration...\n");

async function checkWebhookLogs() {
  console.log("📋 Checking webhook logs...");
  console.log("📋 Go to Render.com dashboard and check the logs for:");
  console.log("   - Environment variable errors");
  console.log("   - WhatsApp API errors");
  console.log("   - Message processing logs");
  console.log("   - sendWhatsAppInteractiveMessage errors");
}

async function testWhatsAppAPIDirectly() {
  console.log("\n🧪 Testing WhatsApp API directly...");

  // These would need to be set in your local environment for testing
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  console.log("📋 Environment Variables Check:");
  console.log(
    `  WHATSAPP_PHONE_NUMBER_ID: ${PHONE_NUMBER_ID ? "✅ Set" : "❌ Not set"}`
  );
  console.log(
    `  WHATSAPP_ACCESS_TOKEN: ${ACCESS_TOKEN ? "✅ Set" : "❌ Not set"}`
  );

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.log("\n❌ Missing environment variables locally");
    console.log(
      "📝 This is expected - we need to check Render.com environment"
    );
    return false;
  }

  console.log("\n📤 Testing WhatsApp API call...");

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: "31639591370",
        type: "text",
        text: {
          body: "🧪 Direct API test",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp API call successful");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log("❌ WhatsApp API call failed");
    console.log("Error:", error.response?.data || error.message);
    return false;
  }
}

function showTroubleshootingSteps() {
  console.log("\n" + "=".repeat(60));
  console.log("🔧 TROUBLESHOOTING STEPS");
  console.log("=".repeat(60));

  console.log("\n📋 Step 1: Check Render.com Environment Variables");
  console.log("   1. Go to https://dashboard.render.com");
  console.log("   2. Select your webhook service");
  console.log("   3. Go to 'Environment' tab");
  console.log("   4. Verify these variables are set:");
  console.log("      - VERIFY_TOKEN");
  console.log("      - WHATSAPP_PHONE_NUMBER_ID");
  console.log("      - WHATSAPP_ACCESS_TOKEN");
  console.log("      - OPENAI_API_KEY");
  console.log("      - GOOGLE_SHEETS_SPREADSHEET_ID");
  console.log("      - GOOGLE_SHEETS_CREDENTIALS");

  console.log("\n📋 Step 2: Check Render.com Logs");
  console.log("   1. Go to your webhook service in Render");
  console.log("   2. Click on 'Logs' tab");
  console.log("   3. Look for these error messages:");
  console.log("      - 'WHATSAPP_ACCESS_TOKEN is not defined'");
  console.log("      - 'Error sending WhatsApp message'");
  console.log("      - 'Error sending WhatsApp interactive message'");

  console.log("\n📋 Step 3: Check WhatsApp Business API");
  console.log("   1. Go to https://developers.facebook.com");
  console.log("   2. Navigate to your WhatsApp Business API app");
  console.log("   3. Check 'Phone Numbers' section");
  console.log("   4. Verify phone number is active");
  console.log("   5. Check 'Webhooks' configuration");

  console.log("\n📋 Step 4: Common Issues");
  console.log("   ❌ Environment variables not set in Render");
  console.log("   ❌ WhatsApp access token expired");
  console.log("   ❌ Phone number not activated");
  console.log("   ❌ Webhook URL not configured");
  console.log("   ❌ API permissions missing");

  console.log("\n📋 Step 5: Quick Fixes");
  console.log("   1. Redeploy the webhook after setting environment variables");
  console.log("   2. Regenerate WhatsApp access token if expired");
  console.log("   3. Verify webhook URL in Meta Developers Console");
  console.log("   4. Check phone number status");
}

async function main() {
  console.log("🚀 Starting environment debug...\n");

  // Check webhook logs
  await checkWebhookLogs();

  // Test WhatsApp API directly (if env vars are set locally)
  const apiTest = await testWhatsAppAPIDirectly();

  // Show troubleshooting steps
  showTroubleshootingSteps();

  console.log("\n" + "=".repeat(60));
  console.log("📊 DEBUG SUMMARY");
  console.log("=".repeat(60));

  if (apiTest) {
    console.log("✅ WhatsApp API works locally");
    console.log("❌ Problem is likely in Render.com environment variables");
  } else {
    console.log("❌ WhatsApp API test failed or not configured locally");
    console.log("🔧 Follow the troubleshooting steps above");
  }

  console.log("\n🎯 NEXT ACTIONS:");
  console.log("1. Check Render.com environment variables");
  console.log("2. Check Render.com logs for errors");
  console.log("3. Verify WhatsApp Business API configuration");
  console.log("4. Redeploy webhook after fixing issues");
}

main().catch(console.error);
