/**
 * WhatsApp Messaging Service
 * Handles all WhatsApp API communication with improved error handling
 */

const axios = require("axios");

// WhatsApp API configuration
const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

/**
 * Validate phone number format
 */
function validatePhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid international format
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    return false;
  }
  
  // Ensure it starts with country code
  if (!cleanNumber.startsWith('31')) {
    return false;
  }
  
  return cleanNumber;
}

/**
 * Validate message content
 */
function validateMessageContent(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }
  
  // WhatsApp has a 4096 character limit for text messages
  if (message.length > 4096) {
    return false;
  }
  
  return true;
}

/**
 * Send a simple text message
 */
async function sendTextMessage(to, message) {
  try {
    console.log(`📤 Sending text message to ${to}`);
    
    // Validate inputs
    const validatedPhone = validatePhoneNumber(to);
    if (!validatedPhone) {
      throw new Error(`Invalid phone number format: ${to}`);
    }
    
    if (!validateMessageContent(message)) {
      throw new Error('Invalid message content');
    }
    
    // Check environment variables
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      throw new Error('Missing WhatsApp API credentials');
    }
    
    const payload = {
      messaging_product: "whatsapp",
      to: validatedPhone,
      type: "text",
      text: {
        body: message
      }
    };
    
    console.log(`📤 WhatsApp API payload:`, JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );
    
    console.log(`✅ WhatsApp text message sent successfully to ${to}`);
    console.log(`📤 Response:`, response.data);
    
    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      response: response.data
    };
    
  } catch (error) {
    console.error(`❌ Error sending WhatsApp text message to ${to}:`, error);
    
    // Log detailed error information
    if (error.response) {
      console.error(`❌ WhatsApp API Error Response:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error.message
    };
  }
}

/**
 * Send an interactive message (List, Button, etc.)
 */
async function sendInteractiveMessage(to, interactiveData) {
  try {
    console.log(`📤 Sending interactive message to ${to}`);
    
    // Validate inputs
    const validatedPhone = validatePhoneNumber(to);
    if (!validatedPhone) {
      throw new Error(`Invalid phone number format: ${to}`);
    }
    
    if (!interactiveData || !interactiveData.interactive) {
      throw new Error('Invalid interactive data structure');
    }
    
    // Check environment variables
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      throw new Error('Missing WhatsApp API credentials');
    }
    
    const payload = {
      messaging_product: "whatsapp",
      to: validatedPhone,
      type: "interactive",
      interactive: interactiveData.interactive
    };
    
    console.log(`📤 WhatsApp API payload:`, JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );
    
    console.log(`✅ WhatsApp interactive message sent successfully to ${to}`);
    console.log(`📤 Response:`, response.data);
    
    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      response: response.data
    };
    
  } catch (error) {
    console.error(`❌ Error sending WhatsApp interactive message to ${to}:`, error);
    
    // Log detailed error information
    if (error.response) {
      console.error(`❌ WhatsApp API Error Response:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error.message
    };
  }
}

/**
 * Send a media message (image, document, etc.)
 */
async function sendMediaMessage(to, mediaData) {
  try {
    console.log(`📤 Sending media message to ${to}`);
    
    // Validate inputs
    const validatedPhone = validatePhoneNumber(to);
    if (!validatedPhone) {
      throw new Error(`Invalid phone number format: ${to}`);
    }
    
    if (!mediaData || !mediaData.type || !mediaData.id) {
      throw new Error('Invalid media data structure');
    }
    
    // Check environment variables
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      throw new Error('Missing WhatsApp API credentials');
    }
    
    const payload = {
      messaging_product: "whatsapp",
      to: validatedPhone,
      type: mediaData.type,
      [mediaData.type]: {
        id: mediaData.id
      }
    };
    
    console.log(`📤 WhatsApp API payload:`, JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );
    
    console.log(`✅ WhatsApp media message sent successfully to ${to}`);
    console.log(`📤 Response:`, response.data);
    
    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      response: response.data
    };
    
  } catch (error) {
    console.error(`❌ Error sending WhatsApp media message to ${to}:`, error);
    
    // Log detailed error information
    if (error.response) {
      console.error(`❌ WhatsApp API Error Response:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error.message
    };
  }
}

/**
 * Test WhatsApp API connection
 */
async function testWhatsAppConnection() {
  try {
    console.log(`🧪 Testing WhatsApp API connection...`);
    
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return {
        success: false,
        error: 'Missing WhatsApp API credentials',
        details: {
          PHONE_NUMBER_ID: !!PHONE_NUMBER_ID,
          ACCESS_TOKEN: !!ACCESS_TOKEN
        }
      };
    }
    
    // Test with a simple API call to get phone number info
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}`,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        timeout: 5000,
      }
    );
    
    console.log(`✅ WhatsApp API connection test successful`);
    console.log(`📤 Phone number info:`, response.data);
    
    return {
      success: true,
      phoneNumberInfo: response.data
    };
    
  } catch (error) {
    console.error(`❌ WhatsApp API connection test failed:`, error);
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error.message
    };
  }
}

module.exports = {
  sendTextMessage,
  sendInteractiveMessage,
  sendMediaMessage,
  testWhatsAppConnection,
  validatePhoneNumber,
  validateMessageContent
};
