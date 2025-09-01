/**
 * Enhanced Error Handling Service
 * Provides better error handling and user feedback
 */

/**
 * Format error message for WhatsApp
 */
function formatErrorMessage(error, context = '') {
  const timestamp = new Date().toISOString();
  const errorId = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  console.error(`❌ [${errorId}] ${context}:`, error);
  
  let userMessage = `❌ Er is een fout opgetreden.\n\n`;
  
  if (context) {
    userMessage += `*Context:* ${context}\n`;
  }
  
  userMessage += `*Error ID:* ${errorId}\n`;
  userMessage += `*Tijdstip:* ${new Date().toLocaleString('nl-NL')}\n\n`;
  
  // Provide specific guidance based on error type
  if (error.message.includes('GOOGLE_SHEETS')) {
    userMessage += `💡 *Oplossing:*\n`;
    userMessage += `• Controleer of Google Sheets correct is geconfigureerd\n`;
    userMessage += `• Probeer het over een paar minuten opnieuw\n`;
    userMessage += `• Neem contact op met support als het probleem aanhoudt`;
  } else if (error.message.includes('WHATSAPP')) {
    userMessage += `💡 *Oplossing:*\n`;
    userMessage += `• Controleer je internetverbinding\n`;
    userMessage += `• Probeer het bericht opnieuw te sturen\n`;
    userMessage += `• Start het gesprek opnieuw met 'help'`;
  } else if (error.message.includes('PDF') || error.message.includes('OCR')) {
    userMessage += `💡 *Oplossing:*\n`;
    userMessage += `• Stuur een duidelijke foto van het document\n`;
    userMessage += `• Zorg dat alle tekst leesbaar is\n`;
    userMessage += `• Probeer een andere foto van het document`;
  } else {
    userMessage += `💡 *Oplossing:*\n`;
    userMessage += `• Probeer het opnieuw\n`;
    userMessage += `• Start het gesprek opnieuw met 'help'\n`;
    userMessage += `• Neem contact op met support als het probleem aanhoudt`;
  }
  
  return {
    userMessage,
    errorId,
    timestamp,
    context
  };
}

/**
 * Handle file processing errors
 */
function handleFileProcessingError(error, fileType, fileName) {
  const context = `File processing (${fileType}: ${fileName})`;
  return formatErrorMessage(error, context);
}

/**
 * Handle Google Sheets errors
 */
function handleGoogleSheetsError(error, operation) {
  const context = `Google Sheets ${operation}`;
  return formatErrorMessage(error, context);
}

/**
 * Handle WhatsApp API errors
 */
function handleWhatsAppError(error, operation) {
  const context = `WhatsApp API ${operation}`;
  return formatErrorMessage(error, context);
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  const required = [
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_ACCESS_TOKEN',
    'VERIFY_TOKEN',
    'GOOGLE_SHEETS_SPREADSHEET_ID',
    'GOOGLE_SHEETS_CREDENTIALS'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing,
      message: `❌ Missing environment variables: ${missing.join(', ')}`
    };
  }
  
  return {
    valid: true,
    message: '✅ All environment variables are set'
  };
}

/**
 * Create a system status message
 */
function createSystemStatusMessage() {
  const envStatus = validateEnvironment();
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  let status = `🔧 *System Status*\n\n`;
  
  // Environment status
  if (envStatus.valid) {
    status += `✅ Environment: Configured\n`;
  } else {
    status += `❌ Environment: ${envStatus.message}\n`;
  }
  
  // System info
  status += `⏱️ Uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m\n`;
  status += `💾 Memory: ${Math.round(memory.heapUsed / 1024 / 1024)}MB used\n`;
  status += `📅 Timestamp: ${new Date().toLocaleString('nl-NL')}\n\n`;
  
  // Service status
  status += `📊 *Services:*\n`;
  status += `• WhatsApp API: ${envStatus.valid ? '✅' : '❌'}\n`;
  status += `• Google Sheets: ${envStatus.valid ? '✅' : '❌'}\n`;
  status += `• File Processing: ✅\n`;
  status += `• Admin Commands: ✅\n`;
  
  return status;
}

module.exports = {
  formatErrorMessage,
  handleFileProcessingError,
  handleGoogleSheetsError,
  handleWhatsAppError,
  validateEnvironment,
  createSystemStatusMessage
};
