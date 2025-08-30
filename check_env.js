#!/usr/bin/env node
/**
 * Environment Variables Checker
 * Checks if all required environment variables are set for the webhook
 */

const requiredVars = [
  'VERIFY_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_ACCESS_TOKEN',
  'OPENAI_API_KEY',
  'GOOGLE_SHEETS_SPREADSHEET_ID',
  'GOOGLE_SHEETS_CREDENTIALS'
];

const optionalVars = [
  'PORT'
];

console.log('🔍 Checking Environment Variables...\n');

let allRequiredSet = true;
let missingVars = [];

// Check required variables
console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
    allRequiredSet = false;
    missingVars.push(varName);
  }
});

// Check optional variables
console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: NOT SET (will use default)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allRequiredSet) {
  console.log('🎉 All required environment variables are set!');
  console.log('✅ Webhook should deploy successfully');
} else {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please set the missing variables in your Render.com environment');
  console.log('📚 See ENVIRONMENT_VARIABLES.md for setup instructions');
}

// Additional checks
console.log('\n🔍 Additional Checks:');

// Check if we're in production
if (process.env.NODE_ENV === 'production') {
  console.log('  ✅ Running in production mode');
} else {
  console.log('  ℹ️  Running in development mode');
}

// Check port
const port = process.env.PORT || 3000;
console.log(`  📡 Server will run on port: ${port}`);

// Check webhook URL (if available)
if (process.env.RENDER_EXTERNAL_URL) {
  console.log(`  🌐 Webhook URL: ${process.env.RENDER_EXTERNAL_URL}`);
} else {
  console.log('  🌐 Webhook URL: Will be set by Render.com');
}

console.log('\n📚 For setup instructions, see: ENVIRONMENT_VARIABLES.md');

// Exit with appropriate code
process.exit(allRequiredSet ? 0 : 1);
