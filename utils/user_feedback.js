/**
 * User Feedback Service
 * Provides enhanced user feedback and response templates
 */

/**
 * Create a welcome message for new users
 */
function createWelcomeMessage(userName = null) {
  const greeting = userName ? `Hallo ${userName}! 👋` : "Hallo! 👋";
  
  return `${greeting}

Welkom bij JMSoft AI Agents! 🤖

Ik ben je persoonlijke assistent voor het verwerken van facturen en bonnetjes. Ik kan je helpen met:

📄 *Factuur Verwerking*
• Albert Heijn bonnetjes
• Professionele facturen
• Meerdere documenten tegelijk

📊 *Data Management*
• Automatische Google Sheets integratie
• Gedetailleerde productinformatie
• Koopzegels tracking

🔧 *Admin Functies*
• Google Sheets beheer
• Systeem monitoring
• Performance tracking

*Stuur 'help' om het menu te openen of begin direct met het sturen van een factuur!*`;
}

/**
 * Create a processing status message
 */
function createProcessingMessage(fileType, fileName) {
  return `🔄 *Verwerking gestart*

📄 *Bestand:* ${fileName}
📋 *Type:* ${fileType}
⏱️ *Status:* Bezig met verwerken...

*Even geduld, ik werk je document zo snel mogelijk uit!*`;
}

/**
 * Create a success message for processed documents
 */
function createSuccessMessage(documentType, invoiceNumber, company, totalAmount) {
  const emoji = documentType === 'receipt' ? '🧾' : '📄';
  const typeText = documentType === 'receipt' ? 'Bonnetje' : 'Factuur';
  
  return `${emoji} *${typeText} Verwerking Voltooid!*

✅ *Status:* Succesvol verwerkt
🔢 *Factuurnummer:* ${invoiceNumber}
🏪 *Bedrijf:* ${company}
💰 *Totaalbedrag:* €${totalAmount}

📊 *Data opgeslagen in Google Sheets*
📋 *Beschikbare tabs:*
• Invoices - Overzicht van alle facturen
• Detail Invoices - Gedetailleerde productinformatie
• Koopzegels Tracking - Koopzegels statistieken

*Bedankt voor het gebruik van JMSoft AI Agents!*`;
}

/**
 * Create an error message with helpful guidance
 */
function createErrorMessage(errorType, context = '') {
  const errorMessages = {
    'file_processing': `❌ *Bestand Verwerking Fout*

Het bestand kon niet worden verwerkt.

💡 *Mogelijke oplossingen:*
• Stuur een duidelijke foto van het document
• Zorg dat alle tekst leesbaar is
• Probeer een andere foto van het document
• Controleer of het bestand niet beschadigd is

${context ? `*Context:* ${context}` : ''}`,

    'google_sheets': `❌ *Google Sheets Fout*

De data kon niet worden opgeslagen.

💡 *Mogelijke oplossingen:*
• Probeer het over een paar minuten opnieuw
• Controleer of Google Sheets toegankelijk is
• Neem contact op met support als het probleem aanhoudt

${context ? `*Context:* ${context}` : ''}`,

    'whatsapp_api': `❌ *WhatsApp API Fout*

Er was een probleem met het versturen van het bericht.

💡 *Mogelijke oplossingen:*
• Controleer je internetverbinding
• Probeer het bericht opnieuw te sturen
• Start het gesprek opnieuw met 'help'

${context ? `*Context:* ${context}` : ''}`,

    'general': `❌ *Systeem Fout*

Er is een onverwachte fout opgetreden.

💡 *Mogelijke oplossingen:*
• Probeer het opnieuw
• Start het gesprek opnieuw met 'help'
• Neem contact op met support als het probleem aanhoudt

${context ? `*Context:* ${context}` : ''}`
  };

  return errorMessages[errorType] || errorMessages['general'];
}

/**
 * Create a help message with available options
 */
function createHelpMessage() {
  return `🤖 *JMSoft AI Agents Help*

*Beschikbare functies:*

📄 *Factuur Verwerking*
• Stuur een foto van een bonnetje/factuur
• Ondersteunde formaten: JPG, PNG, PDF
• Automatische tekstherkenning

📊 *Data Management*
• Automatische Google Sheets integratie
• Gedetailleerde productinformatie
• Koopzegels tracking voor Albert Heijn

🔧 *Admin Commands*
• \`/status\` - Systeem status
• \`/performance\` - Performance metrics
• \`/stats\` - Google Sheets statistieken
• \`/clear\` - Data wissen
• \`/reset\` - Headers resetten

💡 *Tips:*
• Stuur duidelijke foto's voor beste resultaten
• Gebruik 'help' om het menu te openen
• Admin commands werken alleen voor geautoriseerde gebruikers

*Stuur een document om te beginnen of gebruik het menu!*`;
}

/**
 * Create a multiple files summary message
 */
function createMultipleFilesSummary(filesProcessed, totalAmount, companies) {
  const uniqueCompanies = [...new Set(companies)];
  
  return `📋 *Meerdere Documenten Verwerkt!*

✅ *Status:* ${filesProcessed.length} documenten verwerkt
💰 *Totaalbedrag:* €${totalAmount}
🏪 *Bedrijven:* ${uniqueCompanies.join(', ')}

📊 *Verwerkte documenten:*
${filesProcessed.map((file, index) => 
  `${index + 1}. ${file.company} - €${file.totalAmount} (${file.invoiceNumber})`
).join('\n')}

*Alle data is opgeslagen in Google Sheets!*
*Bedankt voor het gebruik van JMSoft AI Agents!*`;
}

module.exports = {
  createWelcomeMessage,
  createProcessingMessage,
  createSuccessMessage,
  createErrorMessage,
  createHelpMessage,
  createMultipleFilesSummary
};
